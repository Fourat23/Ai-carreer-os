// CP8 — retour riche sur les tests, indices statiques, anti-fuite des tests privés.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeDiff } from '../lib/test-diff.mjs';
import { hintForDiagnostic, hasHint } from '../lib/ts-hints.mjs';
import { splitAttempt } from '../lib/lab-feedback.mjs';
import { buildIndex, search } from '../lib/search.mjs';

// ── Diff structuré ───────────────────────────────────────────────────────────
test('describeDiff : primitifs', () => {
  assert.deepEqual(describeDiff(5, 3), [{ path: '', kind: 'value', expected: 5, actual: 3 }]);
  assert.deepEqual(describeDiff('a', 'a'), []);
});

test('describeDiff : type différent', () => {
  const d = describeDiff(5, '5');
  assert.equal(d[0].kind, 'type');
});

test('describeDiff : tableau (longueur + éléments)', () => {
  const d = describeDiff(['a', 'b'], ['a', 'c', 'x']);
  assert.ok(d.some((x) => x.kind === 'length'));
  assert.ok(d.some((x) => x.path === '[1]' && x.expected === 'b' && x.actual === 'c'));
});

test('describeDiff : objet imbriqué', () => {
  const d = describeDiff({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 9 } });
  assert.deepEqual(d, [{ path: 'b.c', kind: 'value', expected: 2, actual: 9 }]);
});

test('describeDiff : borné (maxItems)', () => {
  const e = {}, a = {};
  for (let i = 0; i < 50; i++) { e['k' + i] = i; a['k' + i] = i + 1; }
  assert.equal(describeDiff(e, a, 5).length, 5);
});

// ── Indices statiques ────────────────────────────────────────────────────────
test('hintForDiagnostic : codes TS connus', () => {
  assert.match(hintForDiagnostic(2322), /Type incompatible/);
  assert.match(hintForDiagnostic(7006), /implicite/);
  assert.match(hintForDiagnostic(2307), /relatifs/);
});

test('hintForDiagnostic : codes internes du Lab', () => {
  assert.match(hintForDiagnostic('LAB_IMPORT'), /Import interdit/);
  assert.match(hintForDiagnostic('LAB_REFERENCE'), /triple-slash/);
});

test('hintForDiagnostic : code inconnu → null', () => {
  assert.equal(hintForDiagnostic(999999), null);
  assert.equal(hintForDiagnostic(null), null);
  assert.equal(hasHint(2322), true);
  assert.equal(hasHint(999999), false);
});

// ── Anti-fuite : tests privés jamais exposés en détail ───────────────────────
const attempt = {
  total: 3, passed: 2, allPassed: false, durationMs: 12,
  results: [
    { testId: 'p1', name: 'public 1', passed: true, expected: 1, actual: 1, message: 'OK', durationMs: 0 },
    { testId: 'p2', name: 'public 2', passed: false, expected: 2, actual: 9, message: 'attendu 2, obtenu 9', durationMs: 1 },
    { testId: 's1', name: 'SECRET privé', passed: false, expected: 'REPONSE_SECRETE', actual: 'MAUVAIS', message: 'attendu REPONSE_SECRETE', durationMs: 0 },
  ],
};

test('splitAttempt : ne renvoie que les publics + un agrégat privé', () => {
  const { publicResults, privateSummary } = splitAttempt(attempt, new Set(['s1']));
  assert.equal(publicResults.length, 2);
  assert.deepEqual(publicResults.map((r) => r.testId), ['p1', 'p2']);
  assert.deepEqual(privateSummary, { total: 1, passed: 0 });
});

test('splitAttempt : aucune donnée privée (nom/attendu/reçu/message) ne fuit', () => {
  const { publicResults, privateSummary } = splitAttempt(attempt, new Set(['s1']));
  const blob = JSON.stringify({ publicResults, privateSummary });
  assert.equal(blob.includes('REPONSE_SECRETE'), false);
  assert.equal(blob.includes('MAUVAIS'), false);
  assert.equal(blob.includes('SECRET privé'), false);
  assert.equal(blob.includes('s1'), false);
});

test('splitAttempt : sans test privé → pas d’agrégat', () => {
  const { publicResults, privateSummary } = splitAttempt(attempt, new Set());
  assert.equal(publicResults.length, 3);
  assert.equal(privateSummary, null);
});

// ── Palette globale : trouve les exercices TS, SANS indexer leur contenu ─────
const program = {
  days: [{ day: 36, title: 'TypeScript', skillName: 'TS', week: 6, month: 2 }],
  weeks: [], months: [], skills: [], lessons: [],
};
const catalogue = { tracks: [], modules: {}, technologies: [] };
// Résumés PUBLICS uniquement (comme la projection serveur) — jamais de code.
const exSummaries = [
  { id: 'ts-inventory', title: 'TypeScript : valeur d’un inventaire', skills: ['typescript', 'javascript'], language: 'typescript', runtimeLabel: 'TypeScript', difficulty: 3 },
  { id: 'ts-async-double', title: 'TypeScript : fonction asynchrone', skills: ['typescript'], language: 'typescript', runtimeLabel: 'TypeScript', difficulty: 2 },
];

test('buildIndex : indexe les exercices (métadonnées publiques) avec href /lab/', () => {
  const items = buildIndex(program, catalogue, exSummaries);
  const ex = items.filter((i) => i.type === 'exercise');
  assert.equal(ex.length, 2);
  assert.ok(ex.every((i) => i.href.startsWith('/lab/')));
  assert.match(ex[0].subtitle, /Exercice/);
});

test('search : la palette trouve un exercice TS par titre / compétence', () => {
  const items = buildIndex(program, catalogue, exSummaries);
  assert.ok(search(items, 'inventaire').some((i) => i.href === '/lab/ts-inventory'));
  assert.ok(search(items, 'asynchrone').some((i) => i.href === '/lab/ts-async-double'));
});

test('buildIndex : aucun code / solution / test privé indexé', () => {
  const items = buildIndex(program, catalogue, exSummaries);
  const blob = JSON.stringify(items);
  // Métadonnées publiques présentes, mais jamais de code ni de contenu privé.
  assert.equal(/export function|reduce\(|solution\.ts|REPONSE_SECRETE|=> \{|await fetchUser/.test(blob), false);
});
