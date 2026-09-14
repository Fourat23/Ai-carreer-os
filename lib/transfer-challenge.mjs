// Défi de transfert profond — PUR. COMPOSITION du modèle d'évaluation existant :
// il réutilise validateQuestion / gradeQuestion (lib/assessment.mjs) et n'introduit
// AUCUN moteur de notation nouveau. Un défi ajoute une distance de transfert
// (transferLevel T4/T5), un PONT conceptuel explicite (bridge) et un contexte cible
// différent. Réussir un défi est un INDICE de transfert, pas une maîtrise prouvée.
import { validateQuestion, gradeQuestion } from './assessment.mjs';
import { isTransferLevel } from './transfer-taxonomy.mjs';

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const nonEmptyStr = (v) => typeof v === 'string' && v.trim().length > 0;
const MAX_QUESTIONS = 12;
const MAX_SKILLS = 8;
const DEFAULT_PASS_THRESHOLD = 0.7;

// Un défi vit au niveau T4 (near) ou T5 (deep). Les niveaux inférieurs sont couverts
// par les diagnostics (assessments) et exercices.
export const CHALLENGE_LEVELS = ['T4', 'T5'];

export function validateTransferChallenge(c) {
  const errors = [];
  const fail = (m) => errors.push(m);

  if (!isObj(c)) return { ok: false, errors: ['Défi : objet attendu.'] };
  if (!nonEmptyStr(c.id)) fail('Défi : id manquant.');
  if (!nonEmptyStr(c.title)) fail('Défi : titre manquant.');
  if (!nonEmptyStr(c.sourceSkill)) fail('Défi : sourceSkill (concept source) manquant.');
  if (!nonEmptyStr(c.targetContext)) fail('Défi : targetContext (contexte cible) manquant.');

  if (!isTransferLevel(c.transferLevel) || !CHALLENGE_LEVELS.includes(c.transferLevel)) {
    fail(`Défi : transferLevel doit être T4 ou T5 (reçu « ${c.transferLevel} »).`);
  }
  // T5 EXIGE un pont conceptuel explicite ET un changement de domaine.
  if (c.transferLevel === 'T5') {
    if (!nonEmptyStr(c.bridge) || c.bridge.trim().length < 8) fail('Défi T5 : bridge (pont conceptuel) requis et détaillé.');
    if (c.crossDomain !== true) fail('Défi T5 : crossDomain doit être true (contexte réellement différent).');
  }

  if (!Array.isArray(c.skills) || c.skills.length === 0) fail('Défi : skills (tableau non vide) requis.');
  else {
    if (c.skills.length > MAX_SKILLS) fail('Défi : trop de compétences.');
    for (const s of c.skills) if (!nonEmptyStr(s)) fail('Défi : compétence non textuelle.');
  }
  for (const key of ['lessonRefs']) {
    if (c[key] !== undefined && !Array.isArray(c[key])) fail(`Défi : ${key} doit être un tableau.`);
  }
  if (c.passThreshold !== undefined && !(typeof c.passThreshold === 'number' && c.passThreshold > 0 && c.passThreshold <= 1)) {
    fail('Défi : passThreshold doit être dans ]0, 1].');
  }

  if (!Array.isArray(c.questions) || c.questions.length === 0) fail('Défi : au moins une question requise.');
  else {
    if (c.questions.length > MAX_QUESTIONS) fail('Défi : trop de questions.');
    const ids = new Set();
    let discriminating = false;
    for (const q of c.questions) {
      const e = validateQuestion(q);
      if (e) { fail(e); continue; }
      if (ids.has(q.id)) fail(`Défi : id de question dupliqué « ${q.id} ».`);
      ids.add(q.id);
      if (q.kind === 'multi' || q.kind === 'predict' || (Array.isArray(q.options) && q.options.length >= 4)) discriminating = true;
    }
    // Un défi de transfert doit exiger de la discrimination/raisonnement, pas un simple rappel.
    if (!discriminating) fail('Défi : au moins une question discriminante (multi, predict, ou ≥ 4 options) requise.');
  }

  return { ok: errors.length === 0, errors };
}

/** Corrige un défi en réutilisant gradeQuestion. PUR, déterministe. */
export function gradeTransferChallenge(c, responsesById = {}) {
  const questions = Array.isArray(c?.questions) ? c.questions : [];
  const resp = isObj(responsesById) ? responsesById : {};
  const results = questions.map((q) => gradeQuestion(q, resp[q.id]));
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const ratio = total ? passed / total : 0;
  const threshold = (typeof c?.passThreshold === 'number' && c.passThreshold > 0 && c.passThreshold <= 1) ? c.passThreshold : DEFAULT_PASS_THRESHOLD;
  return {
    challengeId: nonEmptyStr(c?.id) ? c.id : '',
    transferLevel: isTransferLevel(c?.transferLevel) ? c.transferLevel : 'T4',
    total, passed, ratio: Math.round(ratio * 1000) / 1000,
    passedOverall: total > 0 && ratio >= threshold,
    weakSkills: (total > 0 && ratio >= threshold) ? [] : (Array.isArray(c?.skills) ? c.skills.filter(nonEmptyStr) : []),
    results,
  };
}

/**
 * ── V76 · CP8 — LA VUE PUBLIQUE D'UN DÉFI ────────────────────────────────
 *
 * Le CP0 a mesuré que `GET /transfer/[id]` servait, **dans la charge utile de
 * la page**, `"answer":0` et le texte complet d'`explanation` — lisibles par un
 * simple « afficher le code source », **avant toute tentative**.
 *
 * Le côté laboratoire filtrait déjà correctement (`exerciseMeta` n'expose ni la
 * `reference`, ni les `expected`, ni les noms des tests privés). La discipline
 * existait ; elle n'avait simplement jamais traversé jusqu'au chemin transfert.
 *
 * C'est une régression que le CP9 de V75 ne pouvait pas voir : il avait vérifié
 * SIX choses sur les 25 défis — structure, HTTP 200, réussite avec les bonnes
 * réponses, échec avec les mauvaises, preuve valide, comptage par le moteur —
 * et aucune sur la fuite.
 *
 * **Ce que cette vue retire, et rien d'autre** : `answer` et `explanation`. Les
 * énoncés, les options et tout le contexte restent — ils sont ce que l'apprenant
 * doit voir.
 *
 * La correction, elle, arrive par la RÉPONSE DE L'API après soumission, qui
 * porte déjà `expected` et `explanation` par question. Même chemin que le
 * laboratoire : le serveur ne publie la réponse qu'une fois la tentative faite.
 */
export function vuePubliqueDuDefi(challenge) {
  if (!challenge || typeof challenge !== 'object') return null;
  const { questions, ...reste } = challenge;
  return {
    ...reste,
    questions: (Array.isArray(questions) ? questions : []).map((q) => {
      const { answer, explanation, ...question } = q ?? {};
      return question;
    }),
  };
}
