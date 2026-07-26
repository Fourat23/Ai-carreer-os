// Tests du modèle d'exercice exécutable (lib/exercise.mjs) — pur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import {
  RUNTIMES, TEST_KINDS, getRuntime, isSafeRelPath, deepEqual,
  validateExercise, validateTest, checkTest, buildAttemptResult, effectiveLimits,
} from '../lib/exercise.mjs';

const valid = {
  id: 'demo', title: 'Démo', runtime: 'node-js',
  workspace: { entry: 'solution.mjs', files: [{ path: 'solution.mjs', content: 'export const f = () => 1;' }] },
  tests: [{ id: 't1', name: 'un', kind: 'call-equals', export: 'f', args: [], expected: 1 }],
};

test('getRuntime : allowlist fermée', () => {
  assert.equal(getRuntime('node-js').binary, 'node');
  assert.equal(getRuntime('python'), null);      // non supporté → null
  assert.equal(getRuntime('__proto__'), null);   // pas de pollution
  assert.ok(TEST_KINDS.includes('call-equals'));
  assert.ok(RUNTIMES['node-js'].timeoutMs > 0);
});

test('isSafeRelPath : rejette traversal, absolu, backslash, segments dangereux', () => {
  assert.equal(isSafeRelPath('solution.mjs'), true);
  assert.equal(isSafeRelPath('src/util.mjs'), true);
  assert.equal(isSafeRelPath('../secret'), false);
  assert.equal(isSafeRelPath('a/../b'), false);
  assert.equal(isSafeRelPath('/etc/passwd'), false);
  assert.equal(isSafeRelPath('C:\\win'), false);
  assert.equal(isSafeRelPath('a\\b'), false);
  assert.equal(isSafeRelPath('a/__proto__/b'), false);
  assert.equal(isSafeRelPath(''), false);
  assert.equal(isSafeRelPath('a/./b'), false);
});

test('deepEqual : primitifs, tableaux, objets, NaN', () => {
  assert.equal(deepEqual([1, 2, 3], [1, 2, 3]), true);
  assert.equal(deepEqual({ a: 1, b: [2] }, { a: 1, b: [2] }), true);
  assert.equal(deepEqual({ a: 1 }, { a: 1, b: 2 }), false);
  assert.equal(deepEqual(NaN, NaN), true);
  assert.equal(deepEqual('x', 'y'), false);
});

test('validateExercise : accepte un exercice bien formé', () => {
  assert.deepEqual(validateExercise(valid), { ok: true, errors: [] });
});

test('validateExercise : refuse runtime inconnu, entry absent, chemins non sûrs', () => {
  assert.equal(validateExercise({ ...valid, runtime: 'ruby' }).ok, false);
  assert.equal(validateExercise({ ...valid, workspace: { entry: 'missing.mjs', files: valid.workspace.files } }).ok, false);
  assert.equal(validateExercise({ ...valid, workspace: { entry: '../x.mjs', files: [{ path: '../x.mjs', content: '' }] } }).ok, false);
});

test('validateExercise : ids de test uniques, au moins un test', () => {
  const dup = { ...valid, tests: [valid.tests[0], valid.tests[0]] };
  assert.equal(validateExercise(dup).ok, false);
  assert.equal(validateExercise({ ...valid, tests: [] }).ok, false);
});

test('validateTest : call-equals exige export + expected ; stdout exige texte', () => {
  assert.equal(validateTest({ id: 'a', name: 'a', kind: 'call-equals', export: 'f', expected: 1 }), null);
  assert.match(validateTest({ id: 'a', name: 'a', kind: 'call-equals', expected: 1 }), /export/);
  assert.match(validateTest({ id: 'a', name: 'a', kind: 'call-equals', export: 'f' }), /attendue/);
  assert.equal(validateTest({ id: 'b', name: 'b', kind: 'stdout-equals', expected: 'x' }), null);
  assert.match(validateTest({ id: 'b', name: 'b', kind: 'stdout-equals', expected: 3 }), /texte/);
  assert.match(validateTest({ id: 'c', name: 'c', kind: 'unknown' }), /type inconnu/);
});

test('checkTest : call-equals compare par valeur', () => {
  const t = { id: 't', name: 'n', kind: 'call-equals', expected: [1, 2] };
  assert.equal(checkTest(t, { value: [1, 2] }).passed, true);
  assert.equal(checkTest(t, { value: [1, 3] }).passed, false);
  assert.equal(checkTest(t, {}, 'boom').passed, false);           // erreur d'exécution
  assert.match(checkTest(t, {}, 'boom').message, /boom/);
});

test('checkTest : stdout-equals (trim) et stdout-contains', () => {
  const eq = { id: 'e', name: 'e', kind: 'stdout-equals', expected: 'Bonjour, monde' };
  assert.equal(checkTest(eq, { stdout: 'Bonjour, monde\n' }).passed, true);
  assert.equal(checkTest(eq, { stdout: 'autre' }).passed, false);
  const ct = { id: 'c', name: 'c', kind: 'stdout-contains', expected: 'Bonjour' };
  assert.equal(checkTest(ct, { stdout: 'Bonjour, monde' }).passed, true);
  assert.equal(checkTest(ct, { stdout: 'Salut' }).passed, false);
});

test('buildAttemptResult : agrège compteurs + statut global', () => {
  const results = [
    { testId: 'a', passed: true }, { testId: 'b', passed: true }, { testId: 'c', passed: false },
  ];
  const r = buildAttemptResult('demo', results, { at: '2026-07-25T00:00:00.000Z', durationMs: 12 });
  assert.equal(r.total, 3);
  assert.equal(r.passed, 2);
  assert.equal(r.allPassed, false);
  assert.equal(r.exerciseId, 'demo');
  assert.equal(buildAttemptResult('x', results.map((x) => ({ ...x, passed: true }))).allPassed, true);
  assert.equal(buildAttemptResult('x', []).allPassed, false); // aucun test → non réussi
});

// Les fixtures livrées doivent être valides (contrat de contenu).
test('fixtures : data/exercises/*.json sont des exercices valides', () => {
  const dir = new URL('../data/exercises/', import.meta.url);
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  assert.ok(files.length >= 2, 'au moins deux exercices de démo');
  const ids = new Set();
  for (const f of files) {
    const ex = JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
    const v = validateExercise(ex);
    assert.ok(v.ok, `${f} invalide : ${v.errors.join(' ; ')}`);
    assert.equal(ids.has(ex.id), false, `id dupliqué ${ex.id}`);
    ids.add(ex.id);
  }
});

// ── CP4 : modèle multi-runtime ──
test('validateExercise : cohérence runtime <-> extension du fichier d entrée', () => {
  const py = {
    id: 'p', title: 'P', runtime: 'python3',
    workspace: { entry: 'solution.py', files: [{ path: 'solution.py', content: 'def f():\n return 1\n' }] },
    tests: [{ id: 't', name: 'n', kind: 'call-equals', export: 'f', args: [], expected: 1 }],
  };
  assert.equal(validateExercise(py).ok, true);
  // Python mais entrée .mjs → incohérent
  const bad = { ...py, workspace: { entry: 'solution.mjs', files: [{ path: 'solution.mjs', content: 'x' }] } };
  const r = validateExercise(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /incohérente/.test(e)));
});

test('validateExercise : limits bornées valides / invalides', () => {
  const base = {
    id: 'x', title: 'X', runtime: 'node-js',
    workspace: { entry: 'solution.mjs', files: [{ path: 'solution.mjs', content: 'export const f=()=>1;' }] },
    tests: [{ id: 't', name: 'n', kind: 'call-equals', export: 'f', args: [], expected: 1 }],
  };
  assert.equal(validateExercise({ ...base, limits: { timeoutMs: 2000, maxOutputBytes: 5000 } }).ok, true);
  assert.equal(validateExercise({ ...base, limits: { timeoutMs: -1 } }).ok, false);
  assert.equal(validateExercise({ ...base, limits: { maxOutputBytes: 0 } }).ok, false);
  assert.equal(validateExercise({ ...base, skills: 'nope' }).ok, false); // skills doit être un tableau
});

test('effectiveLimits : bornées par le plafond du runtime', () => {
  const node = { runtime: 'node-js' };
  assert.equal(effectiveLimits(node).timeoutMs, RUNTIMES['node-js'].timeoutMs); // défaut = plafond
  assert.equal(effectiveLimits({ runtime: 'node-js', limits: { timeoutMs: 1000 } }).timeoutMs, 1000); // en dessous → gardé
  assert.equal(effectiveLimits({ runtime: 'node-js', limits: { timeoutMs: 999999 } }).timeoutMs, RUNTIMES['node-js'].timeoutMs); // au-dessus → borné
  assert.equal(effectiveLimits({}).timeoutMs > 0, true); // runtime absent → défaut node
});
