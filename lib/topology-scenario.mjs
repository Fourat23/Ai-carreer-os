// Simulation d'incident sur une topologie — PURE, déterministe, sans I/O
// (ADR/TSD-022).
//
// Un scénario BORNÉ (allowlist) retire ou dégrade des composants et l'on recalcule
// des PROPRIÉTÉS QUALITATIVES (atteignabilité client→service, apparition d'un
// point de défaillance). Aucune métrique chiffrée n'est présentée comme réelle.

import { analyzeTopology } from './topology-analysis.mjs';

/** Scénarios reconnus (liste fermée). */
export const SCENARIOS = ['drop-node', 'drop-zone', 'dependency-down', 'traffic-spike'];

const FORWARD_KINDS = new Set(['routes-to', 'resolves', 'depends-on', 'reads', 'writes']);
const SERVICE_KINDS = new Set(['api', 'backend']);
const truthy = (v) => v === true || v === 'true';

/**
 * Ensemble des nœuds atteignables depuis les clients (flux avant). PUR.
 * @returns {Set<string>}
 */
function reachableFromClients(nodes, edges) {
  const present = new Set(nodes.map((n) => n.id));
  const adj = new Map(nodes.map((n) => [n.id, []]));
  for (const e of edges) {
    if (!FORWARD_KINDS.has(e.kind)) continue;
    if (present.has(e.from) && present.has(e.to)) adj.get(e.from).push(e.to);
  }
  const seen = new Set();
  const queue = nodes.filter((n) => n.kind === 'client').map((n) => n.id);
  for (const id of queue) seen.add(id);
  while (queue.length) {
    const id = queue.shift();
    for (const nxt of adj.get(id) ?? []) if (!seen.has(nxt)) { seen.add(nxt); queue.push(nxt); }
  }
  return seen;
}

/** Propriétés qualitatives d'une topologie (sous-ensemble de nœuds actifs). PUR. */
function properties(nodes, edges) {
  const reachable = reachableFromClients(nodes, edges);
  const services = nodes.filter((n) => SERVICE_KINDS.has(n.kind));
  const reachableServices = services.filter((s) => reachable.has(s.id));
  return {
    clientToService: reachableServices.length > 0,
    reachableServiceIds: reachableServices.map((s) => s.id).sort(),
    unreachableServiceIds: services.filter((s) => !reachable.has(s.id)).map((s) => s.id).sort(),
  };
}

/**
 * Applique un scénario d'incident et compare les propriétés avant/après. PUR.
 * @param {object} topo
 * @param {{ kind:string, target?:string }} scenario
 * @returns {{ ok:boolean, error?:string, effects?:object, before?:object, after?:object, diagnostics?:object[] }}
 */
export function runScenario(topo = {}, scenario = {}) {
  const kind = scenario?.kind;
  if (!SCENARIOS.includes(kind)) return { ok: false, error: `scénario inconnu « ${kind} »` };

  const nodes = topo.nodes ?? []; const edges = topo.edges ?? [];
  const before = properties(nodes, edges);

  let removed = new Set();
  let note = '';
  if (kind === 'drop-node' || kind === 'dependency-down') {
    if (!nodes.some((n) => n.id === scenario.target)) return { ok: false, error: `cible inconnue « ${scenario.target} »` };
    removed = new Set([scenario.target]);
    note = kind === 'dependency-down'
      ? `La dépendance « ${scenario.target} » est indisponible.`
      : `Le composant « ${scenario.target} » est tombé.`;
  } else if (kind === 'drop-zone') {
    const zone = scenario.target;
    if (!(topo.zones ?? []).some((z) => z.id === zone)) return { ok: false, error: `zone inconnue « ${zone} »` };
    removed = new Set(nodes.filter((n) => n.zone === zone).map((n) => n.id));
    note = `La zone « ${zone} » est perdue (${removed.size} composant(s)).`;
  } else if (kind === 'traffic-spike') {
    note = 'Pic de charge : les services sans réplica ni autoscaling sont saturés.';
  }

  // Topologie dégradée.
  const activeNodes = nodes.filter((n) => !removed.has(n.id));
  const activeEdges = edges.filter((e) => !removed.has(e.from) && !removed.has(e.to));
  const after = properties(activeNodes, activeEdges);

  const diagnostics = [];
  if (kind === 'traffic-spike') {
    for (const n of nodes) {
      if (!SERVICE_KINDS.has(n.kind)) continue;
      const replicas = Number(n.props?.replicas);
      const scalable = truthy(n.props?.autoscaling) || (Number.isFinite(replicas) && replicas >= 2);
      if (!scalable) {
        diagnostics.push({
          code: 'spike-saturation', severity: 'risk', dimension: 'performance',
          title: `Saturation probable sous charge : ${n.label}`,
          explanation: 'Ce service n\'a ni réplica supplémentaire ni autoscaling : un pic de trafic le sature.',
          evidence: [n.id], impact: 'Latence et erreurs sous charge ; possible effet domino.',
          recommendation: 'Ajouter de l\'autoscaling ou des réplicas ; protéger par une file/limitation.',
          tradeoff: 'Plus de capacité coûte plus cher ; l\'ajuster demande de mesurer la charge réelle.',
          skills: ['archi'], glossary: ['scale-autoscaling', 'scale-horizontal'],
        });
      }
    }
  } else if (before.clientToService && !after.clientToService) {
    diagnostics.push({
      code: 'incident-service-unreachable', severity: 'blocking', dimension: 'availability',
      title: 'Service injoignable après l\'incident',
      explanation: `${note} Plus aucun service n\'est atteignable depuis les clients : c\'était un point de défaillance unique sur le chemin.`,
      evidence: [...removed].sort(), impact: 'Indisponibilité totale du service.',
      recommendation: 'Ajouter de la redondance (multi-instance/multi-zone) et un failover sur ce chemin.',
      tradeoff: 'La redondance augmente le coût, mais supprime l\'indisponibilité totale.',
      skills: ['archi'], glossary: ['ha-spof', 'ha-failover'],
    });
  } else if (after.unreachableServiceIds.length > before.unreachableServiceIds.length) {
    const newlyDown = after.unreachableServiceIds.filter((id) => !before.unreachableServiceIds.includes(id));
    diagnostics.push({
      code: 'incident-partial-degradation', severity: 'risk', dimension: 'availability',
      title: 'Dégradation partielle après l\'incident',
      explanation: `${note} Le service reste globalement joignable, mais certains composants deviennent inatteignables.`,
      evidence: [...removed, ...newlyDown].sort(), impact: 'Capacité réduite ; dégradation partielle.',
      recommendation: 'Vérifier la répartition multi-zone et la capacité restante.',
      tradeoff: 'Tolérer une dégradation partielle est acceptable si la capacité restante suffit.',
      skills: ['archi'], glossary: ['ha-high-availability'],
    });
  }

  return {
    ok: true,
    effects: { removed: [...removed].sort(), note },
    before, after,
    survived: after.clientToService,
    diagnostics,
    // Analyse de la topologie dégradée (informative, déterministe).
    degradedAnalysis: analyzeTopology({ ...topo, nodes: activeNodes, edges: activeEdges }).summary,
  };
}
