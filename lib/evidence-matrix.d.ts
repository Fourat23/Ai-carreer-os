// V77 · CP9 — types de la matrice d'unification des preuves.
import type { NiveauDePreuve } from './evidence';

export type Moteur = 'competency' | 'retention' | 'recovery';
export const MOTEURS: readonly Moteur[];

export type LigneDeMatrice = {
  sourceType: string;
  kind: string;
  status: string;
  evidenceLevel: NiveauDePreuve;
  /** Toujours `false` : la simulation ne dégrade aucun niveau (contrat CP1). */
  simulationChangeLeNiveau: false;
  qualifiesFor: Record<Moteur, boolean>;
};

export function qualifiePourLesMoteurs(sourceType: string, validation: unknown): boolean;
export function matriceDesPreuves(): LigneDeMatrice[];
export function resumeParNiveau(lignes?: LigneDeMatrice[]): Record<NiveauDePreuve, number>;
export function combinaisonsQualifiantes(lignes?: LigneDeMatrice[]): string[];
export function incoherencesDeLaMatrice(lignes?: LigneDeMatrice[]): string[];
