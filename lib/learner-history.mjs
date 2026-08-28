// HISTORIQUE DE L'APPRENANT (V65) — PUR, aucune I/O.
//
// Architecture choisie : **PROJECTION**, pas journal d'événements canonique.
//
// Justification (brief CP9 « choisis une architecture et justifie-la ») :
// les faits sont DÉJÀ persistés et horodatés — `session.startedAt`,
// `session.completedAt`, `submission.submittedAt`, `evidence.createdAt`,
// `review.lastReviewedAt`. Ajouter un journal séparé créerait une seconde base
// mutable, susceptible de diverger de ce qu'elle est censée raconter — et le
// principe P7 comme l'invariant « aucune seconde source de vérité » l'interdisent.
//
// Conséquence assumée : l'historique a la granularité de ce que le produit
// enregistre réellement. Il ne montrera jamais un fait qui n'a pas laissé de
// trace — c'est exactement la garantie recherchée.
//
// AUCUN événement de navigation. Ouvrir une page n'est pas un fait de travail.

import { normalizeDay } from './learning.mjs';
import { isQualifying } from './evidence.mjs';

export const HISTORY_EVENT_TYPES = [
  'DAY_STARTED',
  'SUBMISSION_CREATED',
  'EVIDENCE_CREATED',
  'DAY_COMPLETED',
  'REVIEW_COMPLETED',
];

export const HISTORY_EVENT_LABEL = {
  DAY_STARTED: 'Journée commencée',
  SUBMISSION_CREATED: 'Travail rendu',
  EVIDENCE_CREATED: 'Preuve créée',
  DAY_COMPLETED: 'Journée terminée',
  REVIEW_COMPLETED: 'Révision effectuée',
};

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

/**
 * Construit l'historique depuis les faits déjà persistés.
 * Déterministe : mêmes données → même liste, dans le même ordre.
 *
 * @param {object} progress  progression plate (days + evidence)
 * @param {(day:number)=>string} dayTitle  titre d'une journée, depuis le corpus
 */
export function buildHistory(progress, dayTitle = () => '') {
  const events = [];
  const days = isObj(progress?.days) ? progress.days : {};

  for (const key of Object.keys(days)) {
    if (!/^\d+$/.test(key)) continue;
    const dayNum = Number(key);
    const d = normalizeDay(days[key]);
    const title = dayTitle(dayNum) || '';

    if (d.session.startedAt) {
      events.push({
        type: 'DAY_STARTED', at: d.session.startedAt, dayId: dayNum,
        label: `Journée ${dayNum} commencée`, detail: title,
      });
    }
    for (const s of d.submissions) {
      if (!s.submittedAt) continue;
      events.push({
        type: 'SUBMISSION_CREATED', at: s.submittedAt, dayId: dayNum,
        label: 'Travail rendu', detail: s.stepId,
        validation: s.validation?.status ?? null,
      });
    }
    if (d.session.state === 'completed' && d.session.completedAt) {
      events.push({
        type: 'DAY_COMPLETED', at: d.session.completedAt, dayId: dayNum,
        label: `Journée ${dayNum} terminée`, detail: title,
      });
    }
    // Une révision n'est un fait que si elle a RÉELLEMENT eu lieu.
    if (d.review?.lastReviewedAt) {
      events.push({
        type: 'REVIEW_COMPLETED', at: d.review.lastReviewedAt, dayId: dayNum,
        label: 'Révision effectuée', detail: d.review.reason || title,
      });
    }
  }

  for (const e of progress?.evidence ?? []) {
    if (!e?.createdAt) continue;
    events.push({
      type: 'EVIDENCE_CREATED', at: e.createdAt, dayId: e.dayId,
      label: isQualifying(e) ? 'Preuve créée' : 'Trace enregistrée',
      detail: e.title || e.sourceId,
      evidenceId: e.id,
      competencyIds: e.competencyIds,
      qualifying: isQualifying(e),
    });
  }

  // Ordre déterministe : chronologique décroissant, puis type, puis journée.
  return events.sort((a, b) => {
    if (a.at !== b.at) return a.at < b.at ? 1 : -1;
    if (a.type !== b.type) return a.type < b.type ? -1 : 1;
    return (a.dayId ?? 0) - (b.dayId ?? 0);
  });
}

/** Regroupe par date locale (AAAA-MM-JJ), en conservant l'ordre. */
export function groupHistoryByDate(events) {
  const out = [];
  const index = new Map();
  for (const e of events ?? []) {
    const date = String(e.at).slice(0, 10);
    if (!index.has(date)) { index.set(date, { date, events: [] }); out.push(index.get(date)); }
    index.get(date).events.push(e);
  }
  return out;
}

/** Compteurs factuels — aucun score, aucune moyenne inventée. */
export function historySummary(events) {
  const list = events ?? [];
  const byType = {};
  for (const t of HISTORY_EVENT_TYPES) byType[t] = 0;
  for (const e of list) if (byType[e.type] !== undefined) byType[e.type] += 1;
  return {
    total: list.length,
    byType,
    firstAt: list.length ? list[list.length - 1].at : null,
    lastAt: list.length ? list[0].at : null,
    activeDays: new Set(list.map((e) => String(e.at).slice(0, 10))).size,
  };
}
