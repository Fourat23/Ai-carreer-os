// Déclarations de types pour lib/glossary-core.mjs (logique pure, partagée JS/TS).

/** Un sens documenté d'un terme ambigu. */
export interface GlossarySense {
  meaning: string;   // ce que ça veut dire
  domain: string;    // domaine où ce sens s'emploie
  hint: string;      // indice pour reconnaître ce sens dans un contexte
  example: string;   // phrase d'exemple pour ce sens
}

/** Une entrée du glossaire. Champs optionnels : fullForm, aliases, relatedTerms,
 *  possibleConfusions, ambiguityNote, senses, tags. */
export interface GlossaryEntry {
  id: string;
  term: string;
  fullForm: string | null;
  frenchMeaning: string;
  category: string;
  level: 'débutant' | 'intermédiaire' | 'avancé';
  shortDefinition: string;
  detailedDefinition: string;
  usageContext: string;
  meetingExample: string;
  plainTranslation: string;
  relatedTerms?: string[];
  aliases?: string[];
  possibleConfusions?: string[];
  ambiguityNote?: string | null;
  senses?: GlossarySense[];
  tags?: string[];
  /** Journées du curriculum où ce terme est enseigné (liens glossaire → cours). */
  days?: number[];
}

export interface GlossaryCategory {
  id: string;
  label: string;
}

export const CATEGORIES: GlossaryCategory[];
export const LEVELS: Array<'débutant' | 'intermédiaire' | 'avancé'>;
export const REQUIRED_FIELDS: string[];

export function normalizeText(s: unknown): string;
export function searchableText(entry: GlossaryEntry): string;
export function entryMatches(entry: GlossaryEntry, query: string): boolean;
/**
 * V62 · CP6 — Ces trois fonctions ne lisent QUE des champs légers : `term`,
 * `fullForm`, `aliases`, `frenchMeaning`, `tags`, `category`, `level`
 * (cf. `strongText` / `weakText`). Elles sont donc génériques sur la forme
 * minimale qu'elles touchent réellement, ce qui permet de les appliquer à
 * l'index léger du glossaire aussi bien qu'aux entrées complètes — sans
 * élargir la signature au-delà de ce que le code lit vraiment.
 */
export type GlossarySearchable = {
  term: string; fullForm?: string | null; frenchMeaning: string;
  category: string; level: string; aliases?: string[]; tags?: string[];
};
export function filterEntries<T extends GlossarySearchable>(
  entries: T[],
  opts?: { query?: string; category?: string; level?: string },
): T[];
export function sortEntries<T extends GlossarySearchable>(entries: T[]): T[];
export function isAmbiguous(entry: GlossaryEntry): boolean;
export function firstLetter(entry: GlossarySearchable): string;
export function validateGlossary(entries: unknown): { errors: string[] };
