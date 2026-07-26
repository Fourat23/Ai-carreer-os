// CP2 — modèle générique d'exercice de preview web (runtime `web`), pur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateExercise, getRuntimeAdapter, isKnownRuntime } from '../lib/exercise.mjs';
import { detectRuntime, _resetDetectionCache } from '../lib/runtime-detect.mjs';
import { detectLanguage, normalizeExerciseFiles } from '../lib/exercise-files.mjs';

const webEx = (over = {}) => ({
  id: 'web-x', title: 'Web', difficulty: 1, runtime: 'web', language: 'html',
  workspace: {
    entry: 'index.html',
    files: [
      { path: 'index.html', content: '<!doctype html><html><body><h1>Salut</h1></body></html>' },
      { path: 'style.css', content: 'h1{color:red}' },
      { path: 'app.js', content: 'console.log("ok")' },
    ],
  },
  tests: [{ id: 't1', name: 'titre', kind: 'selector-exists', selector: 'h1' }],
  ...over,
});

test('runtime web enregistré (kind web, extensions, preview)', () => {
  assert.equal(isKnownRuntime('web'), true);
  const a = getRuntimeAdapter('web');
  assert.equal(a.kind, 'web');
  assert.equal(a.preview, true);
  assert.equal(a.executable, false);
  assert.deepEqual(a.extensions, ['.html', '.htm', '.css', '.js', '.json']);
  assert.equal(a.entryDefault, 'index.html');
});

test('détection : web toujours disponible (aperçu navigateur)', () => {
  _resetDetectionCache();
  const d = detectRuntime('web');
  assert.equal(d.available, true);
  assert.equal(d.binary, null);
});

test('detectLanguage : html / css', () => {
  assert.equal(detectLanguage('index.html'), 'html');
  assert.equal(detectLanguage('page.htm'), 'html');
  assert.equal(detectLanguage('style.css'), 'css');
  assert.equal(detectLanguage('app.js'), 'javascript');
});

test('validateExercise : exercice web valide', () => {
  const v = validateExercise(webEx());
  assert.equal(v.ok, true, v.errors.join(' ; '));
});

test('validateExercise : entrée non-HTML rejetée', () => {
  const v = validateExercise(webEx({ workspace: { entry: 'app.js', files: [
    { path: 'app.js', content: 'x' }, { path: 'index.html', content: '<html></html>' },
  ] } }));
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => /entrée doit être un HTML/.test(e)));
});

test('validateExercise : extension non autorisée rejetée', () => {
  const v = validateExercise(webEx({ workspace: { entry: 'index.html', files: [
    { path: 'index.html', content: '<html></html>' },
    { path: 'evil.php', content: 'x' },
  ] } }));
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => /non autorisée/.test(e)));
});

test('validateExercise : .json doit être en lecture seule', () => {
  const bad = validateExercise(webEx({ workspace: { entry: 'index.html', files: [
    { path: 'index.html', content: '<html></html>' },
    { path: 'data.json', content: '{}' },
  ] } }));
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /lecture seule/.test(e)));
  const good = validateExercise(webEx({ workspace: { entry: 'index.html', files: [
    { path: 'index.html', content: '<html></html>' },
    { path: 'data.json', content: '{}', readOnly: true },
  ] } }));
  assert.equal(good.ok, true, good.errors.join(' ; '));
});

test('validateExercise : chemins sûrs, pas de doublon (hérité)', () => {
  assert.equal(validateExercise(webEx({ workspace: { entry: 'index.html', files: [
    { path: 'index.html', content: '<html></html>' }, { path: '../evil.html', content: 'x' },
  ] } })).ok, false);
});

test('normalizeExerciseFiles : langages web déduits', () => {
  const files = normalizeExerciseFiles(webEx());
  const byPath = Object.fromEntries(files.map((f) => [f.path, f.language]));
  assert.equal(byPath['index.html'], 'html');
  assert.equal(byPath['style.css'], 'css');
  assert.equal(byPath['app.js'], 'javascript');
});

test('rétrocompat : Node/Python/TypeScript valident toujours', () => {
  const node = { id: 'n', title: 'n', runtime: 'node-js', workspace: { entry: 'solution.mjs', files: [{ path: 'solution.mjs', content: 'export const x=1' }] }, tests: [{ id: 't', name: 't', kind: 'call-equals', export: 'x', expected: 1 }] };
  const py = { id: 'p', title: 'p', runtime: 'python3', workspace: { entry: 'solution.py', files: [{ path: 'solution.py', content: 'x=1' }] }, tests: [{ id: 't', name: 't', kind: 'call-equals', export: 'f', expected: 1 }] };
  const ts = { id: 't', title: 't', runtime: 'typescript', workspace: { entry: 'solution.ts', files: [{ path: 'solution.ts', content: 'export const x=1' }] }, tests: [{ id: 't', name: 't', kind: 'call-equals', export: 'x', expected: 1 }] };
  assert.equal(validateExercise(node).ok, true);
  assert.equal(validateExercise(py).ok, true);
  assert.equal(validateExercise(ts).ok, true);
});
