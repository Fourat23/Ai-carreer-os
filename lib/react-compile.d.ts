// Types pour lib/react-compile.mjs (compilateur TSX/JSX pur).
import type { LabDiagnostic } from './typescript-compile';
export const REACT_ALLOWLIST: Set<string>;
export interface ReactCompileResult {
  success: boolean;
  emittedFiles: Record<string, string>;
  cssFiles: string[];
  diagnostics: LabDiagnostic[];
  durationMs: number;
}
export function compileReactExercise(
  files: Array<{ path: string; content: string }>,
  opts?: Record<string, unknown>,
): ReactCompileResult;
