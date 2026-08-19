// Curriculum Timeline — READ-MODEL DÉRIVÉ (V50). PUR : aucune I/O.
// Reconstruit la trajectoire temporelle réelle du parcours 365 jours à partir de
// sources EXISTANTES (program.days, day-exercises, exercises, transfer, capstones,
// misconceptions). Ne détient AUCUNE vérité propre : projection recomputable, pas
// une seconde source. Réutilise projectSkill. Ne persiste rien.
import { projectSkill } from './practice-coverage.mjs';

const pj = (arr) => [...new Set((Array.isArray(arr) ? arr : []).map(projectSkill).filter(Boolean))];

// Rôle pédagogique DÉRIVÉ d'une activité (pas un champ persisté concurrent).
export function activityRole({ isReview = false, difficulty = 2, kind = 'exercise' } = {}) {
  if (kind === 'transfer') return 'TRANSFER';
  if (kind === 'capstone') return 'PROFESSIONAL';
  if (isReview) return 'REVIEW';
  if (difficulty >= 4) return 'DIAGNOSTIC';
  return 'PRACTICE';
}

/**
 * Construit la timeline. Entrées passées par l'appelant (module pur).
 * @param {{days:Array, dayExercises:Object, exercises:Array, transfer?:Array, capstones?:Array}} sources
 */
export function buildTimeline({ days = [], dayExercises = {}, exercises = [], transfer = [], capstones = [] } = {}) {
  const exById = new Map(exercises.map((e) => [e.id, e]));

  // Jour → activités résolues.
  const timeline = days.map((d) => {
    const daySkill = projectSkill(d.skill) || d.skill;
    const exIds = Array.isArray(dayExercises[String(d.day)]) ? dayExercises[String(d.day)] : [];
    const acts = exIds.map((id) => {
      const ex = exById.get(id);
      return {
        id, resolved: !!ex,
        skills: ex ? pj(ex.skills) : [],
        difficulty: ex?.difficulty ?? null,
        role: activityRole({ isReview: !!d.isReview, difficulty: ex?.difficulty ?? 2 }),
      };
    });
    return { day: d.day, month: d.month, week: d.week, skill: daySkill, isReview: !!d.isReview, difficulty: d.difficulty, activities: acts };
  });

  // Exposition par compétence (jours où la compétence est enseignée).
  const exposure = {};
  for (const d of days) { const s = projectSkill(d.skill) || d.skill; (exposure[s] ??= []).push(d.day); }
  for (const s of Object.keys(exposure)) exposure[s].sort((a, b) => a - b);

  // Jours de pratique par compétence (via activités résolues).
  const practiceDays = {};
  for (const t of timeline) for (const a of t.activities) if (a.resolved) for (const s of a.skills) (practiceDays[s] ??= new Set()).add(t.day);

  return { timeline, exposure, practiceDays: Object.fromEntries(Object.entries(practiceDays).map(([k, v]) => [k, [...v].sort((a, b) => a - b)])) , exById };
}

/** Audit temporel par compétence : premières/dernières expositions, gaps, oubli. */
export function temporalAudit(tl) {
  const rows = [];
  for (const [skill, days] of Object.entries(tl.exposure)) {
    const first = days[0], last = days[days.length - 1];
    let maxGap = 0;
    for (let i = 1; i < days.length; i++) maxGap = Math.max(maxGap, days[i] - days[i - 1]);
    const tailGap = 365 - last;
    const pd = tl.practiceDays[skill] || [];
    rows.push({ skill, firstExposure: first, lastExposure: last, exposureDays: days.length, practiceDays: pd.length, maxGap, tailGap });
  }
  return rows.sort((a, b) => a.firstExposure - b.firstExposure);
}

/** Exercices jamais atteints par le parcours (orphelins). */
export function orphanExercises(tl, exercises) {
  const mapped = new Set();
  for (const t of tl.timeline) for (const a of t.activities) mapped.add(a.id);
  return exercises.filter((e) => !mapped.has(e.id)).map((e) => e.id);
}

/** Distribution de pratique par mois (jours avec ≥1 activité résolue). */
export function monthlyDistribution(tl) {
  const out = {};
  for (const t of tl.timeline) {
    const b = (out[t.month] ??= { days: 0, daysWithPractice: 0, activities: 0 });
    b.days++;
    const resolved = t.activities.filter((a) => a.resolved).length;
    if (resolved) b.daysWithPractice++;
    b.activities += resolved;
  }
  return out;
}

/** Anomalies temporelles (sévérité/raison/action) — diagnostics, pas source de vérité. */
export function temporalAnomalies(tl, exercises, { forgettingDays = 90, deadRefIsBlocking = true } = {}) {
  const anomalies = [];
  // 1. Références mortes (exercice mappé inexistant).
  const known = new Set(exercises.map((e) => e.id));
  for (const t of tl.timeline) for (const a of t.activities) if (!known.has(a.id)) {
    anomalies.push({ severity: deadRefIsBlocking ? 'blocking' : 'warning', kind: 'dead-ref', day: t.day, reason: `exercice « ${a.id} » mappé au jour ${t.day} mais inexistant`, action: 'retirer ou corriger la référence' });
  }
  // 2. Pratique avant introduction de la compétence (prérequis).
  for (const t of tl.timeline) for (const a of t.activities) if (a.resolved) for (const s of a.skills) {
    const first = tl.exposure[s]?.[0];
    if (first !== undefined && t.day < first) anomalies.push({ severity: 'warning', kind: 'practice-before-intro', day: t.day, reason: `« ${a.id} » (${s}) pratiqué jour ${t.day} avant l'introduction de ${s} (jour ${first})`, action: 'déplacer à ≥ première exposition' });
  }
  // 3. Oubli : compétence de code absente de toute pratique > seuil jusqu'à la fin.
  for (const row of temporalAudit(tl)) {
    if (row.tailGap > forgettingDays && (tl.practiceDays[row.skill] || []).length > 0) {
      const lastPractice = Math.max(...(tl.practiceDays[row.skill] || [0]));
      if (365 - lastPractice > forgettingDays) anomalies.push({ severity: 'warning', kind: 'forgetting', day: lastPractice, reason: `${row.skill} sans pratique après le jour ${lastPractice} (${365 - lastPractice} jours)`, action: 'ajouter une réactivation tardive (jour de révision)' });
    }
  }
  return anomalies;
}
