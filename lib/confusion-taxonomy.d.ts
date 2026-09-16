// Types de `lib/confusion-taxonomy.mjs` (V77.1 · CP5).

export type IdDeConfusion =
  | 'INSTRUCTION_UNCLEAR' | 'UI_CONFUSION' | 'CONCEPT_CONFUSION'
  | 'TOOL_CONFUSION' | 'BUG' | 'FATIGUE' | 'OTHER';

export type MomentDuProtocole =
  | 'PRETEST' | 'LESSON' | 'EXERCISE' | 'HINT' | 'RETRIEVAL'
  | 'TRANSFER' | 'EXPORT' | 'HORS_ETAPE';

export type CategorieDeConfusion = {
  id: IdDeConfusion;
  libelle: string;
  question: string;
  exemple: string;
  porte: string;
  action: string;
};

export type RapportDeConfusion = {
  categorie: IdDeConfusion;
  moment: MomentDuProtocole;
  verbatim: string;
  at: string | null;
  sessionId: string | null;
};

export declare const CATEGORIES_DE_CONFUSION: readonly CategorieDeConfusion[];
export declare const IDS_DE_CONFUSION: readonly IdDeConfusion[];
export declare const PART_MAX_EN_AUTRE: number;
export declare const MOMENTS: readonly MomentDuProtocole[];

export declare function normaliserRapportDeConfusion(raw: unknown): RapportDeConfusion | null;
export declare function decompteParCategorie(rapports: unknown[]): Record<IdDeConfusion, number>;
export declare function verdictH6(rapports: unknown[]): {
  verdict: 'H6_TIENT' | 'H6_FALSIFIEE' | 'NOT_OBSERVED';
  part: number | null;
  total: number;
  autres?: number;
};
