// V77 · CP3 — types du fait d'USAGE (module pur `lib/usage-event.mjs`).
//
// Ce type est délibérément pauvre. Il ne porte AUCUN champ d'issue : pas de
// `passed`, pas de `success`, pas de `score`. C'est la contrainte n°5 du
// contrat gelé (CP1 §3.4), et elle est vérifiable ici, à la compilation.
export type SurfaceUsage = 'terminal' | 'pipelines';
export type ActionUsage = 'run';

export const SURFACES_USAGE: readonly SurfaceUsage[];
export const ACTIONS_USAGE: readonly ActionUsage[];
export const MAX_USAGE_EVENTS: number;
export const CHAMPS_INTERDITS: readonly string[];

export type UsageEvent = {
  at: string;
  surface: SurfaceUsage;
  action: ActionUsage;
  /** Ce qui a été utilisé — identifiant de tâche, de pipeline. */
  ref: string;
  /**
   * Faits observés SEULEMENT, par liste blanche. Un champ absent de cette
   * liste n'entre pas dans l'événement, même si l'appelant l'envoie.
   */
  detail: {
    adapter?: string;
    exitCode?: number;
    durationMs?: number;
    disponible?: boolean;
  };
  provenance: { producer: string; method: string };
  schemaVersion: 1;
};

export type LectureDUsage = {
  surface: string;
  executions: number;
  refsDistinctes: string[];
  premier: string | null;
  dernier: string | null;
  /** Toujours `false` : un usage ne vaut jamais une réussite. */
  vautReussite: false;
  lecture: string;
};

export function normalizeUsageEvent(raw: unknown, o?: { now?: string | null }): UsageEvent | null;
export function usageEventKey(e: UsageEvent): string;
export function normalizeUsageEvents(list: unknown): UsageEvent[];
export function usageDe(events: unknown, surface: string): LectureDUsage;
