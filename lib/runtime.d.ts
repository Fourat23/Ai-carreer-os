// Types pour lib/runtime.mjs (registre de runtimes, pur).
import type { Exercise } from './exercise';

export interface RuntimeCapabilities {
  execution: boolean; publicTests: boolean; privateTests: boolean; multiFile: boolean;
  stdin: boolean; cancellation: boolean; timeout: boolean; syntaxHighlighting: boolean;
}

export interface RuntimeAdapter {
  id: string;
  kind: string;
  label: string;
  language: string;
  extensions: string[];
  entryDefault: string;
  binary: string;
  harnessFile: string;
  fileExtension: string;
  timeoutMs: number;
  maxOutputBytes: number;
  capabilities: RuntimeCapabilities;
  buildHarness(exercise: Exercise): string;
  buildArgs(harnessFile: string): string[];
  env(): Record<string, string>;
}

export const LAB_RESULT_MARKER: string;
export const DEFAULT_RUNTIME_ID: string;
export const RUNTIMES: Record<string, RuntimeAdapter>;
export function getRuntimeAdapter(id: string): RuntimeAdapter | null;
export function getRuntime(id: string): RuntimeAdapter | null;
export function isKnownRuntime(id: string): boolean;
export function listRuntimeAdapters(): RuntimeAdapter[];
