// CP3 (V43) — feedback diagnostique dérivé : sur un échec (compétence ou exercice),
// le read-model surface des misconceptions COMPATIBLES + remédiation. Réutilise le
// registre V42. Vérifie que tous les exerciseRefs pointent des exercices RÉELS.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { MISCONCEPTIONS } from '../lib/misconceptions.mjs';
import { diagnosticFeedback } from '../lib/practice-coverage.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const knownEx = new Set(readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));

test('tous les exerciseRefs de misconceptions pointent des exercices réels', () => {
  for (const m of MISCONCEPTIONS) {
    for (const e of m.exerciseRefs) assert.ok(knownEx.has(e), `${m.id} : exercice inconnu ${e}`);
  }
});

test('diagnosticFeedback par exercice : surface la misconception liée', () => {
  const fb = diagnosticFeedback({ exerciseId: 'react-debug-list' }, MISCONCEPTIONS);
  assert.ok(fb.candidates.length >= 1);
  const c = fb.candidates[0];
  assert.ok(c.right && c.lessonRefs.length > 0, 'remédiation présente');
});

test('diagnosticFeedback par compétence : surface les misconceptions du domaine', () => {
  const fb = diagnosticFeedback({ skill: 'archi' }, MISCONCEPTIONS);
  assert.ok(fb.candidates.some((c) => c.id === 'retry-equals-idempotence'));
});

test('diagnosticFeedback : aucun candidat pour un contexte inconnu (pas d\'invention)', () => {
  assert.equal(diagnosticFeedback({ exerciseId: 'inexistant-xyz' }, MISCONCEPTIONS).candidates.length, 0);
  assert.equal(diagnosticFeedback({}, MISCONCEPTIONS).candidates.length, 0);
});
