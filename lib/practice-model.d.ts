// Types pour lib/practice-model.mjs (carte canonique des surfaces de pratique).
export type NiveauDePreuve = 'DECLARED' | 'OBSERVED' | 'VALIDATED';
export type PolitiqueDeFait = 'FACT_REQUIRED' | 'USAGE_ONLY' | 'NO_FACT';
export type Activite =
  | 'EXECUTABLE' | 'ASSESSMENT' | 'ARTIFACT_ANALYSIS' | 'STRUCTURED_SUBMISSION'
  | 'SIMULATED_EXPLORATION' | 'BOUNDED_DEMONSTRATION' | 'REFERENCE_CONTENT' | 'EXTERNAL_WORK';

export type EntreeDeCarte = {
  activite: Activite;
  observation: string;
  politique: PolitiqueDeFait;
  typeFait: string | null;
  niveauMax: NiveauDePreuve | null;
  simulation: boolean;
  concepts?: string;
  competences?: string;
  existant?: boolean;
  implemente?: boolean;
  lecture?: boolean;
  justification: string;
};

export const NIVEAUX: readonly NiveauDePreuve[];
export const POLITIQUES: readonly PolitiqueDeFait[];
export const ACTIVITES: readonly Activite[];
export const SURFACES: Readonly<Record<string, EntreeDeCarte>>;
export const SURFACES_DE_LECTURE: readonly string[];
export const FAITS_NOUVEAUX: readonly string[];
export const FAITS_EXISTANTS: readonly string[];

export function rangDuNiveau(n: unknown): number;
export function maillonFaible(niveaux: unknown): NiveauDePreuve | null;
export function compteDansLesMoteurs(niveau: unknown): boolean;
export function politiqueDe(surfaceId: string): EntreeDeCarte | null;
export function peutEcrireUnFait(surfaceId: string): boolean;
export function niveauMaximal(surfaceId: string): NiveauDePreuve | null;
export function niveauAutorise(surfaceId: string, niveau: unknown): boolean;
export function estSimulee(surfaceId: string): boolean;
export function surfacesDePratique(): string[];
export function incoherences(): string[];
