// Contexte de parcours d'un exercice — PUR, déterministe, sans I/O, sans React.
// Un exercice est relié à des JOURNÉES (data/day-exercises.json, agnostique au
// parcours). Les journées appartiennent aux parcours (resolveTrackDays). Un
// exercice est donc « atteignable depuis T » si l'une de ses journées liées ∈ T.
// Ce module NE contient jamais de contenu privé (il ne manipule que des numéros
// de journées, des ids de parcours et des portées).
import { resolveTrackDays, isTrackAvailable } from './catalogue.mjs';

/**
 * Ensembles de journées des parcours DISPONIBLES. Construit une fois par requête.
 * @param {object} catalogue
 * @returns {Map<string, Set<number>>}  trackId → Set(dayNums)
 */
export function trackDaySets(catalogue) {
  const out = new Map();
  for (const t of catalogue?.tracks ?? []) {
    if (!isTrackAvailable(t)) continue;
    out.set(t.id, new Set(resolveTrackDays(catalogue, t)));
  }
  return out;
}

/**
 * Classe un exercice relativement au parcours actif. Structure explicite (pas de
 * booléens contradictoires). N'altère JAMAIS ses entrées.
 * @param {number[]} exerciseDayNums   journées liées à l'exercice
 * @param {Map<string,Set<number>>} sets  trackDaySets(catalogue)
 * @param {string} activeTrackId
 * @returns {{reachableTracks:string[], activeDays:number[], inActive:boolean, multiTrack:boolean, scope:'active'|'other'|'global'}}
 */
export function classifyExercise(exerciseDayNums, sets, activeTrackId) {
  const days = Array.isArray(exerciseDayNums) ? [...new Set(exerciseDayNums)] : [];
  const reachable = [];
  let activeDays = [];
  for (const [trackId, daySet] of (sets instanceof Map ? sets : new Map())) {
    const hit = days.filter((d) => daySet.has(d));
    if (hit.length) {
      reachable.push(trackId);
      if (trackId === activeTrackId) activeDays = hit;
    }
  }
  reachable.sort();
  activeDays.sort((a, b) => a - b);
  const inActive = activeDays.length > 0;
  const scope = inActive ? 'active' : (reachable.length ? 'other' : 'global');
  return { reachableTracks: reachable, activeDays, inActive, multiTrack: reachable.length >= 2, scope };
}

/**
 * Prédicat de filtre de portée pédagogique. `all`/'' = tout accepter. PUR.
 * @param {ReturnType<typeof classifyExercise>} ctx
 * @param {string} scopeFilter  '' | 'all' | 'active' | 'active-day' | 'other' | 'multi' | 'global'
 */
export function matchesScope(ctx, scopeFilter) {
  switch (scopeFilter) {
    case '': case 'all': return true;
    case 'active': return ctx.inActive;
    case 'active-day': return ctx.activeDays.length === 1;
    case 'other': return ctx.scope === 'other';
    case 'multi': return ctx.multiTrack;
    case 'global': return ctx.scope === 'global';
    default: return true;
  }
}

/**
 * Prédicat de filtre par parcours (atteignable depuis un parcours donné). PUR.
 */
export function reachableFromTrack(ctx, trackId) {
  if (!trackId) return true;
  return ctx.reachableTracks.includes(trackId);
}

/**
 * Libellé lisible du contexte primaire (badge), sans dépendre de React.
 * @returns {{ label:string, kind:'active'|'other'|'global' }}
 */
export function contextBadge(ctx) {
  if (ctx.inActive) {
    const label = ctx.activeDays.length === 1 ? `Jour ${ctx.activeDays[0]}` : `${ctx.activeDays.length} journées`;
    return { label, kind: 'active' };
  }
  if (ctx.scope === 'other') return { label: ctx.multiTrack ? 'Autres parcours' : 'Autre parcours', kind: 'other' };
  return { label: 'Corpus global', kind: 'global' };
}
