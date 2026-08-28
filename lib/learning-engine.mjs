// Learning Engine (ADR-064) — moteur transactionnel PUR de la journée
// pédagogique. Aucune I/O, aucun DOM, aucune horloge propre : l'horloge est
// injectée. Toute mutation de progression passe par `applyCommand`.
//
// Contrat :
//   applyCommand(flatProgress, command, { now })
//     → { ok: true,  progress, effects }     progression NOUVELLE (immuable)
//     → { ok: false, code, error }           progression INCHANGÉE, rien à écrire
//
// La règle qui tient tout le reste : sur `ok: false`, l'appelant n'écrit RIEN.
// Une transition invalide ne laisse aucune trace sur le disque.

import {
  normalizeDay, addEvidence, removeEvidence, recordAttempt,
  SESSION_STATES, STEP_STATES, SUBMISSION_KINDS, VALIDATION_STATUSES, VALIDATION_KINDS,
  COMPREHENSIONS, CONFIDENCES, CORRECTION_STATES, normalizeValidation,
} from './learning.mjs';
import { updateReviewSchedule } from './review.mjs';
import { makeEvidence, appendEvidence, normalizeLedger } from './evidence.mjs';
import { normalizeAttempt, normalizeAttempts, RECALL_OUTCOMES, RECALL_FORMATS } from './retention.mjs';

export const ENGINE_VERSION = 1;

/** Commandes reconnues. Toute autre valeur est rejetée sans écriture. */
export const COMMANDS = [
  // cycle de vie de la session
  'START', 'PAUSE', 'RESUME', 'COMPLETE', 'REOPEN',
  // travail dans la session
  'SET_STEP', 'SAVE_DRAFT', 'SUBMIT', 'ATTACH_VALIDATION',
  // apprentissage
  'SET_COMPREHENSION', 'SET_SELF_ASSESSMENT', 'SET_CORRECTION_STATE',
  'RECORD_ATTEMPT', 'SCHEDULE_REVIEW',
  // rétention (V66) — la SEULE écriture du Retention Engine
  'RECORD_RECALL',
  // preuves
  'ADD_EVIDENCE', 'REMOVE_EVIDENCE',
  // hors journée
  'SET_SKILL', 'SET_WEEKLY_REVIEW', 'SET_MONTHLY_REVIEW',
];

const COMMAND_SET = new Set(COMMANDS);
const DANGEROUS = new Set(['__proto__', 'prototype', 'constructor']);
const MAX_DAY = 365;
const MAX_SUBMISSIONS_PER_STEP = 100;

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const fail = (code, error) => ({ ok: false, code, error });

// ── Machine à états (ADR-064 §6) ──────────────────────────────────────────
// Table exhaustive. Ce qui n'y est pas est interdit, par construction.
const TRANSITIONS = {
  not_started: { START: 'active' },
  active: { PAUSE: 'paused', COMPLETE: 'completed' },
  paused: { RESUME: 'active', COMPLETE: 'completed' },
  completed: { REOPEN: 'active', COMPLETE: 'completed' }, // COMPLETE = no-op idempotent
};

/** Transition légale ? Renvoie l'état cible, ou null. */
export function nextSessionState(state, command) {
  return TRANSITIONS[state]?.[command] ?? null;
}

/** Projection du statut legacy depuis la session. `status` n'est JAMAIS écrit ailleurs. */
export function projectStatus(session, day) {
  switch (session.state) {
    case 'not_started': return 'not-started';
    case 'active':
    case 'paused': return 'in-progress';
    case 'completed': return day?.comprehension === 'review' ? 'to-review' : 'done';
    default: return 'not-started';
  }
}

// ── Utilitaires purs ──────────────────────────────────────────────────────

function isoOf(now) {
  if (now instanceof Date && !Number.isNaN(now.getTime())) return now.toISOString();
  if (typeof now === 'string' && !Number.isNaN(new Date(now).getTime())) return now;
  return null;
}

function validDay(v) {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= MAX_DAY ? n : null;
}

/** Identifiant d'étape sûr : non vide, borné, jamais un mot dangereux. */
function validId(v, max = 120) {
  if (typeof v !== 'string') return null;
  const t = v.trim().slice(0, max);
  if (!t || DANGEROUS.has(t)) return null;
  // Pas de séparateur de chemin : un identifiant n'est jamais concaténé dans
  // un chemin de fichier, et cette garantie doit être structurelle (§9).
  if (/[/\\]/.test(t) || t.includes('..')) return null;
  return t;
}

/** Écrit une journée dans une NOUVELLE progression, statut re-projeté. */
function putDay(progress, dayKey, day, nowIso) {
  const session = day.session;
  const next = { ...day, status: projectStatus(session, day), updatedAt: nowIso };
  return {
    ...progress,
    days: { ...progress.days, [dayKey]: next },
    startDate: progress.startDate ?? nowIso.slice(0, 10),
  };
}

/** Ajoute une preuve canonique au registre. Dédupliquée par clé métier. */
function withCanonicalEvidence(progress, evidence) {
  const r = appendEvidence(progress.evidence ?? [], evidence);
  return r.added ? { ...progress, evidence: r.evidence } : progress;
}

/** Lit une journée normalisée (jamais undefined). */
function getDay(progress, dayKey) {
  return normalizeDay(progress?.days?.[dayKey]);
}

function touch(session, nowIso) {
  return { ...session, lastActiveAt: nowIso };
}

// ── Preuve dérivée d'une validation réussie ───────────────────────────────
// Idempotente PAR CONSTRUCTION. L'identifiant dérive de l'ÉTAPE, pas de la
// soumission : une preuve atteste que « cette étape a été validée », pas
// qu'« une soumission a existé ». Re-rendre un travail déjà validé ne crée donc
// pas une deuxième preuve du même fait.
//
// `evidenceId` permet à un appelant serveur de nommer l'artefact sous-jacent —
// le laboratoire passe `lab-<exerciseId>`, l'identifiant que `recordExerciseSuccess`
// utilise déjà. Les deux chemins convergent donc sur UNE preuve, pas deux.

function evidenceForSubmission(day, submission, nowIso, opts = {}) {
  const v = submission.validation;
  if (!v || v.status !== 'passed') return null;
  const id = opts.evidenceId || `sub-ev-${submission.stepId || submission.id}`;
  if ((day.evidence ?? []).some((e) => e.id === id)) return null;
  const detail = v.detail || (v.score ? `${v.score.passed}/${v.score.total}` : '');
  return {
    id,
    type: v.kind === 'assessment-grade' ? 'assessment' : 'exercise',
    title: opts.evidenceTitle || `Travail validé : ${submission.stepId || submission.id}`,
    description: detail,
    url: typeof opts.evidenceUrl === 'string' ? opts.evidenceUrl : '',
    skills: Array.isArray(opts.skills) ? opts.skills.filter((s) => typeof s === 'string') : [],
    createdAt: v.checkedAt ?? nowIso,
  };
}

// ── V65 · PREUVE CANONIQUE ────────────────────────────────────────────────
// Une soumission et sa preuve forment UNE unité : la preuve est construite et
// ajoutée au registre dans la même transformation que la soumission. Si la
// preuve est refusée (compétence inconnue, provenance absente), la commande
// entière échoue — jamais « soumission écrite, preuve absente » (P9).

function canonicalSourceFor(cmd, submission) {
  const kind = submission.validation?.kind;
  if (kind === 'exercise-tests') return { sourceType: 'exercise', sourceId: cmd.evidenceId ?? submission.stepId };
  if (kind === 'assessment-grade') return { sourceType: 'assessment', sourceId: cmd.evidenceId ?? submission.stepId };
  return { sourceType: 'submission', sourceId: submission.id };
}

/**
 * Construit la preuve canonique d'une soumission, ou explique le refus.
 * Renvoie `null` quand aucune preuve n'est justifiée (aucune compétence connue
 * transmise) — c'est un cas normal, pas une erreur : on n'invente pas.
 */
function canonicalEvidenceFor(cmd, submission, dayNum, nowIso) {
  const skills = Array.isArray(cmd.skills) ? cmd.skills : [];
  if (skills.length === 0) return null;
  const src = canonicalSourceFor(cmd, submission);
  return makeEvidence({
    sourceType: src.sourceType,
    sourceId: src.sourceId,
    competencyIds: skills,
    validation: submission.validation,
    title: cmd.evidenceTitle ?? submission.stepId,
    provenance: {
      producer: 'learning-engine',
      method: submission.validation?.kind ?? 'submission',
      note: `Journée ${dayNum}, étape ${submission.stepId}.`,
    },
    dayId: dayNum,
    submissionId: submission.id,
    assessmentId: src.sourceType === 'assessment' ? src.sourceId : undefined,
    artifactRef: cmd.evidenceUrl,
  }, { now: nowIso });
}

/** Options de preuve portées par une commande, validées. */
function evidenceOpts(cmd) {
  return {
    evidenceId: validId(cmd.evidenceId, 64) ?? undefined,
    evidenceTitle: typeof cmd.evidenceTitle === 'string' ? cmd.evidenceTitle.slice(0, 300) : undefined,
    evidenceUrl: typeof cmd.evidenceUrl === 'string' ? cmd.evidenceUrl : undefined,
    skills: Array.isArray(cmd.skills) ? cmd.skills : [],
  };
}

// ── Commandes ─────────────────────────────────────────────────────────────

function cmdLifecycle(progress, cmd, nowIso) {
  const day = validDay(cmd.day);
  if (day === null) return fail('INVALID_DAY', 'Journée invalide.');
  const key = String(day);
  const d = getDay(progress, key);
  const target = nextSessionState(d.session.state, cmd.type);

  if (!target) {
    return fail(
      'INVALID_TRANSITION',
      `Transition refusée : ${cmd.type} depuis « ${d.session.state} ».`,
    );
  }

  // COMPLETE sur une session déjà terminée : NO-OP strict. Aucun horodatage
  // réécrit, aucune preuve recréée. C'est COMPLETE_DAY_IS_IDEMPOTENT.
  if (cmd.type === 'COMPLETE' && d.session.state === 'completed') {
    return { ok: true, progress, effects: ['noop:already-completed'] };
  }

  let session = { ...d.session, state: target, lastActiveAt: nowIso };
  const effects = [`session:${target}`];

  if (cmd.type === 'START') {
    // `startedAt` est écrit UNE fois, au premier démarrage réel.
    session.startedAt = session.startedAt ?? nowIso;
    effects.push('started');
  }
  if (cmd.type === 'COMPLETE') {
    session.completedAt = nowIso;
    effects.push('completed');
  }
  if (cmd.type === 'REOPEN') {
    session.completedAt = null;              // anomalie A6 : réellement effacé
    session.reopenCount = session.reopenCount + 1;
    effects.push('reopened');
  }

  let next = { ...d, session };

  // La clôture peut porter une auto-évaluation et planifier une révision. Ce
  // sont des faits déclarés par l'apprenant, pas des scores calculés.
  if (cmd.type === 'COMPLETE') {
    if (CONFIDENCES.includes(cmd.confidence)) {
      const sa = next.selfAssessment ?? { level: null, confidence: null, criteria: {}, comment: '' };
      next.selfAssessment = { ...sa, confidence: cmd.confidence };
    }
    if (cmd.scheduleReview === true) {
      next.review = updateReviewSchedule(next.review ?? null, {
        comprehension: COMPREHENSIONS.includes(cmd.comprehension) ? cmd.comprehension : 'partial',
        confidence: next.selfAssessment?.confidence ?? null,
        now: nowIso,
      });
      effects.push('review:scheduled');
    }
  }

  return { ok: true, progress: putDay(progress, key, next, nowIso), effects };
}

function cmdSetStep(progress, cmd, nowIso) {
  const day = validDay(cmd.day);
  if (day === null) return fail('INVALID_DAY', 'Journée invalide.');
  const stepId = validId(cmd.stepId);
  if (!stepId) return fail('INVALID_STEP', 'Étape invalide.');
  if (!STEP_STATES.includes(cmd.state)) return fail('INVALID_STEP_STATE', 'État d’étape invalide.');

  const key = String(day);
  const d = getDay(progress, key);
  // Travailler suppose une session ouverte : on ne coche pas une étape d'une
  // journée jamais commencée.
  if (d.session.state === 'not_started') {
    return fail('SESSION_NOT_STARTED', 'Commence la journée avant de travailler une étape.');
  }
  const steps = { ...d.session.steps, [stepId]: { state: cmd.state, updatedAt: nowIso } };
  const next = { ...d, session: touch({ ...d.session, steps }, nowIso) };
  return { ok: true, progress: putDay(progress, key, next, nowIso), effects: [`step:${cmd.state}`] };
}

function cmdSaveDraft(progress, cmd, nowIso) {
  const day = validDay(cmd.day);
  if (day === null) return fail('INVALID_DAY', 'Journée invalide.');
  const key = String(day);
  const d = getDay(progress, key);

  const next = { ...d };
  let changed = false;
  if (isObj(cmd.answers)) {
    const answers = { ...d.answers };
    for (const k of Object.keys(cmd.answers)) {
      const id = validId(k);
      if (!id) continue;
      answers[id] = String(cmd.answers[k] ?? '');
    }
    next.answers = answers; changed = true;
  }
  if (typeof cmd.notes === 'string') { next.notes = cmd.notes; changed = true; }
  if (typeof cmd.answer === 'string') { next.answer = cmd.answer; changed = true; }
  if (!changed) return fail('EMPTY_DRAFT', 'Rien à enregistrer.');

  // Un brouillon N'OUVRE PAS la session : écrire n'est pas commencer. Le statut
  // reste projeté depuis l'état de session courant.
  next.session = touch(d.session, nowIso);
  return { ok: true, progress: putDay(progress, key, next, nowIso), effects: ['draft:saved'] };
}

function cmdSubmit(progress, cmd, nowIso) {
  const day = validDay(cmd.day);
  if (day === null) return fail('INVALID_DAY', 'Journée invalide.');
  const stepId = validId(cmd.stepId);
  if (!stepId) return fail('INVALID_STEP', 'Étape invalide.');
  const kind = SUBMISSION_KINDS.includes(cmd.kind) ? cmd.kind : 'text';
  const content = typeof cmd.content === 'string' ? cmd.content : '';
  if (!content.trim()) return fail('EMPTY_SUBMISSION', 'Une soumission vide n’est pas enregistrée.');

  const key = String(day);
  const d = getDay(progress, key);
  if (d.session.state === 'not_started') {
    return fail('SESSION_NOT_STARTED', 'Commence la journée avant de rendre un travail.');
  }

  const already = d.submissions.filter((x) => x.stepId === stepId).length;
  if (already >= MAX_SUBMISSIONS_PER_STEP) {
    return fail('TOO_MANY_SUBMISSIONS', 'Trop de soumissions pour cette étape.');
  }

  // Identifiant DÉTERMINISTE : rejouer la même soumission ne produit pas une
  // preuve différente. `n` est le rang de la soumission pour cette étape.
  const submission = normalizeSubmission({
    id: `sub-${stepId}-${already + 1}`,
    stepId, kind, content, submittedAt: nowIso,
    validation: cmd.validation ?? null,
  });

  let next = { ...d, submissions: [...d.submissions, submission] };
  const effects = ['submission:added'];

  // Une soumission est une tentative : le compteur legacy est enfin alimenté.
  next = { ...recordAttempt(next, { at: nowIso, outcome: kind, summary: stepId }), submissions: next.submissions };

  const v = submission.validation;
  const stepState = v && (v.status === 'passed' || v.status === 'manual') ? 'done' : 'in_progress';
  next.session = touch({
    ...d.session,
    steps: { ...d.session.steps, [stepId]: { state: stepState, updatedAt: nowIso } },
  }, nowIso);

  const ev = evidenceForSubmission(next, submission, nowIso, evidenceOpts(cmd));
  if (ev) { next = { ...addEvidence(next, ev), session: next.session, submissions: next.submissions }; effects.push('evidence:added'); }

  // TRANSACTION : la preuve canonique est construite AVANT toute écriture. Si
  // elle est refusée, la commande entière échoue et rien n'est persisté.
  const canon = canonicalEvidenceFor(cmd, submission, day, nowIso);
  if (canon && !canon.ok) return fail(canon.code, canon.error);

  let out = putDay(progress, key, next, nowIso);
  if (canon) {
    const before = (out.evidence ?? []).length;
    out = withCanonicalEvidence(out, canon.evidence);
    if ((out.evidence ?? []).length > before) effects.push('ledger:added');
  }
  return { ok: true, progress: out, effects };
}

function cmdAttachValidation(progress, cmd, nowIso) {
  const day = validDay(cmd.day);
  if (day === null) return fail('INVALID_DAY', 'Journée invalide.');
  const subId = validId(cmd.submissionId);
  if (!subId) return fail('INVALID_SUBMISSION', 'Soumission invalide.');
  const validation = normalizeValidation(cmd.validation);
  if (!validation) return fail('INVALID_VALIDATION', 'Validation invalide.');

  const key = String(day);
  const d = getDay(progress, key);
  const idx = d.submissions.findIndex((x) => x.id === subId);
  if (idx < 0) return fail('SUBMISSION_NOT_FOUND', 'Soumission introuvable.');

  const submission = { ...d.submissions[idx], validation };
  const submissions = [...d.submissions];
  submissions[idx] = submission;

  let next = { ...d, submissions };
  const effects = [`validation:${validation.status}`];

  if (submission.stepId) {
    const stepState = validation.status === 'passed' || validation.status === 'manual' ? 'done' : 'in_progress';
    next.session = touch({
      ...d.session,
      steps: { ...d.session.steps, [submission.stepId]: { state: stepState, updatedAt: nowIso } },
    }, nowIso);
  }

  const ev = evidenceForSubmission(next, submission, nowIso, evidenceOpts(cmd));
  if (ev) { next = { ...addEvidence(next, ev), session: next.session, submissions: next.submissions }; effects.push('evidence:added'); }

  const canon = canonicalEvidenceFor(cmd, submission, day, nowIso);
  if (canon && !canon.ok) return fail(canon.code, canon.error);

  let out = putDay(progress, key, next, nowIso);
  if (canon) {
    const before = (out.evidence ?? []).length;
    out = withCanonicalEvidence(out, canon.evidence);
    if ((out.evidence ?? []).length > before) effects.push('ledger:added');
  }
  return { ok: true, progress: out, effects };
}

function cmdLearning(progress, cmd, nowIso) {
  const day = validDay(cmd.day);
  if (day === null) return fail('INVALID_DAY', 'Journée invalide.');
  const key = String(day);
  const d = getDay(progress, key);
  let next = { ...d };
  const effects = [];
  let reviewEvidence = null;

  switch (cmd.type) {
    case 'SET_COMPREHENSION': {
      if (!COMPREHENSIONS.includes(cmd.value)) return fail('INVALID_VALUE', 'Compréhension invalide.');
      next.comprehension = cmd.value;
      next.correctionState = 'acknowledged';
      next.review = updateReviewSchedule(next.review ?? null, {
        comprehension: cmd.value, confidence: next.selfAssessment?.confidence ?? null, now: nowIso,
      });
      effects.push('comprehension', 'review:scheduled');

      // ── PONT RÉVISION (V65 · CP11) ────────────────────────────────────
      // Une révision NE MODIFIE JAMAIS une compétence. Elle produit une
      // preuve — NON qualifiante par contrat (§3) : se réentraîner atteste
      // d'un réentraînement, pas d'une démonstration. La projection fera le
      // reste. C'est ce qui interdit `review → skill.status`.
      reviewEvidence = { skills: cmd.skills, comprehension: cmd.value };
      break;
    }
    case 'SET_SELF_ASSESSMENT': {
      const sa = next.selfAssessment ?? { level: null, confidence: null, criteria: {}, comment: '' };
      const merged = { ...sa };
      if (CONFIDENCES.includes(cmd.confidence)) merged.confidence = cmd.confidence;
      if (Number.isInteger(cmd.level) && cmd.level >= 0 && cmd.level <= 5) merged.level = cmd.level;
      if (merged.confidence === sa.confidence && merged.level === sa.level) {
        return fail('EMPTY_VALUE', 'Aucune auto-évaluation à enregistrer.');
      }
      next.selfAssessment = merged;
      effects.push('self-assessment');
      break;
    }
    case 'SET_CORRECTION_STATE': {
      if (!CORRECTION_STATES.includes(cmd.value)) return fail('INVALID_VALUE', 'État de correction invalide.');
      next.correctionState = cmd.value;
      effects.push('correction');
      break;
    }
    case 'RECORD_ATTEMPT': {
      next = recordAttempt(next, {
        at: nowIso,
        outcome: typeof cmd.outcome === 'string' ? cmd.outcome : 'attempted',
        summary: typeof cmd.summary === 'string' ? cmd.summary : '',
      });
      effects.push('attempt');
      break;
    }
    case 'SCHEDULE_REVIEW': {
      const comprehension = COMPREHENSIONS.includes(cmd.comprehension) ? cmd.comprehension : 'partial';
      next.review = updateReviewSchedule(next.review ?? null, {
        comprehension, confidence: next.selfAssessment?.confidence ?? null, now: nowIso,
      });
      if (comprehension === 'review') next.comprehension = 'review';
      effects.push('review:scheduled');
      break;
    }
    case 'ADD_EVIDENCE': {
      if (!isObj(cmd.evidence)) return fail('INVALID_EVIDENCE', 'Preuve invalide.');
      const before = next.evidence.length;
      next = addEvidence(next, { ...cmd.evidence, createdAt: cmd.evidence.createdAt ?? nowIso });
      if (next.evidence.length === before) return fail('INVALID_EVIDENCE', 'Preuve refusée (titre manquant ?).');
      effects.push('evidence:added');
      break;
    }
    case 'REMOVE_EVIDENCE': {
      const id = validId(cmd.evidenceId);
      if (!id) return fail('INVALID_EVIDENCE', 'Preuve invalide.');
      if (!next.evidence.some((e) => e.id === id)) return fail('EVIDENCE_NOT_FOUND', 'Preuve introuvable.');
      next = removeEvidence(next, id);
      effects.push('evidence:removed');
      break;
    }
    default:
      return fail('UNKNOWN_COMMAND', 'Commande inconnue.');
  }

  next.session = touch(next.session ?? d.session, nowIso);
  let out = putDay(progress, key, next, nowIso);

  if (reviewEvidence && Array.isArray(reviewEvidence.skills) && reviewEvidence.skills.length > 0) {
    // Identifiant portant la DATE : une révision par jour et par journée est un
    // fait distinct, deux révisions le même jour sont le même fait.
    const ev = makeEvidence({
      sourceType: 'review',
      sourceId: `day-${day}-${nowIso.slice(0, 10)}`,
      competencyIds: reviewEvidence.skills,
      validation: null, // une révision n'est jamais auto-validée
      title: `Révision de la journée ${day}`,
      provenance: {
        producer: 'review-engine',
        method: 'spaced-repetition',
        note: `Compréhension déclarée : ${reviewEvidence.comprehension}.`,
      },
      dayId: day,
    }, { now: nowIso });
    if (!ev.ok) return fail(ev.code, ev.error);
    const before = (out.evidence ?? []).length;
    out = withCanonicalEvidence(out, ev.evidence);
    if ((out.evidence ?? []).length > before) effects.push('ledger:review');
  }

  return { ok: true, progress: out, effects };
}

/**
 * RECORD_RECALL — enregistre UNE tentative de rappel sur UN concept.
 *
 * C'est la seule écriture du Retention Engine, et elle n'écrit qu'un FAIT
 * OBSERVÉ : « à cette date, dans cette forme, l'apprenant a retrouvé / retrouvé
 * en partie / n'a pas retrouvé ce concept ». Il n'existe volontairement AUCUNE
 * commande capable d'écrire un état de rétention ou une échéance : les deux
 * sont des projections de cette liste (`lib/retention.mjs`). Un état ne peut
 * donc pas être fabriqué — il ne peut qu'être mérité par des tentatives.
 *
 * La date est celle du SERVEUR (`nowIso`), jamais celle fournie par l'appelant :
 * une tentative antidatée fausserait l'espacement, qui se calcule sur des dates.
 * Un échec est un fait aussi légitime qu'une réussite : rien ici ne le rejette,
 * ne l'écrase ni ne le « répare ».
 */
function cmdRecordRecall(progress, cmd, nowIso) {
  const conceptId = validId(cmd.conceptId, 80);
  if (!conceptId) return fail('INVALID_CONCEPT', 'Concept invalide.');
  if (!RECALL_OUTCOMES.includes(cmd.outcome)) {
    return fail('INVALID_OUTCOME', `Issue invalide (attendu : ${RECALL_OUTCOMES.join(', ')}).`);
  }
  if (cmd.format != null && !RECALL_FORMATS.includes(cmd.format)) {
    return fail('INVALID_FORMAT', `Forme de rappel invalide (attendu : ${RECALL_FORMATS.join(', ')}).`);
  }
  const attempt = normalizeAttempt({
    conceptId,
    at: nowIso,
    outcome: cmd.outcome,
    format: cmd.format ?? 'free',
    sourceRef: typeof cmd.sourceRef === 'string' ? cmd.sourceRef : null,
  });
  if (!attempt) return fail('INVALID_ATTEMPT', 'Tentative invalide.');
  return {
    ok: true,
    progress: { ...progress, recallAttempts: [...progress.recallAttempts, attempt] },
    effects: ['recall:recorded'],
  };
}

function cmdOutsideDay(progress, cmd, nowIso) {
  switch (cmd.type) {
    case 'SET_SKILL': {
      const skill = validId(cmd.skill, 80);
      const score = Number(cmd.score);
      if (!skill) return fail('INVALID_SKILL', 'Compétence invalide.');
      if (!Number.isFinite(score) || score < 0 || score > 5) return fail('INVALID_SCORE', 'Score invalide.');
      return {
        ok: true,
        progress: { ...progress, skills: { ...progress.skills, [skill]: score } },
        effects: ['skill:set'],
      };
    }
    case 'SET_WEEKLY_REVIEW':
    case 'SET_MONTHLY_REVIEW': {
      const weekly = cmd.type === 'SET_WEEKLY_REVIEW';
      const id = validId(weekly ? cmd.week : cmd.month, 20);
      if (!id || !/^\d+$/.test(id)) return fail('INVALID_PERIOD', 'Période invalide.');
      const field = weekly ? 'weeklyReviews' : 'monthlyReviews';
      const base = progress[field]?.[id] ?? { done: false, note: '', score: null };
      const patch = isObj(cmd.patch) ? cmd.patch : {};
      const merged = {
        done: typeof patch.done === 'boolean' ? patch.done : base.done,
        note: typeof patch.note === 'string' ? patch.note.slice(0, 4000) : base.note,
        score: patch.score === null ? null
          : Number.isFinite(Number(patch.score)) ? Math.max(0, Math.min(5, Number(patch.score))) : base.score,
      };
      return {
        ok: true,
        progress: { ...progress, [field]: { ...progress[field], [id]: merged }, startDate: progress.startDate ?? nowIso.slice(0, 10) },
        effects: [weekly ? 'weekly-review' : 'monthly-review'],
      };
    }
    default:
      return fail('UNKNOWN_COMMAND', 'Commande inconnue.');
  }
}

// Normalisation d'une soumission unitaire (réutilise le normaliseur de validation).
function normalizeSubmission(raw) {
  return {
    id: String(raw.id).slice(0, 120),
    stepId: String(raw.stepId).slice(0, 120),
    kind: SUBMISSION_KINDS.includes(raw.kind) ? raw.kind : 'text',
    content: String(raw.content ?? '').slice(0, 20000),
    submittedAt: raw.submittedAt,
    validation: normalizeValidation(raw.validation),
  };
}

/**
 * Applique une commande à une progression PLATE. Fonction pure et déterministe
 * pour une horloge donnée.
 * @param {object} progress  progression plate (forme V6/V64)
 * @param {object} command   { type, ... }
 * @param {{now?: Date|string}} ctx
 */
export function applyCommand(progress, command, { now } = {}) {
  if (!isObj(progress)) return fail('INVALID_PROGRESS', 'Progression invalide.');
  if (!isObj(command)) return fail('INVALID_COMMAND', 'Commande invalide.');
  const type = command.type;
  if (typeof type !== 'string' || !COMMAND_SET.has(type)) {
    return fail('UNKNOWN_COMMAND', `Commande inconnue : ${String(type).slice(0, 40)}.`);
  }
  const nowIso = isoOf(now);
  if (!nowIso) return fail('INVALID_CLOCK', 'Horloge invalide.');

  // Base sûre : les cartes attendues existent toujours.
  const base = {
    ...progress,
    recallAttempts: normalizeAttempts(progress.recallAttempts),
    days: isObj(progress.days) ? progress.days : {},
    skills: isObj(progress.skills) ? progress.skills : {},
    weeklyReviews: isObj(progress.weeklyReviews) ? progress.weeklyReviews : {},
    monthlyReviews: isObj(progress.monthlyReviews) ? progress.monthlyReviews : {},
    startDate: progress.startDate ?? null,
    evidence: normalizeLedger(progress.evidence),
  };

  switch (type) {
    case 'START': case 'PAUSE': case 'RESUME': case 'COMPLETE': case 'REOPEN':
      return cmdLifecycle(base, command, nowIso);
    case 'SET_STEP':
      return cmdSetStep(base, command, nowIso);
    case 'SAVE_DRAFT':
      return cmdSaveDraft(base, command, nowIso);
    case 'SUBMIT':
      return cmdSubmit(base, command, nowIso);
    case 'ATTACH_VALIDATION':
      return cmdAttachValidation(base, command, nowIso);
    case 'SET_SKILL': case 'SET_WEEKLY_REVIEW': case 'SET_MONTHLY_REVIEW':
      return cmdOutsideDay(base, command, nowIso);
    case 'RECORD_RECALL':
      return cmdRecordRecall(base, command, nowIso);
    default:
      return cmdLearning(base, command, nowIso);
  }
}

// ── Read-models dérivés (purs, aucune écriture) ───────────────────────────

/**
 * Vue de session d'une journée : ce que l'interface doit afficher pour dire
 * « où j'en suis ». Tout est dérivé — rien n'est stocké en double.
 */
export function sessionView(dayProgress, activities = []) {
  const d = normalizeDay(dayProgress);
  const list = Array.isArray(activities) ? activities : [];
  const steps = list.map((a) => ({
    id: a.id,
    label: a.label ?? '',
    family: a.family ?? null,
    state: d.session.steps[a.id]?.state ?? 'pending',
    submissions: d.submissions.filter((x) => x.stepId === a.id).length,
    lastValidation: [...d.submissions].reverse().find((x) => x.stepId === a.id)?.validation ?? null,
  }));
  const done = steps.filter((x) => x.state === 'done').length;
  const validated = d.submissions.filter((x) => x.validation?.status === 'passed').length;
  return {
    state: d.session.state,
    startedAt: d.session.startedAt,
    lastActiveAt: d.session.lastActiveAt,
    completedAt: d.session.completedAt,
    reopenCount: d.session.reopenCount,
    steps,
    stepsTotal: steps.length,
    stepsDone: done,
    submissions: d.submissions.length,
    validatedSubmissions: validated,
    evidenceCount: d.evidence.length,
    canStart: d.session.state === 'not_started',
    canResume: d.session.state === 'paused',
    canComplete: d.session.state === 'active' || d.session.state === 'paused',
  };
}

/** Journées portant une session ouverte (active ou en pause), triées. */
export function openSessions(progress) {
  const days = progress?.days ?? {};
  const out = [];
  for (const k of Object.keys(days)) {
    if (!/^\d+$/.test(k)) continue;
    const d = normalizeDay(days[k]);
    if (d.session.state === 'active' || d.session.state === 'paused') {
      out.push({ day: Number(k), state: d.session.state, lastActiveAt: d.session.lastActiveAt, startedAt: d.session.startedAt });
    }
  }
  return out.sort((a, b) => a.day - b.day);
}

export { SESSION_STATES, STEP_STATES, SUBMISSION_KINDS, VALIDATION_STATUSES, VALIDATION_KINDS };
