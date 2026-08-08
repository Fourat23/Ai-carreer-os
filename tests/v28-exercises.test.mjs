// CP7 (V28) — contrat des nouveaux exercices Observabilité/SRE/incident, vérifié par
// EXÉCUTION : schéma valide, ≥1 test public + ≥1 test privé, compétences connues,
// référence 100% verte, starter échoue ≥1 test public, aucune fuite de solution.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { validateExercise, deepEqual } from '../lib/exercise.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const read = (p) => readFileSync(R(p), 'utf8');
const onDisk = new Set(readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));

const V28_EXERCISES = [
  'slo-burn-rate', 'rca-classify-cause', 'alert-actionable',
  'incident-severity', 'circuit-breaker-state', 'retry-should',
];

const tmp = mkdtempSync(join(tmpdir(), 'v28x-'));
let seq = 0;
async function runCallEquals(code, tests) {
  const file = join(tmp, `m${seq++}.mjs`);
  writeFileSync(file, code);
  const mod = await import(pathToFileURL(file).href);
  return tests.map((t) => {
    let ok = false;
    try { ok = deepEqual(mod[t.export](...t.args), t.expected); } catch { ok = false; }
    return { private: !!t.private, ok };
  });
}

test('V28 : les 6 exercices existent et sont des fixtures valides', () => {
  for (const id of V28_EXERCISES) {
    assert.ok(onDisk.has(id), `${id} présent sur disque`);
    const ex = JSON.parse(read(`data/exercises/${id}.json`));
    const v = validateExercise(ex);
    assert.ok(v.ok, `${id} invalide : ${v.errors.join(' ; ')}`);
  }
});

test('V28 : compétences connues, ≥1 test public et ≥1 test privé, référence présente', () => {
  for (const id of V28_EXERCISES) {
    const ex = JSON.parse(read(`data/exercises/${id}.json`));
    assert.ok((ex.skills ?? []).length > 0, `${id} : au moins une compétence`);
    for (const s of ex.skills) assert.ok(isKnownSkill(s), `${id} : compétence connue « ${s} »`);
    assert.ok(ex.tests.some((t) => !t.private), `${id} : au moins un test public`);
    assert.ok(ex.tests.some((t) => t.private), `${id} : au moins un test privé`);
    assert.ok(ex.reference && Object.keys(ex.reference).length > 0, `${id} : référence côté serveur`);
    const client = JSON.stringify(ex.workspace);
    assert.ok(!client.includes(ex.reference['solution.mjs']), `${id} : la référence ne fuit pas dans le workspace`);
  }
});

test('V28 : référence 100% verte, starter échoue ≥1 test public (exécuté)', async () => {
  for (const id of V28_EXERCISES) {
    const ex = JSON.parse(read(`data/exercises/${id}.json`));
    const refResults = await runCallEquals(ex.reference['solution.mjs'], ex.tests);
    assert.ok(refResults.every((r) => r.ok), `${id} : la référence doit passer TOUS les tests`);
    const startResults = await runCallEquals(ex.workspace.files[0].content, ex.tests);
    assert.ok(startResults.some((r) => !r.private && !r.ok), `${id} : le starter doit échouer ≥1 test public`);
  }
});
