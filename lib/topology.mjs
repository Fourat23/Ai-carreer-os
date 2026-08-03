// Modèle de topologie de déploiement cloud — PUR, sans I/O, sans réseau
// (ADR/HSD/TSD-022).
//
// Une topologie est un document DÉCLARATIF : des zones, des environnements, des
// nœuds (composants) et des arêtes (flux typés). Ce module ne stocke aucun secret
// réel, n'exécute rien, ne provisionne rien, et ne transforme JAMAIS une
// configuration en appel réseau ou en commande système. L'analyse vit dans
// lib/topology-analysis.mjs (CP3) ; la simulation d'incident dans
// lib/topology-scenario.mjs.

/** Composants reconnus (liste fermée). Un « kind » porte des propriétés analysées, jamais du code. */
export const NODE_KINDS = [
  'client', 'dns', 'cdn', 'load-balancer', 'reverse-proxy', 'api', 'frontend',
  'backend', 'worker', 'queue', 'cache', 'relational-db', 'nosql-db',
  'object-storage', 'file-storage', 'block-storage', 'nat', 'gateway', 'subnet',
  'firewall', 'secret-store', 'monitoring', 'backup', 'scheduler',
];
/** Flux typés (liste fermée). `replicates-to` est bidirectionnel légitime (exempté du cycle de démarrage). */
export const EDGE_KINDS = [
  'depends-on', 'routes-to', 'reads', 'writes', 'replicates-to', 'backs-up',
  'monitors', 'resolves',
];
/** Arêtes qui comptent pour le cycle de dépendances de démarrage. */
export const DEPENDENCY_EDGE_KINDS = new Set(['depends-on', 'routes-to', 'reads', 'writes']);
/** Environnements reconnus (liste fermée, ordonnés du moins au plus sensible). */
export const ENVIRONMENTS = ['development', 'testing', 'staging', 'preproduction', 'production'];
/** Dimensions d'objectif reconnues. */
export const OBJECTIVE_KINDS = ['availability', 'cost', 'performance', 'security', 'maintainability', 'complexity', 'rpo', 'rto'];

/** Plafonds durs (budgets de ressources pédagogiques). */
export const TOPOLOGY_CAPS = { maxNodes: 60, maxEdges: 200, maxZones: 12, maxEnvironments: 5, maxDepth: 12, maxChain: 40, maxSerializedBytes: 96 * 1024 };

const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const isKebab = (v) => typeof v === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
const isNonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;
const isArr = Array.isArray;

/** Un motif qui ressemble à un SECRET brut posé en clair (à référencer, jamais inliner). */
const SECRET_INLINE = /(sk-[A-Za-z0-9]{8,}|ghp_[A-Za-z0-9]{8,}|AKIA[0-9A-Z]{12,}|xox[baprs]-[A-Za-z0-9-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|[A-Za-z0-9_\-]{40,})/;

/**
 * Détecte un cycle dans le graphe de dépendances (arêtes de démarrage). PUR.
 * @param {Array} nodes  [{id}]
 * @param {Array} edges  [{from, to, kind}]
 * @returns {string[]|null} un chemin de cycle, ou null si acyclique.
 */
export function findCycle(nodes = [], edges = []) {
  const ids = new Set(nodes.map((n) => n.id));
  const adj = new Map(nodes.map((n) => [n.id, []]));
  for (const e of edges) {
    if (!DEPENDENCY_EDGE_KINDS.has(e?.kind)) continue;
    if (!ids.has(e.from) || !ids.has(e.to)) continue;
    adj.get(e.from).push(e.to);
  }
  const state = new Map(); // id -> 0 en cours, 1 fini
  const stack = [];
  function dfs(id) {
    if (state.get(id) === 1) return null;
    if (state.get(id) === 0) return [...stack.slice(stack.indexOf(id)), id];
    state.set(id, 0); stack.push(id);
    for (const nxt of adj.get(id) ?? []) { const c = dfs(nxt); if (c) return c; }
    stack.pop(); state.set(id, 1);
    return null;
  }
  for (const n of nodes) { const c = dfs(n.id); if (c) return c; }
  return null;
}

function checkPropsSafety(props, label, errors) {
  if (props == null) return;
  if (typeof props !== 'object' || isArr(props)) { errors.push(`${label} : « props » doit être un objet`); return; }
  const walk = (o, depth) => {
    if (depth > 6) { errors.push(`${label} : « props » trop profond`); return; }
    for (const k of Object.keys(o)) {
      if (DANGEROUS_KEYS.has(k)) errors.push(`${label} : clé dangereuse « ${k} »`);
      const v = o[k];
      if (typeof v === 'string') {
        if (v.includes('\0')) errors.push(`${label} : octet nul interdit`);
        if (SECRET_INLINE.test(v)) errors.push(`${label} : secret en clair interdit (le stockage de secrets est conceptuel)`);
      } else if (v && typeof v === 'object' && !isArr(v)) walk(v, depth + 1);
    }
  };
  walk(props, 0);
}

/**
 * Valide une définition de topologie contre le contexte réel. PUR.
 * @param {object} topo
 * @param {{ skillIds?:{has}, validDays?:Set<number>, trackIds?:Set<string> }} ctx
 * @returns {{ ok:boolean, errors:string[] }}
 */
export function validateTopology(topo = {}, ctx = {}) {
  const errors = [];
  const skillIds = ctx.skillIds ?? { has: () => true };
  const validDays = ctx.validDays ?? null;
  const trackIds = ctx.trackIds ?? null;

  for (const k of Object.keys(topo)) if (DANGEROUS_KEYS.has(k)) errors.push('clé dangereuse au niveau topologie');
  if (!isKebab(topo.id)) errors.push('id invalide (kebab-case)');
  if (!isNonEmpty(topo.title)) errors.push('titre manquant');
  if (!isNonEmpty(topo.description)) errors.push('description manquante');

  // Taille sérialisée globale.
  const serialized = (() => { try { return JSON.stringify(topo); } catch { return ''; } })();
  if (!serialized) errors.push('topologie non sérialisable');
  else if (serialized.length > TOPOLOGY_CAPS.maxSerializedBytes) errors.push('topologie trop volumineuse');

  // Environnements.
  const envs = isArr(topo.environments) ? topo.environments : [];
  if (envs.length > TOPOLOGY_CAPS.maxEnvironments) errors.push('trop d\'environnements');
  for (const e of envs) if (!ENVIRONMENTS.includes(e)) errors.push(`environnement inconnu « ${e} »`);
  const envSet = new Set(envs);

  // Zones.
  const zones = isArr(topo.zones) ? topo.zones : [];
  if (zones.length > TOPOLOGY_CAPS.maxZones) errors.push('trop de zones');
  const zoneIds = new Set();
  for (const z of zones) {
    if (!isKebab(z?.id)) errors.push('zone : id invalide');
    else if (zoneIds.has(z.id)) errors.push(`zone : id dupliqué « ${z.id} »`);
    zoneIds.add(z?.id);
    if (!isNonEmpty(z?.label)) errors.push(`zone ${z?.id} : label manquant`);
  }

  // Nœuds.
  const nodes = isArr(topo.nodes) ? topo.nodes : [];
  if (!nodes.length) errors.push('aucun nœud');
  if (nodes.length > TOPOLOGY_CAPS.maxNodes) errors.push('trop de nœuds');
  const nodeIds = new Set();
  for (const n of nodes) {
    const label = `nœud ${n?.id}`;
    if (!isKebab(n?.id)) { errors.push('nœud : id invalide'); continue; }
    if (nodeIds.has(n.id)) errors.push(`nœud : id dupliqué « ${n.id} »`);
    nodeIds.add(n.id);
    if (!NODE_KINDS.includes(n.kind)) errors.push(`${label} : kind inconnu « ${n.kind} »`);
    if (!isNonEmpty(n.label)) errors.push(`${label} : label manquant`);
    if (n.zone != null && !zoneIds.has(n.zone)) errors.push(`${label} : zone inconnue « ${n.zone} »`);
    if (n.environment != null && !envSet.has(n.environment)) errors.push(`${label} : environnement non déclaré « ${n.environment} »`);
    checkPropsSafety(n.props, label, errors);
  }

  // Arêtes.
  const edges = isArr(topo.edges) ? topo.edges : [];
  if (edges.length > TOPOLOGY_CAPS.maxEdges) errors.push('trop d\'arêtes');
  const edgeIds = new Set();
  for (const e of edges) {
    const label = `arête ${e?.id}`;
    if (!isKebab(e?.id)) { errors.push('arête : id invalide'); continue; }
    if (edgeIds.has(e.id)) errors.push(`arête : id dupliqué « ${e.id} »`);
    edgeIds.add(e.id);
    if (!EDGE_KINDS.includes(e.kind)) errors.push(`${label} : kind inconnu « ${e.kind} »`);
    if (!nodeIds.has(e.from)) errors.push(`${label} : source inconnue « ${e.from} »`);
    if (!nodeIds.has(e.to)) errors.push(`${label} : cible inconnue « ${e.to} »`);
    if (e.from === e.to) errors.push(`${label} : boucle sur soi-même`);
    checkPropsSafety(e.props, label, errors);
  }

  // Cycle de dépendances de démarrage (replicates-to exclu).
  const cycle = findCycle(nodes, edges);
  if (cycle) errors.push(`cycle de dépendances : ${cycle.join(' → ')}`);

  // Contraintes / objectifs (déclaratifs).
  for (const c of isArr(topo.constraints) ? topo.constraints : []) {
    if (!isKebab(c?.id)) errors.push('contrainte : id invalide');
    if (!isNonEmpty(c?.kind)) errors.push(`contrainte ${c?.id} : kind manquant`);
  }
  for (const o of isArr(topo.objectives) ? topo.objectives : []) {
    if (!isKebab(o?.id)) errors.push('objectif : id invalide');
    if (!OBJECTIVE_KINDS.includes(o?.kind)) errors.push(`objectif ${o?.id} : kind inconnu « ${o?.kind} »`);
  }

  // Rattachement pédagogique.
  if (!isArr(topo.skills) || topo.skills.length === 0) errors.push('skills manquantes');
  else for (const s of topo.skills) if (!skillIds.has(s)) errors.push(`compétence inconnue « ${s} »`);
  if (!isArr(topo.dayRefs) || topo.dayRefs.length === 0) errors.push('dayRefs manquantes');
  else if (validDays) for (const d of topo.dayRefs) if (!validDays.has(d)) errors.push(`journée inexistante ${d}`);
  if (topo.trackScope != null) {
    if (!isArr(topo.trackScope)) errors.push('trackScope doit être un tableau');
    else if (trackIds) for (const t of topo.trackScope) if (!trackIds.has(t)) errors.push(`parcours inconnu « ${t} »`);
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Vue publique d'une topologie : structure analysable, jamais de champ interne
 * sensible ni de valeur ressemblant à un secret. PUR.
 */
export function publicTopologyView(topo = {}) {
  const sanitizeProps = (props) => {
    if (props == null || typeof props !== 'object' || isArr(props)) return {};
    const out = {};
    for (const k of Object.keys(props)) {
      if (DANGEROUS_KEYS.has(k)) continue;
      const v = props[k];
      if (typeof v === 'string') out[k] = SECRET_INLINE.test(v) ? '***' : v;
      else if (typeof v === 'number' || typeof v === 'boolean') out[k] = v;
      else if (v && typeof v === 'object' && !isArr(v)) out[k] = sanitizeProps(v);
    }
    return out;
  };
  return {
    id: topo.id, title: topo.title, description: topo.description,
    environments: topo.environments ?? [],
    zones: (topo.zones ?? []).map((z) => ({ id: z.id, label: z.label })),
    nodes: (topo.nodes ?? []).map((n) => ({
      id: n.id, kind: n.kind, label: n.label, zone: n.zone ?? null,
      environment: n.environment ?? null, props: sanitizeProps(n.props),
    })),
    edges: (topo.edges ?? []).map((e) => ({
      id: e.id, from: e.from, to: e.to, kind: e.kind, props: sanitizeProps(e.props),
    })),
    constraints: (topo.constraints ?? []).map((c) => ({ id: c.id, kind: c.kind, ...('target' in (c || {}) ? { target: c.target } : {}) })),
    objectives: (topo.objectives ?? []).map((o) => ({ id: o.id, kind: o.kind, ...('target' in (o || {}) ? { target: o.target } : {}) })),
    skills: topo.skills ?? [], dayRefs: topo.dayRefs ?? [], trackScope: topo.trackScope ?? null,
    missionRefs: topo.missionRefs ?? [],
  };
}

/** Longueur de la plus longue chaîne de dépendances (profondeur du DAG). PUR. */
export function longestChain(nodes = [], edges = []) {
  const ids = new Set(nodes.map((n) => n.id));
  const adj = new Map(nodes.map((n) => [n.id, []]));
  for (const e of edges) if (DEPENDENCY_EDGE_KINDS.has(e?.kind) && ids.has(e.from) && ids.has(e.to)) adj.get(e.from).push(e.to);
  const memo = new Map();
  const seen = new Set();
  const depth = (id) => {
    if (memo.has(id)) return memo.get(id);
    if (seen.has(id)) return 0; // cycle : borné ailleurs
    seen.add(id);
    let best = 1;
    for (const nxt of adj.get(id) ?? []) best = Math.max(best, 1 + depth(nxt));
    seen.delete(id); memo.set(id, best);
    return best;
  };
  let max = 0;
  for (const n of nodes) max = Math.max(max, depth(n.id));
  return max;
}
