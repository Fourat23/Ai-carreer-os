export interface FicheMemoire {
  id: string;
  lastExposureAt: string | null;
  firstExposureAt: string | null;
  lastRetrievalAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastEvidenceAt: string | null;
  lastMeaningfulContactAt: string | null;
  successfulRetrievalCount: number;
  failedRetrievalCount: number;
  retrievalCount: number;
  consecutiveSuccesses: number;
  distinctSuccessDays: number;
  successSpanDays: number;
  applications: number;
  /** Preuve validée issue d'un défi de transfert (V74 · CP11). */
  transfers: number;
  /** Contacts sur une journée à ≥ 2 compétences. **N'est PAS du transfert.** */
  cooccurrencesCompetences: number;
  /** Signal silencieux : su, mais jamais hors de son contexte d'origine. */
  jamaisTransfere: boolean;
  currentExpectedLevel: number | null;
  nextCurriculumNeed: { day: number; inDays: number } | null;
  prereqDepth: number | null;
  meaningfulContacts: Record<string, unknown>[];
}

export declare const CONTACT_KINDS: string[];
export declare function collectContacts(facts?: Record<string, unknown>): Record<string, unknown>[];
export declare function projectLearnerMemory(input?: {
  facts?: Record<string, unknown>;
  context?: Record<string, unknown>;
  now?: string;
}): { concepts: FicheMemoire[]; competences: FicheMemoire[] };
export declare function positionDuJour(startDate: string | null, now: string): number | null;
export declare function memoryOf(
  projection: { concepts: FicheMemoire[]; competences: FicheMemoire[] },
  id: string, grain?: string,
): FicheMemoire | null;
