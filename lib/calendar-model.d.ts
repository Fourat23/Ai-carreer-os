export interface CalendarDay {
  day: number;
  month: number;
  week: number;
  title?: string;
  skillName?: string;
  isReview?: boolean;
}
export interface CalendarWeek { week: number; days: CalendarDay[] }
export interface CalendarMonth { month: number; weeks: CalendarWeek[] }
export interface CalendarModel {
  months: CalendarMonth[];
  expected: number;
  rendered: number;
  missing: number[];
  duplicates: number[];
  /** Ordre RENDU : mois, semaines et jours strictement croissants. */
  ordered: boolean;
  /** Diagnostic : la liste reçue était-elle déjà chronologique ? */
  inputOrdered: boolean;
  weekOrderOk: boolean;
  monthOrderOk: boolean;
  dayOrderOk: boolean;
  weekChainOk: boolean;
  weekSpanOk: boolean;
  ok: boolean;
}
export function buildCalendar(days: CalendarDay[]): CalendarModel;
