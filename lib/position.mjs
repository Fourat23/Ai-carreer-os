// Source de vérité UNIQUE pour le positionnement dans le parcours (pur, testable).
// Distingue explicitement des notions qui étaient auparavant confondues sous
// « jour courant » :
//   - resumeDay              : la journée à reprendre maintenant (logique de reprise)
//   - nextIncompleteDay      : la première journée non terminée, dans l'ordre
//   - currentProgressPosition: la progression réelle (nb de jours terminés)
//   - expectedDay            : la position théorique selon la date de démarrage
//   - delay / ahead          : écart entre attendu et réel
import { resolveResume, dayStatus } from './resume.mjs';

/** Jours triés et valides. */
function ordered(days) {
  return [...(days ?? [])].filter((d) => Number.isInteger(d?.day)).sort((a, b) => a.day - b.day);
}

/** Première journée non terminée (ou null si tout est terminé / liste vide). */
export function nextIncompleteDay(days, progress) {
  for (const d of ordered(days)) if (dayStatus(progress, d.day) !== 'done') return d.day;
  return null;
}

/** Nombre de journées terminées. */
export function completedCount(days, progress) {
  let n = 0;
  for (const d of ordered(days)) if (dayStatus(progress, d.day) === 'done') n += 1;
  return n;
}

/**
 * Position attendue selon la date de démarrage (rythme 1 jour/jour calendaire).
 * @returns {number|null} 1..total, ou null si pas de date valide.
 */
export function expectedDay(total, startDate, now = new Date()) {
  if (!startDate || typeof startDate !== 'string') return null;
  const start = new Date(startDate + 'T00:00:00');
  if (Number.isNaN(start.getTime())) return null;
  const diff = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, Math.min(total || 1, diff + 1));
}

/**
 * Calcule toutes les notions de position en une passe cohérente.
 * @returns {{
 *   total:number, resumeDay:number, resumeReason:string,
 *   nextIncompleteDay:number|null, currentProgressPosition:number,
 *   expectedDay:number|null, delay:number, ahead:number, complete:boolean
 * }}
 */
export function progressPosition(days, progress, now = new Date()) {
  const list = ordered(days);
  const total = list.length;
  const resume = resolveResume(list, progress);
  const nextInc = nextIncompleteDay(list, progress);
  const done = completedCount(list, progress);
  const complete = total > 0 && nextInc === null;
  const exp = expectedDay(total, progress?.startDate, now);

  // Le rythme compare la position attendue à la première journée non terminée
  // (là où tu « devrais » travailler). Si tout est fini, aucun retard.
  const ref = nextInc ?? total;
  const delay = exp != null && !complete ? Math.max(0, exp - ref) : 0;
  const ahead = exp != null && !complete ? Math.max(0, ref - exp) : 0;

  return {
    total,
    resumeDay: resume.day,
    resumeReason: resume.reason,
    nextIncompleteDay: nextInc,
    currentProgressPosition: done,
    expectedDay: exp,
    delay,
    ahead,
    complete,
  };
}
