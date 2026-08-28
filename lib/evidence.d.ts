// Types pour lib/evidence.mjs — modèle canonique de preuve (V65).
// Contrat : docs/V65-COMPETENCY-EVIDENCE-CONTRACT.md

export const EVIDENCE_SCHEMA: number;
export const EVIDENCE_SOURCE_TYPES: readonly EvidenceSourceType[];
export const QUALIFYING_SOURCE_TYPES: ReadonlySet<string>;
export const VALIDATION_STATUSES: readonly EvidenceValidationStatus[];
export const VALIDATION_KINDS: readonly EvidenceValidationKind[];

export type EvidenceSourceType =
  | 'exercise' | 'assessment' | 'mission' | 'capstone'
  | 'submission' | 'declared' | 'review';

export type EvidenceValidationStatus = 'passed' | 'failed' | 'pending' | 'manual';
export type EvidenceValidationKind =
  | 'exercise-tests' | 'assessment-grade' | 'mission-deliverables' | 'capstone-review' | 'self';

export interface EvidenceValidation {
  status: EvidenceValidationStatus;
  kind: EvidenceValidationKind;
  checkedAt: string | null;
  detail: string;
  score: { passed: number; total: number } | null;
}

export interface EvidenceProvenance {
  /** Qui a produit cette preuve (obligatoire). */
  producer: string;
  method: string;
  note: string;
}

export interface Evidence {
  id: string;
  sourceType: EvidenceSourceType;
  sourceId: string;
  /** Identifiants de PROGRAMME uniquement — jamais un identifiant inconnu. */
  competencyIds: string[];
  /** Horodatage SERVEUR, jamais transmis par un client. */
  createdAt: string;
  validation: EvidenceValidation | null;
  provenance: EvidenceProvenance;
  title: string;
  /** Présents seulement lorsque le fait est réel — jamais fabriqués. */
  dayId: number | null;
  sessionId: string | null;
  submissionId: string | null;
  assessmentId: string | null;
  attemptNumber: number | null;
  artifactRef: string | null;
}

export interface EvidenceInput {
  sourceType: EvidenceSourceType | string;
  sourceId: string;
  competencyIds: string[];
  provenance: { producer: string; method?: string; note?: string };
  validation?: Partial<EvidenceValidation> | null;
  title?: string;
  id?: string;
  dayId?: number;
  sessionId?: string;
  submissionId?: string;
  assessmentId?: string;
  attemptNumber?: number;
  artifactRef?: string;
}

export type MakeEvidenceResult =
  | { ok: true; evidence: Evidence }
  | { ok: false; code: string; error: string };

export function safeId(v: unknown, max?: number): string | null;
export function safeUrlish(u: unknown): string | null;
export function isQualifying(evidence: unknown): boolean;
export function evidenceKey(evidence: unknown): string;
/**
 * Identifiant déterministe. `qualifying` porte le MÊME discriminant que la clé
 * métier : sans lui, une tentative ratée puis réussie sur la même source
 * produisait deux preuves de même id, et la garde d'unicité rejetait la
 * réussite.
 */
export function deterministicId(sourceType: string, sourceId: string, qualifying?: boolean): string;
export function makeEvidence(input: EvidenceInput | Record<string, unknown>, ctx?: { now?: string | Date }): MakeEvidenceResult;
export function normalizeEvidenceRecord(raw: unknown): Evidence | null;
export function appendEvidence(list: Evidence[] | undefined, evidence: Evidence): {
  evidence: Evidence[]; added: boolean; reason?: string;
};
export function normalizeLedger(raw: unknown): Evidence[];
export function classifyLegacyEvidence(e: unknown): { sourceType: EvidenceSourceType; sourceId: string; qualifying: boolean };
export function migrateLegacyEvidence(days: unknown): Evidence[];
