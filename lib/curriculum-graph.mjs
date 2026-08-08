// Curriculum Graph — MODÈLE DE LECTURE DÉRIVÉ (V31).
//
// Ce module ne détient AUCUNE vérité propre : il ne fait qu'AGRÉGER des sources
// existantes (les leçons de data/program.json, les graphes de prérequis des
// plans de sprint, les artefacts pratiques) en un graphe unique, puis l'AUDITE.
// Il ne remplace ni le catalogue, ni le moteur de progression, ni les gates ;
// il donne une vue transversale « prérequis → leçon → pratique → compétence »
// pour détecter automatiquement quand la chaîne pédagogique est CASSÉE.
//
// PUR : aucune I/O, aucun accès disque ni réseau. Toutes les données entrent par
// arguments (l'appelant lit les fichiers et passe des objets/ensembles). Ainsi
// le module reste testable en isolation et ne peut pas devenir une seconde base.

// ── Types de nœuds et d'arêtes ───────────────────────────────────────────────
export const NODE_KINDS = ['lesson', 'exercise', 'mission', 'playbook', 'lab', 'skill'];
export const EDGE_KINDS = ['REQUIRES', 'PRACTICES', 'BUILDS_SKILL'];

// Sévérités d'anomalies. `blocking` casse la chaîne (référence morte, cycle) ;
// `warning`/`info` signalent une faiblesse pédagogique sans invalider le graphe.
export const SEVERITIES = ['blocking', 'warning', 'info'];

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const asSet = (v) => (v instanceof Set ? v : new Set(Array.isArray(v) ? v : []));

/**
 * Construit le graphe dérivé. NE LANCE JAMAIS : renvoie une structure normalisée.
 *
 * @param {object} args
 * @param {Array<{slug,title?,cat?,skills?,practiceRefs?}>} args.lessons  Leçons (program.lessons).
 * @param {Array<Record<string,string[]>>} args.prereqPlans  Graphes de prérequis (un par plan de sprint) ; fusionnés en union.
 * @param {{exercises?:Set<string>|string[], missions?:Set<string>|string[], playbooks?:Set<string>|string[], labs?:Set<string>|string[]}} [args.known]  Identifiants d'artefacts RÉELLEMENT présents (pour résoudre les practiceRefs).
 * @returns {{
 *   lessons: Set<string>,
 *   requires: Map<string, Set<string>>,
 *   practices: Array<{lesson:string, kind:string, id:string, resolved:boolean}>,
 *   buildsSkill: Map<string, Set<string>>,
 *   skills: Set<string>,
 *   nodes: Array<{id:string, kind:string}>,
 *   edges: Array<{from:string, to:string, kind:string}>,
 * }}
 */
export function buildCurriculumGraph({ lessons = [], prereqPlans = [], known = {} } = {}) {
  const lessonSet = new Set();
  const buildsSkill = new Map();
  const skills = new Set();
  const practices = [];

  const knownEx = asSet(known.exercises);
  const knownMi = asSet(known.missions);
  const knownPb = asSet(known.playbooks);
  const knownLab = asSet(known.labs);
  const resolves = (kind, id) => {
    if (kind === 'exercise') return knownEx.has(id);
    if (kind === 'mission') return knownMi.has(id);
    if (kind === 'playbook') return knownPb.has(id);
    if (kind === 'lab') return knownLab.has(id);
    return false;
  };

  for (const l of Array.isArray(lessons) ? lessons : []) {
    if (!isObj(l) || typeof l.slug !== 'string' || !l.slug) continue;
    lessonSet.add(l.slug);
    const ls = new Set();
    for (const s of Array.isArray(l.skills) ? l.skills : []) {
      if (typeof s === 'string' && s) { ls.add(s); skills.add(s); }
    }
    buildsSkill.set(l.slug, ls);
    for (const r of Array.isArray(l.practiceRefs) ? l.practiceRefs : []) {
      if (!isObj(r) || typeof r.kind !== 'string' || typeof r.id !== 'string') continue;
      practices.push({ lesson: l.slug, kind: r.kind, id: r.id, resolved: resolves(r.kind, r.id) });
    }
  }

  // REQUIRES : union de tous les plans (une arête existe si UN plan la déclare).
  const requires = new Map();
  for (const plan of Array.isArray(prereqPlans) ? prereqPlans : []) {
    if (!isObj(plan)) continue;
    for (const [slug, deps] of Object.entries(plan)) {
      if (!requires.has(slug)) requires.set(slug, new Set());
      const bucket = requires.get(slug);
      for (const d of Array.isArray(deps) ? deps : []) if (typeof d === 'string' && d) bucket.add(d);
    }
  }

  // Vues plates nœuds/arêtes (pratiques pour rapport et parcours).
  const nodes = [];
  for (const s of lessonSet) nodes.push({ id: s, kind: 'lesson' });
  for (const s of skills) nodes.push({ id: `skill:${s}`, kind: 'skill' });
  const artifactSeen = new Set();
  for (const p of practices) {
    const nid = `${p.kind}:${p.id}`;
    if (!artifactSeen.has(nid)) { artifactSeen.add(nid); nodes.push({ id: nid, kind: p.kind }); }
  }
  const edges = [];
  for (const [slug, deps] of requires) for (const d of deps) edges.push({ from: slug, to: d, kind: 'REQUIRES' });
  for (const p of practices) edges.push({ from: p.lesson, to: `${p.kind}:${p.id}`, kind: 'PRACTICES' });
  for (const [slug, ss] of buildsSkill) for (const s of ss) edges.push({ from: slug, to: `skill:${s}`, kind: 'BUILDS_SKILL' });

  return { lessons: lessonSet, requires, practices, buildsSkill, skills, nodes, edges };
}

/**
 * Détecte les cycles dans le graphe REQUIRES (DFS coloriage). Renvoie la liste
 * des cycles trouvés (chaque cycle = tableau de slugs, dernier = premier).
 * @param {Map<string,Set<string>>} requires
 * @returns {string[][]}
 */
export function findPrereqCycles(requires) {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map();
  const cycles = [];
  const stack = [];
  const nodes = new Set(requires.keys());
  for (const deps of requires.values()) for (const d of deps) nodes.add(d);
  for (const n of nodes) color.set(n, WHITE);

  const visit = (u) => {
    color.set(u, GRAY);
    stack.push(u);
    for (const v of requires.get(u) ?? []) {
      if (color.get(v) === GRAY) {
        const i = stack.indexOf(v);
        cycles.push([...stack.slice(i), v]);
      } else if (color.get(v) === WHITE) {
        visit(v);
      }
    }
    stack.pop();
    color.set(u, BLACK);
  };
  for (const n of nodes) if (color.get(n) === WHITE) visit(n);
  return cycles;
}

/**
 * Audite un graphe dérivé et renvoie des anomalies TYPÉES, triées par sévérité.
 * Ne lance jamais.
 *
 * Types :
 *  - prereq-cycle        (blocking) : cycle de prérequis → progression impossible.
 *  - dead-prereq         (blocking) : prérequis pointant une leçon inexistante.
 *  - dead-practiceref    (blocking) : practiceRef vers un artefact absent.
 *  - concept-not-practiced (warning): compétence enseignée mais aucune leçon qui la
 *                                      porte n'a de pratique associée.
 *  - orphan-lesson       (info)     : leçon sans aucune arête (ni prérequis, ni
 *                                      pratique, ni compétence) — hors du graphe.
 *
 * @param {ReturnType<typeof buildCurriculumGraph>} graph
 * @returns {{ anomalies: Array<{type:string, severity:string, subject:string, detail:string}>,
 *            blocking: Array<object>, counts: Record<string,number>, ok: boolean }}
 */
export function auditCurriculumGraph(graph) {
  const anomalies = [];
  const add = (type, severity, subject, detail) => anomalies.push({ type, severity, subject, detail });
  const { lessons, requires, practices, buildsSkill, skills } = graph;

  // 1. Cycles de prérequis.
  for (const cycle of findPrereqCycles(requires)) {
    add('prereq-cycle', 'blocking', cycle[0], `cycle de prérequis : ${cycle.join(' → ')}`);
  }

  // 2. Prérequis morts (cible inconnue).
  for (const [slug, deps] of requires) {
    for (const d of deps) {
      if (!lessons.has(d)) add('dead-prereq', 'blocking', slug, `prérequis « ${d} » introuvable parmi les leçons`);
    }
    if (!lessons.has(slug)) add('dead-prereq', 'blocking', slug, `la leçon « ${slug} » du graphe de prérequis n'existe pas`);
  }

  // 3. practiceRefs morts.
  for (const p of practices) {
    if (!p.resolved) add('dead-practiceref', 'blocking', p.lesson, `pratique ${p.kind} « ${p.id} » introuvable`);
  }

  // 4. Compétences non pratiquées : une compétence portée uniquement par des
  //    leçons SANS practiceRef n'est jamais mise en pratique nulle part.
  const practicedLessons = new Set(practices.filter((p) => p.resolved).map((p) => p.lesson));
  for (const skill of skills) {
    const carriers = [];
    for (const [slug, ss] of buildsSkill) if (ss.has(skill)) carriers.push(slug);
    if (carriers.length > 0 && !carriers.some((c) => practicedLessons.has(c))) {
      add('concept-not-practiced', 'warning', `skill:${skill}`, `compétence « ${skill} » enseignée (${carriers.length} leçon(s)) mais jamais mise en pratique`);
    }
  }

  // 5. Leçons orphelines (aucune arête).
  const inRequires = new Set();
  for (const [slug, deps] of requires) { if (deps.size) inRequires.add(slug); for (const d of deps) inRequires.add(d); }
  for (const slug of lessons) {
    const hasPractice = practices.some((p) => p.lesson === slug);
    const hasSkill = (buildsSkill.get(slug)?.size ?? 0) > 0;
    if (!inRequires.has(slug) && !hasPractice && !hasSkill) {
      add('orphan-lesson', 'info', slug, `leçon « ${slug} » hors du graphe (aucun prérequis, aucune pratique, aucune compétence)`);
    }
  }

  const order = { blocking: 0, warning: 1, info: 2 };
  anomalies.sort((a, b) => (order[a.severity] - order[b.severity]) || a.type.localeCompare(b.type) || a.subject.localeCompare(b.subject));
  const counts = {};
  for (const a of anomalies) counts[a.severity] = (counts[a.severity] ?? 0) + 1;
  const blocking = anomalies.filter((a) => a.severity === 'blocking');
  return { anomalies, blocking, counts, ok: blocking.length === 0 };
}
