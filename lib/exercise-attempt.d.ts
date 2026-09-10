export type ExerciseOutcome = 'success' | 'partial' | 'failure';
export type ExercisePhase = 'run' | 'compile' | 'timeout';

export interface ExerciseAttempt {
  exerciseId: string;
  at: string;
  passed: number;
  total: number;
  allPassed: boolean;
  outcome: ExerciseOutcome;
  phase: ExercisePhase;
  durationMs: number;
  dayRefs: number[];
  /** La correction était-elle ouverte AVANT la tentative (condition R-b du contrat V74). */
  correctionSeen: boolean;
  provenance: { producer: string; method: string };
}

export declare const EXERCISE_OUTCOMES: ExerciseOutcome[];
export declare const EXERCISE_PHASES: ExercisePhase[];
export declare const MAX_EXERCISE_ATTEMPTS: number;
export declare function outcomeOf(passed: number, total: number): ExerciseOutcome;
export declare function attemptKey(a: ExerciseAttempt): string;
export declare function normalizeExerciseAttempt(raw: unknown): ExerciseAttempt | null;
export declare function normalizeExerciseAttempts(list: unknown): ExerciseAttempt[];
