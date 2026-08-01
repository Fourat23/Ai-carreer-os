// CP9 (V13) — non-régression sauvegarde/restauration pour les runtimes enrichis
// (Node, Python, TypeScript). Le format v3 est agnostique au runtime : les
// workspaces des nouveaux exercices transitent sans migration dédiée, avec
// exclusion des fichiers de test privés et des chemins hors-allowlist.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { serializeBackupV3, parseBackupV3, sanitizeWorkspaces } from '../lib/backup.mjs';
import { editableAllowSet } from '../lib/workspace-fs.mjs';
import { migrateToV7 } from '../lib/progress-store.mjs';

const load = (id) => JSON.parse(readFileSync(`data/exercises/${id}.json`, 'utf8'));
const allow = new Map([
  ['js-conditions', editableAllowSet(load('js-conditions'))],  // node .mjs
  ['py-exceptions', editableAllowSet(load('py-exceptions'))],  // python .py
  ['ds-stack', editableAllowSet(load('ds-stack'))],            // typescript .ts
]);
const v3 = migrateToV7({ startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} });

test('allowlist : fichier d’entrée éditable présent par runtime', () => {
  assert.equal(allow.get('js-conditions').has('solution.mjs'), true);
  assert.equal(allow.get('py-exceptions').has('solution.py'), true);
  assert.equal(allow.get('ds-stack').has('solution.ts'), true);
});

test('round-trip : workspaces Node / Python / TypeScript préservés', () => {
  const ws = {
    'js-conditions': { files: { 'solution.mjs': 'export function categorize(a){ return "MINE_JS"; }' } },
    'py-exceptions': { files: { 'solution.py': 'def parse_ratio(t):\n    return "MINE_PY"\n' } },
    'ds-stack': { files: { 'solution.ts': 'export function runStack(o: string[]): number[] { return [42]; }' } },
  };
  const r = parseBackupV3(JSON.stringify(serializeBackupV3(v3, ws)), allow);
  assert.equal(r.ok, true);
  assert.match(r.workspaces['js-conditions'].files['solution.mjs'], /MINE_JS/);
  assert.match(r.workspaces['py-exceptions'].files['solution.py'], /MINE_PY/);
  assert.match(r.workspaces['ds-stack'].files['solution.ts'], /42/);
});

test('sécurité : test privé / traversal / hors-allowlist filtrés', () => {
  const raw = {
    'js-conditions': { files: {
      'solution.mjs': 'ok',
      '../evil.mjs': 'traversal',
      'secret.test.mjs': 'LEAK',
      'unknown.mjs': 'hors allowlist',
    } },
  };
  const { workspaces, warnings } = sanitizeWorkspaces(raw, allow);
  assert.deepEqual(Object.keys(workspaces['js-conditions'].files), ['solution.mjs']);
  assert.ok(warnings.length >= 2);
});
