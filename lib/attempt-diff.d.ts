// Types pour lib/attempt-diff.mjs (comparaison de deux tentatives).
import type { EntreeJournal, TestJournalise } from './attempt-journal';

export const CONTEXTE: number;
export const MAX_LIGNES: number;

export type LigneDiff = { type: '=' | '+' | '-' | '…'; texte: string; avant: number | null; apres: number | null };
export type DiffFichier = {
  chemin?: string;
  identique: boolean;
  lignes: LigneDiff[];
  ajoutees: number;
  retirees: number;
  tronque: boolean;
};
export type TestsChanges = { reussis: string[]; casses: string[]; toujoursKO: string[]; inchanges: string[] };

export type Comparaison =
  | { lisible: false; raison: string }
  | {
    lisible: true;
    de: { at: string; passed: number; total: number; durationMs: number };
    vers: { at: string; passed: number; total: number; durationMs: number };
    ecart: number;
    tests: TestsChanges;
    fichiers: (DiffFichier & { chemin: string })[];
    fichiersModifies: string[];
    aidesEntre: string[];
    lecture: string;
  };

export function testsQuiOntChange(avant: unknown, apres: unknown): TestsChanges;
export function diffDeFichier(
  avant: unknown,
  apres: unknown,
  opts?: { contexte?: number; maxLignes?: number },
): DiffFichier;
export function comparerTentatives(
  a: EntreeJournal | null | undefined,
  b: EntreeJournal | null | undefined,
  opts?: { aidesEntre?: string[] },
): Comparaison;
export type { TestJournalise };
