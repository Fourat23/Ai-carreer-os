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
