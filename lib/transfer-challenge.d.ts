// Types pour lib/transfer-challenge.mjs (défi de transfert, réutilise assessment).
import type { AssessmentQuestion, QuestionResult } from './assessment';
import type { TransferLevel } from './transfer-taxonomy';

export interface TransferChallenge {
  id: string;
  title: string;
  sourceSkill: string;
  targetContext: string;
  transferLevel: TransferLevel; // T4 | T5
  bridge?: string;
  crossDomain?: boolean;
  skills: string[];
  lessonRefs?: string[];
  simulationNote?: string;
  passThreshold?: number;
  questions: AssessmentQuestion[];
}

export interface TransferChallengeResult {
  challengeId: string;
  transferLevel: TransferLevel;
  total: number;
  passed: number;
  ratio: number;
  passedOverall: boolean;
  weakSkills: string[];
  results: QuestionResult[];
}

export const CHALLENGE_LEVELS: readonly TransferLevel[];
export function validateTransferChallenge(c: unknown): { ok: boolean; errors: string[] };
export function gradeTransferChallenge(c: TransferChallenge, responsesById?: Record<string, unknown>): TransferChallengeResult;

/**
 * V76 · CP8 — le défi tel qu'il peut être servi au CLIENT : sans `answer`, sans
 * `explanation`. Le type le rend vérifiable par le compilateur, pas seulement
 * par un test.
 */
export type QuestionPublique = Omit<AssessmentQuestion, 'answer' | 'explanation'>;
export interface TransferChallengePublic extends Omit<TransferChallenge, 'questions'> {
  questions: QuestionPublique[];
}
export function vuePubliqueDuDefi(c: TransferChallenge | null): TransferChallengePublic | null;
