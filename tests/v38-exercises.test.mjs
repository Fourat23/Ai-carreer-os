// CP5 (V38) — contrat des exercices Backend ajoutés, vérifié par EXÉCUTION via
// le vrai harnais (runExercise) : schéma valide, ≥1 test public + ≥1 test privé,
// compétences connues, référence 100% verte, starter échoue ≥1 test public, aucune
// fuite de solution. Déterministe, local — aucun réseau, aucun faux navigateur.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateExercise } from '../lib/exercise.mjs';
import { runExercise } from '../lib/workspace-fs.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const read = (p) => readFileSync(R(p), 'utf8');
const onDisk = new Set(readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));

const V38_EXERCISES = ['queue-idempotent-consumer', 'dlq-routing', 'api-pagination-choice', 'replication-lag-reason', 'capacity-estimate', 'retry-backoff-delay'];

// Racine d'exécution ISOLÉE (sous data/lab-workspaces, gitignoré) : runExercise
// matérialise le workspace sous cette racine ; on la nettoie après les tests.
let SANDBOX;
before(() => { mkdirSync(R('data/lab-workspaces'), { recursive: true }); SANDBOX = mkdtempSync(R('data/lab-workspaces/v36x-')); });
after(() => { if (SANDBOX) rmSync(SANDBOX, { recursive: true, force: true }); });

test('V38 : les exercices frontend existent et sont des fixtures valides', () => {
  for (const id of V38_EXERCISES) {
    assert.ok(onDisk.has(id), `${id} présent sur disque`);
    const ex = JSON.parse(read(`data/exercises/${id}.json`));
    const v = validateExercise(ex);
    assert.ok(v.ok, `${id} invalide : ${v.errors.join(' ; ')}`);
  }
});

test('V38 : compétences connues, ≥1 test public et ≥1 test privé, référence présente', () => {
  for (const id of V38_EXERCISES) {
    const ex = JSON.parse(read(`data/exercises/${id}.json`));
    assert.ok((ex.skills ?? []).length > 0, `${id} : au moins une compétence`);
    for (const s of ex.skills) assert.ok(isKnownSkill(s), `${id} : compétence connue « ${s} »`);
    assert.ok(ex.tests.some((t) => !t.private), `${id} : au moins un test public`);
    assert.ok(ex.tests.some((t) => t.private), `${id} : au moins un test privé`);
    assert.ok(ex.reference && Object.keys(ex.reference).length > 0, `${id} : référence côté serveur`);
    const client = JSON.stringify(ex.workspace);
    for (const sol of Object.values(ex.reference)) assert.ok(!client.includes(sol), `${id} : la référence ne fuit pas dans le workspace`);
  }
});

test('V38 : référence 100% verte, starter échoue ≥1 test public (exécuté)', async () => {
  for (const id of V38_EXERCISES) {
    const ex = JSON.parse(read(`data/exercises/${id}.json`));
    const ref = await runExercise(SANDBOX, ex, ex.reference);
    assert.ok(ref.attempt.results.every((r) => r.passed), `${id} : référence doit être 100% verte`);
    const st = await runExercise(SANDBOX, ex, {});
    const publicFail = ex.tests.some((t) => !t.private && !st.attempt.results.find((r) => r.id === t.id)?.passed);
    assert.ok(publicFail, `${id} : le starter doit échouer au moins un test public`);
  }
});

test('V38 : exercices reliés à un jour réel (reachables)', () => {
  const dayEx = JSON.parse(read('data/day-exercises.json'));
  const reachable = new Set(Object.values(dayEx).flat());
  for (const id of V38_EXERCISES) assert.ok(reachable.has(id), `${id} : relié à un jour`);
});
