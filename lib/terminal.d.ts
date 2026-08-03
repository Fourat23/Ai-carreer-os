// Déclarations de types pour le modèle de terminal borné (lib/terminal.mjs).

export type TerminalStatus =
  | 'idle' | 'preparing' | 'running' | 'success' | 'failed'
  | 'timed-out' | 'cancelled' | 'cleanup-failed' | 'unavailable';
export type ArgumentKind = 'enum' | 'int' | 'path' | 'flag' | 'literal';
export type TerminalAdapterId = 'local' | 'docker';

export const TERMINAL_STATUSES: TerminalStatus[];
export const ARGUMENT_KINDS: ArgumentKind[];
export const TERMINAL_ADAPTERS: TerminalAdapterId[];
export const TERMINAL_CAPS: { timeoutMs: number; maxBytes: number };
export const TERMINAL_EVENTS: string[];

export interface ArgumentSpec {
  name: string;
  kind: ArgumentKind;
  required?: boolean;
  values?: string[];
  min?: number;
  max?: number;
  default?: string;
}

export interface TerminalTask {
  id: string;
  title: string;
  description: string;
  adapter: TerminalAdapterId;
  executable: string;
  argumentSchema: ArgumentSpec[];
  defaultArguments?: string[];
  allowedArguments?: string[];
  cwdPolicy: 'workspace';
  environmentPolicy: 'minimal';
  timeoutMs: number;
  maxStdoutBytes: number;
  maxStderrBytes: number;
  maxCombinedBytes: number;
  expectedExitCodes: number[];
  successCriteria?: { exitCode?: number[]; stdoutIncludes?: string[]; stdoutEquals?: string };
  cleanupPolicy: 'always';
  skills: string[];
  dayRefs: number[];
  trackScope?: string[] | null;
  hints?: string[];
  securityNotes?: string[];
}

export interface TerminalRun {
  id: string;
  taskId: string;
  status: TerminalStatus;
  commandPreview: string;
  adapter: TerminalAdapterId;
  startedAt: string | null;
  endedAt: string | null;
  durationMs: number;
  exitCode: number | null;
  signal: string | null;
  stdout: string;
  stderr: string;
  truncated: boolean;
  cancelled: boolean;
  timedOut: boolean;
  cleaned: boolean;
  diagnostic?: string;
}

export interface TaskValidationCtx {
  allowlist?: Set<string> | string[];
  skillIds?: { has: (s: string) => boolean };
  validDays?: Set<number>;
}

export function validateWorkspacePath(rel: string): { ok: boolean; reason?: string };
export function isAllowedExecutable(allowlist: Set<string> | string[], exe: string): boolean;
export function validateArgValue(spec: ArgumentSpec, value: unknown): { ok: boolean; reason?: string };
export function validateArguments(task: TerminalTask, raw?: Record<string, string>): { ok: boolean; argv: string[]; errors: string[] };
export function buildCommandPreview(task: TerminalTask, argv?: string[]): string;
export function boundOutput(text: string, maxBytes?: number): { text: string; truncated: boolean };
export function nextStatus(current: TerminalStatus, event: string): TerminalStatus;
export function isTerminalStatus(status: TerminalStatus): boolean;
export function classifyRun(task: TerminalTask, result: { exitCode: number | null; timedOut?: boolean; cancelled?: boolean }): TerminalStatus;
export function validateTerminalTask(task: TerminalTask, ctx?: TaskValidationCtx): { ok: boolean; errors: string[] };
export function publicTaskView(task: TerminalTask): Partial<TerminalTask>;
