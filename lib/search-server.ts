// Index de recherche STATIQUE, construit UNE fois depuis le programme et le
// catalogue (tous deux immuables). Les métadonnées dynamiques (jour à reprendre,
// révisions dues) ne sont jamais mises en cache ici : elles sont fusionnées par
// requête dans la route, pour rester cohérentes après chaque mutation.
import { getProgram } from './program';
import { getCatalogue } from './catalogue-server';
import { buildIndex } from './search';
import type { SearchItem } from './search';

let cached: SearchItem[] | null = null;

export function getSearchIndex(): SearchItem[] {
  if (!cached) cached = buildIndex(getProgram(), getCatalogue());
  return cached;
}
