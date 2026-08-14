// Types pour lib/transfer-taxonomy.mjs (échelle de distance de transfert, pur).
export type TransferLevel = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';

export interface TransferMeta {
  bridge?: string;
  crossDomain?: boolean;
  steps?: number;
}

export interface TransferSuggestion {
  level: TransferLevel;
  reasons: string[];
  canBeT5: boolean;
}

export const TRANSFER_LEVELS: readonly TransferLevel[];
export const TRANSFER_LABEL: Record<TransferLevel, string>;
export const BLOOM_TO_TRANSFER: Record<string, TransferLevel>;
export const TRANSFER_RUBRIC: readonly string[];

export function isTransferLevel(x: unknown): x is TransferLevel;
export function maxLevel(a: TransferLevel, b: TransferLevel): TransferLevel;
export function suggestTransferLevel(question: unknown, meta?: TransferMeta): TransferSuggestion;
export function transferLevelSummary(levels: TransferLevel[]): Record<TransferLevel, number>;
