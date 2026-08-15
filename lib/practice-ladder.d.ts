// Types pour lib/practice-ladder.mjs (read-model de ladder L0-L5, pur et dérivé).
import type { Program } from './types';

export type LadderStep = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

export interface LadderStepState {
  present: boolean;
  from: string[];
}

export interface SkillLadder {
  skill: string;
  name: string;
  steps: Record<LadderStep, LadderStepState>;
  complete: boolean;
  missing: LadderStep[];
}

export interface LadderSources {
  lessons?: Array<{ slug: string; skills: string[] }>;
  exercises?: Array<{ id: string; skills: string[]; difficulty?: number }>;
  assessments?: Array<{ id: string; skills: string[]; questions?: Array<{ taxonomy: string }> }>;
  capstones?: Array<{ id: string; skills: string[]; phases?: Array<{ kind: string }> }>;
  transferChallenges?: Array<{ id: string; skills: string[] }>;
  skillName?: string;
}

export const LADDER_STEPS: readonly LadderStep[];
export const LADDER_LABEL: Record<LadderStep, string>;

export function skillLadder(programSkillId: string, sources?: LadderSources): SkillLadder;
export function ladderMatrix(program: Program, sources?: LadderSources): SkillLadder[];
export function exerciseLadderPosition(exercise: { id: string; difficulty?: number }): LadderStep | null;
