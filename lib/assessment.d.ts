// Types pour lib/assessment.mjs (modèle d'évaluation diagnostique, pur).

export type Taxonomy = 'RECALL' | 'UNDERSTANDING' | 'APPLICATION' | 'DIAGNOSIS' | 'TRANSFER';
export type QuestionKind = 'mcq' | 'multi' | 'predict';

export interface AssessmentQuestion {
  id: string;
  taxonomy: Taxonomy;
  kind: QuestionKind;
  prompt: string;
  explanation: string;              // feedback affiché après réponse
  options?: string[];               // mcq / multi
  answer: number | number[] | string; // mcq: index ; multi: indices ; predict: chaîne/entier
}

export interface Assessment {
  id: string;
  title: string;
  domain?: string;
  skills: string[];                 // compétences DE PROGRAMME
  lessonRefs?: string[];            // leçons enseignant le sujet
  remediation?: string[];           // leçons à revoir si échec
  simulationNote?: string;
  passThreshold?: number;           // ]0,1], défaut 0.7
  questions: AssessmentQuestion[];
}

export interface QuestionResult {
  id: string;
  taxonomy: Taxonomy;
  kind: QuestionKind;
  passed: boolean;
  expected: number | number[] | string;
  given: unknown;
  explanation: string;
}

export interface AssessmentResult {
  assessmentId: string;
  total: number;
  passed: number;
  ratio: number;
  passedOverall: boolean;
  byTaxonomy: Record<Taxonomy, { total: number; passed: number }>;
  weakSkills: string[];
  results: QuestionResult[];
}

export interface AssessmentEvidence {
  type: 'assessment';
  title: string;
  skills: string[];
  createdAt: string;
}

export const TAXONOMY: readonly Taxonomy[];
export const QUESTION_KINDS: readonly QuestionKind[];
export const DEFAULT_PASS_THRESHOLD: number;

export function validateAssessment(a: unknown): { ok: boolean; errors: string[] };
export function validateQuestion(q: unknown): string | null;
export function gradeQuestion(q: AssessmentQuestion, response: unknown): QuestionResult;
export function gradeAssessment(a: Assessment, responsesById?: Record<string, unknown>): AssessmentResult;
export function assessmentTaxonomySummary(list: Assessment[]): Record<Taxonomy, number>;
export function assessmentToEvidence(
  a: Assessment,
  result: AssessmentResult,
  now?: Date,
): AssessmentEvidence | null;
