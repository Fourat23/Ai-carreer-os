// CP5 (V19) — intégrité des exercices déterministes systèmes/réseau.
// Contrat vérifié par EXÉCUTION : référence 100% verte, starter échoue ≥1 test
// public, ≥1 test privé non exposé, compétences connues, journée liée atteignable
// depuis Foundations. Aucun shell arbitraire : fonctions pures sur fixtures.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { validateExercise, deepEqual } from '../lib/exercise.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';
import { buildCatalogue, resolveTrackDays, DEFAULT_TRACK_ID } from '../lib/catalogue.mjs';
import { buildDayExerciseIndex, daysForExercise } from '../lib/day-exercises.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const read = (p) => readFileSync(R(p), 'utf8');
const program = JSON.parse(read('data/program.json'));
const validDays = new Set(program.days.map((d) => d.day));
const exerciseIds = new Set(readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));

const V19_EXERCISES = [
  'sys-perms-to-octal', 'sys-perms-to-symbolic', 'sys-umask-apply', 'sys-process-top-cpu',
  'sys-port-listener', 'sys-log-level-counts', 'net-layer-classify', 'net-dns-resolve',
  'net-http-status-class', 'net-first-failure', 'sh-pipeline-run', 'sh-exit-retry',
];

const tmp = mkdtempSync(join(tmpdir(), 'v19t-'));
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

test('V19 : les 12 exercices existent et sont des fixtures valides', () => {
  assert.equal(V19_EXERCISES.length, 12);
  for (const id of V19_EXERCISES) {
    assert.ok(exerciseIds.has(id), `${id} présent sur disque`);
    const ex = JSON.parse(read(`data/exercises/${id}.json`));
    const v = validateExercise(ex);
    assert.ok(v.ok, `${id} invalide : ${v.errors.join(' ; ')}`);
  }
});

test('V19 : compétences connues, ≥1 test public et ≥1 test privé', () => {
  for (const id of V19_EXERCISES) {
    const ex = JSON.parse(read(`data/exercises/${id}.json`));
    assert.ok((ex.skills ?? []).length > 0, `${id} : au moins une compétence`);
    for (const s of ex.skills) assert.ok(isKnownSkill(s), `${id} : compétence connue « ${s} »`);
    assert.ok(ex.tests.some((t) => !t.private), `${id} : au moins un test public`);
    assert.ok(ex.tests.some((t) => t.private), `${id} : au moins un test privé`);
    assert.ok(ex.reference && Object.keys(ex.reference).length > 0, `${id} : référence côté serveur`);
  }
});

test('V19 : référence 100% verte, starter échoue ≥1 test public (exécuté)', async () => {
  for (const id of V19_EXERCISES) {
    const ex = JSON.parse(read(`data/exercises/${id}.json`));
    const refResults = await runCallEquals(ex.reference['solution.mjs'], ex.tests);
    assert.ok(refResults.every((r) => r.ok), `${id} : la référence doit passer TOUS les tests`);
    const startResults = await runCallEquals(ex.workspace.files[0].content, ex.tests);
    assert.ok(startResults.some((r) => !r.private && !r.ok), `${id} : le starter doit échouer ≥1 test public`);
  }
});

test('V19 : chaque exercice est relié à une journée atteignable depuis Foundations', () => {
  const raw = JSON.parse(read('data/day-exercises.json'));
  const idx = buildDayExerciseIndex(raw, exerciseIds, validDays);
  const catalogue = buildCatalogue(program);
  const foundationDays = new Set(resolveTrackDays(catalogue, DEFAULT_TRACK_ID));
  for (const id of V19_EXERCISES) {
    const days = daysForExercise(idx, id);
    assert.ok(days.length > 0, `${id} relié à ≥1 journée`);
    assert.ok(days.some((d) => foundationDays.has(d)), `${id} atteignable depuis Foundations`);
  }
});
