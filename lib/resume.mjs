// Logique PURE de reprise & de progression (aucun I/O, aucun DOM) — partagée par
// le Dashboard, la Vue Jour et les tests. Un SEUL modèle de progression :
// on lit le même `progress.days[String(day)].status` que l'API /api/progress.

/** @typedef {'not-started'|'in-progress'|'done'|'to-review'} DayStatus */

/** Statut d'un jour (défensif : jour absent / statut inconnu → 'not-started'). */
export function dayStatus(progress, day) {
  const s = progress?.days?.[String(day)]?.status;
  return s === 'in-progress' || s === 'done' || s === 'to-review' ? s : 'not-started';
}

/**
 * Résout la journée à reprendre depuis les VRAIES données, avec la raison :
 *  1. une journée explicitement « en cours » (la plus basse) ;
 *  2. sinon la première non terminée après la dernière terminée ;
 *  3. sinon la première non terminée (progression discontinue / vide) ;
 *  4. sinon programme terminé (toutes terminées).
 * @returns {{ day:number, reason:'in-progress'|'continue'|'start'|'complete', total:number }}
 */
export function resolveResume(days, progress) {
  const ordered = [...(days ?? [])].filter((d) => Number.isInteger(d?.day)).sort((a, b) => a.day - b.day);
  const total = ordered.length;
  if (!total) return { day: 1, reason: 'start', total: 0 };

  // 1. En cours (priorité absolue).
  const inProg = ordered.find((d) => dayStatus(progress, d.day) === 'in-progress');
  if (inProg) return { day: inProg.day, reason: 'in-progress', total };

  // Dernière journée terminée.
  let lastDone = 0;
  for (const d of ordered) if (dayStatus(progress, d.day) === 'done') lastDone = d.day;

  // 4. Tout est terminé.
  const anyNotDone = ordered.some((d) => dayStatus(progress, d.day) !== 'done');
  if (!anyNotDone) return { day: ordered[ordered.length - 1].day, reason: 'complete', total };

  // 2. Première non terminée après la dernière terminée.
  if (lastDone > 0) {
    const after = ordered.find((d) => d.day > lastDone && dayStatus(progress, d.day) !== 'done');
    if (after) return { day: after.day, reason: 'continue', total };
  }

  // 3. Première non terminée (aucune terminée, ou trous avant lastDone).
  const first = ordered.find((d) => dayStatus(progress, d.day) !== 'done');
  return { day: first.day, reason: lastDone > 0 ? 'continue' : 'start', total };
}

const REASON_TEXT = {
  'in-progress': 'Journée en cours — reprends où tu t’es arrêté.',
  continue: 'Prochaine journée non terminée de ton parcours.',
  start: 'Point de départ de ton programme.',
  complete: 'Programme terminé — les 365 journées sont faites.',
};

/** Phrase expliquant pourquoi cette journée est proposée. */
export function resumeReasonText(reason) {
  return REASON_TEXT[reason] ?? REASON_TEXT.continue;
}

/** Compte les jours par statut. */
export function countStatuses(days, progress) {
  const c = { done: 0, 'in-progress': 0, 'to-review': 0, 'not-started': 0, total: 0 };
  for (const d of days ?? []) {
    if (!Number.isInteger(d?.day)) continue;
    c[dayStatus(progress, d.day)] += 1;
    c.total += 1;
  }
  return c;
}

/** Progression (0-100) d'un sous-ensemble de jours (ex. une semaine, un mois). */
export function progressOf(days, progress) {
  const list = (days ?? []).filter((d) => Number.isInteger(d?.day));
  if (!list.length) return 0;
  const done = list.filter((d) => dayStatus(progress, d.day) === 'done').length;
  return Math.round((done / list.length) * 100);
}

/** Transition de statut autorisée depuis une action de la Vue Jour. */
export function nextStatusFor(action, current) {
  switch (action) {
    case 'start': return current === 'done' ? 'done' : 'in-progress';
    case 'complete': return 'done';
    case 'reopen': return 'in-progress';
    case 'review': return 'to-review';
    default: return current;
  }
}
