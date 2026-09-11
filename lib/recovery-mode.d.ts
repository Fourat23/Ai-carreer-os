// Types pour lib/recovery-mode.mjs (V75 · CP6 — mode de récupération).
import type { Pression } from './backlog-triage';

export type Mode = 'NORMAL' | 'CATCH_UP' | 'RECOVERY' | 'CRITICAL';

export const MODES: readonly Mode[];
export const SEUILS: Readonly<{
  CATCH_UP: { bloquantes: number; echecsNonRepris: number };
  RECOVERY: { bloquantes: number; facteurMinutes: number };
  CRITICAL: { bloquantes: number; facteurMinutes: number };
}>;
export const SORTIE: Readonly<{
  bloquantes: number; echecsNonRepris: number; facteurMinutes: number; joursActifs: number;
}>;
export const PART_REVISION: Readonly<Record<Mode, number>>;

export interface Facteur { id: string; valeur: number }

export interface Sortie { E1: boolean; E2: boolean; E3: boolean; E4: boolean; confirmee: boolean }

export interface Choix {
  id: string;
  libelle: string;
  /** Ce que l'option change, dit en clair. Jamais « appliqué » tout seul. */
  effet: string;
}

export interface Recommandation {
  titre: string | null;
  texte: string | null;
  choix: Choix[];
  /** Toujours `false` : le moteur recommande, il n'impose pas (§1.4). */
  impose: boolean;
}

export interface Allocation {
  nouveau: number;
  revision: number;
  /** Sous-ensemble de `revision`, jamais un ajout : hors de `total`. */
  remediation: number;
  total: number;
  applique?: boolean;
}

export interface Arbitrage {
  mode: Mode;
  actuel: Allocation;
  propose: Allocation & { applique: boolean };
  ecart: { nouveau: number; revision: number; total: number };
  transfert: 'propose' | 'suspendu';
  projet: 'inchange' | 'reportable';
  recommandation: Recommandation;
}

export function conditionsDeSortie(pression: Partial<Pression> | null, budget?: number):
  { E1: boolean; E2: boolean; E3: boolean };

export function modeDe(pression: Partial<Pression> | null, options?: {
  budget?: number;
  pressionJourActifPrecedent?: Partial<Pression> | null;
}): {
  mode: Mode;
  regle: string;
  facteurs: Facteur[];
  /** Vrai quand le mode ne tient qu'à `E4` : aucun seuil n'est franchi aujourd'hui. */
  tenuParE4: boolean;
  phrase: string;
  sortie: Sortie;
};

export function phraseDuMode(mode: Mode, facteurs?: Facteur[]): string;

export function arbitrerLaJournee(input?: {
  mode?: Mode;
  chargeHaut?: number | null;
  minutesReactivation?: number;
  pression?: Partial<Pression> | null;
  budgetJournee?: number;
}): Arbitrage;

export function recommandationDe(mode: Mode, input?: {
  supplement?: number; nouveauPropose?: number; nouveauActuel?: number; echecs?: number;
}): Recommandation;
