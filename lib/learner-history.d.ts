// Types pour lib/learner-history.mjs — historique factuel (V65).
export type HistoryEventType =
  | 'DAY_STARTED' | 'SUBMISSION_CREATED' | 'EVIDENCE_CREATED'
  | 'DAY_COMPLETED' | 'REVIEW_COMPLETED';

export const HISTORY_EVENT_TYPES: readonly HistoryEventType[];
export const HISTORY_EVENT_LABEL: Record<HistoryEventType, string>;

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
}

export interface HistorySummary {
  total: number;
  byType: Record<HistoryEventType, number>;
  firstAt: string | null;
  lastAt: string | null;
  activeDays: number;
}

export function buildHistory(progress: unknown, dayTitle?: (day: number) => string): HistoryEvent[];
export function groupHistoryByDate(events: HistoryEvent[]): { date: string; events: HistoryEvent[] }[];
export function historySummary(events: HistoryEvent[]): HistorySummary;
