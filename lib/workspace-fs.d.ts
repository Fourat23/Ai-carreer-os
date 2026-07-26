// Types pour lib/workspace-fs.mjs (gestionnaire d'espace de travail, I/O).
import type { Exercise, AttemptResult } from './exercise';
import type { LabDiagnostic } from './typescript-compile';

export const MAX_FILE_BYTES: number;
export const MAX_TOTAL_BYTES: number;

export interface WorkspaceFileState {
  path: string;
  content: string;
  readOnly: boolean;
  editable: boolean;
  hidden: boolean;
  language: string;
  entry: boolean;
}

export interface RunOutput {
  attempt: AttemptResult;
  stdout: string;
  timedOut: boolean;
  error: string | null;
  /** Étape ayant produit le résultat : compilation, exécution ou notation des tests. */
  phase?: 'compile' | 'run' | 'test';
  /** Diagnostics de compilation (runtimes compilés). Jamais de fuite de test privé. */
  diagnostics?: LabDiagnostic[];
}

export function templateFileMap(exercise: Exercise): Map<string, { content: string; readOnly: boolean }>;
export function materializeWorkspace(root: string, exercise: Exercise, userFiles?: Record<string, string>): string;
export function workspaceExists(root: string, exercise: Exercise): boolean;
export function readWorkspaceTree(root: string, exercise: Exercise): WorkspaceFileState[];
export function readWorkspaceFile(root: string, exercise: Exercise, path: string): string;
export function writeWorkspaceFile(root: string, exercise: Exercise, path: string, content: string): void;
export function resetWorkspace(root: string, exercise: Exercise): string;
export function resetWorkspaceFile(root: string, exercise: Exercise, path: string): void;
export function editableAllowSet(exercise: Exercise): Set<string>;
export function exportWorkspace(root: string, exercise: Exercise): { files: Record<string, string> } | null;
export function clearWorkspace(root: string, exerciseId: string): void;
export function runExercise(root: string, exercise: Exercise, userFiles?: Record<string, string>): Promise<RunOutput>;
