// Types pour lib/day-exercises.mjs (liaison jour↔exercice, pure).
export interface DayExerciseIndex {
  byDay: Map<number, string[]>;
  byExercise: Map<string, number[]>;
}
export function buildDayExerciseIndex(
  raw: Record<string, string[]>,
  knownExerciseIds?: Set<string> | null,
  dayNums?: Set<number> | null,
): DayExerciseIndex;
export function exercisesForDay(index: DayExerciseIndex, day: number): string[];
export function daysForExercise(index: DayExerciseIndex, exerciseId: string): number[];

export type DayRole = 'principal' | 'complement' | 'remediation' | 'challenge';
export interface DayExerciseSummary {
  id: string;
  title: string;
  runtime: string;
  language: string | null;
  difficulty: number | null;
  role: DayRole;
  status: 'passed' | 'todo';
}
export function selectDayExercises(
  index: DayExerciseIndex,
  day: number | string,
  resolve: ((id: string) => unknown) | Map<string, unknown> | Record<string, unknown>,
  isPassed?: (id: string) => boolean,
): DayExerciseSummary[];

export const DAY_ROLES: DayRole[];
export const MAX_DAY_LOAD: number;
export function assignDayRoles(
  sortedItems: Array<{ id: string; difficulty?: number | null; debug?: boolean }>,
): Map<string, DayRole>;
export function dayLoadReport(
  index: DayExerciseIndex,
  max?: number,
): Array<{ day: number; count: number; over: boolean }>;
export function prerequisiteSatisfied(linkedDay: number, introDay: number): boolean;
