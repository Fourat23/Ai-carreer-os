// Types pour lib/exercise.mjs (modèle d'exercice exécutable, pur).
import type { RuntimeAdapter } from './runtime';

// Compat : le modèle de runtime est désormais l'adaptateur (lib/runtime).
export type RuntimeDefinition = RuntimeAdapter;

export interface WorkspaceFile {
  path: string;
  content: string;
  readOnly?: boolean;
}

export interface WorkspaceTemplate {
  files: WorkspaceFile[];
  entry: string;
}

export type TestKind = 'call-equals' | 'stdout-equals' | 'stdout-contains';

export interface TestDefinition {
  id: string;
  name: string;
  kind: TestKind;
  export?: string;      // call-equals : nom de la fonction exportée
  args?: unknown[];     // call-equals : arguments
  expected: unknown;    // valeur (call-equals) ou texte (stdout-*)
  private?: boolean;    // test privé : pass/fail visible, attendu/reçu jamais divulgués
}

export interface ExerciseLimits {
  timeoutMs?: number;
  maxOutputBytes?: number;
}

export interface Exercise {
  id: string;
  title: string;
  summary?: string;
  difficulty?: number;
  runtime?: string;                // clé de RUNTIMES ; absent → défaut node-js
  language?: string;
  workspace: WorkspaceTemplate;
  tests: TestDefinition[];
  testFiles?: WorkspaceFile[];
  skills?: string[];
  trackRefs?: string[];
  tags?: string[];
  activeFile?: string;
  limits?: ExerciseLimits;
}

export interface ValidationResult {
  testId: string;
  name: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  message: string;
}

export interface AttemptResult {
  exerciseId: string;
  at: string | null;
  durationMs: number;
  total: number;
  passed: number;
  allPassed: boolean;
  results: ValidationResult[];
}

export const RUNTIMES: Record<string, RuntimeDefinition>;
export const TEST_KINDS: readonly TestKind[];
export const DEFAULT_RUNTIME_ID: string;
export function getRuntime(id: string): RuntimeDefinition | null;
export function getRuntimeAdapter(id: string): RuntimeDefinition | null;
export function isKnownRuntime(id: string): boolean;
export function effectiveLimits(exercise: Exercise): { timeoutMs: number; maxOutputBytes: number };
export function isSafeRelPath(p: unknown): boolean;
export function deepEqual(a: unknown, b: unknown): boolean;
export function validateExercise(ex: unknown): { ok: boolean; errors: string[] };
export function validateTest(t: unknown): string | null;
export function checkTest(
  test: TestDefinition,
  observed?: { value?: unknown; stdout?: string },
  error?: unknown,
): ValidationResult;
export function buildAttemptResult(
  exerciseId: string,
  results: ValidationResult[],
  opts?: { at?: string | null; durationMs?: number },
): AttemptResult;
