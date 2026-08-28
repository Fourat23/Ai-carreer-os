// Types pour lib/learning-experience.mjs (read-model dérivé, pur).
//
// V65.1 · CP2 : les états de compétence viennent désormais du modèle canonique
// (`CompetencyState` de `./competency`). L'ancien `SkillState` à cinq valeurs a
// disparu avec `lib/skill-state.mjs`.
import type { Program } from './types';

export type NextActionKind = 'remediation' | 'review' | 'consolidate' | 'demonstrate' | 'practice' | 'resume';

export interface NextAction {
  action: string;
  reason: string;
  goal: string;
  expectedEvidence: string;
  href: string;
}

export interface NextBestAction extends NextAction {
  kind: NextActionKind;
  competencyId?: string;
}

/** Une entrée de la chronologie = une preuve canonique du ledger. */
export interface TimelineEntry {
  id: string;
  createdAt: string;
  /** `sourceType` de la preuve : exercise | assessment | mission | capstone | submission | declared | review */
  type: string;
  sourceId: string;
  title: string;
  /** Compétences du PROGRAMME (jamais des étiquettes fines). */
  skills: string[];
  day: number | null;
  qualifying: boolean;
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
  dueDays?: Set<number>;
  reviewFlaggedDays?: Set<number>;
}

export interface ExperienceSummary {
  actions: NextBestAction[];
  nextMilestone: Milestone | null;
  milestonesAchieved: number;
  milestonesTotal: number;
}

export const NEXT_ACTION_PRIORITIES: readonly NextActionKind[];
export const MILESTONE_DEFS: ReadonlyArray<{ id: string; label: string; description: string }>;

export function nextBestActions(program: Program, progress: unknown, ctx?: ExperienceCtx): NextBestAction[];
export function evidenceTimeline(progress: unknown, program?: Program, ctx?: { limit?: number }): TimelineEntry[];
export function milestones(program: Program, progress: unknown, ctx?: ExperienceCtx): Milestone[];
export function experienceSummary(program: Program, progress: unknown, ctx?: ExperienceCtx): ExperienceSummary;
