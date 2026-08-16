// Couverture de PRATIQUE — READ-MODEL PUR et DÉRIVÉ (V43). Aucune vérité propre :
// il PROJETTE et COMPOSE les sources existantes (leçons, exercices, assessments,
// capstones, défis de transfert, missions, misconceptions) en une matrice par
// compétence de programme sur 7 dimensions. Chaque cellule est un signal EXPLICITE
// (full/partial/none + provenance), jamais un score opaque. La difficulté numérique
// et la taxonomie T0-T5 existantes sont réutilisées ; aucune taxonomie concurrente.
// PUR : aucun I/O, aucune écriture. Un signal est un PROXY structurel, pas une maîtrise.
import { canonicalSkill } from './skill-taxonomy.mjs';

export const COVERAGE_DIMENSIONS = ['foundation', 'practice', 'autonomy', 'diagnostic', 'variation', 'transfer', 'professional'];
export const READINESS_LEVELS = ['not-ready', 'foundational', 'guided', 'junior-ready', 'strong-junior'];

// Projection DOCUMENTÉE compétence fine (exercices) → compétence de programme (21).
// C'est une VUE : elle ne modifie ni les exercices ni program.json.
export const FINE_TO_PROGRAM = {
  // JS / TS / frontend → jsts
  javascript: 'jsts', typescript: 'jsts', conditions: 'jsts', loops: 'jsts', functions: 'jsts',
  arrays: 'jsts', objects: 'jsts', hof: 'jsts', purity: 'jsts', errors: 'jsts', debugging: 'jsts',
  react: 'jsts', jsx: 'jsts', props: 'jsts', state: 'jsts', events: 'jsts', hooks: 'jsts',
  forms: 'jsts', components: 'jsts', effects: 'jsts', 'lifting-state': 'jsts', dom: 'jsts',
  html: 'jsts', css: 'jsts', accessibility: 'jsts', responsive: 'jsts', testing: 'se',
  // algo / structures
  algo: 'algo', recursion: 'algo', search: 'algo',
  ds: 'ds', hashmap: 'ds', stack: 'ds', queue: 'ds',
  // backend / data
  http: 'http', sql: 'sql', node: 'jsts',
  // systèmes
  linux: 'gitlinux', git: 'gitlinux',
  // data / IA
  python: 'python', data: 'python',
  ml: 'ml', dl: 'dl', llm: 'llm', rag: 'rag', agents: 'agents', evalia: 'evalia',
  // sécurité / cloud / archi / patterns
  secu: 'secu', security: 'secu', cloud: 'cloud', archi: 'archi', patterns: 'patterns',
};

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const isStr = (v) => typeof v === 'string';

/** Projette une compétence (fine ou déjà programme) vers une compétence de programme. */
export function projectSkill(id) {
  if (!isStr(id)) return null;
  const c = canonicalSkill(id);
  if (FINE_TO_PROGRAM[c]) return FINE_TO_PROGRAM[c];
  if (FINE_TO_PROGRAM[id]) return FINE_TO_PROGRAM[id];
  return c; // compétences déjà au niveau programme (http, sql, se, archi, ml, rag, secu, cloud…) se résolvent à elles-mêmes
}

const cell = (level, from = []) => ({ level, from: from.filter(Boolean) });

/**
 * Couverture d'UNE compétence de programme, dérivée des sources. PUR.
 * @param {string} skillId compétence de programme
 * @param {{lessons?,exercises?,assessments?,capstones?,transferChallenges?,missions?,misconceptions?,skillName?}} sources
 */
export function skillCoverage(skillId, sources = {}) {
  const S = skillId;
  const lessons = Array.isArray(sources.lessons) ? sources.lessons : [];
  const exercises = Array.isArray(sources.exercises) ? sources.exercises : [];
  const assessments = Array.isArray(sources.assessments) ? sources.assessments : [];
  const capstones = Array.isArray(sources.capstones) ? sources.capstones : [];
  const transfers = Array.isArray(sources.transferChallenges) ? sources.transferChallenges : [];
  const missions = Array.isArray(sources.missions) ? sources.missions : [];
  const misconceptions = Array.isArray(sources.misconceptions) ? sources.misconceptions : [];
  // Labs (kubernetes/cloud/security/pipeline/topology) : PRATIQUE non-code, portée par
  // des compétences de programme (pas la taxonomie fine). Comptée pour practice/professional.
  const labs = Array.isArray(sources.labs) ? sources.labs : [];

  const projd = (skills) => (Array.isArray(skills) ? skills.map(projectSkill).filter(Boolean) : []);

  const skillLessons = lessons.filter((l) => Array.isArray(l.skills) && l.skills.includes(S));
  const skillEx = exercises.filter((e) => projd(e.skills).includes(S));
  const skillLabs = labs.filter((lb) => Array.isArray(lb.skills) && lb.skills.includes(S));
  const autonomousEx = skillEx.filter((e) => Number.isFinite(e.difficulty) && e.difficulty >= 3);
  const diagAssess = assessments.filter((a) => Array.isArray(a.skills) && a.skills.includes(S) && (a.questions || []).some((q) => q.taxonomy === 'DIAGNOSIS'));
  const transAssess = assessments.filter((a) => Array.isArray(a.skills) && a.skills.includes(S) && (a.questions || []).some((q) => q.taxonomy === 'TRANSFER'));
  const diagCap = capstones.filter((c) => Array.isArray(c.skills) && c.skills.includes(S) && (c.phases || []).some((p) => p.kind === 'diagnosis'));
  const skillTransfers = transfers.filter((t) => Array.isArray(t.skills) && t.skills.includes(S));
  const skillMis = misconceptions.filter((m) => m.skill === S);
  const skillMissions = missions.filter((m) => projd(m.skills).includes(S));
  const skillCaps = capstones.filter((c) => Array.isArray(c.skills) && c.skills.includes(S));

  const dims = {};
  dims.foundation = skillLessons.length ? cell('full', [`${skillLessons.length} leçon(s)`]) : cell('none');
  const practiceCount = skillEx.length + skillLabs.length;
  dims.practice = practiceCount >= 3 ? cell('full', [skillEx.length ? `${skillEx.length} exercices` : null, skillLabs.length ? `${skillLabs.length} lab(s)` : null].filter(Boolean))
    : practiceCount >= 1 ? cell('partial', [skillEx.length ? `${skillEx.length} exercice(s)` : null, skillLabs.length ? `${skillLabs.length} lab(s)` : null].filter(Boolean)) : cell('none');
  dims.autonomy = (autonomousEx.length >= 1 || skillLabs.length >= 1) ? cell('full', [autonomousEx.length ? `${autonomousEx.length} exo(s) difficulté ≥ 3` : null, skillLabs.length ? `${skillLabs.length} lab(s) autonomes` : null].filter(Boolean))
    : practiceCount >= 5 ? cell('partial', [`${practiceCount} activités (variété)`]) : cell('none');
  dims.diagnostic = (diagAssess.length || diagCap.length) ? cell('full', [...diagAssess.map((a) => `assessment ${a.id}`), ...diagCap.map((c) => `capstone ${c.id}`)])
    : skillMis.length ? cell('partial', [`${skillMis.length} misconception(s)`]) : cell('none');
  dims.variation = (skillTransfers.length || practiceCount >= 3) ? cell('full', skillTransfers.length ? skillTransfers.map((t) => `défi ${t.id}`) : [`${practiceCount} activités`])
    : practiceCount === 2 ? cell('partial', ['2 activités']) : cell('none');
  dims.transfer = skillTransfers.length ? cell('full', skillTransfers.map((t) => `défi ${t.id}`))
    : transAssess.length ? cell('partial', transAssess.map((a) => `assessment ${a.id}`)) : cell('none');
  dims.professional = (skillCaps.length || skillMissions.length || skillLabs.length) ? cell('full', [...skillCaps.map((c) => `capstone ${c.id}`), ...skillMissions.map((m) => `mission ${m.id}`), ...skillLabs.map((lb) => `lab ${lb.id}`)]) : cell('none');

  const gaps = COVERAGE_DIMENSIONS.filter((d) => dims[d].level === 'none');
  return { skill: S, name: isStr(sources.skillName) ? sources.skillName : S, dimensions: dims, readiness: deriveReadiness(dims), gaps };
}

/** Readiness dérivée de la COMBINAISON (jamais du seul volume). */
function deriveReadiness(dims) {
  const has = (d, min = 'partial') => dims[d].level === 'full' || (min === 'partial' && dims[d].level === 'partial');
  const full = (d) => dims[d].level === 'full';
  if (!(has('foundation') && has('practice'))) return 'not-ready';
  if (!has('autonomy')) return 'foundational';
  if (!(has('diagnostic') && (has('variation') || has('transfer')))) return 'guided';
  const allPartialPlus = COVERAGE_DIMENSIONS.every((d) => dims[d].level !== 'none');
  // RECALIBRAGE CONSERVATEUR (V44, ADR-044 D7) : « strong-junior » n'est atteint que si
  // l'autonomie repose sur une PRATIQUE DE CODE EXÉCUTABLE (au moins un exercice réel
  // difficulté ≥ 3), pas uniquement des labs simulés. Sinon on plafonne à junior-ready :
  // un raisonnement simulé ne prouve pas une maîtrise de junior « fort ».
  const executableAutonomy = dims.autonomy.from.some((f) => /exo/.test(f));
  if (allPartialPlus && full('transfer') && executableAutonomy) return 'strong-junior';
  return 'junior-ready';
}

/** Matrice complète : une ligne par compétence de programme. PUR. */
export function coverageMatrix(program, sources = {}) {
  const skills = (program && Array.isArray(program.skills)) ? program.skills : [];
  return skills.map((sk) => skillCoverage(sk.id, { ...sources, skillName: sk.name }));
}

/** Résumé : distribution de readiness + trous par dimension. PUR. */
export function coverageSummary(matrix) {
  const byReadiness = {};
  for (const r of READINESS_LEVELS) byReadiness[r] = 0;
  const gapsByDimension = {};
  for (const d of COVERAGE_DIMENSIONS) gapsByDimension[d] = 0;
  for (const row of Array.isArray(matrix) ? matrix : []) {
    if (byReadiness[row.readiness] !== undefined) byReadiness[row.readiness] += 1;
    for (const g of row.gaps) gapsByDimension[g] += 1;
  }
  return { byReadiness, gapsByDimension, total: Array.isArray(matrix) ? matrix.length : 0 };
}

/**
 * Feedback diagnostique dérivé : candidats de misconception COMPATIBLES avec une
 * erreur sur une compétence ou un exercice. Langage prudent (compatible, pas
 * « tu ne comprends pas »). PUR ; compose le registre V42.
 */
export function diagnosticFeedback({ skill, exerciseId } = {}, misconceptions = []) {
  const list = Array.isArray(misconceptions) ? misconceptions : [];
  const candidates = list.filter((m) =>
    (isStr(skill) && m.skill === skill) ||
    (isStr(exerciseId) && Array.isArray(m.exerciseRefs) && m.exerciseRefs.includes(exerciseId)));
  return {
    candidates: candidates.map((m) => ({ id: m.id, wrong: m.wrong, right: m.right, lessonRefs: [...(m.lessonRefs || [])], exerciseRefs: [...(m.exerciseRefs || [])] })),
  };
}
