// Types pour lib/transfer-attempt.mjs (V75 · CP10 — `TransferAttempt`).
import type { Validation } from './types';

export type TransferOutcome = 'success' | 'partial' | 'failure';

export const TRANSFER_OUTCOMES: readonly TransferOutcome[];
export const MAX_TRANSFER_ATTEMPTS: number;
/** Fenêtre DÉCLARÉE au-delà de laquelle une resoumission identique est une tentative. */
export const FENETRE_REJEU_MS: number;

export interface TransferAttempt {
  /** Horloge SERVEUR. Jamais acceptée du client (contrat V74 §3.6). */
  at: string;
  submittedAt: string;
  grain: 'challenge';
  challengeId: string;
  /** §10.1 — cardinalité RÉELLE : un défi peut porter plusieurs concepts. */
  conceptIds: string[];
  competencyIds: string[];
  passed: number;
  total: number;
  /** Dérivée de passed/total, jamais reçue de l'appelant. */
  outcome: TransferOutcome;
  /**
   * Ouverture du défi telle que **déclarée par le client**. Le serveur ne peut
   * pas la connaître ; elle est nommée comme une déclaration et n'entre dans
   * aucun verdict (même décision que `scoreDeclare` au CP2).
   */
  startedAtDeclare: string | null;
  validation: Validation;
  /** Preuve produite, si l'apprenant a conservé le résultat. */
  evidenceId: string | null;
  /** §10.4 — clé de la tentative précédente. Elle n'est jamais écrasée. */
  retryOf: string | null;
  sourceRef: string | null;
  /** Empreinte stable des réponses, base de la clé métier. */
  empreinte: string;
  provenance: { producer: string; method: string; note: string };
  schemaVersion: number;
}

export function outcomeDuTransfert(passed: number, total: number): TransferOutcome;
export function empreinteReponses(responses: unknown): string;
export function normalizeTransferAttempt(
  raw: unknown, options?: { now?: string | null; legacy?: boolean },
): TransferAttempt | null;
export function transferAttemptKey(a: Partial<TransferAttempt>): string;
export function estUnRejeu(
  candidat: TransferAttempt | null, precedente: TransferAttempt | null,
): boolean;
export function normalizeTransferAttempts(list: unknown): TransferAttempt[];
export function historiqueDuDefi(list: unknown, challengeId: string): TransferAttempt[];
export const ATTEMPT_OUTCOMES: readonly string[];
