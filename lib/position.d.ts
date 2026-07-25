// Types pour lib/position.mjs (positionnement dans le parcours, pur).
import type { Program, Progress } from './types';
import type { ResumeReason } from './resume';

type DayLike = { day: number };
type Days = readonly DayLike[] | Program['days'];

export function nextIncompleteDay(days: Days, progress: Progress): number | null;
export function completedCount(days: Days, progress: Progress): number;
export function expectedDay(total: number, startDate: string | null | undefined, now?: Date): number | null;
export function progressPosition(days: Days, progress: Progress, now?: Date): {
  total: number;
  resumeDay: number;
  resumeReason: ResumeReason;
  nextIncompleteDay: number | null;
  currentProgressPosition: number;
  expectedDay: number | null;
  delay: number;
  ahead: number;
  complete: boolean;
};
