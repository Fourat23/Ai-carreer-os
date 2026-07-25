// Tests de la recherche locale pure (lib/search.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, tokenize, buildIndex, parseJump, search } from '../lib/search.mjs';

const program = {
  days: [
    { day: 241, title: 'Chunking : comparaison objective', skillName: 'RAG', week: 35, month: 9 },
    { day: 7, title: 'Revue hebdomadaire', skillName: 'Git / Linux', week: 1, month: 1 },
  ],
  weeks: [{ week: 35, theme: 'RAG avancé', month: 9 }],
  months: [{ month: 9, title: 'RAG en production', summary: 'Retrieval', project: { id: 6, name: 'DocQA' } }],
  skills: [{ id: 'rag', name: 'RAG' }, { id: 'py', name: 'Python' }],
  lessons: [{ slug: 'embeddings', title: 'Embeddings', cat: 'IA appliquée' }],
};

test('normalize / tokenize', () => {
  assert.equal(normalize('  Évaluation   IA '), 'evaluation ia');
  assert.deepEqual(tokenize('RAG : chunking'), ['rag', 'chunking']);
});

test('buildIndex : couvre pages, commandes et contenu', () => {
  const idx = buildIndex(program, { resumeDay: 241 });
  const types = new Set(idx.map((i) => i.type));
  for (const t of ['command', 'page', 'day', 'week', 'month', 'skill', 'project', 'lesson']) assert.ok(types.has(t), `type ${t} présent`);
  assert.ok(idx.some((i) => i.title.includes('Reprendre le jour 241') && i.href === '/day/241'));
});

test('parseJump : jour / semaine / mois', () => {
  assert.equal(parseJump('jour 241').href, '/day/241');
  assert.equal(parseJump('j241').href, '/day/241');
  assert.equal(parseJump('semaine 35').href, '/week/35');
  assert.equal(parseJump('mois 9').href, '/month/9');
  assert.equal(parseJump('jour 999'), null); // hors bornes
  assert.equal(parseJump('rag'), null);
});

test('search : jump placé en tête', () => {
  const idx = buildIndex(program, { resumeDay: 241 });
  const r = search(idx, 'jour 241');
  assert.equal(r[0].href, '/day/241');
  assert.equal(r[0].id.startsWith('jump:'), true);
  // pas de doublon du même href
  assert.equal(r.filter((x) => x.href === '/day/241' && x.id.startsWith('jump:')).length, 1);
});

test('search : par titre et par compétence', () => {
  const idx = buildIndex(program, {});
  const chunk = search(idx, 'chunking');
  assert.ok(chunk.some((r) => r.href === '/day/241'));
  const rag = search(idx, 'rag');
  assert.ok(rag.some((r) => r.type === 'skill' && r.href === '/skills'));
});

test('search : correspondance exacte avant partielle', () => {
  const idx = buildIndex(program, {});
  const r = search(idx, 'python');
  assert.equal(normalize(r[0].title), 'python'); // le skill exact d'abord
});

test('search : requête vide → commandes seulement', () => {
  const idx = buildIndex(program, { resumeDay: 5 });
  const r = search(idx, '');
  assert.ok(r.length > 0);
  assert.ok(r.every((i) => i.type === 'command'));
});

test('search : aucun résultat', () => {
  const idx = buildIndex(program, {});
  assert.deepEqual(search(idx, 'zzzzxxxx'), []);
});

test('search : classement stable (même score → ordre déterministe)', () => {
  const idx = buildIndex(program, {});
  const a = search(idx, 'mois');
  const b = search(idx, 'mois');
  assert.deepEqual(a.map((x) => x.id), b.map((x) => x.id));
});
