// Practice ladder — READ-MODEL PUR et DÉRIVÉ (V44). Aucune vérité propre, aucune
// table persistée : la ladder L0–L5 d'une compétence de programme est PROJETÉE depuis
// les sources existantes (leçons, exercices avec `difficulty`, assessments, capstones,
// défis de transfert). Elle réutilise la MÊME projection fine→programme que
// practice-coverage ; elle ne crée ni difficulté ni taxonomie concurrente.
//
// Sémantique des échelons (cf. ADR/TSD-044) — cognitive, pas volumétrique :
//   L0 Concept            → une leçon fonde la compétence.
//   L1 Guidé              → exo d1-d2 (procédure évidente, stratégie fournie).
//   L2 Application        → exo d2-d3 (application d'un pattern connu).
//   L3 Stratégie autonome → exo d3+ (l'apprenant choisit l'approche).
//   L4 Diagnostic         → exo « debug » OU assessment DIAGNOSIS OU phase capstone diagnosis.
//   L5 Transfert          → défi de transfert OU question TRANSFER OU capstone.
//
// PUR : aucun I/O. Un échelon présent est un PROXY structurel (une activité de ce type
// existe), pas une preuve de maîtrise. Chaque échelon cite sa provenance.
import { projectSkill } from './practice-coverage.mjs';

export const LADDER_STEPS = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'];
export const LADDER_LABEL = {
  L0: 'Concept', L1: 'Guidé', L2: 'Application',
  L3: 'Stratégie autonome', L4: 'Diagnostic', L5: 'Transfert',
};

const asArr = (v) => (Array.isArray(v) ? v : []);
const isStr = (v) => typeof v === 'string';
const diffOf = (e) => (Number.isFinite(e.difficulty) ? e.difficulty : 2);

/**
 * Ladder d'UNE compétence de programme, dérivée des sources. PUR.
 * @param {string} programSkillId compétence de programme (ex. 'jsts', 'algo', 'http')
 * @param {{lessons?,exercises?,assessments?,capstones?,transferChallenges?,skillName?}} sources
 * @returns {{skill,name,steps:Record<string,{present:boolean,from:string[]}>,complete:boolean,missing:string[]}}
 */
export function skillLadder(programSkillId, sources = {}) {
  const S = programSkillId;
  const lessons = asArr(sources.lessons);
  const exercises = asArr(sources.exercises);
  const assessments = asArr(sources.assessments);
  const capstones = asArr(sources.capstones);
  const transfers = asArr(sources.transferChallenges);

  const projd = (skills) => asArr(skills).map(projectSkill).filter(Boolean);
  const forSkill = (skills) => projd(skills).includes(S);

  const skillLessons = lessons.filter((l) => asArr(l.skills).includes(S));
  const skillEx = exercises.filter((e) => forSkill(e.skills));
  const skillAssess = assessments.filter((a) => asArr(a.skills).includes(S));
  const skillCaps = capstones.filter((c) => asArr(c.skills).includes(S));
  const skillTransfers = transfers.filter((t) => asArr(t.skills).includes(S));

  // Échelons de difficulté (cognitive) — bornes chevauchantes assumées : un d2 sert
  // L1 ET L2, un d3 sert L2 ET L3. La difficulté est un signal, pas une classe rigide.
  const guided = skillEx.filter((e) => diffOf(e) <= 2);
  const application = skillEx.filter((e) => diffOf(e) === 2 || diffOf(e) === 3);
  const autonomous = skillEx.filter((e) => diffOf(e) >= 3);
  const debugEx = skillEx.filter((e) => /(^|[-_])debug([-_]|$)/.test(String(e.id)));
  const diagAssess = skillAssess.filter((a) => asArr(a.questions).some((q) => q.taxonomy === 'DIAGNOSIS'));
  const transAssess = skillAssess.filter((a) => asArr(a.questions).some((q) => q.taxonomy === 'TRANSFER'));
  const diagCaps = skillCaps.filter((c) => asArr(c.phases).some((p) => p.kind === 'diagnosis'));

  const step = (from) => ({ present: from.length > 0, from });
  const ex = (list) => list.map((e) => `exo ${e.id}`);

  const steps = {
    L0: step(skillLessons.map((l) => `leçon ${l.slug}`)),
    L1: step(ex(guided)),
    L2: step(ex(application)),
    L3: step(ex(autonomous)),
    L4: step([...ex(debugEx), ...diagAssess.map((a) => `assessment ${a.id}`), ...diagCaps.map((c) => `capstone ${c.id}`)]),
    L5: step([
      ...skillTransfers.map((t) => `défi ${t.id}`),
      ...transAssess.map((a) => `assessment ${a.id}`),
      ...skillCaps.map((c) => `capstone ${c.id}`),
    ]),
  };

  const missing = LADDER_STEPS.filter((s) => !steps[s].present);
  // « complète » = fondation + montée jusqu'à l'autonomie (L0-L3) PLUS un sommet
  // diagnostic OU transfert (L4 ou L5). Une ladder peut être utile sans L4 ET L5.
  const complete = steps.L0.present && steps.L1.present && steps.L2.present && steps.L3.present && (steps.L4.present || steps.L5.present);

  return { skill: S, name: isStr(sources.skillName) ? sources.skillName : S, steps, complete, missing };
}

/** Ladder de chaque compétence de programme. PUR. */
export function ladderMatrix(program, sources = {}) {
  const skills = (program && Array.isArray(program.skills)) ? program.skills : [];
  return skills.map((sk) => skillLadder(sk.id, { ...sources, skillName: sk.name }));
}

/**
 * Position la plus haute atteinte par UN exercice dans la ladder de sa (ses)
 * compétence(s) — utilisé par le ledger d'audit. PUR ; ne dépend pas des autres
 * exercices. Rend l'échelon MAX que cet exercice peut alimenter à lui seul.
 */
export function exerciseLadderPosition(exercise) {
  if (!exercise || typeof exercise !== 'object') return null;
  const d = diffOf(exercise);
  const isDebug = /(^|[-_])debug([-_]|$)/.test(String(exercise.id));
  if (isDebug) return 'L4';
  if (d >= 4) return 'L4';   // diagnostic / contraintes concurrentes
  if (d === 3) return 'L3';  // stratégie autonome
  if (d === 2) return 'L2';  // application
  return 'L1';               // guidé
}
