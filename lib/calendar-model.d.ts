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
  ordered: boolean;
  weekOrderOk: boolean;
  monthOrderOk: boolean;
  weekSpanOk: boolean;
  ok: boolean;
}
export function buildCalendar(days: CalendarDay[]): CalendarModel;
