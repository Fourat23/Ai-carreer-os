// Types pour lib/workspace.mjs (runner pur : chemins, harnais, notation).
import type { Exercise, AttemptResult } from './exercise';

export const LAB_RESULT_MARKER: string;
export const HARNESS_FILE: string;

export function resolveWithinRoot(root: string, rel: unknown): string | null;
export function buildHarness(exercise: Exercise): string;
export function parseHarnessOutput(stdout: unknown): { observed?: Record<string, { value?: unknown; stdout?: string; error?: string }>; fatal?: string } | null;
export function gradeRun(
  exercise: Exercise,
  rawStdout: string,
  ctx?: { error?: string | null; durationMs?: number; at?: string | null },
): AttemptResult;

// V76 · CP9 — la concurrence d'écriture, décidée hors du serveur et hors de la
// surface, pour qu'un test puisse l'exercer sans lancer ni l'un ni l'autre.
export type ConflitDeRevision = { path: string; revAttendue: string; revActuelle: string };
export function decisionDeSauvegarde(
  revsAttendues: unknown,
  revsActuelles: Record<string, string> | null | undefined,
): { refuse: boolean; conflits: ConflitDeRevision[] };
