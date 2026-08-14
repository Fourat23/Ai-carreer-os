// Types pour lib/capstone.mjs (modèle de simulation professionnelle, pur).
import type { AssessmentQuestion, QuestionResult, Taxonomy } from './assessment';

export type PhaseKind =
  | 'hypotheses' | 'investigation' | 'diagnosis' | 'decision'
  | 'remediation' | 'validation' | 'communication';

export type ArtifactKind =
  | 'code' | 'log' | 'metrics' | 'stacktrace' | 'config' | 'manifest' | 'http'
  | 'sql' | 'architecture' | 'ticket' | 'ci' | 'trace' | 'diff' | 'incident';

export interface CapstoneArtifact {
  id: string;
  kind: ArtifactKind;
  title: string;
  content: string;
  useful?: boolean;   // false = bruit (non déterminant) ; sert au debrief/gate
}

export interface CapstonePhase {
  id: string;
  kind: PhaseKind;
  title: string;
  prompt: string;
  questions: AssessmentQuestion[];
}

export interface CapstoneDebrief {
  expectedReasoning: string;
  keySignals?: string[];
  redHerrings?: string[];
  alternatives?: string[];
  tradeoffs?: string[];
  conceptsMobilized?: string[];
  commonMistakes?: string[];
}

export interface Capstone {
  id: string;
  title: string;
  domain?: string;
  difficulty?: number;
  estimatedMinutes?: number;
  skills: string[];
  lessonRefs?: string[];
  exerciseRefs?: string[];
  playbookRefs?: string[];
  dayRefs?: number[];
  simulationNote?: string;
  passThreshold?: number;
  context: string;
  signal: string;
  artifacts: CapstoneArtifact[];
  phases: CapstonePhase[];
  debrief: CapstoneDebrief;
}

export interface PhaseResult {
  id: string;
  kind: PhaseKind;
  title: string;
  total: number;
  passed: number;
  ratio: number;
  results: QuestionResult[];
}

export interface CapstoneResult {
  capstoneId: string;
  total: number;
  passed: number;
  ratio: number;
  passedOverall: boolean;
  byPhase: PhaseResult[];
  mobilizedSkills: string[];
  weakSkills: string[];
  results: QuestionResult[];
}

export interface CapstoneEvidence {
  type: 'capstone';
  title: string;
  url: string;
  skills: string[];
  createdAt: string;
}

export interface CapstoneRemediation {
  weakSkills: string[];
  lessons: string[];
  exercises: string[];
  playbooks: string[];
}

export const PHASE_KINDS: readonly PhaseKind[];
export const ARTIFACT_KINDS: readonly ArtifactKind[];
export const DEFAULT_PASS_THRESHOLD: number;

export function validateCapstone(c: unknown): { ok: boolean; errors: string[] };
export function gradeCapstonePhase(phase: CapstonePhase, responsesById?: Record<string, unknown>): PhaseResult;
export function gradeCapstone(c: Capstone, responsesById?: Record<string, unknown>): CapstoneResult;
export function capstoneToEvidence(c: Capstone, result: CapstoneResult, now?: Date): CapstoneEvidence | null;
export function capstoneRemediation(c: Capstone, result: CapstoneResult): CapstoneRemediation;
export function capstoneDomainSummary(list: Capstone[]): Record<string, number>;
export function capstoneTaxonomySummary(c: Capstone): Record<Taxonomy, number>;
