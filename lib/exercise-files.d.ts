// Types pour lib/exercise-files.mjs (modele de fichiers multi-fichiers, pur).
import type { Exercise } from './exercise';

export interface NormalizedFile {
  path: string;
  content: string;
  language: string;
  editable: boolean;
  hidden: boolean;
  entry: boolean;
  test: boolean;
}

export interface ClientFile {
  path: string;
  content: string;
  language: string;
  editable: boolean;
  hidden: boolean;
  entry: boolean;
}

export function detectLanguage(path: string): string;
export function looksBinary(content: unknown): boolean;
export function validateExercisePath(path: unknown): { ok: boolean; error?: string };
export function normalizeExerciseFiles(exercise: Exercise): NormalizedFile[];
export interface FileFlags {
  path: string;
  editable?: boolean;
  hidden?: boolean;
  entry?: boolean;
  test?: boolean;
}
export function resolveEntryFile(files: FileFlags[]): string | null;
export function resolveActiveFile(files: FileFlags[], preferred?: string | null): string | null;
export function updateWorkspaceFile(files: NormalizedFile[], path: string, content: string): NormalizedFile[];
export function resetWorkspaceFiles(exercise: Exercise): NormalizedFile[];
export function migrateLegacySingleFileExercise(exercise: Exercise): { files: NormalizedFile[]; entry: string | null; activeFile: string | null };
export function clientFiles(files: NormalizedFile[]): ClientFile[];
