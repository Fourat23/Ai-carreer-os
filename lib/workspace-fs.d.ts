// Types pour lib/workspace-fs.mjs (gestionnaire d'espace de travail, I/O).
import type { Exercise, AttemptResult } from './exercise';

export const MAX_FILE_BYTES: number;
export const MAX_TOTAL_BYTES: number;

export interface WorkspaceFileState {
  path: string;
  content: string;
  readOnly: boolean;
}

export interface RunOutput {
  attempt: AttemptResult;
  stdout: string;
  timedOut: boolean;
  error: string | null;
}

export function templateFileMap(exercise: Exercise): Map<string, { content: string; readOnly: boolean }>;
export function materializeWorkspace(root: string, exercise: Exercise, userFiles?: Record<string, string>): string;
export function workspaceExists(root: string, exercise: Exercise): boolean;
export function readWorkspaceTree(root: string, exercise: Exercise): WorkspaceFileState[];
export function readWorkspaceFile(root: string, exercise: Exercise, path: string): string;
export function writeWorkspaceFile(root: string, exercise: Exercise, path: string, content: string): void;
export function resetWorkspace(root: string, exercise: Exercise): string;
export function clearWorkspace(root: string, exerciseId: string): void;
export function runExercise(root: string, exercise: Exercise, userFiles?: Record<string, string>): Promise<RunOutput>;
