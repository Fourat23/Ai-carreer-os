// CP9 (V12) — sauvegarde/restauration des workspaces React (schéma v3 générique).
// Le modèle de workspace est agnostique à l'extension : les fichiers React
// éditables (.tsx/.jsx/.css) transitent par le MÊME format v3 que Node/Web/TS,
// sans migration dédiée. On prouve : round-trip fidèle, filtrage des fichiers en
// lecture seule / hors-allowlist / traversal / tests privés, et rejet du binaire.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { serializeBackupV3, parseBackupV3, sanitizeWorkspaces } from '../lib/backup.mjs';
import { editableAllowSet } from '../lib/workspace-fs.mjs';
import { migrateToV7 } from '../lib/progress-store.mjs';

const NOW = '2026-07-28T00:00:00.000Z';
const load = (id) => JSON.parse(readFileSync(`data/exercises/${id}.json`, 'utf8'));

// Allowlist RÉELLE dérivée du corpus : seuls les fichiers éditables non-test.
// react-search : App.tsx éditable, Row.tsx en lecture seule.
// react-hello  : App.jsx éditable.
const search = load('react-search');
const hello = load('react-hello');
const allow = new Map([
  ['react-search', editableAllowSet(search)],
  ['react-hello', editableAllowSet(hello)],
]);
const v3 = migrateToV7({ startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} });

test('allowlist : App éditable, composant en lecture seule exclu', () => {
  assert.equal(allow.get('react-search').has('App.tsx'), true);
  assert.equal(allow.get('react-search').has('Row.tsx'), false); // readOnly
  assert.equal(allow.get('react-hello').has('App.jsx'), true);
});

test('round-trip : workspace React (.tsx/.jsx) préservé à l’identique', () => {
  const ws = {
    'react-search': { files: { 'App.tsx': "import Row from './Row';\nexport default function App(){ return <ul><Row label=\"MINE\"/></ul>; }" } },
    'react-hello': { files: { 'App.jsx': 'export default function App(){ return <h1>Bonjour, React !</h1>; }' } },
  };
  const r = parseBackupV3(JSON.stringify(serializeBackupV3(v3, ws, new Date(NOW))), allow);
  assert.equal(r.ok, true);
  assert.match(r.workspaces['react-search'].files['App.tsx'], /MINE/);
  assert.match(r.workspaces['react-hello'].files['App.jsx'], /Bonjour, React !/);
});

test('sécurité : fichier React en lecture seule / hors-allowlist / traversal / test privé filtrés', () => {
  const raw = {
    'react-search': { files: {
      'App.tsx': 'ok',
      'Row.tsx': 'export default function Row(){ return null; }', // hors allowlist (readOnly)
      '../evil.tsx': 'traversal',
      'secret.test.tsx': 'LEAK',
    } },
  };
  const { workspaces, warnings } = sanitizeWorkspaces(raw, allow);
  assert.deepEqual(Object.keys(workspaces['react-search'].files), ['App.tsx']);
  assert.ok(warnings.length >= 2);
});

test('sécurité : contenu binaire (NUL) dans un .tsx ignoré', () => {
  const raw = { 'react-search': { files: { 'App.tsx': 'x' + String.fromCharCode(0) } } };
  const { workspaces } = sanitizeWorkspaces(raw, allow);
  assert.equal(workspaces['react-search'], undefined);
});
