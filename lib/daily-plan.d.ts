import type { FicheMemoire } from './learner-memory';
import type { Seance } from './retention-scheduler';

export interface BudgetReactivation { minutes: number; reste: number; motif: string }
export interface SignalCharge {
  niveau: 'ok' | 'vigilance' | 'ralentir';
  message: string | null;
  proposition: string | null;
}
export interface PlanJour {
  date: string | null;
  charge: { curriculumHaut: number | null; budgetJournee: number; depassement: number };
  reactivation: { minutesAccordees: number; minutesReportees: number; motif: string };
  seance: Seance;
  signal: SignalCharge;
}

export declare const BUDGET_JOURNEE: { bas: number; haut: number };
export declare const BUDGET_SEMAINE: number;
export declare const CIBLE_REACTIVATION: number;
export declare const PLANCHER_JOURNEE_CHARGEE: number;
export declare const REPORT_MAX_PAR_JOUR: number;
export declare const SEUIL_ALERTE_ARRIERE: number;

export declare function budgetReactivationDe(
  chargeHaut: number | null,
  options?: { report?: number; cible?: number },
): BudgetReactivation;

export declare function repartirLaSemaine(
  charges: { jour: number; chargeHaut: number }[],
): {
  jours: { jour: number; minutes: number; motif: string }[];
  semaine: { chargeHaute: number; plafond: number; excedent: number; surchargee: boolean; minutesNonPlacees: number };
};

export declare function signalDeCharge(input?: { arriere?: number; tendance?: number | null }): SignalCharge;

export declare function planDuJour(input?: {
  fiches?: FicheMemoire[];
  chargeHaut?: number | null;
  report?: number;
  arriere?: number;
  tendance?: number | null;
  now?: string;
  planifierAvec?: (fiches: FicheMemoire[], options: Record<string, unknown>) => Seance;
  optionsScheduler?: Record<string, unknown>;
}): PlanJour;
