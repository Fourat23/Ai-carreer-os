// Liant applicatif du gestionnaire d'espace de travail : fixe la racine dédiée
// data/lab-workspaces/ (jamais versionnée) et expose l'API à Next. Toute la
// logique — sûreté des chemins, allowlist, exécution cloisonnée — vit dans
// workspace-fs.mjs (paramétré par racine, donc testable) et workspace.mjs (pur).
import { join } from 'node:path';
import * as fs from './workspace-fs.mjs';
import type { Exercise } from './exercise';
import type { WorkspaceFileState, RunOutput } from './workspace-fs';

const ROOT = join(process.cwd(), 'data', 'lab-workspaces');

export function materializeWorkspace(exercise: Exercise, userFiles: Record<string, string> = {}): string {
  return fs.materializeWorkspace(ROOT, exercise, userFiles);
}
export function readWorkspaceTree(exercise: Exercise): WorkspaceFileState[] {
  return fs.readWorkspaceTree(ROOT, exercise);
}
export function readWorkspaceFile(exercise: Exercise, path: string): string {
  return fs.readWorkspaceFile(ROOT, exercise, path);
}
export function writeWorkspaceFile(exercise: Exercise, path: string, content: string): void {
  fs.writeWorkspaceFile(ROOT, exercise, path, content);
}
export function resetWorkspace(exercise: Exercise): string {
  return fs.resetWorkspace(ROOT, exercise);
}
export function clearWorkspace(exerciseId: string): void {
  fs.clearWorkspace(ROOT, exerciseId);
}
export function runExercise(exercise: Exercise, userFiles: Record<string, string> = {}): Promise<RunOutput> {
  return fs.runExercise(ROOT, exercise, userFiles);
}

export type { WorkspaceFileState, RunOutput };
