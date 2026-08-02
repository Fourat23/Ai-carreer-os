// Modèle de couverture éditoriale V19 — PUR, sans I/O, sans réseau.
//
// Cartographie des sujets « fondations opérationnelles » (terminal/shell, système
// Linux, réseau, SSH, diagnostic) : quels sujets, quelles journées, quels
// parcours, quels exercices, quelles missions, quel glossaire. Ne stocke AUCUN
// texte de cours ; ne porte que la cartographie et les invariants de cohérence.

/** Échelle de profondeur pédagogique, du plus faible au plus fort. */
export const DEPTH_LEVELS = ['absent', 'mentioned', 'explained', 'practiced', 'evaluated'];
export function depthRank(level) { return DEPTH_LEVELS.indexOf(level); }

/** Domaines transverses du sprint. */
export const V19_DOMAINS = ['shell', 'system', 'network', 'ops'];

/** Taxonomie canonique des sujets V19 (stable — les plans y référencent par id). */
export const V19_TOPICS = [
  { id: 'terminal-cli', label: 'Terminal, shell & CLI (quoting, globbing, redirections, pipes, exit codes)', domain: 'shell' },
  { id: 'filesystem', label: 'Système de fichiers, FHS & chemins', domain: 'shell' },
  { id: 'permissions', label: 'Permissions rwx/octal, chmod/chown, umask, moindre privilège', domain: 'system' },
  { id: 'processes', label: 'Processus, PID, signaux, foreground/background', domain: 'system' },
  { id: 'services-logs', label: 'Services, démons, systemd/systemctl/journalctl, logs', domain: 'system' },
  { id: 'resources', label: 'CPU/mémoire/disque/I-O, inode, descripteurs de fichiers, load average, swap', domain: 'system' },
  { id: 'networking', label: 'Réseau : IP, port, socket, TCP/UDP, localhost, subnet, gateway, NAT, pare-feu', domain: 'network' },
  { id: 'dns', label: 'DNS, résolution, TTL, cache, routage', domain: 'network' },
  { id: 'http-tls', label: 'HTTP/HTTPS/TLS, certificat, proxy/reverse proxy, statuts', domain: 'network' },
  { id: 'ssh', label: 'SSH : clés publique/privée, known_hosts, agent, tunnel', domain: 'network' },
  { id: 'diagnostic', label: 'Méthode de diagnostic opérationnel par couches', domain: 'ops' },
];
export const V19_TOPIC_IDS = new Set(V19_TOPICS.map((t) => t.id));
const TOPIC_BY_ID = new Map(V19_TOPICS.map((t) => [t.id, t]));
export function topicById(id) { return TOPIC_BY_ID.get(id) ?? null; }

/** Extrait les numéros de journée référencés (« jour 72 », « day-072 »). */
export function extractDayRefs(text) {
  if (!text) return [];
  const out = new Set();
  const re = /\b(?:jours?|day)[\s-]*0*(\d{1,3})\b/gi;
  let m;
  while ((m = re.exec(text))) { const n = Number(m[1]); if (n >= 1 && n <= 365) out.add(n); }
  return [...out].sort((a, b) => a - b);
}

/**
 * Valide un plan d'enrichissement V19 contre le contexte réel.
 * @param {object} plan { topics?, days?, exercisesAdded?, missionsAdded?, glossaryTermsAdded?, tracksAdded? }
 * @param {object} ctx { validDays:Set, trackIds:Set, skillIds:{has}, exerciseIds:Set, missionIds:Set, glossaryTerms:Set }
 * @returns {{ errors: string[] }}
 */
export function validateCoveragePlan(plan = {}, ctx = {}) {
  const errors = [];
  const validDays = ctx.validDays ?? new Set();
  const trackIds = ctx.trackIds ?? new Set();
  const skillIds = ctx.skillIds ?? new Set();
  const exerciseIds = ctx.exerciseIds ?? new Set();
  const missionIds = ctx.missionIds ?? new Set();
  const glossaryTerms = ctx.glossaryTerms ?? new Set();
  const has = (set, k) => (typeof set.has === 'function' ? set.has(k) : false);

  const days = Array.isArray(plan.days) ? plan.days : [];
  const seen = new Set();
  const addedExercises = new Set((plan.exercisesAdded ?? []).map((e) => e.id));
  const addedMissions = new Set((plan.missionsAdded ?? []).map((m) => m.id));

  for (const entry of days) {
    const label = `journée ${entry?.day}`;
    if (!Number.isInteger(entry?.day) || !validDays.has(entry.day)) { errors.push(`${label} : référence vers un jour inexistant`); continue; }
    if (seen.has(entry.day)) errors.push(`${label} : doublon dans le plan`);
    seen.add(entry.day);
    if (!entry.objective || String(entry.objective).trim().length < 12) errors.push(`${label} : enrichissement sans objectif clair`);
    for (const t of entry.topics ?? []) if (!V19_TOPIC_IDS.has(t)) errors.push(`${label} : sujet inconnu « ${t} »`);
    if (!(entry.topics ?? []).length) errors.push(`${label} : aucun sujet transverse rattaché`);
    for (const tr of entry.tracks ?? []) if (!trackIds.has(tr)) errors.push(`${label} : parcours inconnu « ${tr} »`);
    for (const ex of entry.exercises ?? []) if (!exerciseIds.has(ex) && !addedExercises.has(ex)) errors.push(`${label} : exercice lié inexistant « ${ex} »`);
  }

  const exSeen = new Set();
  for (const ex of plan.exercisesAdded ?? []) {
    if (exSeen.has(ex.id)) errors.push(`exercice « ${ex.id} » : doublon dans le plan`);
    exSeen.add(ex.id);
    for (const s of ex.skills ?? []) if (!has(skillIds, s)) errors.push(`exercice « ${ex.id} » : compétence absente « ${s} »`);
    if (!(ex.skills ?? []).length) errors.push(`exercice « ${ex.id} » : aucune compétence`);
    if (ex.day != null && !validDays.has(ex.day)) errors.push(`exercice « ${ex.id} » : journée liée inexistante ${ex.day}`);
  }

  const mSeen = new Set();
  for (const m of plan.missionsAdded ?? []) {
    if (mSeen.has(m.id)) errors.push(`mission « ${m.id} » : doublon dans le plan`);
    mSeen.add(m.id);
    for (const d of m.days ?? []) if (!validDays.has(d)) errors.push(`mission « ${m.id} » : journée liée inexistante ${d}`);
    if (!(m.days ?? []).length) errors.push(`mission « ${m.id} » : aucune journée liée`);
    for (const ex of m.exercises ?? []) if (!exerciseIds.has(ex) && !addedExercises.has(ex)) errors.push(`mission « ${m.id} » : exercice inexistant « ${ex} »`);
  }

  const gSeen = new Set();
  for (const g of plan.glossaryTermsAdded ?? []) {
    const key = String(g.term ?? '').toLowerCase();
    if (!key) errors.push('entrée de glossaire sans terme');
    if (gSeen.has(key)) errors.push(`glossaire « ${g.term} » : doublon dans le plan`);
    gSeen.add(key);
    if (glossaryTerms.has(key)) errors.push(`glossaire « ${g.term} » : déjà présent dans le glossaire`);
    if (!g.shortDefinition || !g.detailedDefinition) errors.push(`glossaire « ${g.term} » : définition manquante`);
  }

  // Cohérence : les missions référencées comme livrées existent réellement.
  for (const id of addedMissions) if (!missionIds.has(id)) errors.push(`mission déclarée « ${id} » absente de data/missions`);

  return { errors };
}

export function daysForTopic(plan, topicId) {
  return (plan.days ?? []).filter((d) => (d.topics ?? []).includes(topicId)).map((d) => d.day);
}
export function coverageByDomain(plan) {
  const out = Object.fromEntries(V19_DOMAINS.map((d) => [d, 0]));
  for (const entry of plan.days ?? []) {
    const domains = new Set((entry.topics ?? []).map((t) => topicById(t)?.domain).filter(Boolean));
    for (const d of domains) out[d] += 1;
  }
  return out;
}
