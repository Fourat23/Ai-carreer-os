// Catalogue de parcours & modules — PUR, validé au chargement. Un module est
// défini une fois et RÉFÉRENCÉ par les parcours (jamais copié). Le programme
// actuel (365 jours) devient le premier parcours « ai-engineer-foundations-v1 »,
// dont les modules sont dérivés des mois du programme (références de jours, pas
// de duplication de contenu). Aucune donnée pédagogique n'est modifiée ici.

export const DEFAULT_TRACK_ID = 'ai-engineer-foundations-v1';

// Taxonomie initiale (non exhaustive). Un id stable ≠ libellé affiché.
export const TECHNOLOGIES = [
  { id: 'git', name: 'Git', area: 'foundations' },
  { id: 'linux', name: 'Terminal / Linux', area: 'foundations' },
  { id: 'javascript', name: 'JavaScript', area: 'foundations' },
  { id: 'typescript', name: 'TypeScript', area: 'foundations' },
  { id: 'node', name: 'Node.js', area: 'backend' },
  { id: 'react', name: 'React', area: 'frontend' },
  { id: 'nextjs', name: 'Next.js', area: 'frontend' },
  { id: 'api', name: 'API / HTTP', area: 'backend' },
  { id: 'sql', name: 'SQL / PostgreSQL', area: 'data' },
  { id: 'testing', name: 'Tests', area: 'engineering' },
  { id: 'architecture', name: 'Architecture logicielle', area: 'engineering' },
  { id: 'docker', name: 'Docker', area: 'devops' },
  { id: 'cloud', name: 'Cloud', area: 'devops' },
  { id: 'python', name: 'Python', area: 'data' },
  { id: 'llm', name: 'LLM', area: 'ai' },
  { id: 'rag', name: 'RAG', area: 'ai' },
  { id: 'agents', name: 'Agents', area: 'ai' },
  { id: 'evaluation', name: 'Évaluation IA', area: 'ai' },
  { id: 'ai-security', name: 'Sécurité IA', area: 'ai' },
];

// Parcours annoncés (pas encore implémentés — non activables).
export const ANNOUNCED_TRACKS = [
  { id: 'ai-fullstack-v1', title: 'Full-stack orienté IA', goal: 'Concevoir des produits web dopés à l’IA.', technologies: ['react', 'nextjs', 'node', 'api', 'llm'] },
  { id: 'frontend-engineer-v1', title: 'Frontend Engineer', goal: 'Interfaces modernes, accessibles, performantes.', technologies: ['javascript', 'typescript', 'react', 'nextjs', 'testing'] },
  { id: 'cloud-devops-v1', title: 'Cloud / DevOps', goal: 'CI/CD, conteneurs, infrastructure.', technologies: ['docker', 'cloud', 'linux', 'testing'] },
  { id: 'data-ml-v1', title: 'Data / ML', goal: 'Données, modèles, pipelines ML.', technologies: ['python', 'sql', 'evaluation', 'llm'] },
];

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const uniq = (a) => [...new Set(a)];
const DANGEROUS = new Set(['__proto__', 'prototype', 'constructor']);
const VALID_STATUS = new Set(['available', 'announced']);
const MAX_MODULES = 64;

// Parcours Full-Stack TypeScript (V14). Il SÉLECTIONNE les journées du trimestre 1
// (mois 1-4, jours 1-119 : fondation génie logiciel), regroupées en modules
// thématiques par PLAGES CONTIGUËS (aucun jour dupliqué, aucun contenu copié).
// Les jours IA (mois 5-12) sont hors périmètre de ce parcours.
export const FULLSTACK_TRACK_ID = 'fullstack-typescript';
const FULLSTACK_MODULE_SPECS = [
  ['fst-01-env', 'Environnement, terminal & Git', 'Installer son environnement, maîtriser le terminal et Git.', 1, 7],
  ['fst-02-js', 'JavaScript moderne', 'Tableaux, fonctions, objets, fichiers — les fondamentaux du langage.', 8, 14],
  ['fst-03-algo', 'Algorithmie & structures de données', 'Complexité, recherche, tris, récursion, transformations, Map/Set, piles/files.', 15, 35],
  ['fst-04-ts', 'TypeScript & conception', 'Typage, types avancés, POO, patterns, clean code, débogage, FP — Projet 1.', 36, 49],
  ['fst-05-http', 'HTTP, REST & Node/Express', 'Le protocole HTTP, la conception REST, Node natif et Express.', 50, 56],
  ['fst-06-sql', 'SQL & persistance', 'SQL, modélisation, transactions — une API réellement persistée (Projet 2).', 57, 66],
  ['fst-07-secu', 'Sécurité & robustesse d’API', 'OWASP appliqué, authentification par token, gestion des secrets, refactor.', 67, 70],
  ['fst-08-archi', 'Architecture, observabilité & qualité', 'Réseau, architecture 3-tiers/MVC, observabilité, cache, trade-offs.', 71, 86],
  ['fst-09-react', 'React : composants, état & hooks', 'JSX/TSX, composants, props, état, événements, hooks, formulaires, accessibilité.', 87, 105],
  ['fst-10-tests', 'Tests & qualité front', 'Tests unitaires, tests de composants React, mocks, hooks, robustesse.', 106, 112],
  ['fst-11-projet', 'Projet full-stack final', 'BiblioApp : socle, CRUD, recherche, tests, polish, livraison.', 113, 119],
];
const FULLSTACK_TECHS = ['linux', 'git', 'javascript', 'typescript', 'node', 'react', 'api', 'sql', 'testing', 'architecture'];

/** Modules du parcours Full-Stack : plages de jours réelles, skills dérivés. */
function fullstackModules(program) {
  const days = program?.days ?? [];
  return FULLSTACK_MODULE_SPECS.map(([id, title, summary, from, to]) => {
    const mdays = days.filter((d) => d.day >= from && d.day <= to).sort((a, b) => a.day - b.day);
    return { id, title, summary, dayRefs: mdays.map((d) => d.day), skills: uniq(mdays.map((d) => d.skill).filter(Boolean)), projectRef: null };
  });
}

// Parcours Backend Engineer (V15). SÉLECTIONNE le spine serveur du trimestre 1
// (jours 1-86), SANS le bloc frontend/React (j87-119) NI l'intro Python/data
// (j82) → parcours volontairement NON CONTIGU (saut j81→j83). Aucun contenu copié.
export const BACKEND_TRACK_ID = 'backend-engineer-v1';
const BACKEND_MODULE_SPECS = [
  ['be-01-foundations', 'Fondations backend (terminal, Git, JS)', 'Terminal, Git et JavaScript pour le développement serveur.', 1, 14],
  ['be-02-algo', 'Algorithmie & structures de données', 'Complexité, recherche, récursion, Map/Set, piles/files.', 15, 35],
  ['be-03-typescript', 'TypeScript & conception', 'Typage, POO, patterns, clean code, débogage — Projet 1.', 36, 49],
  ['be-04-http-node', 'HTTP, Node & Express', 'Le protocole HTTP, la conception REST, Node natif, Express, validation et erreurs.', 50, 56],
  ['be-05-sql-project', 'SQL, persistance & API (Projet 2)', 'SQL, modélisation, transactions — une API réellement persistée.', 57, 66],
  ['be-06-security', 'Sécurité applicative', 'OWASP appliqué, authentification par token, gestion des secrets.', 67, 70],
  ['be-07-architecture', 'Architecture, observabilité & qualité', 'Réseau, terminal/Git avancés, architecture 3-tiers/MVC, observabilité, cache, trade-offs.', 71, 81],
  ['be-08-consolidation', 'Consolidation & durcissement', 'Consolidation, durcissement et performance de l’API (Projet 2).', 83, 86],
];
const BACKEND_TECHS = ['linux', 'git', 'javascript', 'typescript', 'node', 'api', 'sql', 'testing', 'architecture'];

/** Modules du parcours Backend : mêmes règles génériques (plages, skills dérivés). */
function backendModules(program) {
  const days = program?.days ?? [];
  return BACKEND_MODULE_SPECS.map(([id, title, summary, from, to]) => {
    const mdays = days.filter((d) => d.day >= from && d.day <= to).sort((a, b) => a.day - b.day);
    return { id, title, summary, dayRefs: mdays.map((d) => d.day), skills: uniq(mdays.map((d) => d.skill).filter(Boolean)), projectRef: null };
  });
}

/** Dérive les modules du parcours fondations depuis les mois du programme. */
function foundationsModules(program) {
  const days = program?.days ?? [];
  const months = [...(program?.months ?? [])].sort((a, b) => a.month - b.month);
  return months.map((m) => {
    const mdays = days.filter((d) => d.month === m.month).sort((a, b) => a.day - b.day);
    return {
      id: `mod-m${m.month}`,
      title: m.title ?? `Mois ${m.month}`,
      summary: m.summary ?? '',
      dayRefs: mdays.map((d) => d.day),
      skills: uniq(mdays.map((d) => d.skill).filter(Boolean)),
      projectRef: m.project?.id != null ? String(m.project.id) : null,
    };
  });
}

/**
 * Construit le catalogue complet à partir du programme, PUIS le valide.
 * Lance une erreur explicite si une référence est cassée ou un id dupliqué.
 * @returns {{ technologies, modules: Record<string,object>, tracks: object[] }}
 */
export function buildCatalogue(program) {
  const dayNums = new Set((program?.days ?? []).map((d) => d.day));
  const modList = foundationsModules(program);
  const fstList = fullstackModules(program);
  const beList = backendModules(program);
  const modules = {};
  for (const m of modList) modules[m.id] = m;
  for (const m of fstList) modules[m.id] = m;
  for (const m of beList) modules[m.id] = m;

  const fullstackDayCount = new Set(fstList.flatMap((m) => m.dayRefs)).size;
  const fullstack = {
    id: FULLSTACK_TRACK_ID,
    version: '1',
    status: 'available',
    title: 'Full-Stack TypeScript Engineer',
    goal: 'Concevoir, développer, tester et livrer une application web full-stack en TypeScript : React, Node.js, APIs HTTP, SQL, tests, architecture.',
    roles: ['Développeur Full-Stack TypeScript junior', 'Développeur Backend Node.js junior', 'Développeur Frontend React/TypeScript junior'],
    moduleRefs: fstList.map((m) => m.id),
    technologies: FULLSTACK_TECHS,
    totalDays: fullstackDayCount,
    completion: { minDaysDone: fullstackDayCount },
  };

  const backendDayCount = new Set(beList.flatMap((m) => m.dayRefs)).size;
  const backend = {
    id: BACKEND_TRACK_ID,
    version: '1',
    status: 'available',
    title: 'Backend Engineer',
    goal: 'Concevoir et exposer des APIs HTTP/REST robustes en Node.js/TypeScript : validation, erreurs, persistance SQL, sécurité, architecture et observabilité.',
    roles: ['Développeur Backend Node.js junior', 'Développeur API TypeScript junior'],
    moduleRefs: beList.map((m) => m.id),
    technologies: BACKEND_TECHS,
    totalDays: backendDayCount,
    completion: { minDaysDone: backendDayCount },
  };

  const foundations = {
    id: DEFAULT_TRACK_ID,
    version: '1',
    status: 'available',
    title: 'AI Engineer — Fondations',
    goal: 'Devenir employable sur des rôles IA appliquée en 12 mois : fondations, ingénierie, IA appliquée.',
    moduleRefs: modList.map((m) => m.id),
    // Le parcours fondations couvre l'ensemble de la taxonomie (référence les ids
    // de TECHNOLOGIES, pas les ids de compétences internes des modules).
    technologies: TECHNOLOGIES.map((t) => t.id),
    totalDays: (program?.days ?? []).length,
  };

  const announced = ANNOUNCED_TRACKS.map((t) => ({
    ...t, version: '1', status: 'announced', moduleRefs: [], totalDays: 0,
  }));

  const catalogue = { technologies: TECHNOLOGIES, modules, tracks: [foundations, fullstack, backend, ...announced] };
  validateCatalogue(catalogue, dayNums);
  return catalogue;
}

/** Validation stricte : ids uniques, refs résolues, jours existants. Lance sinon. */
export function validateCatalogue(catalogue, dayNums = null) {
  if (!isObj(catalogue) || !Array.isArray(catalogue.tracks) || !isObj(catalogue.modules)) {
    throw new Error('Catalogue invalide : structure attendue { modules, tracks }.');
  }
  const trackIds = new Set();
  const moduleIds = Object.keys(catalogue.modules);
  if (new Set(moduleIds).size !== moduleIds.length) throw new Error('Catalogue : id de module dupliqué.');

  for (const mid of moduleIds) {
    const m = catalogue.modules[mid];
    if (m.id !== mid) throw new Error(`Catalogue : id de module incohérent (${mid}).`);
    if (dayNums) for (const d of m.dayRefs ?? []) {
      if (!dayNums.has(d)) throw new Error(`Catalogue : jour inexistant ${d} référencé par le module ${mid}.`);
    }
  }
  const techIds = new Set((catalogue.technologies ?? []).map((x) => x.id));
  for (const t of catalogue.tracks) {
    if (!t.id || DANGEROUS.has(t.id)) throw new Error('Catalogue : parcours sans id valide.');
    if (trackIds.has(t.id)) throw new Error(`Catalogue : id de parcours dupliqué (${t.id}).`);
    trackIds.add(t.id);
    if (!VALID_STATUS.has(t.status)) throw new Error(`Catalogue : statut invalide « ${t.status} » (parcours « ${t.id} »).`);
    if ((t.moduleRefs ?? []).length > MAX_MODULES) throw new Error(`Catalogue : trop de modules (parcours « ${t.id} »).`);
    for (const ref of t.moduleRefs ?? []) {
      if (!catalogue.modules[ref]) throw new Error(`Catalogue : référence de module cassée « ${ref} » dans le parcours « ${t.id} ».`);
    }
    for (const tech of t.technologies ?? []) {
      if (!techIds.has(tech)) throw new Error(`Catalogue : technologie inconnue « ${tech} » (parcours « ${t.id} »).`);
    }
    // Contrôles renforcés propres aux parcours DISPONIBLES.
    if (t.status === 'available') {
      if (!(t.moduleRefs ?? []).length) throw new Error(`Catalogue : parcours disponible sans module (« ${t.id} »).`);
      const days = resolveTrackDays(catalogue, t);
      if (typeof t.totalDays === 'number' && t.totalDays !== days.length) {
        throw new Error(`Catalogue : totalDays incohérent (« ${t.id} » : déclaré ${t.totalDays}, résolu ${days.length}).`);
      }
      // Aucune journée dupliquée entre deux modules d'un même parcours (accidentel).
      const seen = new Set();
      for (const ref of t.moduleRefs) {
        for (const d of catalogue.modules[ref].dayRefs ?? []) {
          if (seen.has(d)) throw new Error(`Catalogue : jour ${d} dupliqué entre modules du parcours « ${t.id} ».`);
          seen.add(d);
        }
      }
    }
  }
  return true;
}

/**
 * Liste ORDONNÉE et dédupliquée des jours d'un parcours (concaténation des
 * dayRefs de ses modules, dans l'ordre). PURE. La durée d'un parcours en découle.
 * @param {object} catalogue
 * @param {object|string} trackOrId
 * @returns {number[]}
 */
export function resolveTrackDays(catalogue, trackOrId) {
  const track = typeof trackOrId === 'string' ? getTrack(catalogue, trackOrId) : trackOrId;
  if (!track) return [];
  const seen = new Set();
  const out = [];
  for (const ref of track.moduleRefs ?? []) {
    const m = catalogue?.modules?.[ref];
    if (!m) continue;
    for (const d of m.dayRefs ?? []) if (!seen.has(d)) { seen.add(d); out.push(d); }
  }
  return out;
}

export function getTrack(catalogue, id) {
  return (catalogue?.tracks ?? []).find((t) => t.id === id) ?? null;
}

/**
 * Objets-journée ORDONNÉS d'un parcours (résolution des numéros → objets du
 * programme, dans l'ordre du parcours). PURE. Sert les surfaces (Dashboard,
 * calendrier, trajectoire, navigation) à partir du parcours actif.
 * @returns {Array<object>}
 */
/**
 * Voisins d'une journée DANS un parcours (navigation bornée). PURE.
 * @param {number[]} trackDayNums  jours ordonnés du parcours (resolveTrackDays)
 * @param {number} day
 * @returns {{inTrack:boolean, prev:number|null, next:number|null, position:number|null, total:number}}
 */
export function trackNeighbors(trackDayNums, day) {
  const days = Array.isArray(trackDayNums) ? trackDayNums : [];
  const idx = days.indexOf(day);
  if (idx < 0) return { inTrack: false, prev: null, next: null, position: null, total: days.length };
  return {
    inTrack: true,
    prev: idx > 0 ? days[idx - 1] : null,
    next: idx < days.length - 1 ? days[idx + 1] : null,
    position: idx + 1,
    total: days.length,
  };
}

export function resolveTrackDayObjects(catalogue, trackOrId, program) {
  const nums = resolveTrackDays(catalogue, trackOrId);
  const byDay = new Map((program?.days ?? []).map((d) => [d.day, d]));
  const out = [];
  for (const n of nums) { const d = byDay.get(n); if (d) out.push(d); }
  return out;
}

/** Résout les modules d'un parcours (lance si une référence est cassée). */
export function getTrackModules(catalogue, track) {
  return (track?.moduleRefs ?? []).map((ref) => {
    const m = catalogue.modules[ref];
    if (!m) throw new Error(`Référence de module cassée « ${ref} ».`);
    return m;
  });
}

export function isTrackAvailable(track) {
  return !!track && track.status === 'available';
}
