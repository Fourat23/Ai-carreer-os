#!/usr/bin/env node
// Validation des données du glossaire. Lance : npm run glossary:check
// Vérifie le schéma via lib/glossary-core.mjs (id/terme dupliqués, définitions,
// catégories/niveaux contrôlés, relations existantes, alias, champs obligatoires)
// et affiche un petit rapport de couverture. Échoue (exit 1) au moindre problème.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateGlossary, CATEGORIES, LEVELS, isAmbiguous } from '../lib/glossary-core.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(ROOT, 'curriculum', 'glossary', 'glossary.json');

let entries;
try {
  entries = JSON.parse(readFileSync(path, 'utf8'));
} catch (e) {
  console.error(`❌ Impossible de lire/parser ${path} : ${e.message}`);
  process.exit(1);
}

const { errors } = validateGlossary(entries);

// Rapport de couverture (informatif).
const byCat = new Map(CATEGORIES.map((c) => [c.id, 0]));
let acronyms = 0, plain = 0, ambiguous = 0;
for (const e of entries) {
  if (byCat.has(e.category)) byCat.set(e.category, byCat.get(e.category) + 1);
  if (e.fullForm) acronyms++; else plain++;
  if (isAmbiguous(e)) ambiguous++;
}

console.log('── Validation du glossaire IT ──');
console.log(`Entrées                : ${entries.length}`);
console.log(`  acronymes (fullForm) : ${acronyms}`);
console.log(`  termes non acronymes : ${plain}`);
console.log(`  termes ambigus       : ${ambiguous}`);
console.log('Couverture par catégorie :');
for (const c of CATEGORIES) console.log(`  ${c.label.padEnd(34)} : ${byCat.get(c.id)}`);
console.log(`Niveaux autorisés       : ${LEVELS.join(', ')}`);

if (errors.length) {
  console.log(`\n❌ ${errors.length} problème(s) de données :`);
  for (const e of errors.slice(0, 60)) console.log(`   - ${e}`);
  if (errors.length > 60) console.log(`   … et ${errors.length - 60} autres`);
  process.exit(1);
}
console.log('\n✅ Glossaire valide : schéma, catégories, niveaux, relations et unicité OK.');
