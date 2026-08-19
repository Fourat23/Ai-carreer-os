// V49 — exécution réelle des exercices ajoutés (sprint=v49, DL opérationnel),
// validation des scénarios V49 et des défis de transfert V49.
// python3 sauté si Python absent ; python-ds sauté si venv opt-in absent.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateExercise } from '../lib/exercise.mjs';
import { runExercise } from '../lib/workspace-fs.mjs';
import { detectRuntime } from '../lib/runtime-detect.mjs';
import { validateCapstone, gradeCapstone } from '../lib/capstone.mjs';
import { validateTransferChallenge, gradeTransferChallenge } from '../lib/transfer-challenge.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const load = (dir) => readdirSync(R(dir)).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(R(dir), f), 'utf8')));
const V49EX = load('data/exercises').filter((e) => e.sprint === 'v49');
const V49CAPS = load('data/capstones').filter((c) => c.sprint === 'v49');
const V49TR = load('data/transfer-challenges').filter((t) => t.sprint === 'v49');
const PY = detectRuntime('python3').available;
const DS = detectRuntime('python-ds').available;

let SANDBOX;
before(() => { mkdirSync(R('data/lab-workspaces'), { recursive: true }); SANDBOX = mkdtempSync(R('data/lab-workspaces/v49t-')); });
after(() => { if (SANDBOX) rmSync(SANDBOX, { recursive: true, force: true }); });

test('V49 : exercices DL — schéma + ≥1 public + ≥1 privé', () => {
  assert.ok(V49EX.length >= 6, `≥6 exercices V49 (obtenu ${V49EX.length})`);
  for (const e of V49EX) {
    const v = validateExercise(e);
    assert.ok(v.ok, `${e.id} invalide : ${v.errors.join(' ; ')}`);
    assert.ok(e.tests.some((t) => !t.private) && e.tests.some((t) => t.private), `${e.id} : public+privé`);
    if (e.runtime === 'python-ds') assert.equal(e.practiceMode, 'TOOLING_ENVIRONMENT_REQUIRED');
  }
});

test('V49 : exécution réelle — référence verte, starter casse un public', async () => {
  let ran = 0;
  for (const e of V49EX) {
    if (e.runtime === 'python3' && !PY) continue;
    if (e.runtime === 'python-ds' && !DS) continue;
    const ref = await runExercise(SANDBOX, e, e.reference ?? {});
    assert.ok(ref.attempt.allPassed, `${e.id} : référence 100% verte — ${JSON.stringify(ref.attempt.results.filter((r) => !r.passed)).slice(0, 250)}`);
    const st = await runExercise(SANDBOX, e, {});
    const pubFail = st.attempt.results.some((r) => !r.passed && !((e.tests.find((t2) => t2.id === r.testId) || {}).private));
    assert.ok(pubFail, `${e.id} : le starter doit casser ≥1 test public`);
    ran++;
  }
  assert.ok(ran >= 1, 'au moins un exercice V49 exécuté');
});

test('V49 : scénarios de clôture valides + référence gagnante', () => {
  assert.ok(V49CAPS.length >= 3, `≥3 scénarios V49 (obtenu ${V49CAPS.length})`);
  for (const c of V49CAPS) {
    const v = validateCapstone(c);
    assert.ok(v.ok, `${c.id} invalide : ${v.errors.join(' ; ')}`);
    assert.ok((c.artifacts ?? []).some((a) => a.useful === false), `${c.id} : ≥1 artefact bruit`);
    const resp = {};
    for (const p of c.phases) for (const q of p.questions) resp[q.id] = q.answer;
    assert.ok(gradeCapstone(c, resp).passedOverall, `${c.id} : référence doit réussir`);
  }
});

test('V49 : défis de transfert valides + référence gagnante', () => {
  assert.ok(V49TR.length >= 5, `≥5 défis de transfert V49 (obtenu ${V49TR.length})`);
  for (const c of V49TR) {
    const v = validateTransferChallenge(c);
    assert.ok(v.ok, `${c.id} invalide : ${v.errors.join(' ; ')}`);
    const resp = {}; for (const q of c.questions) resp[q.id] = q.answer;
    const res = gradeTransferChallenge(c, resp);
    assert.ok(res.passed || res.ratio >= (c.passThreshold ?? 0.7), `${c.id} : référence doit réussir`);
  }
});
