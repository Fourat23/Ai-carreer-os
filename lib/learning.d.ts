// Types pour lib/learning.mjs (modèle Active Learning pur, extension V6).
import type { Progress, DayProgress } from './types';

export const LEARNING_SCHEMA: number;
export const CORRECTION_STATES: readonly ['locked', 'available', 'viewed', 'acknowledged'];
export const COMPREHENSIONS: readonly ['understood', 'partial', 'review'];
export const CONFIDENCES: readonly ['low', 'medium', 'high'];
export const EVIDENCE_TYPES: readonly ['exercise', 'repo', 'project', 'screenshot', 'note', 'demo', 'assessment', 'capstone', 'other'];
export const DAY_STATUSES: readonly ['not-started', 'in-progress', 'done', 'to-review'];

export type CorrectionState = 'locked' | 'available' | 'viewed' | 'acknowledged';
export type Comprehension = 'understood' | 'partial' | 'review';
export type Confidence = 'low' | 'medium' | 'high';
export type EvidenceType = 'exercise' | 'repo' | 'project' | 'screenshot' | 'note' | 'demo' | 'assessment' | 'capstone' | 'other';

export interface SelfAssessment {
  level: number | null;
  confidence: Confidence | null;
  criteria: Record<string, boolean>;
  comment: string;
}
export interface Attempts {
  count: number;
  lastAt: string | null;
  history: { at: string | null; outcome: string; summary: string }[];
}
export interface ReviewState {
  dueAt: string | null;
  interval: number;
  repetitions: number;
  ease: number;
  lastReviewedAt: string | null;
  reason: string;
}
export interface Evidence {
  id: string;
  type: EvidenceType;
  title: string;
  description: string;
  url: string;
  skills: string[];
  createdAt: string;
}

export function safeUrl(u: unknown): string;
export function normalizeDay(d: unknown): Required<DayProgress>;
export function migrateProgress(progress: unknown): Progress;
export function updateAnswer(day: unknown, sectionId: string, text: string): DayProgress;
export function updateNotes(day: unknown, text: string): DayProgress;
export function recordAttempt(day: unknown, entry?: { at?: string; outcome?: string; summary?: string }): DayProgress;
export function updateSelfAssessment(day: unknown, patch: Partial<SelfAssessment>): DayProgress;
export function setCorrectionState(day: unknown, state: CorrectionState): DayProgress;
export function setComprehension(day: unknown, value: Comprehension | null): DayProgress;
export function scheduleReview(day: unknown, review: Partial<ReviewState> | null): DayProgress;
export function addEvidence(day: unknown, evidence: Partial<Evidence>): DayProgress;
export function removeEvidence(day: unknown, id: string): DayProgress;
export function daySummary(day: unknown, activities?: { id: string }[]): {
  status: string; activities: number; answered: number; unanswered: number;
  correctionViewed: boolean; comprehension: string | null; confidence: string | null;
  reviewDueAt: string | null; evidenceCount: number; hasNotes: boolean;
};
