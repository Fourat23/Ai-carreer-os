// Modèle de couverture éditoriale V17 — PUR, sans I/O, sans réseau.
//
// Rôle : représenter les sujets transverses du sprint V17 (dette technique,
// maintenance, refactoring, performance, documentation), leur profondeur cible,
// les journées/parcours/exercices/livrables concernés, ET valider un plan
// d'enrichissement contre les données réelles (program.json, catalogue,
// exercices, glossaire) fournies par l'appelant.
//
// Ce module n'est PAS une seconde source du contenu rédactionnel : il ne stocke
// aucun texte de cours. Il ne porte que la CARTOGRAPHIE (quel sujet, quelle
// journée, quel parcours, quel livrable) et les invariants de cohérence.

/** Échelle de profondeur pédagogique, du plus faible au plus fort. */
export const DEPTH_LEVELS = ['absent', 'mentioned', 'explained', 'practiced', 'evaluated'];

/** Rang numérique d'un niveau de profondeur (−1 si inconnu). */
export function depthRank(level) {
  return DEPTH_LEVELS.indexOf(level);
}

/** Domaines transverses du sprint. */
export const V17_DOMAINS = ['quality', 'performance', 'documentation'];

/**
 * Taxonomie canonique des sujets V17 (stable — les plans y référencent par id).
 * Aucune donnée rédactionnelle ici, seulement l'étiquette et le domaine.
 */
export const V17_TOPICS = [
  { id: 'tech-debt', label: 'Dette technique', domain: 'quality' },
  { id: 'maintenance', label: 'Maintenance (corrective, adaptative, préventive, évolutive)', domain: 'quality' },
  { id: 'refactoring', label: 'Refactoring sans régression', domain: 'quality' },
  { id: 'code-smells', label: 'Code smells & legacy', domain: 'quality' },
  { id: 'deprecation', label: 'Dépréciation, compatibilité ascendante & migration', domain: 'quality' },
  { id: 'perf-measure', label: "Mesurer avant d'optimiser (baseline, profiling, benchmark)", domain: 'performance' },
  { id: 'perf-metrics', label: 'Latence, débit & percentiles (p50/p95/p99, bound)', domain: 'performance' },
  { id: 'perf-pitfalls', label: 'Pièges de performance (N+1, memory leak, bundle, cache, cold start)', domain: 'performance' },
  { id: 'perf-regression', label: 'Budget & régression de performance', domain: 'performance' },
  { id: 'doc-decision', label: 'Documentation de décision (ADR, RFC, changelog, decision log)', domain: 'documentation' },
  { id: 'doc-design', label: 'Documentation de conception (HLD, HSD, LLD, TSD, C4, contrat d’API)', domain: 'documentation' },
  { id: 'doc-ops', label: "Documentation d'exploitation (runbook, playbook, post-mortem)", domain: 'documentation' },
];

export const V17_TOPIC_IDS = new Set(V17_TOPICS.map((t) => t.id));

/** Table id → topic. */
const TOPIC_BY_ID = new Map(V17_TOPICS.map((t) => [t.id, t]));
export function topicById(id) {
  return TOPIC_BY_ID.get(id) ?? null;
}

// ── Extraction de références internes (pur, réutilisable par la gate) ─────────

/**
 * Extrait les numéros de journée référencés dans un texte français.
 * Formes reconnues : « jour 49 », « jours 49 », « day-049 », « day 49 ».
 * Retourne un tableau trié unique de nombres.
 */
export function extractDayRefs(text) {
  if (!text) return [];
  const out = new Set();
  const re = /\b(?:jours?|day)[\s-]*0*(\d{1,3})\b/gi;
  let m;
  while ((m = re.exec(text))) {
    const n = Number(m[1]);
    if (n >= 1 && n <= 365) out.add(n);
  }
  return [...out].sort((a, b) => a - b);
}

/**
 * Extrait les identifiants d'exercice plausibles cités dans un texte, restreints
 * à l'ensemble connu (pas d'heuristique fragile : on ne « trouve » qu'un id qui
 * existe réellement). Retourne un tableau unique.
 */
export function extractExerciseRefs(text, knownIds) {
  if (!text || !knownIds) return [];
  const out = new Set();
  for (const id of knownIds) {
    // limites de mot autour de l'id (les ids sont en kebab-case)
    const re = new RegExp(`(?<![\\w-])${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`);
    if (re.test(text)) out.add(id);
  }
  return [...out];
}

// ── Validation du plan d'enrichissement ──────────────────────────────────────

/**
 * Valide un plan d'enrichissement V17 contre le contexte réel.
 *
 * @param {object} plan  { topics?, days?, exercisesAdded?, glossaryTermsAdded?, allowedSourceModules? }
 *   - days: [{ day:number, topics:string[], tracks:string[], objective:string,
 *              exercises?:string[], docDeliverables?:string[] }]
 *   - exercisesAdded: [{ id, skills:string[], day?:number }]
 *   - glossaryTermsAdded: [{ term, shortDefinition, detailedDefinition }]
 * @param {object} ctx
 *   - validDays: Set<number>   journées existantes (1..365)
 *   - trackIds: Set<string>    identifiants de parcours valides
 *   - skillIds: Set<string>    compétences existantes
 *   - exerciseIds: Set<string> exercices existants (corpus)
 *   - glossaryTerms: Set<string> termes déjà présents (minuscule) pour doublons
 * @returns {{ errors: string[] }}
 */
export function validateCoveragePlan(plan = {}, ctx = {}) {
  const errors = [];
  const validDays = ctx.validDays ?? new Set();
  const trackIds = ctx.trackIds ?? new Set();
  const skillIds = ctx.skillIds ?? new Set();
  const exerciseIds = ctx.exerciseIds ?? new Set();
  const glossaryTerms = ctx.glossaryTerms ?? new Set();

  // 0. Taxonomie : ids de topics uniques et connus.
  const seenTopicDays = new Set();
  const days = Array.isArray(plan.days) ? plan.days : [];

  for (const entry of days) {
    const label = `journée ${entry?.day}`;
    // 1. Référence vers un jour inexistant.
    if (!Number.isInteger(entry?.day) || !validDays.has(entry.day)) {
      errors.push(`${label} : référence vers un jour inexistant`);
      continue;
    }
    // 2. Doublon de journée dans le plan.
    if (seenTopicDays.has(entry.day)) {
      errors.push(`${label} : doublon dans le plan`);
    }
    seenTopicDays.add(entry.day);
    // 3. Journée enrichie sans objectif clair.
    if (!entry.objective || String(entry.objective).trim().length < 12) {
      errors.push(`${label} : enrichissement sans objectif clair`);
    }
    // 4. Topics valides.
    for (const t of entry.topics ?? []) {
      if (!V17_TOPIC_IDS.has(t)) errors.push(`${label} : sujet inconnu « ${t} »`);
    }
    if (!(entry.topics ?? []).length) errors.push(`${label} : aucun sujet transverse rattaché`);
    // 5. Parcours valides.
    for (const tr of entry.tracks ?? []) {
      if (!trackIds.has(tr)) errors.push(`${label} : parcours inconnu « ${tr} »`);
    }
    if (!(entry.tracks ?? []).length) errors.push(`${label} : aucun parcours rattaché`);
    // 6. Exercices référencés existants (ou déclarés ajoutés).
    const added = new Set((plan.exercisesAdded ?? []).map((e) => e.id));
    for (const ex of entry.exercises ?? []) {
      if (!exerciseIds.has(ex) && !added.has(ex)) {
        errors.push(`${label} : exercice lié inexistant « ${ex} »`);
      }
    }
  }

  // 7. Exercices ajoutés : compétences existantes, id unique, journée valide.
  const exSeen = new Set();
  for (const ex of plan.exercisesAdded ?? []) {
    if (exSeen.has(ex.id)) errors.push(`exercice « ${ex.id} » : doublon dans le plan`);
    exSeen.add(ex.id);
    for (const s of ex.skills ?? []) {
      if (!skillIds.has(s)) errors.push(`exercice « ${ex.id} » : compétence absente « ${s} »`);
    }
    if (!(ex.skills ?? []).length) errors.push(`exercice « ${ex.id} » : aucune compétence`);
    if (ex.day != null && !validDays.has(ex.day)) {
      errors.push(`exercice « ${ex.id} » : journée liée inexistante ${ex.day}`);
    }
  }

  // 8. Entrées de glossaire ajoutées : définition présente, pas de doublon.
  const gSeen = new Set();
  for (const g of plan.glossaryTermsAdded ?? []) {
    const key = String(g.term ?? '').toLowerCase();
    if (!key) errors.push('entrée de glossaire sans terme');
    if (gSeen.has(key)) errors.push(`glossaire « ${g.term} » : doublon dans le plan`);
    gSeen.add(key);
    if (glossaryTerms.has(key)) errors.push(`glossaire « ${g.term} » : déjà présent dans le glossaire`);
    if (!g.shortDefinition || !g.detailedDefinition) {
      errors.push(`glossaire « ${g.term} » : définition manquante`);
    }
  }

  return { errors };
}

/** Sujets couverts par une journée du plan. */
export function topicsForDay(plan, day) {
  const entry = (plan.days ?? []).find((d) => d.day === day);
  return entry ? [...(entry.topics ?? [])] : [];
}

/** Journées couvrant un sujet donné. */
export function daysForTopic(plan, topicId) {
  return (plan.days ?? []).filter((d) => (d.topics ?? []).includes(topicId)).map((d) => d.day);
}

/** Couverture agrégée par domaine : nb de journées touchant chaque domaine. */
export function coverageByDomain(plan) {
  const out = Object.fromEntries(V17_DOMAINS.map((d) => [d, 0]));
  for (const entry of plan.days ?? []) {
    const domains = new Set(
      (entry.topics ?? []).map((t) => topicById(t)?.domain).filter(Boolean),
    );
    for (const d of domains) out[d] += 1;
  }
  return out;
}
