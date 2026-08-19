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

// ── V51 — progression cognitive, charge, rétention honnête ───────────────────

/** Charge dérivée d'un jour (modèle transparent, pas de « score IA »). */
export function dailyLoad(dayRow, tl) {
  const t = tl.timeline.find((x) => x.day === dayRow.day) || { activities: [] };
  const n = t.activities.filter((a) => a.resolved).length;
  const hard = t.activities.filter((a) => a.resolved && (a.difficulty ?? 0) >= 4).length;
  let level = 'none';
  if (n === 0) level = dayRow.isReview ? 'light' : 'none';
  else if (n <= 2) level = 'light';
  else if (n <= 4) level = 'normal';
  else if (n <= 6) level = 'heavy';
  else level = 'excessive';
  // Une forte concentration de D4/D5 alourdit d'un cran.
  if (hard >= 3 && level === 'normal') level = 'heavy';
  return { day: dayRow.day, month: dayRow.month, activities: n, hard, isReview: !!dayRow.isReview, level };
}

/** Histogramme de charge sur les 365 jours. */
export function loadHistogram(days, tl) {
  const out = { none: 0, light: 0, normal: 0, heavy: 0, excessive: 0 };
  for (const d of days) out[dailyLoad(d, tl).level]++;
  return out;
}

/** Progression cognitive par compétence : timeline de difficulté (jour du 1er Dk). */
export function skillProgression(tl) {
  // Reconstruire, par compétence, la liste {day, difficulty, review}.
  const byId = tl.exById;
  const perSkill = {};
  for (const t of tl.timeline) for (const a of t.activities) if (a.resolved) {
    const ex = byId.get(a.id);
    for (const s of a.skills) (perSkill[s] ??= []).push({ day: t.day, difficulty: ex?.difficulty ?? a.difficulty ?? null, review: t.isReview });
  }
  const rows = [];
  for (const [skill, list] of Object.entries(perSkill)) {
    list.sort((x, y) => x.day - y.day);
    const firstAt = (min) => { const f = list.find((x) => (x.difficulty ?? 0) >= min); return f ? f.day : null; };
    rows.push({
      skill,
      firstD3: firstAt(3), firstD4: firstAt(4), firstD5: firstAt(5),
      practiceDays: [...new Set(list.map((x) => x.day))].length,
      reactivations: list.filter((x) => x.review).length,
    });
  }
  return rows.sort((a, b) => a.skill.localeCompare(b.skill));
}

/**
 * Anomalies de RÉTENTION mesurées sur la PRATIQUE (correction de l'angle mort V50).
 * Un gap = jours entre deux pratiques consécutives ; l'écart de queue = j365 −
 * dernière pratique. Compétences non-code exclues. Seuils ADR-051.
 */
export function retentionAnomalies(tl, { nonCode = ['comm', 'autonomy', 'cloud'], warn = 61, anomaly = 90, justifiedLateSkills = {} } = {}) {
  const out = [];
  for (const [skill, days] of Object.entries(tl.practiceDays)) {
    if (nonCode.includes(skill)) continue;
    const introLate = justifiedLateSkills[skill]; // ex. rag/dl enseignés en fin d'année
    const arr = days.slice().sort((a, b) => a - b);
    let maxGap = 0;
    for (let i = 1; i < arr.length; i++) maxGap = Math.max(maxGap, arr[i] - arr[i - 1]);
    const tail = 365 - arr[arr.length - 1];
    if (maxGap > anomaly) out.push({ severity: 'warning', kind: 'practice-gap', skill, reason: `${skill} : écart max de pratique ${maxGap} j (> ${anomaly})`, gap: maxGap });
    // Écart de queue : anomalie sauf si la compétence est légitimement enseignée en toute fin.
    if (tail > anomaly && !introLate) out.push({ severity: 'warning', kind: 'forgetting-tail', skill, reason: `${skill} : plus de pratique après le jour ${arr[arr.length - 1]} (${tail} j jusqu'à la fin)`, gap: tail });
  }
  return out.sort((a, b) => b.gap - a.gap);
}

/** Anomalies de progression de difficulté. */
export function difficultyAnomalies(tl) {
  const out = [];
  for (const row of skillProgression(tl)) {
    const { skill, firstD3, firstD4, firstD5 } = row;
    if (firstD5 && !firstD4 && !firstD3) out.push({ severity: 'warning', kind: 'isolated-d5', skill, reason: `${skill} : D5 (j${firstD5}) sans D3/D4 en pratique` });
    if (firstD4 && firstD3 && firstD4 - firstD3 > 120) out.push({ severity: 'info', kind: 'difficulty-jump', skill, reason: `${skill} : D3 (j${firstD3}) → D4 (j${firstD4}) écartés de ${firstD4 - firstD3} j` });
  }
  return out;
}
