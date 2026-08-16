// V47 — contrat des exercices exécutables ajoutés (sprint=v47), vérifié par
// EXÉCUTION RÉELLE via runExercise : schéma valide, ≥1 public + ≥1 privé,
// référence 100% verte, starter casse ≥1 test public, floor de livraison,
// feedback diagnostique relié, étiquettes de preuve honnêtes.
// python3 sauté si Python 3 absent ; python-ds sauté si le venv opt-in absent.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateExercise } from '../lib/exercise.mjs';
import { runExercise } from '../lib/workspace-fs.mjs';
import { detectRuntime } from '../lib/runtime-detect.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';
import { projectSkill } from '../lib/practice-coverage.mjs';
import { MISCONCEPTIONS } from '../lib/misconceptions.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const exDir = R('data/exercises');
const all = readdirSync(exDir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(exDir, f), 'utf8')));
const V47 = all.filter((e) => e.sprint === 'v47');
const PY = detectRuntime('python3').available;
const DS = detectRuntime('python-ds').available;

const VALID_MODES = new Set([undefined, 'LOCAL_EXECUTABLE', 'SIMULATION', 'PROXY', 'EXTERNAL_ENVIRONMENT_REQUIRED', 'TOOLING_ENVIRONMENT_REQUIRED']);

let SANDBOX;
before(() => { mkdirSync(R('data/lab-workspaces'), { recursive: true }); SANDBOX = mkdtempSync(R('data/lab-workspaces/v47t-')); });
after(() => { if (SANDBOX) rmSync(SANDBOX, { recursive: true, force: true }); });

test('V47 : floor de livraison (≥20 nouveaux, D4/D5 ≥ 10)', () => {
  assert.ok(V47.length >= 20, `≥20 exercices attendus, obtenu ${V47.length}`);
  const d = (n) => V47.filter((e) => e.difficulty === n).length;
  assert.ok(d(4) + d(5) >= 10, `D4+D5 ≥ 10 (obtenu ${d(4) + d(5)})`);
});

test('V47 : axes zéro-pratique désormais couverts (archi, patterns, evalia)', () => {
  const skills = new Set();
  for (const e of V47) for (const s of e.skills ?? []) skills.add(projectSkill(s));
  for (const target of ['archi', 'patterns', 'evalia', 'llm', 'ml']) {
    assert.ok(skills.has(target), `axe ${target} renforcé en V47`);
  }
});

test('V47 : schéma valide, skills connues, ≥1 public + ≥1 privé, mode honnête', () => {
  for (const e of V47) {
    const v = validateExercise(e);
    assert.ok(v.ok, `${e.id} invalide : ${v.errors.join(' ; ')}`);
    for (const s of e.skills ?? []) { assert.ok(isKnownSkill(s), `${e.id} skill inconnue ${s}`); assert.ok(projectSkill(s), `${e.id} skill non projetable ${s}`); }
    assert.ok((e.tests ?? []).some((t) => !t.private), `${e.id} : ≥1 test public`);
    assert.ok((e.tests ?? []).some((t) => t.private), `${e.id} : ≥1 test privé`);
    assert.ok(VALID_MODES.has(e.practiceMode), `${e.id} : practiceMode honnête (obtenu ${e.practiceMode})`);
    if (e.runtime === 'python-ds') {
      assert.equal(e.practiceMode, 'TOOLING_ENVIRONMENT_REQUIRED', `${e.id} : python-ds doit être TOOLING_ENVIRONMENT_REQUIRED`);
    }
  }
});

test('V47 : feedback diagnostique relié (≥12 exercices → misconception)', () => {
  const refs = new Set(MISCONCEPTIONS.flatMap((m) => m.exerciseRefs ?? []));
  const linked = V47.filter((e) => refs.has(e.id)).length;
  assert.ok(linked >= 12, `≥12 exercices reliés à une misconception (obtenu ${linked})`);
});

test('V47 : exécution réelle — référence verte, starter casse un test public', async () => {
  let ran = 0;
  for (const e of V47) {
    if (e.runtime === 'python3' && !PY) continue; // sauté proprement
    if (e.runtime === 'python-ds' && !DS) continue; // venv opt-in absent → sauté honnêtement
    const ref = await runExercise(SANDBOX, e, e.reference ?? {});
    assert.ok(ref.attempt.allPassed, `${e.id} : référence doit être 100% verte — ${JSON.stringify(ref.attempt.results.filter((r) => !r.passed)).slice(0, 300)}`);
    const st = await runExercise(SANDBOX, e, {});
    const pubFail = st.attempt.results.some((r) => !r.passed && !((e.tests.find((t2) => t2.id === r.testId) || {}).private));
    assert.ok(pubFail, `${e.id} : le starter doit casser ≥1 test public (anti-fuite de solution)`);
    ran++;
  }
  assert.ok(ran >= 1, 'au moins un exercice V47 exécuté (sinon environnement sans runtime)');
});
