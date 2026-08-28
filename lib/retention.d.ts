// Types du Retention Engine I (V66). Le modèle vit dans `lib/retention.mjs`.

export type RecallOutcome = 'recalled' | 'partial' | 'failed';
export type RecallFormat = 'free' | 'cued' | 'applied' | 'discrim' | 'generate';
export type RetentionStateId = 'nouveau' | 'fragile' | 'en_consolidation' | 'retenu' | 'a_revoir';

export declare const RECALL_OUTCOMES: RecallOutcome[];
export declare const RECALL_FORMATS: RecallFormat[];
export declare const RETENTION_STATES: RetentionStateId[];
export declare const RETENTION_STATE_LABEL: Record<RetentionStateId, string>;
export declare const FORMAT_LABEL: Record<RecallFormat, string>;
export declare const FORMAT_PROMPT: Record<RecallFormat, string>;
export declare const INTERVALS: number[];
export declare const RETAINED_MIN_SUCCESSES: number;
export declare const RETAINED_MIN_SPAN_DAYS: number;

/** Le SEUL fait écrit par le moteur. Tout le reste en est une projection. */
export interface RecallAttempt {
  conceptId: string;
  at: string;
  outcome: RecallOutcome;
  format: RecallFormat;
  sourceRef: string | null;
}

export interface ConceptExposure {
  conceptId: string;
  exposed: boolean;
  firstExposedAt: string | null;
  lastExposedAt: string | null;
  /** Journées réellement ouvertes par l'apprenant qui enseignent ce concept. */
  days: number[];
  /** Journées du corpus qui enseignent ce concept, ouvertes ou non. */
  teachingDays: number[];
}

export interface ConceptRecall {
  conceptId: string;
  attempts: RecallAttempt[];
  attemptCount: number;
  successes: number;
  failures: number;
  /** Réussites consécutives en fin d'historique — indexe l'espacement. */
  consecutiveSuccesses: number;
  distinctSuccessDays: number;
  spanDays: number;
  lastAttempt: RecallAttempt | null;
  formatsUsed: RecallFormat[];
}

export interface ReviewSchedule {
  conceptId: string | null;
  dueAt: string | null;
  intervalDays: number | null;
  basis: string;
}

export interface RetentionProjection {
  conceptId: string;
  title: string;
  skills: string[];
  exposure: ConceptExposure;
  recall: ConceptRecall;
  state: RetentionStateId;
  /** Pourquoi CET état — jamais un texte écrit en dur dans une page. */
  reason: string;
  schedule: ReviewSchedule;
}

export declare function normalizeAttempt(raw: unknown): RecallAttempt | null;
export declare function normalizeAttempts(list: unknown): RecallAttempt[];
export declare function projectExposures(
  conceptDays: Map<string, number[]> | Record<string, number[]>,
  days: Record<string, unknown>,
): Record<string, ConceptExposure>;
export declare function projectRecall(conceptId: string, attempts: unknown): ConceptRecall;
export declare function projectSchedule(recall: ConceptRecall | null): ReviewSchedule;
export declare function projectRetentionState(
  exposure: ConceptExposure | null,
  recall: ConceptRecall | null,
  now: string,
): { state: RetentionStateId; reason: string; schedule: ReviewSchedule };
export declare function projectRetention(args: {
  concepts?: Array<string | { id: string; title?: string; skills?: string[] }>;
  conceptDays?: Map<string, number[]> | Record<string, number[]>;
  days?: Record<string, unknown>;
  attempts?: unknown;
  now: string;
}): RetentionProjection[];
export declare function interleave<T extends { conceptId: string; skills?: string[]; schedule?: ReviewSchedule }>(
  items: T[],
  opts?: { familyOf?: (item: T) => string },
): T[];
export declare function buildReviewQueue(
  projection: RetentionProjection[],
  opts?: { now: string; limit?: number },
): RetentionProjection[];
export declare function availableFormats(sectionTitles: string[]): RecallFormat[];
export declare function nextFormat(recall: ConceptRecall | null, formats: RecallFormat[]): RecallFormat | null;
export declare function retentionCounts(projection: RetentionProjection[]): Record<RetentionStateId, number>;
