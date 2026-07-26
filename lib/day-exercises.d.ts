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

export interface DayExerciseSummary {
  id: string;
  title: string;
  runtime: string;
  language: string | null;
  difficulty: number | null;
  status: 'passed' | 'todo';
}
export function selectDayExercises(
  index: DayExerciseIndex,
  day: number | string,
  resolve: ((id: string) => unknown) | Map<string, unknown> | Record<string, unknown>,
  isPassed?: (id: string) => boolean,
): DayExerciseSummary[];
