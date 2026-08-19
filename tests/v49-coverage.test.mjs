// V49 — read-model de couverture professionnelle : pureté, dimensions, statuts,
// et cohérence du ledger dérivé (aucune dérive, aucune seconde source).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { skillCoverageRow, computeCoverageMatrix, completeLoopCount } from '../lib/professional-coverage.mjs';
import { buildLedger } from '../scripts/v49-ledger.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);

test('read-model : 8 dimensions présentes et booléennes', () => {
  const row = skillCoverageRow('ml', {
    lessons: [{ skills: ['ml'] }],
    exercises: [
      { skills: ['ml'], difficulty: 4, runtime: 'python3' },
      { skills: ['ml'], difficulty: 3, runtime: 'python3' },
      { skills: ['ml'], difficulty: 5, runtime: 'python3' },
      { skills: ['ml'], difficulty: 2, runtime: 'python3' },
    ],
    capstones: [{ skills: ['ml'] }],
    missions: [], transfer: [{ skills: ['ml'] }], misconceptions: [{ skill: 'ml' }], externalTasks: [],
  });
  const keys = ['foundation', 'practice', 'autonomy', 'diagnostic', 'variation', 'transfer', 'professional', 'evidence'];
  for (const k of keys) assert.equal(typeof row.dims[k], 'boolean', `dim ${k}`);
  assert.ok(Object.values(row.dims).every(Boolean), 'toutes dimensions vraies pour ce cas complet');
  assert.equal(row.status, 'PROFESSIONAL_READY');
});

test('read-model : compétence non-code sans pratique → NON_CODE ou BLOCKED', () => {
  const row = skillCoverageRow('comm', { lessons: [{ skills: ['comm'] }], exercises: [], capstones: [{ skills: ['comm'] }], missions: [], transfer: [], misconceptions: [], externalTasks: [] });
  assert.equal(row.runtime, 'NON_CODE');
  assert.ok(['NON_CODE', 'BLOCKED'].includes(row.status));
});

test('read-model : compétence externe seule → EXTERNAL_REQUIRED', () => {
  const row = skillCoverageRow('cloud', { lessons: [{ skills: ['cloud'] }], exercises: [], capstones: [], missions: [], transfer: [], misconceptions: [], externalTasks: [{ skills: ['cloud'] }] });
  assert.equal(row.runtime, 'EXTERNAL_ENVIRONMENT_REQUIRED');
  assert.equal(row.status, 'EXTERNAL_REQUIRED');
});

test('read-model : PUR (mêmes entrées → mêmes sorties)', () => {
  const src = { lessons: [], exercises: [{ skills: ['algo'], difficulty: 3, runtime: 'node-js' }], capstones: [], missions: [], transfer: [], misconceptions: [], externalTasks: [] };
  assert.deepEqual(skillCoverageRow('algo', src), skillCoverageRow('algo', src));
});

test('ledger : committé identique à la matrice recalculée (aucune dérive)', () => {
  const path = R('docs/audits/v49-coverage-ledger.json');
  assert.ok(existsSync(path), 'ledger présent (npm run v49:ledger)');
  const committed = JSON.parse(readFileSync(path, 'utf8'));
  const fresh = buildLedger();
  assert.deepEqual(committed.matrix, fresh.matrix, 'le ledger ne doit pas dériver de la source dérivée');
  assert.equal(committed.completeLoops, completeLoopCount(fresh.matrix));
});
