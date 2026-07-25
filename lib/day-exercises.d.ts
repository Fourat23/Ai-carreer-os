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
