// Read-model AGRÉGÉ multi-parcours — PUR, LECTURE SEULE, sans I/O, sans React.
// Produit une synthèse PAR parcours disponible en réutilisant les helpers de
// source de vérité existants (resolveTrackDayObjects, progressPosition,
// reviewSummary). N'écrit JAMAIS ; chaque ligne conserve son trackId. Ne fusionne
// jamais plusieurs parcours en un score global.
import { resolveTrackDayObjects, isTrackAvailable } from './catalogue.mjs';
import { progressPosition } from './position.mjs';
import { reviewSummary } from './review.mjs';
import { createLedger, projectCompetencies } from './competency.mjs';
import { isQualifying } from './evidence.mjs';

/** Flat progress d'un parcours (ou vide) depuis un état v3. */
function trackFlat(progressV3, trackId) {
  const t = progressV3?.tracks?.[trackId];
  return (t && typeof t === 'object') ? t : { days: {}, skills: {}, startDate: null };
}

/**
 * Dernière preuve enregistrée dans un parcours (ou null). PUR.
 *
 * V65.1 · CP2 — LIT LE LEDGER. Cette fonction balayait `days[N].evidence[]`,
 * les preuves héritées par journée : la Synthèse annonçait « Jour 12 » comme
 * dernière preuve alors que le ledger en connaissait deux plus récentes
 * (un diagnostic et une tentative datés du jour même). Une preuve sans
 * journée — un diagnostic passé hors séquence — était par construction
 * invisible ici.
 */
function lastEvidenceOf(ledger) {
  const all = ledger.all();
  if (all.length === 0) return null;
  const e = all[all.length - 1];
  return { day: e.dayId ?? null, title: e.title ?? '', at: e.createdAt, qualifying: isQualifying(e) };
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

  // V65.1 · CP2 — `skillsCount` comptait `Object.keys(flat.skills)`, c'est-à-dire
  // les NIVEAUX AUTO-DÉCLARÉS. La colonne « Compét. » de la Synthèse affichait
  // donc 2 pour un apprenant ayant déclaré deux niveaux et démontré huit
  // compétences : une note personnelle présentée comme un décompte de
  // compétences (invariant 9). On compte désormais les compétences reposant sur
  // au moins une preuve QUALIFIANTE — le même critère que /skills.
  const ledger = createLedger(flat.evidence ?? []);
  const competencies = projectCompetencies(program?.skills ?? [], ledger);
  const demonstratedCount = competencies.filter((c) => c.qualifyingEvidenceCount > 0).length;
  const assessedCount = competencies.filter((c) => c.state !== 'unassessed').length;
  const declaredCount = flat.skills && typeof flat.skills === 'object' ? Object.keys(flat.skills).length : 0;
  const started = pos.currentProgressPosition > 0 || inProgress > 0 || toReview > 0
    || ledger.size > 0 || declaredCount > 0;
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
    lastEvidence: lastEvidenceOf(ledger),
    /** Compétences portant ≥ 1 preuve qualifiante. Jamais un niveau déclaré. */
    demonstratedCount,
    /** Compétences portant ≥ 1 trace, qualifiante ou non. */
    assessedCount,
    /** Niveaux auto-déclarés — une DÉCLARATION, jamais une preuve. */
    declaredCount,
    evidenceCount: ledger.size,
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
