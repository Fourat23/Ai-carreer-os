// Types pour lib/lab-progress.mjs (enregistrement pur de réussite d'exercice).
import type { Progress } from './types';

export function labEvidenceUrl(exerciseId: string): string;
export function hasLabEvidence(dayProgress: unknown, exerciseId: string): boolean;
export function recordExerciseSuccess(
  flat: Progress,
  p: {
    exerciseId: string; title: string; skills?: string[]; dayRefs?: number[]; at?: string | null;
    /** V75 · CP3 — concepts connus SANS AMBIGUÏTÉ. Liste, éventuellement vide. */
    conceptIds?: string[];
  },
): Progress;
