// Types pour lib/competency.mjs — registre + projection de compétence (V65).
import type { Evidence } from './evidence';

export type CompetencyState = 'unassessed' | 'practiced' | 'demonstrated' | 'reinforced';

export const COMPETENCY_STATES: readonly CompetencyState[];
export const COMPETENCY_STATE_LABEL: Record<CompetencyState, string>;
export const COMPETENCY_DISPLAY_ORDER: readonly CompetencyState[];
export const EVIDENCE_SOURCE_LABEL: Record<string, string>;

export interface EvidenceLedger {
  all(): Evidence[];
  size: number;
  getEvidenceById(id: string): Evidence | null;
  getEvidenceBySkill(skillId: string): Evidence[];
  getEvidenceBySession(sessionId: string): Evidence[];
  getEvidenceByDay(dayId: number): Evidence[];
  getEvidenceBySource(sourceType: string, sourceId: string): Evidence[];
  getEvidenceTimeline(limit?: number): Evidence[];
}

export function createLedger(evidenceList: Evidence[] | undefined): EvidenceLedger;

export interface CompetencyProjection {
  competencyId: string;
  /** Nom lisible, ajouté par projectCompetencies. */
  name?: string;
  state: CompetencyState;
  evidenceCount: number;
  qualifyingEvidenceCount: number;
  lastEvidenceAt: string | null;
  lastQualifiedEvidenceAt: string | null;
  distinctSourceCount: number;
  distinctDateCount: number;
  /** Drapeau ORTHOGONAL à l'état — jamais un niveau. */
  needsReview: boolean;
  needsReviewReasons: string[];
  supportingEvidenceIds: string[];
  allEvidenceIds: string[];
}

export interface ProjectionContext {
  dueDays?: Set<number>;
  reviewFlaggedDays?: Set<number>;
}

export function competencyStateFrom(input: {
  qualifying?: { sourceType: string; sourceId: string; createdAt: string }[];
  nonQualifying?: unknown[];
}): CompetencyState;

export function projectCompetency(
  competencyId: string,
  evidenceForSkill: Evidence[] | undefined,
  ctx?: ProjectionContext,
): CompetencyProjection;

export function projectCompetencies(
  programSkillList: { id: string; name: string }[],
  ledger: EvidenceLedger,
  ctx?: ProjectionContext,
): CompetencyProjection[];

export interface CompetencyExplanationEvidence {
  id: string;
  sourceLabel: string;
  sourceId: string;
  title: string;
  createdAt: string;
  qualifying: boolean;
  validationDetail: string;
  dayId: number | null;
  artifactRef: string | null;
}

export interface CompetencyExplanation {
  competencyId: string;
  state: CompetencyState;
  stateLabel: string;
  rule: string;
  facts: string[];
  evidence: CompetencyExplanationEvidence[];
  needsReview: boolean;
  needsReviewReasons: string[];
}

export function whyCompetencyState(
  projection: CompetencyProjection,
  ledger: EvidenceLedger,
): CompetencyExplanation | null;

// ── Présentation et prochaine action (V65.1 · CP2) ────────────────────────

export type CompetencyTone = 'neutral' | 'accent' | 'positive';

export const COMPETENCY_STATE_TONE: Record<CompetencyState, CompetencyTone>;

export interface CompetencyStatusToken {
  state: CompetencyState;
  label: string;
  tone: CompetencyTone;
  requiresExplanation: true;
}

export function competencyStatusToken(state: string): CompetencyStatusToken;
export function allCompetencyStatusTokens(): CompetencyStatusToken[];

export interface CompetencyNextAction {
  competencyId: string;
  action: string;
  reason: string;
  goal: string;
  expectedEvidence: string;
  href: string;
}

export function nextActionForCompetency(
  projection: CompetencyProjection,
): CompetencyNextAction | null;
