// V76 · CP6 — types du diagnostic pédagogique (module pur `lib/diagnostic.mjs`).
export type ClasseDiagnostic =
  | 'COMPILATION' | 'ERREUR_LEVEE' | 'TYPE' | 'CARDINALITE'
  | 'CAS_ISOLE' | 'VALEUR' | 'RIEN_NE_PASSE' | 'INDETERMINE';

export const CLASSES: readonly ClasseDiagnostic[];
export const PISTE_PAR_CLASSE: Readonly<Record<ClasseDiagnostic, string>>;

export type CheminDiff = { path: string; kind: 'value' | 'type' | 'length'; expected: unknown; actual: unknown };

export type Diagnostic = {
  classe: ClasseDiagnostic;
  observation: string;
  chemins: CheminDiff[];
  testId: string | null;
  sur: string | null;
};

export type LectureDiagnostic = {
  classe: ClasseDiagnostic;
  observation: string;
  piste: string;
  /** `false` quand le test ne permet pas d'en déduire un symptôme. */
  exploitable: boolean;
  sur: string | null;
  testId: string | null;
};

export function diagnostiquer(o?: {
  resultatsPublics?: { id?: string; testId?: string; name?: string; passed?: boolean; expected?: unknown; received?: unknown; actual?: unknown; message?: string }[];
  compilation?: { message?: string; line?: number; file?: string }[];
  phase?: 'compile' | 'run' | 'test' | 'timeout';
  erreur?: string | null;
}): Diagnostic;

export function lectureDuDiagnostic(d: Diagnostic | null): LectureDiagnostic | null;
