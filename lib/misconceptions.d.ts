// Types pour lib/misconceptions.mjs (registre pur d'idées fausses → remédiation).
export interface Misconception {
  id: string;
  skill: string;
  wrong: string;
  right: string;
  lessonRefs: string[];
  exerciseRefs: string[];
}

export interface MisconceptionRemediation {
  id: string;
  skill: string;
  right: string;
  lessonRefs: string[];
  exerciseRefs: string[];
}

export const MISCONCEPTIONS: readonly Misconception[];
export function listMisconceptions(skill?: string): Misconception[];
export function remediateMisconception(id: string): MisconceptionRemediation | null;
