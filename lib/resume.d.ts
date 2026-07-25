// Types pour lib/resume.mjs (logique pure de reprise & progression).
import type { DayStatus, Program, Progress } from './types';

type DayLike = { day: number };
export type ResumeReason = 'in-progress' | 'continue' | 'start' | 'complete';

export function dayStatus(progress: Progress | null | undefined, day: number): DayStatus;
export function resolveResume(
  days: readonly DayLike[] | Program['days'],
  progress: Progress,
): { day: number; reason: ResumeReason; total: number };
export function resumeReasonText(reason: ResumeReason): string;
export function countStatuses(
  days: readonly DayLike[] | Program['days'],
  progress: Progress,
): { done: number; 'in-progress': number; 'to-review': number; 'not-started': number; total: number };
export function progressOf(days: readonly DayLike[] | Program['days'], progress: Progress): number;
export function nextStatusFor(
  action: 'start' | 'complete' | 'reopen' | 'review',
  current: DayStatus,
): DayStatus;
