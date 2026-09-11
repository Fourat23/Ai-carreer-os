// Types pour lib/catchup-plan.mjs (V75 · CP7 — plan de rattrapage).
import type { NotionTriage } from './backlog-triage';

export const HORIZON_PLAN: number;
export const CLASSES_PLANIFIABLES: readonly string[];

export interface UniteDuPlan {
  id: string;
  minutes: number;
  classe: string;
  raison: string;
}

export interface JourDuPlan {
  rang: number;
  date: string | null;
  minutes: number;
  unites: UniteDuPlan[];
  /** La raison de la journée, en clair, deux facteurs au plus. */
  pourquoi: string;
}

export interface Couverture {
  /** Journées de travail pour que chaque notion repasse UNE fois. `null` si nul. */
  jours: number | null;
  /** Un fait de DÉBIT, jamais une promesse de maîtrise (`R10`). */
  phrase: string;
}

export interface PlanRattrapage {
  horizon: number;
  jours: JourDuPlan[];
  /** Ce que le plan propose sur l'horizon. */
  couvertes: number;
  /** Ce qu'il ne propose pas, et qui reste dû. */
  restantes: number;
  /** Bloquées par un prérequis : hors plan, mais comptées dans `total`. */
  garees: number;
  total: number;
  rythme: number;
  couverture: Couverture;
  abandonnable: boolean;
  recalculeChaqueJour: boolean;
}

/**
 * **Aucun paramètre ne décrit un plan antérieur** : la fonction ne peut pas
 * savoir qu'une journée a été manquée, donc pas le reprocher (§1.3).
 */
export function planDeRattrapage(input?: {
  notions?: NotionTriage[];
  minutesParJour?: number;
  unitesParJour?: number;
  horizon?: number;
  now?: string | null;
}): PlanRattrapage;

export function couvertureDe(planifiables: number, rythme: number, garees?: number): Couverture;
