// Tests d'exécution RÉELLE de l'adaptateur Python (contre un répertoire
// temporaire). Sautés proprement si Python 3 est absent de la machine.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { runExercise } from '../lib/workspace-fs.mjs';
import { detectRuntime } from '../lib/runtime-detect.mjs';

const PY = detectRuntime('python3').available;
const opts = PY ? {} : { skip: 'Python 3 indisponible sur cette machine' };

let ROOT;
before(() => { ROOT = mkdtempSync(join(tmpdir(), 'lab-py-')); });
after(() => { rmSync(ROOT, { recursive: true, force: true }); });

const ex = (id, files, tests, entry = 'solution.py') => ({
  id, title: id, runtime: 'python3', workspace: { entry, files }, tests,
});

test('python : succès simple (call-equals)', opts, async () => {
  const e = ex('py-ok', [{ path: 'solution.py', content: 'def add(a, b):\n    return a + b\n' }],
    [{ id: 't', name: 'add', kind: 'call-equals', export: 'add', args: [2, 3], expected: 5 }]);
  const { attempt } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, true, JSON.stringify(attempt.results));
});

test('python : assertion échouée (mauvais retour)', opts, async () => {
  const e = ex('py-wrong', [{ path: 'solution.py', content: 'def add(a, b):\n    return a - b\n' }],
    [{ id: 't', name: 'add', kind: 'call-equals', export: 'add', args: [2, 3], expected: 5 }]);
  const { attempt } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, false);
  assert.match(attempt.results[0].message, /attendu/);
});

test('python : erreur de syntaxe → tests échoués proprement', opts, async () => {
  const e = ex('py-syntax', [{ path: 'solution.py', content: 'def add(a, b)\n    return a + b\n' }],
    [{ id: 't', name: 'add', kind: 'call-equals', export: 'add', args: [2, 3], expected: 5 }]);
  const { attempt } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, false);
  assert.ok(attempt.results.every((r) => !r.passed));
});

test('python : exception runtime capturée', opts, async () => {
  const e = ex('py-exc', [{ path: 'solution.py', content: 'def boom():\n    raise ValueError("boum")\n' }],
    [{ id: 't', name: 'boom', kind: 'call-equals', export: 'boom', args: [], expected: 1 }]);
  const { attempt } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, false);
  assert.match(attempt.results[0].message, /boum|ValueError/);
});

test('python : sortie standard (print)', opts, async () => {
  const e = ex('py-out', [{ path: 'main.py', content: 'print("Bonjour, monde")\n' }],
    [{ id: 't', name: 'sortie', kind: 'stdout-contains', expected: 'Bonjour' }], 'main.py');
  const { attempt, stdout } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, true);
  assert.match(stdout, /Bonjour, monde/);
  assert.equal(stdout.includes('__LAB_RESULT__'), false); // marqueur jamais exposé
});

test('python : multi-fichiers avec import local', opts, async () => {
  const e = ex('py-multi', [
    { path: 'main.py', content: 'from helper import triple\n\ndef run(n):\n    return triple(n)\n' },
    { path: 'helper.py', content: 'def triple(n):\n    return n * 3\n' },
  ], [{ id: 't', name: 'run', kind: 'call-equals', export: 'run', args: [4], expected: 12 }], 'main.py');
  const { attempt } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, true, JSON.stringify(attempt.results));
});

test('python : timeout (boucle infinie interrompue)', opts, async () => {
  const e = ex('py-timeout', [{ path: 'main.py', content: 'while True:\n    pass\n' }],
    [{ id: 't', name: 'x', kind: 'stdout-equals', expected: 'x' }], 'main.py');
  const t0 = Date.now();
  const { attempt, timedOut } = await runExercise(ROOT, e, {});
  assert.ok(Date.now() - t0 < 15000);
  assert.equal(timedOut, true);
  assert.equal(attempt.allPassed, false);
});

test('python : dépassement de sortie → interrompu', opts, async () => {
  const e = ex('py-flood', [{ path: 'main.py', content: 'import sys\nfor _ in range(400000):\n    sys.stdout.write("x")\n' }],
    [{ id: 't', name: 'x', kind: 'stdout-contains', expected: 'zzz' }], 'main.py');
  const { attempt, timedOut } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, false);
  assert.equal(timedOut, true);
});

test('python : dict/list sérialisés (retours structurés)', opts, async () => {
  const e = ex('py-struct', [{ path: 'solution.py', content: 'def counts(words):\n    d = {}\n    for w in words:\n        d[w] = d.get(w, 0) + 1\n    return d\n' }],
    [{ id: 't', name: 'counts', kind: 'call-equals', export: 'counts', args: [['a', 'b', 'a']], expected: { a: 2, b: 1 } }]);
  const { attempt } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, true, JSON.stringify(attempt.results));
});
