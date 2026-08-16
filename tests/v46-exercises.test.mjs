// V46 — contrat des exercices exécutables ajoutés (sprint=v46), vérifié par
// EXÉCUTION RÉELLE via runExercise : schéma valide, ≥1 public + ≥1 privé,
// référence 100% verte, starter casse ≥1 test public, floor de livraison,
// feedback diagnostique relié. Python/SQL sautés proprement si Python 3 absent.
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
const V46 = all.filter((e) => e.sprint === 'v46');
const PY = detectRuntime('python3').available;

let SANDBOX;
before(() => { mkdirSync(R('data/lab-workspaces'), { recursive: true }); SANDBOX = mkdtempSync(R('data/lab-workspaces/v46t-')); });
after(() => { if (SANDBOX) rmSync(SANDBOX, { recursive: true, force: true }); });

test('V46 : floor de livraison (≥36 nouveaux, D3≥12, D4≥8, D5≥4)', () => {
  assert.ok(V46.length >= 36, `≥36 exercices attendus, obtenu ${V46.length}`);
  const d = (n) => V46.filter((e) => e.difficulty === n).length;
  assert.ok(d(3) >= 12, `D3 ≥ 12 (obtenu ${d(3)})`);
  assert.ok(d(4) >= 8, `D4 ≥ 8 (obtenu ${d(4)})`);
  assert.ok(d(5) >= 4, `D5 ≥ 4 (obtenu ${d(5)})`);
});

test('V46 : ≥6 compétences sous-pratiquées renforcées', () => {
  const skills = new Set();
  for (const e of V46) for (const s of e.skills ?? []) skills.add(projectSkill(s));
  for (const target of ['python', 'sql', 'ml', 'dl', 'rag', 'agents', 'secu']) {
    assert.ok(skills.has(target), `compétence ${target} renforcée`);
  }
});

test('V46 : schéma valide, skills connues, ≥1 public + ≥1 privé', () => {
  for (const e of V46) {
    const v = validateExercise(e);
    assert.ok(v.ok, `${e.id} invalide : ${v.errors.join(' ; ')}`);
    for (const s of e.skills ?? []) { assert.ok(isKnownSkill(s), `${e.id} skill inconnue ${s}`); assert.ok(projectSkill(s), `${e.id} skill non projetable ${s}`); }
    assert.ok((e.tests ?? []).some((t) => !t.private), `${e.id} : ≥1 test public`);
    assert.ok((e.tests ?? []).some((t) => t.private), `${e.id} : ≥1 test privé`);
  }
});

test('V46 : feedback diagnostique relié (≥16 exercices → misconception)', () => {
  const refs = new Set(MISCONCEPTIONS.flatMap((m) => m.exerciseRefs ?? []));
  const linked = V46.filter((e) => refs.has(e.id)).length;
  assert.ok(linked >= 16, `≥16 exercices reliés à une misconception (obtenu ${linked})`);
});

test('V46 : exécution réelle — référence verte, starter casse un test public', async (t) => {
  for (const e of V46) {
    if (e.runtime === 'python3' && !PY) { continue; } // sauté proprement
    const ref = await runExercise(SANDBOX, e, e.reference ?? {});
    assert.ok(ref.attempt.allPassed, `${e.id} : référence doit être 100% verte — ${JSON.stringify(ref.attempt.results.filter((r) => !r.passed)).slice(0, 300)}`);
    const st = await runExercise(SANDBOX, e, {});
    const pubFail = st.attempt.results.some((r) => !r.passed && !((e.tests.find((t2) => t2.id === r.testId) || {}).private));
    assert.ok(pubFail, `${e.id} : le starter doit casser ≥1 test public (anti-fuite de solution)`);
  }
});
