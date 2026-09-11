// Types pour lib/backlog-triage.mjs (V75 · CP5 — triage de l'arriéré).
import type { FicheMemoire } from './learner-memory';

export type ClasseTriage = 'URGENT' | 'IMPORTANT' | 'DEFERRABLE' | 'PARKED';
export type Placement = 'actif' | 'differe' | 'gare';

export const CLASSES_TRIAGE: readonly ClasseTriage[];
export const PLACEMENTS: readonly Placement[];
export const STATUTS_EN_RETARD: readonly string[];
export const CAPACITE_ACTIVE_DEFAUT: number;

export interface NotionTriage {
  id: string;
  statut: string;
  minutes: number;
  score: number;
  classe: ClasseTriage;
  placement: Placement;
  /** Phrase lisible, sans jargon moteur. Jamais vide. */
  raison: string;
  /** Renseigné pour `PARKED` uniquement : la condition qui lève le garage. */
  conditionDeRetour: string | null;
  bloqueePar?: string[];
}

/** `BACKLOG_PRESSURE` — cinq facteurs nommés. **Jamais un score** (§2). */
export interface Pression {
  bloquantes: number;
  echecsNonRepris: number;
  volume: number;
  minutesRequises: number;
  anciennete: number;
}

export interface ResultatTriage {
  total: number;
  notions: NotionTriage[];
  compte: Record<ClasseTriage, number>;
  placement: Record<Placement, number>;
  pression: Pression;
  soupape: boolean;
  capaciteActive: number;
}

export function trierArriere(input: {
  fiches?: FicheMemoire[];
  dueAtOf?: (id: string) => string | null;
  statutDe?: (f: FicheMemoire, dueAt: string | null, now: string) => string;
  estEssentielle?: (id: string) => boolean;
  prerequisDe?: (id: string) => string[];
  minutesDe?: (id: string) => number;
  scoreDe?: (id: string) => number;
  besoinDe?: (id: string) => { inDays: number } | null;
  capaciteActive?: number;
  now: string;
}): ResultatTriage;

export function notionsEssentielles(input: {
  jourCourant?: number;
  horizon?: number;
  leconsDuJour?: (j: number) => string[];
  prerequisDe?: (id: string) => string[];
}): Set<string>;
