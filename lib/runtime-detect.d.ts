// Types pour lib/runtime-detect.mjs (détection serveur des runtimes).
export interface RuntimeDetection {
  available: boolean;
  binary: string | null;
  version: string | null;
  error?: string;
}
export interface RuntimeStatus {
  id: string;
  available: boolean;
  version: string | null;
  error: string | null;
}
export function detectRuntime(id: string): RuntimeDetection;
export function runtimeStatus(id: string): RuntimeStatus;
export function _resetDetectionCache(): void;
