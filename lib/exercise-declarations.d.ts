// V77 · CP8 — types des déclarations de rattachement hors corpus gelé.
export type SourceDeDeclaration =
  | 'auteur-du-curriculum' | 'cite-dans-la-lecon' | 'declare-ailleurs-dans-le-corpus';

export type DeclarationExercice = {
  lessons: string[];
  /** Obligatoire : une déclaration sans source est REFUSÉE, pas corrigée. */
  source: SourceDeDeclaration;
  note: string;
};

export const CHEMIN_DECLARATIONS: string;
export const SOURCES_DECLARATION: readonly SourceDeDeclaration[];
export function normaliserDeclarations(raw: unknown): Record<string, DeclarationExercice>;
