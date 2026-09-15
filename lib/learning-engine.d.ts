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

import type { RecallOutcome, RecallFormat } from './retention';

export type Command =
  | { type: 'START' | 'PAUSE' | 'RESUME' | 'REOPEN'; day: number }
  | { type: 'COMPLETE'; day: number; comprehension?: string; confidence?: string; scheduleReview?: boolean }
  | { type: 'SET_STEP'; day: number; stepId: string; state: StepState }
  | { type: 'SAVE_DRAFT'; day: number; answers?: Record<string, string>; notes?: string; answer?: string }
  | {
      type: 'SUBMIT'; day: number; stepId: string; kind?: string; content: string;
      validation?: Partial<Validation> | null;
      evidenceId?: string; evidenceTitle?: string; evidenceUrl?: string; skills?: string[];
      /** V75 · CP4 — concepts connus sans ambiguïté. Additif : vide = inconnu. */
      conceptIds?: string[];
    }
  | { type: 'ATTACH_VALIDATION'; day: number; submissionId: string; validation: Partial<Validation> }
  | { type: 'SET_COMPREHENSION'; day: number; value: string }
  | { type: 'SET_SELF_ASSESSMENT'; day: number; level?: number; confidence?: string }
  | { type: 'SET_CORRECTION_STATE'; day: number; value: string }
  | { type: 'RECORD_ATTEMPT'; day: number; outcome?: string; summary?: string }
  | { type: 'SCHEDULE_REVIEW'; day: number; comprehension?: string }
  | { type: 'ADD_EVIDENCE'; day: number; evidence: Record<string, unknown> }
  | { type: 'REMOVE_EVIDENCE'; day: number; evidenceId: string }
  // V75 · CP10 — la tentative de transfert, écrite succès OU échec.
  | {
      type: 'RECORD_TRANSFER_ATTEMPT'; challengeId: string;
      passed: number; total: number;
      conceptIds?: string[]; competencyIds?: string[];
      startedAtDeclare?: string | null; evidenceId?: string | null;
      sourceRef?: string | null; empreinte?: string;
      provenance?: { producer?: string; method?: string };
    }
  | { type: 'SET_SKILL'; skill: string; score: number }
  | { type: 'SET_WEEKLY_REVIEW'; week: string; patch: Record<string, unknown> }
  | { type: 'SET_MONTHLY_REVIEW'; month: string; patch: Record<string, unknown> }
  // V75 · CP7 — `PAUSED_CURRICULUM` (§1.5) : un choix de l'apprenant que le
  // moteur ne peut qu'enregistrer. Rien ne l'appelle automatiquement.
  | {
      type: 'SET_CURRICULUM_PAUSE'; paused: boolean; raison?: string;
      provenance?: { producer?: string; method?: string };
    }
  // V66 — la seule écriture du Retention Engine. Concept, pas journée : une
  // tentative de rappel porte sur une notion, pas sur une date du calendrier.
  | { type: 'RECORD_RECALL'; conceptId: string; outcome: RecallOutcome; format?: RecallFormat; sourceRef?: string }
  // V77 · CP4 — la soumission d'un diagnostic. Le type ne porte ni niveau ni
  // pourcentage de maîtrise : `passed`, `total` et le `seuil` de la fixture
  // suffisent, et tout le reste s'en dérive.
  | {
      type: 'RECORD_ASSESSMENT_ATTEMPT';
      assessmentId: string;
      kind?: import('./assessment-attempt').GenreDeDiagnostic;
      competencyIds?: string[];
      passed: number; total: number; seuil?: number;
      simulation?: boolean;
      empreinte?: string;
      evidenceId?: string | null;
      sourceRef?: string | null;
      provenance?: { producer?: string; method?: string };
    }
  // V77 · CP3 — un USAGE observé. Le type est volontairement dépourvu de tout
  // champ d'issue : il n'existe aucune façon d'exprimer une réussite ici, et
  // c'est la contrainte n°5 du contrat gelé rendue vérifiable à la compilation.
  | {
      type: 'RECORD_USAGE_EVENT';
      surface: import('./usage-event').SurfaceUsage;
      action: import('./usage-event').ActionUsage;
      ref: string;
      detail?: { adapter?: string; exitCode?: number; durationMs?: number; disponible?: boolean };
      provenance: { producer: string; method?: string };
    };

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
