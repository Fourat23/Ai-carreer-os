// V77 · CP4 — types du fait « soumission de diagnostic » (`lib/assessment-attempt.mjs`).
//
// Le fait porte `passed`, `total` et le `seuil` déclaré par la fixture. Il ne
// porte AUCUN niveau, pourcentage de maîtrise ni rang : transformer un
// assessment en `mastery` est nommément interdit par le contrat gelé, et le
// type est le premier endroit où cette promesse se vérifie.
export type GenreDeDiagnostic = 'assessment' | 'capstone';
export type IssueDeDiagnostic = 'success' | 'partial' | 'failure';

export const GENRES: readonly GenreDeDiagnostic[];
export const MAX_ASSESSMENT_ATTEMPTS: number;
export const SEUIL_PAR_DEFAUT: number;
export const ATTEMPT_OUTCOMES: readonly string[];

export type AssessmentAttempt = {
  at: string;
  grain: 'assessment';
  assessmentId: string;
  kind: GenreDeDiagnostic;
  competencyIds: string[];
  passed: number;
  total: number;
  /** `passThreshold` de la fixture, recopié pour que le calcul reste refaisable. */
  seuil: number;
  outcome: IssueDeDiagnostic;
  /** Le seuil déclaré est-il atteint — **pas** un niveau de maîtrise. */
  reussiteGlobale: boolean;
  /** Champ booléen, jamais du texte libre (dette `D9` du CP0). */
  simulation: boolean;
  validation: { status: 'passed' | 'failed'; kind: 'assessment-grade'; checkedAt: string; detail: string };
  evidenceId: string | null;
  sourceRef: string | null;
  empreinte: string;
  provenance: { producer: string; method: string };
  schemaVersion: number;
};

export type LectureDeDiagnostic = {
  assessmentId: string;
  tentatives: number;
  scores: string[];
  reussies: number;
  echouees: number;
  premier: string | null;
  dernier: string | null;
  lecture: string;
};

export function issueDuDiagnostic(passed: number, total: number, seuil?: number): IssueDeDiagnostic;
export function normalizeAssessmentAttempt(raw: unknown, o?: { now?: string | null; legacy?: boolean }): AssessmentAttempt | null;
export function assessmentAttemptKey(a: AssessmentAttempt): string;
export function estUnRejeu(candidat: AssessmentAttempt | null, precedente: AssessmentAttempt | null): boolean;
export function normalizeAssessmentAttempts(list: unknown): AssessmentAttempt[];
export function historiqueDuDiagnostic(attempts: unknown, assessmentId: string): AssessmentAttempt[];
export function lectureDuDiagnostic(attempts: unknown, assessmentId: string): LectureDeDiagnostic;
