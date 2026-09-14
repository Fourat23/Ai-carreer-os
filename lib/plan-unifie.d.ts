// Types pour lib/plan-unifie.mjs (V75 · CP11 — le plan unique).
import type { Mode } from './recovery-mode';
import type { Pression } from './backlog-triage';

export type Nature = 'NEW' | 'REVIEW' | 'REMEDIATION' | 'TRANSFER' | 'PROJECT';
export type StatutBloc = 'inclus' | 'reduit' | 'differe' | 'suspendu' | 'recommande-pause';

export const NATURES: readonly Nature[];
export const STATUTS_BLOC: readonly StatutBloc[];
/** L'ordre d'ARBITRAGE par mode — servir dans cet ordre, c'est arbitrer. */
export const ORDRE: Readonly<Record<Mode, readonly Nature[]>>;

export interface BlocDuPlan {
  nature: Nature;
  libelle: string;
  /** Minutes ACCORDÉES. Leur somme n'excède jamais le budget de la journée. */
  minutes: number;
  /** Minutes DEMANDÉES. L'écart avec `minutes` est ce que l'arbitrage a coupé. */
  demande: number;
  statut: StatutBloc;
  /** En clair, sans jargon. Un bloc modifié sans raison est incontestable. */
  pourquoi: string;
}

export interface PlanUnifie {
  mode: Mode;
  budget: {
    journee: number;
    curriculum: number | null;
    demande: number;
    /** `accorde ≤ journee`, toujours. La récupération ne crée pas de temps. */
    accorde: number;
    restant: number;
    journeeLourde: boolean;
    /** Minutes que la journée ne peut pas donner. Publiées, jamais effacées. */
    nonPlacees: number;
  };
  blocs: BlocDuPlan[];
  /** §11.4 — `TOTAL`, `ACTIVE` et `PARKED` restent distincts de bout en bout. */
  arriere: { total: number; actif: number; differe: number; gare: number };
  ordre: readonly Nature[];
  /** §11.5 — une phrase humaine par modification du plan. */
  explications: string[];
  modifie: boolean;
}

export function planUnifie(input?: {
  mode?: Mode;
  chargeHaut?: number | null;
  budgetJournee?: number;
  demande?: Partial<Record<Nature, number>>;
  arriere?: { total?: number; actif?: number; differe?: number; gare?: number };
  pression?: Partial<Pression>;
  projetAujourdhui?: boolean;
  minutesTransfert?: number;
}): PlanUnifie;

export function explicationsDe(input: {
  mode: Mode; blocs: BlocDuPlan[]; pression?: Partial<Pression>;
  journeeLourde?: boolean; charge?: number | null; plafond?: number;
}): string[];
