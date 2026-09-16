// Types de `lib/session-trace.mjs` (V77.1 · CP4).
import type { FixturePilote } from './pilot-scope';

export type GenreDeManque =
  | 'ETAPE_ABSENTE' | 'CHAMP_ABSENT' | 'AMBIGUITE'
  | 'ORDRE_INDETERMINE' | 'IDENTITE_ABSENTE' | 'CONCEPT_MULTIPLE';

export type Manque = { genre: GenreDeManque; etape: string | null; quoi: string };

export type EtapeReconstruite = {
  id: string;
  n: number;
  concept: string | null;
  fait: string | null;
  at: string | null;
  resultat: string;
  provenance?: { producer: string; method?: string; note?: string } | null;
  sourceRef?: string | null;
  cle?: string | null;
  concepts?: string[];
  origineDuConcept?: 'fait' | 'fixture' | null;
  occurrences?: number;
  raison?: string;
};

export type IdentiteReconstruite = {
  sessionId: string | null;
  protocolVersion: string | null;
  scopeId: string | null;
  exportedAt: string | null;
};

export type Reconstruction = {
  etapes: EtapeReconstruite[];
  manques: Manque[];
  reconstructible: boolean;
  identite: IdentiteReconstruite;
  conceptsDerivesDeLaFixture?: string[];
};

export declare const GENRES_DE_MANQUE: readonly GenreDeManque[];
export declare const CODES_DE_DONNEE_MANQUANTE: readonly string[];

export declare function parcoursDeLArchive(archive: unknown): Record<string, unknown> | null;
export declare function instantDuFait(genre: string, f: unknown): string | null;
export declare function cleDuFait(genre: string, f: unknown): string | null;
export declare function reconstruireLaSession(archive: unknown, fixture: FixturePilote): Reconstruction;
export declare function resultatDuFait(genre: string, f: unknown): string;
export declare function delaiEnHeures(etapes: EtapeReconstruite[], idA: string, idB: string): number | null;
export declare function verdictDuDelai(heures: number | null, fenetre: number[]): string;
