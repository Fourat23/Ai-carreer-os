import type { FicheMemoire } from './learner-memory';

export interface Echeance { dueAt: string; intervalDays: number; basis: string }
export interface ItemPlanifie {
  id: string; score: number; statut: string; dueAt: string | null; intervalDays: number | null;
  basis: string; format: string; formatLabel: string; prompt: string; raisonForme: string;
  minutes: number; pourquoi: string; pourquoiFacteurs: string[]; facteurs: Record<string, unknown>[];
}
export interface Seance {
  date: string | null; budgetMinutes: number; minutesPlanifiees: number;
  items: ItemPlanifie[];
  differes: { id: string; score: number; statut: string; motif: string }[];
  raisonArret: string;
}

export declare const MINUTES_PAR_FORME: Record<string, number>;
export declare const BUDGET_DEFAUT: number;
export declare const PLAFOND_UNITES: number;
export declare const PLACES_DECOUVERTE: number;

export declare function echeanceDe(fiche: FicheMemoire | undefined): Echeance | null;
export declare function formeDe(
  fiche: FicheMemoire, formats: string[], recall: unknown,
): { format: string; raison: string } | null;
export declare function planifier(
  fiches: FicheMemoire[],
  options?: {
    now?: string; budgetMinutes?: number;
    formatsOf?: (id: string) => string[];
    recallOf?: (id: string) => unknown;
    plafond?: number;
    echeanceDeOf?: (fiche: FicheMemoire) => Echeance | null;
  },
): Seance;
export declare function prochaineEcheance(
  fiche: FicheMemoire, issue: string, at: string,
): { dueAt: string; intervalDays: number };
export declare function statutDe(fiche: FicheMemoire, dueAt: string | null, now: string): string;
