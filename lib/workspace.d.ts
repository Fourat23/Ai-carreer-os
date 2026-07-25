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
