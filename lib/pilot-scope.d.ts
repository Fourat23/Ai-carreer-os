// Types de `lib/pilot-scope.mjs` (V77.1 · CP3).

export type StageDeConcept =
  | 'PRETEST_PREREQUISITE' | 'FOCAL' | 'TRANSFER_TARGET' | 'TRANSFER_TARGET_SECOURS';

export type ExerciceDuScope = {
  exerciseId: string;
  role: 'PRINCIPAL' | 'SECOURS';
  difficulty: number;
  tests: number;
  declarants: string[];
  regleDeResolution: string;
  justification: string;
};

export type ConceptDuScope = {
  conceptId: string;
  stage: StageDeConcept;
  lesson: { slug: string; level: number; minutes: number; words: number };
  prerequisites: string[];
  exercises: ExerciceDuScope[];
  retrieval: { formats: string[]; prompts: number } | null;
  transfer: string | null;
  justification: string;
};

export type EtapeDuProtocole = {
  n: number;
  id: string;
  concept: string | null;
  fait: string | null;
  grain: string | null;
  surface: string;
  niveauDePreuveMax: string | null;
};

export type FixturePilote = {
  protocolVersion: string;
  scopeId: string;
  primaryOutcome: string;
  delayedRetrievalDelayHours: number;
  delayedRetrievalWindowHours: [number, number];
  partialAfterHours: number;
  concepts: ConceptDuScope[];
  transfers: { id: string; role: string; lessonRefs: string[]; [k: string]: unknown }[];
  steps: EtapeDuProtocole[];
  pretestRules: Record<string, unknown>;
  fallbackScope: Record<string, unknown>;
  excludedExercises: { exerciseId: string; declarants: string[]; raison: string }[];
  nonResolu: Record<string, unknown>;
};

export type CorpusDuScope = {
  lecons: Set<string>;
  exercices: Set<string>;
  transferts: Set<string>;
  declarantsDe: (id: string) => string[];
  formatsDe: (slug: string) => string[];
};

export declare const ETAPES_DU_PROTOCOLE: readonly string[];
export declare const STAGES_DE_CONCEPT: readonly StageDeConcept[];
export declare const FAITS_ATTENDUS: readonly string[];
export declare const ROLES_EXERCICE: readonly string[];

export declare function incoherencesDuScope(
  fixture: unknown, corpus: CorpusDuScope, protocolVersionAttendue: string,
): string[];
export declare function exercicesDuPilote(fixture: FixturePilote): (ExerciceDuScope & { conceptId: string })[];
export declare function etapeDuProtocole(fixture: FixturePilote, id: string): EtapeDuProtocole | null;
