// CP2 (V12) — modèle générique d'exercice React/TSX (runtime `react-tsx`), pur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateExercise, getRuntimeAdapter, isKnownRuntime } from '../lib/exercise.mjs';
import { detectRuntime, _resetDetectionCache } from '../lib/runtime-detect.mjs';
import { detectLanguage } from '../lib/exercise-files.mjs';

const reactEx = (over = {}) => ({
  id: 'react-x', title: 'React', difficulty: 1, runtime: 'react-tsx', language: 'tsx',
  workspace: {
    entry: 'App.tsx',
    files: [
      { path: 'App.tsx', content: 'export default function App() { return <h1>Salut</h1>; }' },
      { path: 'styles.css', content: 'h1{color:red}' },
    ],
  },
  tests: [{ id: 't1', name: 'rend', kind: 'component-renders' }],
  ...over,
});

test('runtime react-tsx enregistré (kind react, preview, compile)', () => {
  assert.equal(isKnownRuntime('react-tsx'), true);
  const a = getRuntimeAdapter('react-tsx');
  assert.equal(a.kind, 'react');
  assert.equal(a.preview, true);
  assert.equal(a.compile, true);
  assert.equal(a.executable, false);
  assert.deepEqual(a.extensions, ['.tsx', '.ts', '.jsx', '.js', '.css', '.json']);
  assert.equal(a.entryDefault, 'App.tsx');
});

test('détection : react disponible (React + TypeScript locaux)', () => {
  _resetDetectionCache();
  const d = detectRuntime('react-tsx');
  assert.equal(d.available, true, d.error);
});

test('detectLanguage : tsx / jsx', () => {
  assert.equal(detectLanguage('App.tsx'), 'tsx');
  assert.equal(detectLanguage('Widget.jsx'), 'jsx');
  assert.equal(detectLanguage('util.ts'), 'typescript');
});

test('validateExercise : exercice React valide (component-renders)', () => {
  const v = validateExercise(reactEx());
  assert.equal(v.ok, true, v.errors.join(' ; '));
});

test('validateExercise : toutes les assertions React déclaratives', () => {
  const v = validateExercise(reactEx({ tests: [
    { id: 't1', name: 'rend', kind: 'component-renders' },
    { id: 't2', name: 'sel', kind: 'selector-exists', selector: 'h1' },
    { id: 't3', name: 'cnt', kind: 'element-count', selector: 'li', expected: 3 },
    { id: 't4', name: 'txt', kind: 'text-contains', selector: 'h1', expected: 'Salut', props: { name: 'Ada' } },
    { id: 't5', name: 'attr', kind: 'attribute-equals', selector: 'a', attribute: 'href', expected: '#' },
    { id: 't6', name: 'role', kind: 'accessible-role-exists', role: 'button' },
    { id: 't7', name: 'aname', kind: 'accessible-name-equals', selector: 'button', expected: 'Envoyer' },
    { id: 't8', name: 'list', kind: 'list-content', selector: 'li', expected: ['a', 'b'] },
    { id: 't9', name: 'cond', kind: 'conditional-visible', selector: '.alert', expected: true, props: { show: true } },
  ] }));
  assert.equal(v.ok, true, v.errors.join(' ; '));
});

test('validateExercise : entrée non-composant (.ts) rejetée', () => {
  const v = validateExercise(reactEx({ workspace: { entry: 'util.ts', files: [
    { path: 'util.ts', content: 'export const x=1' }, { path: 'App.tsx', content: 'export default ()=><i/>' },
  ] } }));
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => /composant \(\.tsx ou \.jsx\)/.test(e)));
});

test('validateExercise : extension non autorisée + .json non-readonly rejetés', () => {
  assert.equal(validateExercise(reactEx({ workspace: { entry: 'App.tsx', files: [
    { path: 'App.tsx', content: 'export default ()=><i/>' }, { path: 'evil.py', content: 'x' },
  ] } })).ok, false);
  assert.equal(validateExercise(reactEx({ workspace: { entry: 'App.tsx', files: [
    { path: 'App.tsx', content: 'export default ()=><i/>' }, { path: 'data.json', content: '{}' },
  ] } })).ok, false);
  assert.equal(validateExercise(reactEx({ workspace: { entry: 'App.tsx', files: [
    { path: 'App.tsx', content: 'export default ()=><i/>' }, { path: 'data.json', content: '{}', readOnly: true },
  ] } })).ok, true);
});

test('validateExercise : props non-objet rejeté', () => {
  const v = validateExercise(reactEx({ tests: [{ id: 't', name: 'x', kind: 'component-renders', props: [1, 2] }] }));
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => /props doit être un objet/.test(e)));
});

test('rétrocompat : Node/Python/TypeScript/Web valident toujours', () => {
  const web = { id: 'w', title: 'w', runtime: 'web', workspace: { entry: 'index.html', files: [{ path: 'index.html', content: '<html></html>' }] }, tests: [{ id: 't', name: 't', kind: 'selector-exists', selector: 'html' }] };
  const ts = { id: 't', title: 't', runtime: 'typescript', workspace: { entry: 'solution.ts', files: [{ path: 'solution.ts', content: 'export const x=1' }] }, tests: [{ id: 't', name: 't', kind: 'call-equals', export: 'x', expected: 1 }] };
  assert.equal(validateExercise(web).ok, true);
  assert.equal(validateExercise(ts).ok, true);
});
