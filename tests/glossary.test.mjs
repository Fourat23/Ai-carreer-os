// Tests du glossaire IT : validation du schéma + logique de recherche/filtre.
// Zéro dépendance : node:test natif. Lance : npm test
// La logique testée est celle réellement utilisée par l'app et le script
// de validation (lib/glossary-core.mjs) — pas une réimplémentation.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  validateGlossary, filterEntries, entryMatches, normalizeText,
  isAmbiguous, sortEntries, CATEGORIES, LEVELS,
} from '../lib/glossary-core.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const entries = JSON.parse(readFileSync(join(ROOT, 'curriculum', 'glossary', 'glossary.json'), 'utf8'));

const byId = (id) => entries.find((e) => e.id === id);

test('glossaire : chargement et volume minimal', () => {
  assert.ok(Array.isArray(entries), 'doit être un tableau');
  assert.ok(entries.length >= 15, `attendu >= 15 entrées, obtenu ${entries.length}`);
});

test('glossaire : schéma valide (aucune erreur de validation)', () => {
  const { errors } = validateGlossary(entries);
  assert.deepEqual(errors, [], `erreurs de validation :\n${errors.join('\n')}`);
});

test('glossaire : ids uniques', () => {
  const ids = entries.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length, 'des ids sont dupliqués');
});

test('glossaire : la validation détecte un id dupliqué', () => {
  const dup = [
    { ...entries[0] },
    { ...entries[0] }, // même id → doit être signalé
  ];
  const { errors } = validateGlossary(dup);
  assert.ok(errors.some((e) => e.includes('id dupliqué')), 'un id dupliqué doit être détecté');
});

test('glossaire : la validation détecte une catégorie et un niveau invalides', () => {
  const bad = [{ ...entries[0], id: 'x-bad', term: 'ZZBAD', category: 'inexistante', level: 'expert' }];
  const { errors } = validateGlossary(bad);
  assert.ok(errors.some((e) => e.includes('catégorie invalide')), 'catégorie invalide non détectée');
  assert.ok(errors.some((e) => e.includes('niveau invalide')), 'niveau invalide non détecté');
});

test('glossaire : la validation détecte une relation vers un id inexistant', () => {
  const bad = [{ ...entries[0], id: 'x-rel', term: 'ZZREL', relatedTerms: ['id-qui-nexiste-pas'] }];
  const { errors } = validateGlossary(bad);
  assert.ok(errors.some((e) => e.includes('id inexistant')), 'relation cassée non détectée');
});

test('glossaire : la validation détecte un champ obligatoire manquant', () => {
  const bad = [{ ...entries[0], id: 'x-miss', term: 'ZZMISS', shortDefinition: '' }];
  const { errors } = validateGlossary(bad);
  assert.ok(errors.some((e) => e.includes('shortDefinition') || e.includes('définition courte')),
    'champ obligatoire manquant non détecté');
});

test('catégories : toutes celles utilisées sont contrôlées', () => {
  const catIds = new Set(CATEGORIES.map((c) => c.id));
  for (const e of entries) assert.ok(catIds.has(e.category), `catégorie inconnue: ${e.category} (${e.id})`);
});

test('niveaux : tous ceux utilisés sont contrôlés', () => {
  for (const e of entries) assert.ok(LEVELS.includes(e.level), `niveau inconnu: ${e.level} (${e.id})`);
});

test('recherche : par acronyme (insensible à la casse)', () => {
  assert.ok(entryMatches(byId('dev-api'), 'api'));
  assert.ok(entryMatches(byId('dev-api'), 'API'));
});

test('recherche : par forme développée', () => {
  const r = filterEntries(entries, { query: 'application programming interface' });
  assert.ok(r.some((e) => e.id === 'dev-api'), 'API introuvable via sa forme développée');
});

test('recherche : par traduction française', () => {
  const r = filterEntries(entries, { query: 'retour arriere' });
  assert.ok(r.some((e) => e.id === 'prod-rollback'), 'rollback introuvable via son français');
});

test('recherche : insensible aux accents', () => {
  // "développement" doit matcher via "developpement" (sans accents)
  const withAccent = filterEntries(entries, { query: 'développement' });
  const withoutAccent = filterEntries(entries, { query: 'developpement' });
  assert.deepEqual(
    withoutAccent.map((e) => e.id).sort(),
    withAccent.map((e) => e.id).sort(),
    'la recherche doit ignorer les accents',
  );
  assert.ok(withoutAccent.length > 0, 'devrait trouver des entrées liées au développement');
});

test('recherche : par alias', () => {
  // "RESTful" est un alias de REST
  const r = filterEntries(entries, { query: 'restful' });
  assert.ok(r.some((e) => e.id === 'dev-rest'), 'REST introuvable via son alias');
});

test('recherche : par tag', () => {
  const r = filterEntries(entries, { query: 'conteneurs' });
  assert.ok(r.some((e) => e.tags?.includes('conteneurs')), 'aucune entrée trouvée via un tag');
});

test('filtre : par catégorie', () => {
  const r = filterEntries(entries, { category: 'git' });
  assert.ok(r.length > 0);
  assert.ok(r.every((e) => e.category === 'git'), 'le filtre catégorie laisse passer une autre catégorie');
});

test('filtre : par niveau', () => {
  const r = filterEntries(entries, { level: 'débutant' });
  assert.ok(r.length > 0);
  assert.ok(r.every((e) => e.level === 'débutant'), 'le filtre niveau laisse passer un autre niveau');
});

test('ambiguïté : PR est marqué ambigu et documente plusieurs sens', () => {
  const pr = byId('git-pr');
  assert.ok(pr, 'entrée PR absente');
  assert.ok(isAmbiguous(pr), 'PR devrait être ambigu');
  assert.ok((pr.senses ?? []).length >= 2, 'PR devrait documenter au moins 2 sens');
});

test('état vide : une recherche sans correspondance ne retourne rien', () => {
  const r = filterEntries(entries, { query: 'zzzzz-terme-inexistant-xyz' });
  assert.equal(r.length, 0, "une recherche absurde devrait renvoyer un ensemble vide");
});

test('tri : alphabétique stable insensible à la casse/accents', () => {
  const sorted = sortEntries(entries).map((e) => normalizeText(e.term));
  const manual = [...sorted].sort((a, b) => a.localeCompare(b, 'fr'));
  assert.deepEqual(sorted, manual, 'le tri devrait être alphabétique normalisé');
});
