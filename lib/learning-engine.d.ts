// Types pour lib/learning-engine.mjs (Learning Engine V64, ADR-064).
import type { Progress, DayProgress, LearningSession, Submission, Validation } from './types';

export const ENGINE_VERSION: number;
export const COMMANDS: readonly string[];
export const SESSION_STATES: readonly ['not_started', 'active', 'paused', 'completed'];
export const STEP_STATES: readonly ['pending', 'in_progress', 'done'];
export const SUBMISSION_KINDS: readonly ['text', 'exercise', 'assessment'];
export const VALIDATION_STATUSES: readonly ['passed', 'failed', 'pending', 'manual'];
export const VALIDATION_KINDS: readonly ['exercise-tests', 'assessment-grade', 'self'];

export type SessionState = 'not_started' | 'active' | 'paused' | 'completed';
export type StepState = 'pending' | 'in_progress' | 'done';

export type Command =
  | { type: 'START' | 'PAUSE' | 'RESUME' | 'REOPEN'; day: number }
  | { type: 'COMPLETE'; day: number; comprehension?: string; confidence?: string; scheduleReview?: boolean }
  | { type: 'SET_STEP'; day: number; stepId: string; state: StepState }
  | { type: 'SAVE_DRAFT'; day: number; answers?: Record<string, string>; notes?: string; answer?: string }
  | { type: 'SUBMIT'; day: number; stepId: string; kind?: string; content: string; validation?: Partial<Validation> | null }
  | { type: 'ATTACH_VALIDATION'; day: number; submissionId: string; validation: Partial<Validation> }
  | { type: 'SET_COMPREHENSION'; day: number; value: string }
  | { type: 'SET_SELF_ASSESSMENT'; day: number; level?: number; confidence?: string }
  | { type: 'SET_CORRECTION_STATE'; day: number; value: string }
  | { type: 'RECORD_ATTEMPT'; day: number; outcome?: string; summary?: string }
  | { type: 'SCHEDULE_REVIEW'; day: number; comprehension?: string }
  | { type: 'ADD_EVIDENCE'; day: number; evidence: Record<string, unknown> }
  | { type: 'REMOVE_EVIDENCE'; day: number; evidenceId: string }
  | { type: 'SET_SKILL'; skill: string; score: number }
  | { type: 'SET_WEEKLY_REVIEW'; week: string; patch: Record<string, unknown> }
  | { type: 'SET_MONTHLY_REVIEW'; month: string; patch: Record<string, unknown> };

export type CommandResult =
  | { ok: true; progress: Progress; effects: string[] }
  | { ok: false; code: string; error: string };

export function nextSessionState(state: SessionState, command: string): SessionState | null;
export function projectStatus(session: LearningSession, day?: Partial<DayProgress>): DayProgress['status'];
export function applyCommand(
  progress: Progress,
  command: Command | { type: string; [k: string]: unknown },
  ctx?: { now?: Date | string },
): CommandResult;

export interface SessionStepView {
  id: string;
  label: string;
  family: string | null;
  state: StepState;
  submissions: number;
  lastValidation: Validation | null;
}

export interface SessionView {
  state: SessionState;
  startedAt: string | null;
  lastActiveAt: string | null;
  completedAt: string | null;
  reopenCount: number;
  steps: SessionStepView[];
  stepsTotal: number;
  stepsDone: number;
  submissions: number;
  validatedSubmissions: number;
  evidenceCount: number;
  canStart: boolean;
  canResume: boolean;
  canComplete: boolean;
}

export function sessionView(
  dayProgress: DayProgress | undefined,
  activities?: { id: string; label?: string; family?: string }[],
): SessionView;

export function openSessions(progress: Progress): {
  day: number; state: SessionState; lastActiveAt: string | null; startedAt: string | null;
}[];

export type { Submission };
