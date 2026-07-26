// Types du compilateur TypeScript pur (lib/typescript-compile.mjs).
export type LabDiagnostic = {
  category: 'error' | 'warning' | 'suggestion';
  code: number | string;
  message: string;
  phase: 'compile';
  file?: string;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
};

export type CompileResult = {
  success: boolean;
  emittedFiles: Record<string, string>;
  diagnostics: LabDiagnostic[];
  durationMs: number;
};

export function compileExerciseTs(
  files: Array<{ path: string; content: string }>,
  opts?: { fileName?: string },
): CompileResult;
