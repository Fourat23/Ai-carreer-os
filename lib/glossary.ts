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
