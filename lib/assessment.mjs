// Modèle GÉNÉRIQUE d'évaluation diagnostique — PUR (aucun I/O, aucune exécution,
// aucune horloge implicite, aucun LLM). Décrit une évaluation à taxonomie, valide
// sa structure, et corrige une tentative par COMPARAISON DE DONNÉES déterministe.
// Ne remplace ni skill-state.mjs (états) ni review.mjs (révision) : une évaluation
// RÉUSSIE peut devenir une PREUVE (evidence) consommée par le moteur d'états
// existant (cf. ADR-039 / TSD-039). Réussir une évaluation est un INDICE, jamais
// une « maîtrise prouvée ».

const DANGEROUS = new Set(['__proto__', 'prototype', 'constructor']);
const MAX_QUESTIONS = 40;
const MAX_OPTIONS = 12;
const MAX_TEXT = 4000;
const MAX_PROMPT = 8000;
const MAX_SKILLS = 12;
const MAX_REFS = 20;

// ── Taxonomie d'évaluation (ordonnée, du plus simple au plus exigeant) ────────
export const TAXONOMY = ['RECALL', 'UNDERSTANDING', 'APPLICATION', 'DIAGNOSIS', 'TRANSFER'];

// ── Familles de questions (allowlist). Toutes 100 % déterministes. ────────────
// mcq     : choix unique (answer = index entier).
// multi   : sous-ensemble EXACT (answer = tableau d'indices ; égalité ensembliste).
// predict : prédiction d'une valeur déterministe (answer = chaîne OU entier).
export const QUESTION_KINDS = ['mcq', 'multi', 'predict'];

export const DEFAULT_PASS_THRESHOLD = 0.7;

// ── Helpers purs ─────────────────────────────────────────────────────────────
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const isStr = (v) => typeof v === 'string';
const isInt = (v) => Number.isInteger(v);
const nonEmptyStr = (v) => isStr(v) && v.trim().length > 0;

/** Ensemble d'indices trié, sans doublon (pour comparaison ensembliste). */
function sortedUniqueInts(arr) {
  return [...new Set(arr)].sort((a, b) => a - b);
}

/**
 * Valide STRICTEMENT une définition d'évaluation. Ne lance jamais : renvoie
 * { ok, errors[] }. Vérifie identité, compétences, questions et INVARIANTS
 * DÉTERMINISTES (index bornés, pas d'égalité de flottant, multi ensembliste).
 * Les résolutions lessonRefs/remediation/skills contre le programme réel sont
 * faites par le GATE (v39-check), pas ici (ce module reste pur/isolé).
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateAssessment(a) {
  const errors = [];
  const fail = (m) => { errors.push(m); };

  if (!isObj(a)) return { ok: false, errors: ['Évaluation : objet attendu.'] };
  if (!nonEmptyStr(a.id)) fail('Évaluation : id manquant.');
  if (!nonEmptyStr(a.title)) fail('Évaluation : titre manquant.');

  if (!Array.isArray(a.skills) || a.skills.length === 0) {
    fail('Évaluation : skills (tableau non vide) requis.');
  } else {
    if (a.skills.length > MAX_SKILLS) fail(`Évaluation : trop de compétences (${a.skills.length}).`);
    for (const s of a.skills) if (!nonEmptyStr(s)) fail('Évaluation : compétence non textuelle.');
  }

  for (const key of ['lessonRefs', 'remediation']) {
    if (a[key] !== undefined) {
      if (!Array.isArray(a[key])) { fail(`Évaluation : ${key} doit être un tableau.`); continue; }
      if (a[key].length > MAX_REFS) fail(`Évaluation : ${key} trop long.`);
      for (const r of a[key]) if (!nonEmptyStr(r)) fail(`Évaluation : ${key} contient une entrée non textuelle.`);
    }
  }

  if (a.passThreshold !== undefined) {
    if (typeof a.passThreshold !== 'number' || !(a.passThreshold > 0 && a.passThreshold <= 1)) {
      fail('Évaluation : passThreshold doit être un nombre dans ]0, 1].');
    }
  }

  if (!Array.isArray(a.questions) || a.questions.length === 0) {
    fail('Évaluation : au moins une question requise.');
  } else {
    if (a.questions.length > MAX_QUESTIONS) fail(`Évaluation : trop de questions (${a.questions.length}).`);
    const ids = new Set();
    for (const q of a.questions) {
      const e = validateQuestion(q);
      if (e) { fail(e); continue; }
      if (ids.has(q.id)) fail(`Évaluation : id de question dupliqué « ${q.id} ».`);
      ids.add(q.id);
    }
  }

  return { ok: errors.length === 0, errors };
}

/** Valide une question. Renvoie un message d'erreur (string) ou null si OK. */
export function validateQuestion(q) {
  if (!isObj(q)) return 'Question : objet attendu.';
  if (!nonEmptyStr(q.id)) return 'Question : id manquant.';
  if (DANGEROUS.has(q.id)) return `Question « ${q.id} » : id interdit.`;
  if (!nonEmptyStr(q.prompt)) return `Question « ${q.id} » : énoncé manquant.`;
  if (isStr(q.prompt) && q.prompt.length > MAX_PROMPT) return `Question « ${q.id} » : énoncé trop long.`;
  if (!nonEmptyStr(q.explanation)) return `Question « ${q.id} » : explication (feedback) manquante.`;
  if (isStr(q.explanation) && q.explanation.length > MAX_TEXT) return `Question « ${q.id} » : explication trop longue.`;
  if (!TAXONOMY.includes(q.taxonomy)) return `Question « ${q.id} » : niveau de taxonomie inconnu « ${q.taxonomy} ».`;
  if (!QUESTION_KINDS.includes(q.kind)) return `Question « ${q.id} » : type inconnu « ${q.kind} ».`;

  if (q.kind === 'mcq' || q.kind === 'multi') {
    if (!Array.isArray(q.options) || q.options.length < 2) return `Question « ${q.id} » : au moins 2 options requises.`;
    if (q.options.length > MAX_OPTIONS) return `Question « ${q.id} » : trop d'options.`;
    for (const o of q.options) if (!nonEmptyStr(o)) return `Question « ${q.id} » : option non textuelle.`;
    const n = q.options.length;
    if (q.kind === 'mcq') {
      if (!isInt(q.answer) || q.answer < 0 || q.answer >= n) return `Question « ${q.id} » : answer doit être un index entier dans [0, ${n}).`;
    } else {
      if (!Array.isArray(q.answer) || q.answer.length === 0) return `Question « ${q.id} » : answer (multi) doit être un tableau non vide d'indices.`;
      for (const i of q.answer) if (!isInt(i) || i < 0 || i >= n) return `Question « ${q.id} » : index de réponse hors bornes.`;
      if (new Set(q.answer).size !== q.answer.length) return `Question « ${q.id} » : indices de réponse dupliqués.`;
    }
  } else { // predict
    const ans = q.answer;
    if (isStr(ans)) {
      if (!ans.trim()) return `Question « ${q.id} » : answer (predict) vide.`;
      if (ans.length > MAX_TEXT) return `Question « ${q.id} » : answer trop longue.`;
    } else if (isInt(ans)) {
      // entier accepté
    } else {
      return `Question « ${q.id} » : answer (predict) doit être une chaîne ou un entier (pas de flottant).`;
    }
  }
  return null;
}

/**
 * Corrige UNE question par comparaison de données. PUR, déterministe.
 * `response` : index (mcq), tableau d'indices (multi), chaîne/entier (predict).
 * @returns {{ id, taxonomy, kind, passed, expected, given, explanation }}
 */
export function gradeQuestion(q, response) {
  const base = { id: q.id, taxonomy: q.taxonomy, kind: q.kind, expected: q.answer, given: response ?? null, explanation: q.explanation };
  let passed = false;
  if (q.kind === 'mcq') {
    passed = isInt(response) && response === q.answer;
  } else if (q.kind === 'multi') {
    if (Array.isArray(response) && response.every(isInt)) {
      const a = sortedUniqueInts(response);
      const b = sortedUniqueInts(q.answer);
      passed = a.length === b.length && a.every((x, i) => x === b[i]);
    }
  } else { // predict
    if (isInt(q.answer)) {
      passed = (isInt(response) && response === q.answer) ||
               (isStr(response) && response.trim() === String(q.answer));
    } else {
      passed = isStr(response) && response.trim() === String(q.answer).trim();
    }
  }
  return { ...base, passed };
}

/**
 * Corrige une tentative complète. PUR, déterministe. `responsesById` = map
 * { [questionId]: response }. Renvoie compteurs, répartition par taxonomie,
 * compétences faibles (indice si échec global) et détail par question.
 */
export function gradeAssessment(a, responsesById = {}) {
  const questions = Array.isArray(a?.questions) ? a.questions : [];
  const resp = isObj(responsesById) ? responsesById : {};
  const results = questions.map((q) => gradeQuestion(q, resp[q.id]));
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const ratio = total ? passed / total : 0;
  const threshold = (typeof a?.passThreshold === 'number' && a.passThreshold > 0 && a.passThreshold <= 1)
    ? a.passThreshold : DEFAULT_PASS_THRESHOLD;
  const passedOverall = total > 0 && ratio >= threshold;

  const byTaxonomy = {};
  for (const lvl of TAXONOMY) byTaxonomy[lvl] = { total: 0, passed: 0 };
  for (const r of results) {
    if (!byTaxonomy[r.taxonomy]) byTaxonomy[r.taxonomy] = { total: 0, passed: 0 };
    byTaxonomy[r.taxonomy].total += 1;
    if (r.passed) byTaxonomy[r.taxonomy].passed += 1;
  }

  const skills = Array.isArray(a?.skills) ? a.skills.filter(isStr) : [];
  return {
    assessmentId: isStr(a?.id) ? a.id : '',
    total,
    passed,
    ratio: Math.round(ratio * 1000) / 1000,
    passedOverall,
    byTaxonomy,
    weakSkills: passedOverall ? [] : skills, // indice de fragilité, PAS une preuve
    results,
  };
}

/** Couverture de taxonomie d'un catalogue : { [level]: nombre de questions }. */
export function assessmentTaxonomySummary(list) {
  const out = {};
  for (const lvl of TAXONOMY) out[lvl] = 0;
  for (const a of Array.isArray(list) ? list : []) {
    for (const q of Array.isArray(a?.questions) ? a.questions : []) {
      if (TAXONOMY.includes(q?.taxonomy)) out[q.taxonomy] += 1;
    }
  }
  return out;
}

/**
 * PONT évaluation → PREUVE (cf. ADR-039 D2). Une évaluation RÉUSSIE devient une
 * preuve typée `assessment` que skill-state.mjs consomme déjà. Un échec ne
 * produit AUCUNE preuve (renvoie null). PUR ; horloge injectée.
 * @returns {{type:'assessment', title:string, skills:string[], createdAt:string}|null}
 */
export function assessmentToEvidence(a, result, now = new Date()) {
  if (!result || !result.passedOverall) return null;
  const at = (now instanceof Date && !Number.isNaN(now.getTime())) ? now : new Date();
  return {
    type: 'assessment',
    title: isStr(a?.title) ? a.title : (isStr(a?.id) ? a.id : 'Évaluation'),
    skills: Array.isArray(a?.skills) ? a.skills.filter(isStr) : [],
    createdAt: at.toISOString(),
  };
}
