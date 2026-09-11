import type { FicheMemoire } from './learner-memory';

export interface Priorite {
  id: string; score: number; statut: string; eligible: boolean;
  facteurs: { id: string; points: number; valeur: unknown; libelle: string }[];
  pourquoiFacteurs: string[];
  pourquoi: string;
}
export declare const POIDS: Record<string, number>;
export declare const POIDS_TOTAL: number;
export declare const FENETRE_SOON: number;
export declare const TOLERANCE_DUE: number;
export declare const HORIZON_JOURS: number;
export declare function statutDe(fiche: FicheMemoire, dueAt: string | null, now: string): string;
export declare function prioriteDe(
  fiche: FicheMemoire, options: { dueAt?: string | null; now: string },
): Priorite;
export declare function prioriser(
  fiches: FicheMemoire[],
  options?: { dueAtOf?: (id: string) => string | null; now?: string; limit?: number | null },
): Priorite[];
export declare function comptesParStatut(
  fiches: FicheMemoire[],
  options?: { dueAtOf?: (id: string) => string | null; now?: string },
): Record<string, number>;
