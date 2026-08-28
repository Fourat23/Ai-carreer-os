// Taxonomie CANONIQUE des compétences d'exercice — PURE, additive, rétrocompatible.
// Les identifiants de compétence sont des chaînes libres (preuves). Ce module
// NE migre RIEN : il RÉSOUT un id (synonyme / casse / pluriel) vers son id
// canonique et fournit un libellé lisible. Tout id historique reste résoluble
// (au pire vers lui-même normalisé) → aucune preuve existante n'est invalidée.
// Aucune modification de data/program.json ni des Markdown.

// Synonymes / variantes → id canonique. (Les ids déjà canoniques n'y figurent
// pas : ils se résolvent vers eux-mêmes via la normalisation.)
const ALIASES = {
  js: 'javascript', javascripts: 'javascript', ecmascript: 'javascript',
  ts: 'typescript',
  py: 'python', python3: 'python',
  reactjs: 'react',
  'higher-order-functions': 'hof', 'higher-order': 'hof', callbacks: 'hof',
  array: 'arrays', object: 'objects', condition: 'conditions', loop: 'loops',
  'function': 'functions', fn: 'functions',
  recursivity: 'recursion',
  'binary-search': 'search', 'linear-search': 'search',
  'hash-map': 'hashmap', hashmaps: 'hashmap',
  stacks: 'stack', queues: 'queue',
  'data-structures': 'ds', 'structures-de-donnees': 'ds',
  error: 'errors', 'exception': 'errors', exceptions: 'errors',
  'error-handling': 'errors',
  rest: 'http', api: 'http', apis: 'http',
  a11y: 'accessibility',
  test: 'testing', tests: 'testing',
  event: 'events', hook: 'hooks', prop: 'props', component: 'components',
  form: 'forms', style: 'css', styles: 'css',
  'lifting-state-up': 'lifting-state', 'lift-state': 'lifting-state',
  effect: 'effects', useeffect: 'effects',
  immutability: 'purity', 'pure-functions': 'purity',
  composition: 'components',
  // Data / IA / infra (V46) — variantes fines → id canonique de programme.
  'machine-learning': 'ml', 'deep-learning': 'dl', 'neural-networks': 'dl',
  'neural-network': 'dl', retrieval: 'rag', reranking: 'rag', embeddings: 'rag',
  agent: 'agents', 'tool-use': 'agents', orchestration: 'agents',
  evaluation: 'evalia', 'evaluation-ia': 'evalia', 'llmops': 'evalia',
  security: 'secu', 'prompt-injection': 'secu', secrets: 'secu',
  pandas: 'python', dataframe: 'python', etl: 'python', 'data-cleaning': 'python',
};

// Libellés lisibles (FR) par id canonique. Un id absent retombe sur l'id brut.
const LABELS = {
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
  react: 'React', jsx: 'JSX', node: 'Node.js', html: 'HTML', css: 'CSS',
  dom: 'DOM', http: 'HTTP / API', sql: 'SQL',
  algo: 'Algorithmique', ds: 'Structures de données',
  conditions: 'Conditions', loops: 'Boucles', functions: 'Fonctions',
  arrays: 'Tableaux', objects: 'Objets', hof: "Fonctions d'ordre supérieur",
  recursion: 'Récursion', search: 'Recherche', hashmap: 'Hash map',
  stack: 'Pile (stack)', queue: 'File (queue)', purity: 'Pureté / immutabilité',
  props: 'Props', state: 'État', events: 'Événements', hooks: 'Hooks',
  forms: 'Formulaires', components: 'Composants', effects: 'Effets (useEffect)',
  'lifting-state': "Remontée d'état", accessibility: 'Accessibilité',
  testing: 'Tests', errors: 'Gestion des erreurs', debugging: 'Débogage',
  responsive: 'Responsive', data: 'Données', linux: 'Terminal / Linux',
  git: 'Git',
  // Compétences de programme Data / IA / infra (V46) — libellés canoniques.
  jsts: 'JavaScript / TypeScript', gitlinux: 'Git / Linux',
  se: 'Software engineering', archi: 'Architecture', patterns: 'Design patterns',
  ml: 'Machine learning', dl: 'Deep learning', llm: 'LLM', rag: 'RAG',
  agents: 'Agents', evalia: 'Évaluation IA', secu: 'Sécurité',
  cloud: 'Cloud / DevOps', comm: 'Communication technique', autonomy: 'Autonomie projet',
};

// ── V65 · palier FIN → COMPÉTENCE DE PROGRAMME ────────────────────────────
//
// Mesuré au CP0 de V65 : les 376 exercices déclarent leurs compétences dans une
// taxonomie FINE (`javascript`, `arrays`, `conditions`…) tandis que
// `program.json` en définit VINGT. `skillStats()` appariait les deux sans
// traduction : **204 exercices sur 376 (54 %) ne créditaient aucune compétence
// de programme**. Un apprenant pouvait réussir 204 exercices — tests verts,
// preuve écrite sur disque — et lire « non abordée ».
//
// Cette table est le palier manquant. Elle est établie à partir des 35
// identifiants orphelins RÉELLEMENT présents dans le corpus, pas devinés.
// `curriculum/` n'est pas touché : c'est un mapping de code, pas du contenu.
//
// Les 20 compétences de programme :
//   algo ds jsts python gitlinux http sql se archi patterns
//   ml dl llm rag agents evalia secu cloud comm autonomy
const PROGRAM_SKILLS = new Set([
  'algo', 'ds', 'jsts', 'python', 'gitlinux', 'http', 'sql', 'se', 'archi', 'patterns',
  'ml', 'dl', 'llm', 'rag', 'agents', 'evalia', 'secu', 'cloud', 'comm', 'autonomy',
]);

const FINE_TO_PROGRAM = {
  // Langage et plateforme web → JavaScript / TypeScript
  javascript: 'jsts', typescript: 'jsts', node: 'jsts', jsx: 'jsts',
  react: 'jsts', props: 'jsts', components: 'jsts', hooks: 'jsts',
  state: 'jsts', events: 'jsts', forms: 'jsts', 'lifting-state': 'jsts',
  dom: 'jsts', html: 'jsts', css: 'jsts', responsive: 'jsts',
  accessibility: 'jsts',
  // Raisonnement algorithmique
  conditions: 'algo', loops: 'algo', functions: 'algo', hof: 'algo',
  recursion: 'algo', search: 'algo', purity: 'algo',
  // Structures de données
  arrays: 'ds', objects: 'ds', hashmap: 'ds', stack: 'ds', queue: 'ds',
  // Outillage et pratique d'ingénierie
  linux: 'gitlinux', git: 'gitlinux',
  testing: 'se', debugging: 'se', errors: 'se',
  // Données
  data: 'sql',
};

/**
 * Résout un identifiant (fin ou déjà canonique) vers une COMPÉTENCE DE PROGRAMME.
 * Renvoie `null` si aucune correspondance — on ne devine jamais.
 */
export function programSkill(id) {
  const c = canonicalSkill(id);
  if (!c) return null;
  if (PROGRAM_SKILLS.has(c)) return c;
  return FINE_TO_PROGRAM[c] ?? null;
}

/** Compétences de PROGRAMME couvertes par une liste d'identifiants (dédupliquées). */
export function programSkills(skills) {
  const out = [];
  for (const s of Array.isArray(skills) ? skills : []) {
    const p = programSkill(s);
    if (p && !out.includes(p)) out.push(p);
  }
  return out;
}

/** Vrai si l'identifiant est une compétence de programme. */
export function isProgramSkill(id) {
  return PROGRAM_SKILLS.has(canonicalSkill(id));
}

export { PROGRAM_SKILLS, FINE_TO_PROGRAM };

/** Normalise (trim, minuscule, espaces/underscores → tiret). */
export function normalizeSkillId(id) {
  return String(id ?? '').trim().toLowerCase().replace(/[\s_]+/g, '-');
}

/** Résout un id vers sa forme canonique (rétrocompatible : jamais vide si non vide). */
export function canonicalSkill(id) {
  const n = normalizeSkillId(id);
  if (!n) return '';
  return ALIASES[n] ?? n;
}

/** Canonicalise une liste : résolution + déduplication en préservant l'ordre. */
export function canonicalizeSkills(skills) {
  const out = [];
  for (const s of Array.isArray(skills) ? skills : []) {
    const c = canonicalSkill(s);
    if (c && !out.includes(c)) out.push(c);
  }
  return out;
}

/** Libellé lisible d'un id (canonicalisé d'abord). */
export function skillLabel(id) {
  const c = canonicalSkill(id);
  return LABELS[c] ?? c;
}

/** Vrai si l'id (canonicalisé) est un identifiant canonique connu (a un libellé). */
export function isKnownSkill(id) {
  return Object.prototype.hasOwnProperty.call(LABELS, canonicalSkill(id));
}

export { ALIASES as SKILL_ALIASES, LABELS as SKILL_LABELS };
