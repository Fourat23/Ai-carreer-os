// Read-model AGRÉGÉ multi-parcours — PUR, LECTURE SEULE, sans I/O, sans React.
// Produit une synthèse PAR parcours disponible en réutilisant les helpers de
// source de vérité existants (resolveTrackDayObjects, progressPosition,
// reviewSummary). N'écrit JAMAIS ; chaque ligne conserve son trackId. Ne fusionne
// jamais plusieurs parcours en un score global.
import { resolveTrackDayObjects, isTrackAvailable } from './catalogue.mjs';
import { progressPosition } from './position.mjs';
import { reviewSummary } from './review.mjs';

/** Flat progress d'un parcours (ou vide) depuis un état v3. */
function trackFlat(progressV3, trackId) {
  const t = progressV3?.tracks?.[trackId];
  return (t && typeof t === 'object') ? t : { days: {}, skills: {}, startDate: null };
}

/** Dernière preuve enregistrée dans un parcours (ou null). PUR. */
function lastEvidenceOf(flat) {
  let best = null;
  const days = (flat && typeof flat.days === 'object') ? flat.days : {};
  for (const k of Object.keys(days)) {
    for (const e of (days[k]?.evidence ?? [])) {
      if (typeof e?.createdAt === 'string' && (!best || e.createdAt > best.at)) {
        best = { day: Number(k), title: typeof e.title === 'string' ? e.title : '', at: e.createdAt };
      }
    }
  }
  return best;
}

/**
 * Synthèse d'UN parcours (lecture seule). Réutilise progressPosition pour la
 * position et les compteurs. Aucune métrique inventée ; une valeur non fiable
 * est simplement null.
 */
export function aggregateTrack(catalogue, track, progressV3, program) {
  const days = resolveTrackDayObjects(catalogue, track, program);
  const flat = trackFlat(progressV3, track.id);
  const pos = progressPosition(days, flat);
  let inProgress = 0, toReview = 0;
  for (const d of days) {
    const s = flat.days?.[String(d.day)]?.status;
    if (s === 'in-progress') inProgress++;
    else if (s === 'to-review') toReview++;
  }
  const reviews = reviewSummary(flat.days ?? {});
  const skillsCount = flat.skills && typeof flat.skills === 'object' ? Object.keys(flat.skills).length : 0;
  const started = pos.currentProgressPosition > 0 || inProgress > 0 || toReview > 0 || skillsCount > 0;
  return {
    trackId: track.id,
    title: track.title,
    status: track.status,
    active: false, // renseigné par aggregateTracks
    totalDays: pos.total,
    completedDays: pos.currentProgressPosition,
    percent: pos.total ? Math.round((pos.currentProgressPosition / pos.total) * 100) : 0,
    resumeDay: started ? pos.resumeDay : (days[0]?.day ?? null),
    inProgress,
    toReview,
    reviewsDue: reviews.dueToday,
    lastEvidence: lastEvidenceOf(flat),
    skillsCount,
    started,
    complete: pos.complete,
  };
}

/**
 * Synthèse de TOUS les parcours disponibles (lecture seule). Ordre : parcours
 * actif d'abord, puis ordre du catalogue. Chaque ligne conserve son trackId.
 * @returns {Array<object>}
 */
export function aggregateTracks(catalogue, progressV3, program) {
  const activeId = progressV3?.activeTrackId ?? null;
  const rows = (catalogue?.tracks ?? [])
    .filter(isTrackAvailable)
    .map((t) => ({ ...aggregateTrack(catalogue, t, progressV3, program), active: t.id === activeId }));
  rows.sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0));
  return rows;
}
