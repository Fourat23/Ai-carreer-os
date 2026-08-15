// CP7 (V44) — contrat des exercices D3/D4/D5 AJOUTÉS, vérifié par EXÉCUTION via le
// vrai harnais (runExercise) : schéma valide, compétences connues et projetables,
// ≥1 test public + ≥1 test privé, référence 100 % verte, starter échoue ≥1 test
// public, aucune fuite de solution, sorties entières/chaînes (pas de flottant).
// Déterministe, local — aucun réseau, aucun faux navigateur.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateExercise } from '../lib/exercise.mjs';
import { runExercise } from '../lib/workspace-fs.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';
import { projectSkill } from '../lib/practice-coverage.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const read = (p) => readFileSync(R(p), 'utf8');
const onDisk = new Set(readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));
const program = JSON.parse(read('data/program.json'));
const programSkills = new Set(program.skills.map((s) => s.id));

// Les 24 pratiques créées au CP7 (difficulté cognitive D3/D4/D5), par exécution réelle.
const V44_EXERCISES = [
  'ds-lru-cache', 'ds-min-stack', 'http-idempotency-dedup', 'http-etag-revalidation', 'http-rate-limit-decide',
  'sh-pipeline-exit-diagnose', 'git-conflicting-files', 'sql-left-join-nulls', 'sql-group-having', 'sql-window-running-total',
  'se-flaky-vs-real', 'se-semver-bump', 'py-topk-frequent', 'py-sliding-window-max', 'py-retry-idempotent',
  'algo-interval-merge', 'algo-coin-change-min', 'http-resilient-consumer', 'se-release-decision', 'sql-index-advice',
  'http-cache-policy', 'algo-kadane-max-subarray', 'ds-two-stack-queue', 'sql-dedup-latest',
];

let SANDBOX;
before(() => { mkdirSync(R('data/lab-workspaces'), { recursive: true }); SANDBOX = mkdtempSync(R('data/lab-workspaces/v44x-')); });
after(() => { if (SANDBOX) rmSync(SANDBOX, { recursive: true, force: true }); });

test('V44 : ≥24 exercices ajoutés, présents et valides', () => {
  assert.ok(V44_EXERCISES.length >= 24, `FLOOR E : attendu ≥24, obtenu ${V44_EXERCISES.length}`);
  for (const id of V44_EXERCISES) {
    assert.ok(onDisk.has(id), `${id} présent sur disque`);
    const v = validateExercise(JSON.parse(read(`data/exercises/${id}.json`)));
    assert.ok(v.ok, `${id} invalide : ${v.errors.join(' ; ')}`);
  }
});

test('V44 : difficulté D3+, compétences connues et projetables, ≥1 public + ≥1 privé', () => {
  let d5 = 0, d4 = 0;
  for (const id of V44_EXERCISES) {
    const ex = JSON.parse(read(`data/exercises/${id}.json`));
    assert.ok(ex.difficulty >= 3, `${id} : difficulté ≥ 3 (obtenu ${ex.difficulty})`);
    if (ex.difficulty === 5) d5 += 1; else if (ex.difficulty === 4) d4 += 1;
    assert.ok((ex.skills ?? []).length > 0, `${id} : au moins une compétence`);
    for (const s of ex.skills) {
      assert.ok(isKnownSkill(s), `${id} : compétence connue « ${s} »`);
      assert.ok(programSkills.has(projectSkill(s)), `${id} : « ${s} » projetable vers une compétence de programme`);
    }
    assert.ok(ex.tests.some((t) => !t.private), `${id} : au moins un test public`);
    assert.ok(ex.tests.some((t) => t.private), `${id} : au moins un test privé`);
  }
  // La pathologie CP0 (d5=0) est corrigée : plusieurs D5 réels, et des D4 nombreux.
  assert.ok(d5 >= 4, `attendu ≥4 exercices D5, obtenu ${d5}`);
  assert.ok(d4 >= 8, `attendu ≥8 exercices D4, obtenu ${d4}`);
});

test('V44 : sorties entières/chaînes (pas de flottant), pas de fuite de solution', () => {
  const isFloat = (v) => typeof v === 'number' && !Number.isInteger(v);
  const noFloat = (v) => {
    if (Array.isArray(v)) return v.every(noFloat);
    if (v && typeof v === 'object') return Object.values(v).every(noFloat);
    return !isFloat(v);
  };
  for (const id of V44_EXERCISES) {
    const ex = JSON.parse(read(`data/exercises/${id}.json`));
    for (const t of ex.tests) if (t.kind === 'call-equals') assert.ok(noFloat(t.expected), `${id}/${t.id} : sortie flottante interdite`);
    const client = JSON.stringify(ex.workspace);
    for (const sol of Object.values(ex.reference)) assert.ok(!client.includes(sol), `${id} : la référence ne doit pas fuiter dans le workspace`);
  }
});

test('V44 : référence 100% verte, starter échoue ≥1 test public (exécuté)', async () => {
  for (const id of V44_EXERCISES) {
    const ex = JSON.parse(read(`data/exercises/${id}.json`));
    const ref = await runExercise(SANDBOX, ex, ex.reference);
    assert.ok(ref.attempt.results.every((r) => r.passed), `${id} : référence doit être 100% verte`);
    const st = await runExercise(SANDBOX, ex, {});
    const publicFail = ex.tests.some((t) => !t.private && !st.attempt.results.find((r) => r.id === t.id)?.passed);
    assert.ok(publicFail, `${id} : le starter doit échouer au moins un test public`);
  }
});
