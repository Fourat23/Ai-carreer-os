// Types pour lib/learner-history.mjs — historique factuel (V65, étendu V77 · CP11).
export type HistoryEventType =
  | 'DAY_STARTED' | 'SUBMISSION_CREATED' | 'EVIDENCE_CREATED'
  | 'DAY_COMPLETED' | 'REVIEW_COMPLETED'
  // V77 · CP11 — les faits des CP3→CP7, jusqu'ici écrits et lus par personne.
  | 'ASSESSMENT_SUBMITTED' | 'MISSION_DELIVERABLE' | 'ARTIFACT_ANALYZED'
  | 'SURFACE_USED';

export const HISTORY_EVENT_TYPES: readonly HistoryEventType[];
export const HISTORY_EVENT_LABEL: Record<HistoryEventType, string>;
/** Les types qui ne disent PAS un travail évalué. Séparés, et nommés. */
export const HISTORY_USAGE_TYPES: readonly HistoryEventType[];

export interface HistoryEvent {
  type: HistoryEventType;
  /** Horodatage RÉEL, issu d'un fait déjà persisté — jamais reconstruit. */
  at: string;
  dayId: number | null;
  label: string;
  detail: string;
  validation?: string | null;
  evidenceId?: string;
  competencyIds?: string[];
  qualifying?: boolean;
  /** V77 · CP4 — le seuil DÉCLARÉ est atteint. Ce n'est pas un niveau de maîtrise. */
  seuilAtteint?: boolean;
  /** V77 · CP5/CP7 — le niveau de preuve de ce qui a été constaté. */
  niveau?: 'DECLARED' | 'OBSERVED' | 'VALIDATED';
  /** V77 · CP5 — conformité de FORME ; `null` hors du mode structural. */
  structureOk?: boolean | null;
  /** V77 · CP6/CP7 — environnement simulé. Ne dégrade aucun niveau. */
  simulation?: boolean;
  /** V77 · CP3 — cet événement est un USAGE, pas un travail évalué. */
  usage?: boolean;
}

export interface HistorySummary {
  total: number;
  /** V77 · CP11 — événements décrivant un travail, usage EXCLU. */
  travail: number;
  /** V77 · CP11 — usages observés, comptés à part. */
  usage: number;
  byType: Record<HistoryEventType, number>;
  firstAt: string | null;
  lastAt: string | null;
  activeDays: number;
}

export function buildHistory(progress: unknown, dayTitle?: (day: number) => string): HistoryEvent[];
export function groupHistoryByDate(events: HistoryEvent[]): { date: string; events: HistoryEvent[] }[];
export function historySummary(events: HistoryEvent[]): HistorySummary;
