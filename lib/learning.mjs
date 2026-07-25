// Modèle « Active Learning » PUR (aucun I/O, aucun DOM) — EXTENSION de la
// progression existante, pas une seconde source de vérité. Un DayProgress V6 est
// un sur-ensemble rétro-compatible du DayProgress V5 : les anciens champs
// (status, answer, notes, selfScore, checklist) restent lus tels quels ; on
// ajoute answers (par section), selfAssessment, attempts, correctionState,
// review, evidence, comprehension, horodatages. Toutes les mutations passent par
// des fonctions pures immuables, validées et bornées.

export const LEARNING_SCHEMA = 2; // 1 = V5, 2 = V6 (active learning)

export const CORRECTION_STATES = ['locked', 'available', 'viewed', 'acknowledged'];
export const COMPREHENSIONS = ['understood', 'partial', 'review'];
export const CONFIDENCES = ['low', 'medium', 'high'];
export const EVIDENCE_TYPES = ['exercise', 'repo', 'project', 'screenshot', 'note', 'demo', 'other'];
export const DAY_STATUSES = ['not-started', 'in-progress', 'done', 'to-review'];

const DANGEROUS = new Set(['__proto__', 'prototype', 'constructor']);
const MAX_TEXT = 20000;
const MAX_ANSWERS = 200;
const MAX_EVIDENCE = 100;
const MAX_ATTEMPTS = 500;
const MAX_SKILLS_PER_EVIDENCE = 30;

const s = (v, max = MAX_TEXT) => (typeof v === 'string' ? v.slice(0, max) : '');
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const clampInt = (v, lo, hi, dflt = 0) => (Number.isFinite(v) ? Math.max(lo, Math.min(hi, Math.trunc(v))) : dflt);
const isoOrNull = (v) => (typeof v === 'string' && !Number.isNaN(new Date(v).getTime()) ? v : null);

/** Neutralise les URLs dangereuses ; autorise http(s), mailto et chemins relatifs. */
export function safeUrl(u) {
  if (typeof u !== 'string') return '';
  const t = u.trim();
  if (!t) return '';
  if (/^(https?:|mailto:)/i.test(t)) return t.slice(0, 2000);
  if (/^[a-z0-9]+:/i.test(t)) return ''; // javascript:, data:, file:… → rejeté
  return t.slice(0, 2000); // chemin relatif
}

function cleanMap(raw, valueFn, max) {
  const out = {};
  if (!isObj(raw)) return out;
  let n = 0;
  for (const k of Object.keys(raw)) {
    if (DANGEROUS.has(k) || n >= max) continue;
    const v = valueFn(raw[k]);
    if (v !== undefined) { out[k] = v; n += 1; }
  }
  return out;
}

function normalizeSelfAssessment(a) {
  if (!isObj(a)) return null;
  const level = a.level === null || a.level === undefined ? null : clampInt(a.level, 0, 5, 0);
  const confidence = CONFIDENCES.includes(a.confidence) ? a.confidence : null;
  const criteria = cleanMap(a.criteria, (v) => !!v, 100);
  const comment = s(a.comment, 4000);
  if (level === null && confidence === null && !Object.keys(criteria).length && !comment) return null;
  return { level, confidence, criteria, comment };
}

function normalizeAttempts(a) {
  const base = { count: 0, lastAt: null, history: [] };
  if (!isObj(a)) return base;
  const history = Array.isArray(a.history)
    ? a.history.slice(0, MAX_ATTEMPTS).filter(isObj).map((h) => ({
        at: isoOrNull(h.at), outcome: s(h.outcome, 40), summary: s(h.summary, 500),
      }))
    : [];
  return { count: clampInt(a.count, 0, MAX_ATTEMPTS, history.length), lastAt: isoOrNull(a.lastAt), history };
}

function normalizeReview(r) {
  if (!isObj(r)) return null;
  return {
    dueAt: isoOrNull(r.dueAt),
    interval: clampInt(r.interval, 0, 3650, 0),
    repetitions: clampInt(r.repetitions, 0, 10000, 0),
    ease: Number.isFinite(r.ease) ? Math.max(1.3, Math.min(3.5, r.ease)) : 2.5,
    lastReviewedAt: isoOrNull(r.lastReviewedAt),
    reason: s(r.reason, 200),
  };
}

function normalizeEvidence(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, MAX_EVIDENCE).filter(isObj).map((e, i) => ({
    id: s(e.id, 64) || `ev-${i}-${Date.now()}`,
    type: EVIDENCE_TYPES.includes(e.type) ? e.type : 'other',
    title: s(e.title, 300),
    description: s(e.description, 4000),
    url: safeUrl(e.url),
    skills: Array.isArray(e.skills) ? e.skills.filter((x) => typeof x === 'string').slice(0, MAX_SKILLS_PER_EVIDENCE).map((x) => x.slice(0, 80)) : [],
    createdAt: isoOrNull(e.createdAt) ?? '',
  }));
}

/** Normalise un DayProgress (V5 ou V6) vers la forme V6 complète et sûre. */
export function normalizeDay(d) {
  const o = isObj(d) ? d : {};
  const status = DAY_STATUSES.includes(o.status) ? o.status : 'not-started';
  return {
    status,
    startedAt: isoOrNull(o.startedAt),
    completedAt: isoOrNull(o.completedAt),
    updatedAt: typeof o.updatedAt === 'string' ? o.updatedAt : '',
    answer: s(o.answer),                       // legacy : réponse globale
    notes: s(o.notes),
    answers: cleanMap(o.answers, (v) => s(v), MAX_ANSWERS), // par section
    selfScore: o.selfScore === null || o.selfScore === undefined ? null : clampInt(o.selfScore, 0, 5, 0), // legacy
    selfAssessment: normalizeSelfAssessment(o.selfAssessment),
    comprehension: COMPREHENSIONS.includes(o.comprehension) ? o.comprehension : null,
    attempts: normalizeAttempts(o.attempts),
    correctionState: CORRECTION_STATES.includes(o.correctionState) ? o.correctionState : 'locked',
    review: normalizeReview(o.review),
    evidence: normalizeEvidence(o.evidence),
    checklist: cleanMap(o.checklist, (v) => !!v, 200), // legacy
  };
}

/** Migre une progression entière (V5 → V6) en mémoire, sans perte. */
export function migrateProgress(progress) {
  const p = isObj(progress) ? progress : {};
  const days = {};
  if (isObj(p.days)) {
    for (const k of Object.keys(p.days)) {
      if (DANGEROUS.has(k) || !/^\d+$/.test(k)) continue;
      days[k] = normalizeDay(p.days[k]);
    }
  }
  return {
    schemaVersion: LEARNING_SCHEMA,
    startDate: typeof p.startDate === 'string' ? p.startDate : null,
    days,
    skills: cleanMap(p.skills, (v) => (Number.isFinite(v) ? Math.max(0, Math.min(5, v)) : undefined), 300),
    weeklyReviews: isObj(p.weeklyReviews) ? p.weeklyReviews : {},
    monthlyReviews: isObj(p.monthlyReviews) ? p.monthlyReviews : {},
  };
}

// ── Mutations pures (renvoient un nouveau DayProgress) ──

export function updateAnswer(day, sectionId, text) {
  const d = normalizeDay(day);
  const id = String(sectionId);
  if (DANGEROUS.has(id)) return d;
  return { ...d, answers: { ...d.answers, [id]: s(text) } };
}

export function updateNotes(day, text) {
  return { ...normalizeDay(day), notes: s(text) };
}

export function recordAttempt(day, { at, outcome = '', summary = '' } = {}) {
  const d = normalizeDay(day);
  const entry = { at: isoOrNull(at) ?? new Date(0).toISOString(), outcome: s(outcome, 40), summary: s(summary, 500) };
  const history = [...d.attempts.history, entry].slice(-MAX_ATTEMPTS);
  return { ...d, attempts: { count: d.attempts.count + 1, lastAt: entry.at, history } };
}

export function updateSelfAssessment(day, patch) {
  const d = normalizeDay(day);
  const merged = normalizeSelfAssessment({ ...(d.selfAssessment ?? {}), ...(isObj(patch) ? patch : {}) });
  return { ...d, selfAssessment: merged };
}

export function setCorrectionState(day, state) {
  const d = normalizeDay(day);
  return { ...d, correctionState: CORRECTION_STATES.includes(state) ? state : d.correctionState };
}

export function setComprehension(day, value) {
  const d = normalizeDay(day);
  return { ...d, comprehension: COMPREHENSIONS.includes(value) ? value : null };
}

export function scheduleReview(day, review) {
  return { ...normalizeDay(day), review: normalizeReview(review) };
}

export function addEvidence(day, evidence) {
  const d = normalizeDay(day);
  const [clean] = normalizeEvidence([{ ...evidence, createdAt: evidence?.createdAt ?? new Date().toISOString() }]);
  if (!clean || !clean.title) return d;
  if (!clean.id || d.evidence.some((e) => e.id === clean.id)) clean.id = `ev-${d.evidence.length}-${Date.parse(clean.createdAt) || 0}`;
  return { ...d, evidence: [...d.evidence, clean].slice(0, MAX_EVIDENCE) };
}

export function removeEvidence(day, id) {
  const d = normalizeDay(day);
  return { ...d, evidence: d.evidence.filter((e) => e.id !== id) };
}

/**
 * Synthèse de journée dérivée (pure) : compte les activités attendues et
 * répondues, l'état de correction, la confiance, la révision et les preuves.
 * @param {object} day  DayProgress
 * @param {Array<{id:string}>} activities  activités dérivées du contenu
 */
export function daySummary(day, activities = []) {
  const d = normalizeDay(day);
  const list = Array.isArray(activities) ? activities : [];
  const answered = list.filter((a) => a && typeof d.answers[a.id] === 'string' && d.answers[a.id].trim()).length;
  return {
    status: d.status,
    activities: list.length,
    answered,
    unanswered: Math.max(0, list.length - answered),
    correctionViewed: d.correctionState === 'viewed' || d.correctionState === 'acknowledged',
    comprehension: d.comprehension,
    confidence: d.selfAssessment?.confidence ?? null,
    reviewDueAt: d.review?.dueAt ?? null,
    evidenceCount: d.evidence.length,
    hasNotes: !!d.notes.trim(),
  };
}
