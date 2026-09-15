// Types pour lib/attempt-journal.mjs (journal d'accompagnement des tentatives).
export const MAX_ENTREES: number;
export const MAX_OCTETS: number;
export const MAX_OCTETS_FICHIER: number;

export type TestJournalise = { id: string; name: string; passed: boolean };

export type EntreeJournal = {
  cle: string;
  at: string;
  passed: number;
  total: number;
  phase: 'run' | 'compile' | 'timeout';
  durationMs: number;
  tests: TestJournalise[];
  files: Record<string, string>;
  aides: string[];
  schemaVersion: number;
};

export type LigneHistorique = {
  cle: string;
  at: string;
  passed: number;
  total: number;
  allPassed: boolean;
  outcome: string | null;
  phase: string;
  durationMs: number;
  conserve: boolean;
  tests: TestJournalise[];
  aides: string[];
  fichiers: string[];
};

export function cleDeJournal(a: { exerciseId: string; at: string; passed: number; total: number }): string;
export function entreeDeJournal(a: {
  exerciseId?: string; at?: string; passed?: number; total?: number;
  phase?: string; durationMs?: number;
  resultats?: unknown[]; fichiers?: Record<string, string>; aides?: string[];
}): EntreeJournal | null;
export function ajouterAuJournal(
  journal: unknown,
  entree: EntreeJournal | null,
  opts?: { maxEntrees?: number; maxOctets?: number },
): EntreeJournal[];
export function vueDeLHistorique(
  faits: unknown,
  journal: unknown,
  opts?: { max?: number },
): LigneHistorique[];
