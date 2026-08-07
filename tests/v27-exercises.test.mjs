// CP7 (V27) — contrat des nouveaux exercices Cloud/DevOps, vérifié par EXÉCUTION :
// schéma valide, ≥1 test public + ≥1 test privé, compétences connues, référence
// 100% verte, starter échoue ≥1 test public, aucune fuite de solution côté client.
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

const V27_EXERCISES = [
  'linux-path-traversal-x', 'linux-signal-choice', 'systemd-restart-loop', 'linux-fd-ulimit',
  'ssh-key-perms-accepted', 'dns-record-type-choice', 'dns-ttl-still-cached', 'tls-cert-usable',
  'http-method-idempotent', 'iac-plan-destructive', 'iac-idempotent-changes', 'compose-depends-ready',
];

const tmp = mkdtempSync(join(tmpdir(), 'v27x-'));
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

test('V27 : les 12 exercices existent et sont des fixtures valides', () => {
  for (const id of V27_EXERCISES) {
    assert.ok(onDisk.has(id), `${id} présent sur disque`);
    const ex = JSON.parse(read(`data/exercises/${id}.json`));
    const v = validateExercise(ex);
    assert.ok(v.ok, `${id} invalide : ${v.errors.join(' ; ')}`);
  }
});

test('V27 : compétences connues, ≥1 test public et ≥1 test privé, référence présente', () => {
  for (const id of V27_EXERCISES) {
    const ex = JSON.parse(read(`data/exercises/${id}.json`));
    assert.ok((ex.skills ?? []).length > 0, `${id} : au moins une compétence`);
    for (const s of ex.skills) assert.ok(isKnownSkill(s), `${id} : compétence connue « ${s} »`);
    assert.ok(ex.tests.some((t) => !t.private), `${id} : au moins un test public`);
    assert.ok(ex.tests.some((t) => t.private), `${id} : au moins un test privé`);
    assert.ok(ex.reference && Object.keys(ex.reference).length > 0, `${id} : référence côté serveur`);
    // Anti-fuite : la solution de référence ne doit pas être dans le workspace client.
    const client = JSON.stringify(ex.workspace);
    assert.ok(!client.includes(ex.reference['solution.mjs']), `${id} : la référence ne fuit pas dans le workspace`);
  }
});

test('V27 : référence 100% verte, starter échoue ≥1 test public (exécuté)', async () => {
  for (const id of V27_EXERCISES) {
    const ex = JSON.parse(read(`data/exercises/${id}.json`));
    const refResults = await runCallEquals(ex.reference['solution.mjs'], ex.tests);
    assert.ok(refResults.every((r) => r.ok), `${id} : la référence doit passer TOUS les tests`);
    const startResults = await runCallEquals(ex.workspace.files[0].content, ex.tests);
    assert.ok(startResults.some((r) => !r.private && !r.ok), `${id} : le starter doit échouer ≥1 test public`);
  }
});
