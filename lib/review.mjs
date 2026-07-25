// Moteur de révision espacée PUR, LOCAL et DÉTERMINISTE (aucune « IA »).
// Horloge injectable pour des tests reproductibles. Dérive la prochaine révision
// depuis la compréhension déclarée, la confiance et l'historique — pas de
// dépendance externe. S'appuie sur le champ `review` du modèle Active Learning.

const DAY_MS = 86_400_000;
const MAX_INTERVAL = 180; // plafond en jours
const MIN_EASE = 1.3;
const MAX_EASE = 3.5;

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
function toDate(v) { const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d; }
function addDays(date, n) { return new Date(date.getTime() + n * DAY_MS); }
function startOfDay(d) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); }

/** Intervalle de base (jours) selon compréhension + confiance. Documenté et fixe. */
export function baseInterval(comprehension, confidence) {
  if (comprehension === 'review') return 1;   // incompris / à revoir
  if (comprehension === 'partial') return 3;  // partiellement compris
  if (confidence === 'low') return 7;         // compris, peu sûr
  if (confidence === 'high') return 21;       // compris, très sûr
  return 14;                                   // compris, confiance moyenne/inconnue
}

const REASON = {
  review: 'Marqué à revoir', partial: 'Compréhension partielle',
  understood: 'Consolidation espacée',
};

/**
 * Calcule la prochaine révision. Déterministe pour une horloge donnée.
 * @returns {{dueAt, interval, repetitions, ease, lastReviewedAt, reason}}
 */
export function calculateNextReview({
  comprehension = 'partial', confidence = null, repetitions = 0, ease = 2.5, now = new Date(),
} = {}) {
  const clock = toDate(now) ?? new Date();
  const good = comprehension === 'understood';
  const reps = good ? repetitions + 1 : comprehension === 'partial' ? repetitions : 0;

  let interval = baseInterval(comprehension, confidence);
  if (good && repetitions > 0) {
    interval = Math.min(MAX_INTERVAL, Math.round(interval * Math.pow(ease, Math.min(repetitions, 6))));
  }
  const nextEase = good
    ? Math.min(MAX_EASE, ease + 0.05)
    : Math.max(MIN_EASE, ease - (comprehension === 'review' ? 0.2 : 0.1));

  const dueAt = addDays(startOfDay(clock), interval).toISOString();
  return {
    dueAt,
    interval,
    repetitions: reps,
    ease: Math.round(nextEase * 100) / 100,
    lastReviewedAt: clock.toISOString(),
    reason: REASON[comprehension] ?? REASON.partial,
  };
}

/** Met à jour le champ review d'un jour à partir d'une auto-évaluation. */
export function updateReviewSchedule(review, { comprehension, confidence, now = new Date() } = {}) {
  const prev = isObj(review) ? review : {};
  return calculateNextReview({
    comprehension, confidence,
    repetitions: Number.isFinite(prev.repetitions) ? prev.repetitions : 0,
    ease: Number.isFinite(prev.ease) ? prev.ease : 2.5,
    now,
  });
}

/** Entrées de révision {day, review} dérivées d'une progression. */
function reviewEntries(days) {
  const out = [];
  for (const k of Object.keys(days ?? {})) {
    if (!/^\d+$/.test(k)) continue;
    const d = days[k];
    if (isObj(d) && isObj(d.review) && d.review.dueAt) out.push({ day: Number(k), review: d.review, status: d.status });
  }
  return out;
}

/** Révisions dues (échéance ≤ aujourd'hui), triées par retard décroissant. */
export function getDueReviews(days, now = new Date()) {
  const clock = toDate(now) ?? new Date();
  const today = startOfDay(clock).getTime();
  return reviewEntries(days)
    .map((e) => {
      const due = toDate(e.review.dueAt);
      if (!due) return null;
      const dueDay = startOfDay(due).getTime();
      const overdueDays = Math.round((today - dueDay) / DAY_MS);
      return overdueDays >= 0 ? { day: e.day, dueAt: e.review.dueAt, reason: e.review.reason, overdueDays } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.overdueDays - a.overdueDays || a.day - b.day);
}

/** Prochaines révisions (échéance future), triées par échéance croissante. */
export function getUpcomingReviews(days, now = new Date(), withinDays = 30) {
  const clock = toDate(now) ?? new Date();
  const today = startOfDay(clock).getTime();
  const limit = today + withinDays * DAY_MS;
  return reviewEntries(days)
    .map((e) => {
      const due = toDate(e.review.dueAt);
      if (!due) return null;
      const dueDay = startOfDay(due).getTime();
      return dueDay > today && dueDay <= limit
        ? { day: e.day, dueAt: e.review.dueAt, reason: e.review.reason, inDays: Math.round((dueDay - today) / DAY_MS) }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.inDays - b.inDays || a.day - b.day);
}

/** Compteurs compacts pour le Dashboard. */
export function reviewSummary(days, now = new Date()) {
  const due = getDueReviews(days, now);
  const overdue = due.filter((d) => d.overdueDays > 0).length;
  const upcoming = getUpcomingReviews(days, now);
  return {
    dueToday: due.length,
    overdue,
    next: upcoming[0] ?? null,
    total: reviewEntries(days).length,
  };
}

/** Résultat d'une révision → nouvelle planification (result: 'hard'|'partial'|'good'). */
export function completeReview(review, result, now = new Date()) {
  const comprehension = result === 'good' ? 'understood' : result === 'hard' ? 'review' : 'partial';
  return updateReviewSchedule(review, { comprehension, confidence: null, now });
}
