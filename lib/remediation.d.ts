import type { ExerciseAttempt } from './exercise-attempt';

export type RemediationAction =
  | 'SOUS_PROBLEME'
  | 'MODELE_MENTAL'
  | 'INDICE'
  | 'EXEMPLE_ANALOGUE'
  | 'EXERCICE_PLUS_SIMPLE'
  | 'CORRECTION_COMPLETE'
  | 'TENTATIVE_DIFFEREE';

export type PointeurKind = 'test' | 'section' | 'misconception' | 'exercise' | 'diagnostic' | 'reference' | 'delai';

export interface RemediationDecision {
  action: RemediationAction;
  /** Rang dans l'échelle : nombre d'échecs pédagogiques consécutifs. */
  niveau: number;
  consigne: string;
  pointeur: { kind: PointeurKind; ref: string | null };
  minutes: number;
  /** Phrase lisible expliquant POURQUOI cette marche (critère B10). */
  raison: string;
  /** Ce qui suivrait si cette marche ne suffisait pas, ou `null` au bout. */
  prochaine: RemediationAction | null;
  note: string | null;
  /** Uniquement pour `TENTATIVE_DIFFEREE`, et `null` si `now` n'est pas fourni. */
  reprendreApres: string | null;
}

export interface SerieEchecs {
  niveau: number;
  progression: boolean;
  dernier: ExerciseAttempt | null;
  masses: number;
  tentatives: number;
}

export interface ExerciceCandidat {
  id: string;
  title?: string;
  difficulty?: number;
  skills?: string[];
}

export declare const ACTIONS: RemediationAction[];
export declare const MINUTES_PAR_ACTION: Record<RemediationAction, number>;
export declare const FENETRE_MASSAGE_MIN: number;
export declare const ECHECS_MASSES: number;
export declare const DELAI_REPRISE_HEURES: number;
export declare const NIVEAU_CORRECTION: number;

export declare function serieEchecs(
  attempts: ExerciseAttempt[],
  exerciseId: string,
  options?: { now?: string | null },
): SerieEchecs;

export declare function plusSimpleParmi<T extends ExerciceCandidat>(
  candidats: T[],
  exercice: ExerciceCandidat,
): T | null;

export declare function remedier(input: {
  attempts?: ExerciseAttempt[];
  exerciseId: string;
  now?: string | null;
  sections?: Partial<Record<'modeleMental' | 'erreurs' | 'antipatterns' | 'exempleGuide' | 'exempleApplique' | 'correction', boolean>>;
  misconception?: { id?: string; right?: string } | null;
  voisinPlusSimple?: { id: string; title?: string } | null;
  testsEchoues?: ({ name?: string } | string)[];
  diagnostic?: string | null;
  correctionVue?: boolean;
}): RemediationDecision | null;

export declare function prochaineMarche(niveau: number): RemediationAction;

export declare function leconUnique(
  slugsDeclarants: string[],
  slugsParJournee: string[],
): { slug: string; via: 'declaration' | 'journee' } | null;
