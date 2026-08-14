// Types pour lib/learning-experience.mjs (read-model dérivé, pur).
import type { Program } from './types';

export type SkillState = 'not-started' | 'discovered' | 'practiced' | 'demonstrated' | 'to-consolidate';
export type NextActionKind = 'remediation' | 'review' | 'consolidate' | 'demonstrate' | 'practice' | 'resume';

export interface NextAction {
  action: string;
  reason: string;
  goal: string;
  expectedEvidence: string;
  href: string;
}

export interface SkillExplanation {
  id: string;
  name: string;
  state: SkillState;
  label: string;
  reasons: string[];
  toConsolidate: boolean;
  nextAction: NextAction | null;
}

export interface NextBestAction extends NextAction {
  kind: NextActionKind;
}

export interface TimelineEntry {
  createdAt: string;
  type: string;
  title: string;
  skills: string[];
  day: number;
}

export interface Milestone {
  id: string;
  label: string;
  description: string;
  achieved: boolean;
  achievedAt: string | null;
  why: string;
}

export interface ExperienceCtx {
  reviews?: Array<{ day: number; overdueDays: number }>;
  resume?: { day: number; title?: string };
  remediations?: Array<Partial<NextAction> & { action: string }>;
  now?: Date;
  limit?: number;
}

export interface ExperienceSummary {
  actions: NextBestAction[];
  nextMilestone: Milestone | null;
  milestonesAchieved: number;
  milestonesTotal: number;
}

export const NEXT_ACTION_PRIORITIES: readonly NextActionKind[];
export const MILESTONE_DEFS: ReadonlyArray<{ id: string; label: string; description: string }>;

export function explainSkillState(stat: unknown): SkillExplanation;
export function nextBestActions(program: Program, progress: unknown, ctx?: ExperienceCtx): NextBestAction[];
export function evidenceTimeline(progress: unknown, program?: Program, ctx?: { limit?: number }): TimelineEntry[];
export function milestones(program: Program, progress: unknown, ctx?: ExperienceCtx): Milestone[];
export function experienceSummary(program: Program, progress: unknown, ctx?: ExperienceCtx): ExperienceSummary;
