// V76 · CP7 — types du fait « aide consultée » (module pur `lib/hint-view.mjs`).
export type ActionAide =
  | 'SOUS_PROBLEME' | 'MODELE_MENTAL' | 'INDICE' | 'EXEMPLE_ANALOGUE'
  | 'EXERCICE_PLUS_SIMPLE' | 'CORRECTION_COMPLETE' | 'TENTATIVE_DIFFEREE';

export const ACTIONS_AIDE: readonly ActionAide[];
export const MAX_HINT_VIEWS: number;

export type HintView = {
  at: string;
  exerciseId: string;
  action: ActionAide;
  niveau: number;
  /** `auto` : servie après un échec · `demandee` : ouverte par l'apprenant. */
  declenchee: 'auto' | 'demandee';
  provenance: { producer: string; method: string };
  schemaVersion: 2;
};

export function normalizeHintView(raw: unknown, o?: { now?: string | null }): HintView | null;
export function hintViewKey(v: HintView): string;
export function normalizeHintViews(list: unknown): HintView[];
export function aidesDe(views: unknown, exerciseId: string): HintView[];
export function actionsVues(views: unknown, exerciseId: string): ActionAide[];

export type ProvenanceReussite = {
  /** Toujours `true` : une réussite n'est jamais retirée. */
  reussite: true;
  aidesConsultees: number;
  actions: ActionAide[];
  correctionVue: boolean;
  lecture: string;
};
export function provenanceDeLaReussite(views: unknown, exerciseId: string): ProvenanceReussite;
