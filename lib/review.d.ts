// Types pour lib/review.mjs (moteur de révision espacée pur).
import type { Progress, ReviewState } from './learning';

export interface DueReview { day: number; dueAt: string; reason: string; overdueDays: number }
export interface UpcomingReview { day: number; dueAt: string; reason: string; inDays: number }

export function baseInterval(comprehension: string, confidence: string | null): number;
export function calculateNextReview(opts?: {
  comprehension?: string; confidence?: string | null; repetitions?: number; ease?: number; now?: Date | string;
}): ReviewState;
export function updateReviewSchedule(
  review: Partial<ReviewState> | null,
  opts?: { comprehension?: string; confidence?: string | null; now?: Date | string },
): ReviewState;
export function getDueReviews(days: Progress['days'], now?: Date | string): DueReview[];
export function getUpcomingReviews(days: Progress['days'], now?: Date | string, withinDays?: number): UpcomingReview[];
export function reviewSummary(days: Progress['days'], now?: Date | string): {
  dueToday: number; overdue: number; next: UpcomingReview | null; total: number;
};
export function completeReview(review: Partial<ReviewState> | null, result: string, now?: Date | string): ReviewState;
