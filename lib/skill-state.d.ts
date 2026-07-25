// Types pour lib/skill-state.mjs (états de compétence purs).
import type { Program, Progress } from './types';

export type SkillStateKey = 'not-started' | 'discovered' | 'practiced' | 'demonstrated' | 'to-consolidate';
export const SKILL_STATES: readonly SkillStateKey[];
export const SKILL_STATE_LABEL: Record<SkillStateKey, string>;

export function skillState(signals: {
  daysDone?: number; daysStarted?: number; evidenceCount?: number; hasToReview?: boolean;
}): SkillStateKey;

export interface SkillStat {
  id: string; name: string; daysAssociated: number; daysDone: number;
  evidenceCount: number; lastActivityAt: string | null; state: SkillStateKey;
}
export function skillStats(program: Program, progress: Progress): SkillStat[];
