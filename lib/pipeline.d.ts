// Déclarations de types pour le modèle de pipeline CI/CD (lib/pipeline.mjs).

export type TriggerKind = 'push' | 'pull_request' | 'tag' | 'manual' | 'schedule';
export type JobStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'cancelled' | 'blocked';
export type ActionKind =
  | 'validate-config' | 'lint' | 'test' | 'build' | 'artifact-check'
  | 'cache-check' | 'branch-policy' | 'approval' | 'secret-scan' | 'status-aggregate';

export const TRIGGER_KINDS: TriggerKind[];
export const JOB_STATUSES: JobStatus[];
export const ACTION_KINDS: ActionKind[];
export const PIPELINE_CAPS: { maxStages: number; maxJobs: number; maxSteps: number; timeoutMs: number; maxLogBytes: number };

export interface JobCondition { branchIn?: string[]; tagIn?: string[]; event?: TriggerKind[] }
export interface Job {
  id: string; name: string; stage: string;
  needs?: string[]; condition?: JobCondition; action: ActionKind;
  with?: Record<string, unknown>; timeoutMs: number; allowFailure?: boolean;
  artifactsOut?: string[]; cacheKey?: string; secrets?: string[];
}
export interface Stage { id: string; name: string; order: number }
export interface Pipeline {
  id: string; title: string; description: string; version: string;
  trigger: TriggerKind[]; branchFilters?: string[]; tagFilters?: string[];
  stages: Stage[]; jobs: Job[];
  environment?: { name: string; requiresApproval?: boolean };
  approval?: { required: boolean; approvers?: string[] };
  skills: string[]; dayRefs: number[]; trackScope?: string[]; missionRefs?: string[];
  maxJobs?: number; maxSteps?: number;
}
export interface PipelineValidationCtx {
  skillIds?: { has: (s: string) => boolean };
  validDays?: Set<number>;
  trackIds?: Set<string>;
}

export function findCycle(jobs: Job[]): string[] | null;
export function topoOrder(jobs: Job[]): { order: string[] } | { cycle: string[] };
export function validatePipeline(pipeline: Pipeline, ctx?: PipelineValidationCtx): { ok: boolean; errors: string[] };
export function publicPipelineView(pipeline: Pipeline): Record<string, unknown>;
export function maskSecrets(line: string, secretValues?: string[]): string;
