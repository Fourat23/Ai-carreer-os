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
export function workspaceExists(exercise: Exercise): boolean {
  return fs.workspaceExists(ROOT, exercise);
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
export function resetWorkspaceFile(exercise: Exercise, path: string): void {
  fs.resetWorkspaceFile(ROOT, exercise, path);
}
export function clearWorkspace(exerciseId: string): void {
  fs.clearWorkspace(ROOT, exerciseId);
}
export function runExercise(exercise: Exercise, userFiles: Record<string, string> = {}): Promise<RunOutput> {
  return fs.runExercise(ROOT, exercise, userFiles);
}
export function buildReactPreview(exercise: Exercise, userFiles: Record<string, string> = {}): {
  ok: boolean; srcDoc?: string; channel?: string; diagnostics: unknown[];
} {
  return fs.buildReactPreview(exercise, userFiles);
}

// ── Export / restauration des workspaces (sauvegarde V9) ──
export function exportAllWorkspaces(exercises: Exercise[]): Record<string, { files: Record<string, string> }> {
  const out: Record<string, { files: Record<string, string> }> = {};
  for (const ex of exercises) {
    const w = fs.exportWorkspace(ROOT, ex);
    if (w) out[ex.id] = w;
  }
  return out;
}

export function workspaceAllowlist(exercises: Exercise[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const ex of exercises) map.set(ex.id, fs.editableAllowSet(ex));
  return map;
}

/** Restaure des workspaces validés : n'écrit que des fichiers éditables autorisés. */
export function restoreWorkspaces(
  exercisesById: Map<string, Exercise>,
  workspaces: Record<string, { files: Record<string, string> }>,
): void {
  for (const [exId, w] of Object.entries(workspaces)) {
    const ex = exercisesById.get(exId);
    if (!ex) continue;
    for (const [path, content] of Object.entries(w.files)) {
      try { fs.writeWorkspaceFile(ROOT, ex, path, content); } catch { /* fichier refusé : ignoré */ }
    }
  }
}

export type { WorkspaceFileState, RunOutput };
