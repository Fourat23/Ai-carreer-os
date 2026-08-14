// Modèle de SIMULATION PROFESSIONNELLE (capstone) — PUR (aucun I/O, aucune
// exécution, aucune horloge implicite, aucun LLM). Un capstone est une COMPOSITION
// au-dessus du modèle d'évaluation existant : chaque phase de raisonnement contient
// des questions notées par gradeQuestion (lib/assessment.mjs). Il ne crée AUCUN
// second moteur de compétence/évaluation/progression. Une réussite produit une
// PREUVE (patron mission-state), consommée par skill-state ; réussir un capstone
// est un INDICE de raisonnement, JAMAIS une maîtrise absolue. Les infrastructures
// décrites sont SIMULÉES.

import { validateQuestion, gradeQuestion, TAXONOMY } from './assessment.mjs';

const DANGEROUS = new Set(['__proto__', 'prototype', 'constructor']);
const MAX_PHASES = 12;
const MAX_QUESTIONS_PER_PHASE = 12;
const MAX_ARTIFACTS = 20;
const MAX_TEXT = 8000;
const MAX_SKILLS = 12;
const MAX_REFS = 20;

// Phases de raisonnement (allowlist), du problème vers la clôture.
export const PHASE_KINDS = ['hypotheses', 'investigation', 'diagnosis', 'decision', 'remediation', 'validation', 'communication'];
// Types d'artefacts plausibles (signal + bruit).
export const ARTIFACT_KINDS = ['code', 'log', 'metrics', 'stacktrace', 'config', 'manifest', 'http', 'sql', 'architecture', 'ticket', 'ci', 'trace', 'diff', 'incident'];

export const DEFAULT_PASS_THRESHOLD = 0.7;

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const isStr = (v) => typeof v === 'string';
const nonEmptyStr = (v) => isStr(v) && v.trim().length > 0;

/**
 * Valide STRICTEMENT une définition de capstone. Ne lance jamais : { ok, errors[] }.
 * La résolution des refs (skills/leçons/exos/playbooks) contre le programme réel est
 * faite par le GATE (v40-check), pas ici (module pur/isolé).
 */
export function validateCapstone(c) {
  const errors = [];
  const fail = (m) => { errors.push(m); };

  if (!isObj(c)) return { ok: false, errors: ['Capstone : objet attendu.'] };
  if (!nonEmptyStr(c.id)) fail('Capstone : id manquant.');
  if (!nonEmptyStr(c.title)) fail('Capstone : titre manquant.');
  if (!nonEmptyStr(c.context)) fail('Capstone : contexte manquant.');
  if (!nonEmptyStr(c.signal)) fail('Capstone : signal initial manquant.');

  if (c.difficulty !== undefined && (!Number.isInteger(c.difficulty) || c.difficulty < 1 || c.difficulty > 5)) {
    fail('Capstone : difficulty doit être un entier 1..5.');
  }
  if (c.passThreshold !== undefined && !(typeof c.passThreshold === 'number' && c.passThreshold > 0 && c.passThreshold <= 1)) {
    fail('Capstone : passThreshold doit être dans ]0, 1].');
  }

  if (!Array.isArray(c.skills) || c.skills.length === 0) fail('Capstone : skills (tableau non vide) requis.');
  else {
    if (c.skills.length > MAX_SKILLS) fail('Capstone : trop de compétences.');
    for (const s of c.skills) if (!nonEmptyStr(s)) fail('Capstone : compétence non textuelle.');
  }
  for (const key of ['lessonRefs', 'exerciseRefs', 'playbookRefs', 'dayRefs']) {
    if (c[key] !== undefined && !Array.isArray(c[key])) fail(`Capstone : ${key} doit être un tableau.`);
    else if (Array.isArray(c[key]) && c[key].length > MAX_REFS) fail(`Capstone : ${key} trop long.`);
  }

  // Artefacts : signal + bruit. Au moins un artefact NON déterminant (useful:false).
  if (!Array.isArray(c.artifacts) || c.artifacts.length < 3) fail('Capstone : au moins 3 artefacts requis.');
  else {
    if (c.artifacts.length > MAX_ARTIFACTS) fail('Capstone : trop d\'artefacts.');
    const aIds = new Set();
    for (const a of c.artifacts) {
      if (!isObj(a) || !nonEmptyStr(a.id)) { fail('Capstone : artefact sans id.'); continue; }
      if (aIds.has(a.id)) fail(`Capstone : artefact dupliqué « ${a.id} ».`);
      aIds.add(a.id);
      if (!ARTIFACT_KINDS.includes(a.kind)) fail(`Capstone : artefact « ${a.id} » de kind inconnu « ${a.kind} ».`);
      if (!nonEmptyStr(a.title)) fail(`Capstone : artefact « ${a.id} » sans titre.`);
      if (!nonEmptyStr(a.content) || a.content.length > MAX_TEXT) fail(`Capstone : artefact « ${a.id} » : contenu manquant ou trop long.`);
    }
    if (!c.artifacts.some((a) => isObj(a) && a.useful === false)) {
      fail('Capstone : au moins un artefact non déterminant (bruit, useful:false) requis.');
    }
  }

  // Phases : ≥ 3, dont ≥ 1 diagnosis. Questions valides (modèle assessment).
  if (!Array.isArray(c.phases) || c.phases.length < 3) fail('Capstone : au moins 3 phases requises.');
  else {
    if (c.phases.length > MAX_PHASES) fail('Capstone : trop de phases.');
    const pIds = new Set();
    let hasDiagnosis = false;
    for (const p of c.phases) {
      if (!isObj(p) || !nonEmptyStr(p.id)) { fail('Capstone : phase sans id.'); continue; }
      if (DANGEROUS.has(p.id)) fail('Capstone : id de phase interdit.');
      if (pIds.has(p.id)) fail(`Capstone : phase dupliquée « ${p.id} ».`);
      pIds.add(p.id);
      if (!PHASE_KINDS.includes(p.kind)) fail(`Capstone : phase « ${p.id} » de kind inconnu « ${p.kind} ».`);
      if (p.kind === 'diagnosis') hasDiagnosis = true;
      if (!nonEmptyStr(p.title)) fail(`Capstone : phase « ${p.id} » sans titre.`);
      if (!nonEmptyStr(p.prompt)) fail(`Capstone : phase « ${p.id} » sans énoncé.`);
      if (!Array.isArray(p.questions) || p.questions.length === 0) { fail(`Capstone : phase « ${p.id} » sans question.`); continue; }
      if (p.questions.length > MAX_QUESTIONS_PER_PHASE) fail(`Capstone : phase « ${p.id} » : trop de questions.`);
      const qIds = new Set();
      for (const q of p.questions) {
        const e = validateQuestion(q);
        if (e) { fail(`phase « ${p.id} » : ${e}`); continue; }
        if (qIds.has(q.id)) fail(`Capstone : phase « ${p.id} » : id de question dupliqué « ${q.id} ».`);
        qIds.add(q.id);
      }
    }
    if (!hasDiagnosis) fail('Capstone : au moins une phase de kind « diagnosis » requise.');
  }

  // Debrief : raisonnement attendu obligatoire.
  if (!isObj(c.debrief) || !nonEmptyStr(c.debrief.expectedReasoning)) {
    fail('Capstone : debrief.expectedReasoning requis (raisonnement attendu).');
  }

  return { ok: errors.length === 0, errors };
}

/** Corrige une phase (réutilise gradeQuestion). PUR. */
export function gradeCapstonePhase(phase, responsesById = {}) {
  const questions = Array.isArray(phase?.questions) ? phase.questions : [];
  const resp = isObj(responsesById) ? responsesById : {};
  const results = questions.map((q) => gradeQuestion(q, resp[q.id]));
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  return { id: phase.id, kind: phase.kind, title: phase.title, total, passed, ratio: total ? passed / total : 0, results };
}

/**
 * Corrige un capstone complet. PUR, déterministe. `responsesById` = map
 * { [questionId]: response } (toutes phases confondues ; les ids de question sont
 * uniques par phase — l'appelant peut préfixer si nécessaire, mais gradeQuestion
 * lit par id de question directement).
 */
export function gradeCapstone(c, responsesById = {}) {
  const phases = Array.isArray(c?.phases) ? c.phases : [];
  const byPhase = phases.map((p) => gradeCapstonePhase(p, responsesById));
  const total = byPhase.reduce((n, p) => n + p.total, 0);
  const passed = byPhase.reduce((n, p) => n + p.passed, 0);
  const ratio = total ? passed / total : 0;
  const threshold = (typeof c?.passThreshold === 'number' && c.passThreshold > 0 && c.passThreshold <= 1) ? c.passThreshold : DEFAULT_PASS_THRESHOLD;
  const passedOverall = total > 0 && ratio >= threshold;
  const mobilizedSkills = Array.isArray(c?.skills) ? c.skills.filter(isStr) : [];
  return {
    capstoneId: isStr(c?.id) ? c.id : '',
    total,
    passed,
    ratio: Math.round(ratio * 1000) / 1000,
    passedOverall,
    byPhase,
    mobilizedSkills,
    weakSkills: passedOverall ? [] : mobilizedSkills, // indice de fragilité, PAS une preuve
    results: byPhase.flatMap((p) => p.results),
  };
}

/**
 * PONT capstone → PREUVE (cf. ADR-040 D5), patron mission-state. Réussite → evidence
 * typée `capstone` (consommée par skill-state, règle existante evidence→demonstrated).
 * Échec → null. PUR ; horloge injectée. Ne produit JAMAIS « mastered ».
 * @returns {{type:'capstone', title:string, url:string, skills:string[], createdAt:string}|null}
 */
export function capstoneToEvidence(c, result, now = new Date()) {
  if (!result || !result.passedOverall) return null;
  const at = (now instanceof Date && !Number.isNaN(now.getTime())) ? now : new Date();
  return {
    type: 'capstone',
    title: `Capstone réussi : ${isStr(c?.title) ? c.title : (isStr(c?.id) ? c.id : 'capstone')}`,
    url: `/capstones/${isStr(c?.id) ? c.id : ''}`,
    skills: Array.isArray(c?.skills) ? c.skills.filter(isStr) : [],
    createdAt: at.toISOString(),
  };
}

/**
 * Remédiation exploitable à partir d'un résultat. Réussi → {} (rien à remédier).
 * Échec → compétences fragiles + leçons/exercices/playbooks reliés à réviser. PUR.
 */
export function capstoneRemediation(c, result) {
  if (!result || result.passedOverall) return { weakSkills: [], lessons: [], exercises: [], playbooks: [] };
  return {
    weakSkills: Array.isArray(c?.skills) ? c.skills.filter(isStr) : [],
    lessons: Array.isArray(c?.lessonRefs) ? c.lessonRefs.filter(isStr) : [],
    exercises: Array.isArray(c?.exerciseRefs) ? c.exerciseRefs.filter(isStr) : [],
    playbooks: Array.isArray(c?.playbookRefs) ? c.playbookRefs.filter(isStr) : [],
  };
}

/** Répartition d'un catalogue par domaine : { [domain]: nombre }. */
export function capstoneDomainSummary(list) {
  const out = {};
  for (const c of Array.isArray(list) ? list : []) {
    const d = isStr(c?.domain) && c.domain ? c.domain : 'Autres';
    out[d] = (out[d] ?? 0) + 1;
  }
  return out;
}

/** Répartition des questions d'un capstone par niveau de taxonomie. */
export function capstoneTaxonomySummary(c) {
  const out = {};
  for (const lvl of TAXONOMY) out[lvl] = 0;
  for (const p of Array.isArray(c?.phases) ? c.phases : []) {
    for (const q of Array.isArray(p?.questions) ? p.questions : []) {
      if (TAXONOMY.includes(q?.taxonomy)) out[q.taxonomy] += 1;
    }
  }
  return out;
}
