// V48 — contrat des exercices & scénarios ajoutés (sprint=v48), vérifié par
// EXÉCUTION RÉELLE : schéma, ≥1 public + ≥1 privé, référence 100% verte, starter
// cassant ≥1 public, floors D3/D4/D5, feedback diagnostique, modes honnêtes ;
// scénarios (capstones V48) valides et copie de référence gagnante.
// python3 sauté si Python absent ; python-ds sauté si venv opt-in absent.
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
import { validateCapstone, gradeCapstone } from '../lib/capstone.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const exDir = R('data/exercises');
const all = readdirSync(exDir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(exDir, f), 'utf8')));
const V48 = all.filter((e) => e.sprint === 'v48');
const capDir = R('data/capstones');
const V48CAPS = readdirSync(capDir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(capDir, f), 'utf8'))).filter((c) => c.sprint === 'v48');
const PY = detectRuntime('python3').available;
const DS = detectRuntime('python-ds').available;
const VALID_MODES = new Set([undefined, 'LOCAL_EXECUTABLE', 'SIMULATION', 'PROXY', 'EXTERNAL_ENVIRONMENT_REQUIRED', 'TOOLING_ENVIRONMENT_REQUIRED']);

let SANDBOX;
before(() => { mkdirSync(R('data/lab-workspaces'), { recursive: true }); SANDBOX = mkdtempSync(R('data/lab-workspaces/v48t-')); });
after(() => { if (SANDBOX) rmSync(SANDBOX, { recursive: true, force: true }); });

test('V48 : floors de profondeur (≥36 ; D3≥12 D4≥12 D5≥6)', () => {
  assert.ok(V48.length >= 36, `≥36 exercices V48 (obtenu ${V48.length})`);
  const d = (n) => V48.filter((e) => e.difficulty === n).length;
  assert.ok(d(3) >= 12, `D3 ≥ 12 (obtenu ${d(3)})`);
  assert.ok(d(4) >= 12, `D4 ≥ 12 (obtenu ${d(4)})`);
  assert.ok(d(5) >= 6, `D5 ≥ 6 (obtenu ${d(5)})`);
});

test('V48 : domaines cibles renforcés', () => {
  const skills = new Set();
  for (const e of V48) for (const s of e.skills ?? []) skills.add(projectSkill(s));
  for (const target of ['ml', 'llm', 'rag', 'agents', 'archi', 'patterns']) {
    assert.ok(skills.has(target), `axe ${target} renforcé en V48`);
  }
});

test('V48 : schéma valide, skills connues, ≥1 public + ≥1 privé, mode honnête', () => {
  for (const e of V48) {
    const v = validateExercise(e);
    assert.ok(v.ok, `${e.id} invalide : ${v.errors.join(' ; ')}`);
    for (const s of e.skills ?? []) { assert.ok(isKnownSkill(s), `${e.id} skill inconnue ${s}`); assert.ok(projectSkill(s), `${e.id} skill non projetable ${s}`); }
    assert.ok((e.tests ?? []).some((t) => !t.private), `${e.id} : ≥1 test public`);
    assert.ok((e.tests ?? []).some((t) => t.private), `${e.id} : ≥1 test privé`);
    assert.ok(VALID_MODES.has(e.practiceMode), `${e.id} : practiceMode honnête (${e.practiceMode})`);
    if (e.runtime === 'python-ds') assert.equal(e.practiceMode, 'TOOLING_ENVIRONMENT_REQUIRED', `${e.id} : python-ds ⇒ TOOLING`);
  }
});

test('V48 : feedback diagnostique relié (≥12 exercices → misconception)', () => {
  const refs = new Set(MISCONCEPTIONS.flatMap((m) => m.exerciseRefs ?? []));
  const linked = V48.filter((e) => refs.has(e.id)).length;
  assert.ok(linked >= 12, `≥12 exercices V48 reliés à une misconception (obtenu ${linked})`);
});

test('V48 : exécution réelle — référence verte, starter casse un public', async () => {
  let ran = 0;
  for (const e of V48) {
    if (e.runtime === 'python3' && !PY) continue;
    if (e.runtime === 'python-ds' && !DS) continue;
    const ref = await runExercise(SANDBOX, e, e.reference ?? {});
    assert.ok(ref.attempt.allPassed, `${e.id} : référence 100% verte — ${JSON.stringify(ref.attempt.results.filter((r) => !r.passed)).slice(0, 300)}`);
    const st = await runExercise(SANDBOX, e, {});
    const pubFail = st.attempt.results.some((r) => !r.passed && !((e.tests.find((t2) => t2.id === r.testId) || {}).private));
    assert.ok(pubFail, `${e.id} : le starter doit casser ≥1 test public`);
    ran++;
  }
  assert.ok(ran >= 1, 'au moins un exercice V48 exécuté');
});

test('V48 : ≥5 scénarios pro valides, divulgation progressive, référence gagnante', () => {
  assert.ok(V48CAPS.length >= 5, `≥5 scénarios V48 (obtenu ${V48CAPS.length})`);
  const PHASES = ['hypotheses', 'investigation', 'diagnosis', 'decision', 'remediation', 'validation', 'communication'];
  for (const c of V48CAPS) {
    const v = validateCapstone(c);
    assert.ok(v.ok, `${c.id} invalide : ${v.errors.join(' ; ')}`);
    // divulgation progressive : au moins hypotheses → investigation → diagnosis → decision
    const kinds = (c.phases ?? []).map((p) => p.kind);
    for (const need of ['hypotheses', 'investigation', 'diagnosis', 'decision']) assert.ok(kinds.includes(need), `${c.id} : phase ${need} attendue`);
    assert.ok(PHASES.every((k) => kinds.includes(k)) || kinds.length >= 5, `${c.id} : parcours complet`);
    // bruit : au moins un artefact non déterminant
    assert.ok((c.artifacts ?? []).some((a) => a.useful === false), `${c.id} : ≥1 artefact bruit`);
    // copie de référence : toutes les bonnes réponses ⇒ réussite
    const resp = {};
    for (const p of c.phases) for (const q of p.questions) resp[q.id] = q.answer;
    const res = gradeCapstone(c, resp);
    assert.ok(res.passedOverall, `${c.id} : la référence doit réussir (ratio ${res.ratio})`);
  }
});
