// Chargement du glossaire (curriculum/glossary/glossary.json), côté serveur (fs).
// Les pages Server Components l'importent directement, puis passent les entrées
// au composant client (app/glossary/GlossaryBrowser.tsx).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { GlossaryEntry } from './glossary-core';

export type { GlossaryEntry, GlossaryCategory, GlossarySense } from './glossary-core';
export { CATEGORIES, LEVELS } from './glossary-core';

const ROOT = process.cwd();

let cached: GlossaryEntry[] | null = null;

/** Charge et met en cache les entrées du glossaire. */
export function getGlossary(): GlossaryEntry[] {
  if (cached) return cached;
  const raw = readFileSync(join(ROOT, 'curriculum', 'glossary', 'glossary.json'), 'utf8');
  cached = JSON.parse(raw) as GlossaryEntry[];
  return cached;
}

// ── V62 · CP6 — INDEX LÉGER ───────────────────────────────────────────────
// Mesuré au CP0 : `/glossary` est la route la plus lourde du produit, 1 073 Ko
// d'HTML rendu. Cause : les 711 entrées étaient sérialisées ENTIÈREMENT vers
// le composant client — 17 champs chacune — alors que la liste n'en affiche
// que cinq et que le volet de détail n'en montre qu'une à la fois.
// Payload complet 778 Ko contre 108 Ko pour l'index : sept huitièmes du poids
// existaient pour du texte que personne ne lisait.
//
// La recherche du glossaire ne porte QUE sur term, fullForm, aliases,
// frenchMeaning et tags (cf. `strongText` / `weakText` dans glossary-core) :
// l'index léger filtre donc exactement comme avant, sans approximation.
export type GlossaryIndexEntry = {
  id: string; term: string; fullForm?: string | null; frenchMeaning: string;
  category: string; level: GlossaryEntry['level']; aliases?: string[]; tags?: string[];
  /** Pré-calculé côté serveur : `isAmbiguous` a besoin de `senses`, qui est lourd. */
  ambiguous: boolean;
};

export function getGlossaryIndex(): GlossaryIndexEntry[] {
  return getGlossary().map((e) => ({
    id: e.id, term: e.term, fullForm: e.fullForm, frenchMeaning: e.frenchMeaning,
    category: e.category, level: e.level, aliases: e.aliases, tags: e.tags,
    ambiguous: Boolean((e.senses && e.senses.length > 1) || e.ambiguityNote),
  }));
}

/** Une entrée complète, par id — pour le volet de détail, chargé à la demande. */
export function getGlossaryEntry(id: string): GlossaryEntry | undefined {
  return getGlossary().find((e) => e.id === id);
}
