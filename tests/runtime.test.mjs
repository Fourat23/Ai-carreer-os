// Tests du registre de runtimes (lib/runtime.mjs) + détection (runtime-detect).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LAB_RESULT_MARKER, DEFAULT_RUNTIME_ID, getRuntimeAdapter, getRuntime,
  isKnownRuntime, listRuntimeAdapters, RUNTIMES,
} from '../lib/runtime.mjs';
import { detectRuntime, runtimeStatus } from '../lib/runtime-detect.mjs';

const nodeEx = {
  id: 'x', title: 'X', runtime: 'node-js',
  workspace: { entry: 'solution.mjs', files: [{ path: 'solution.mjs', content: 'export const f=()=>1;' }] },
  tests: [{ id: 't', name: 'n', kind: 'call-equals', export: 'f', args: [], expected: 1 }],
};
const pyEx = {
  id: 'p', title: 'P', runtime: 'python3',
  workspace: { entry: 'solution.py', files: [{ path: 'solution.py', content: 'def f():\n    return 1\n' }] },
  tests: [{ id: 't', name: 'n', kind: 'call-equals', export: 'f', args: [], expected: 1 }],
};

test('registre : node et python connus ; inconnu/dangereux → null', () => {
  assert.equal(getRuntimeAdapter('node-js').id, 'node-js');
  assert.equal(getRuntimeAdapter('python3').id, 'python3');
  assert.equal(getRuntimeAdapter('ruby'), null);
  assert.equal(getRuntimeAdapter('__proto__'), null);
  assert.equal(getRuntime('python'), null); // 'python' n'est pas un id (seul python3)
  assert.equal(isKnownRuntime('node-js'), true);
  assert.equal(isKnownRuntime('ruby'), false);
  assert.equal(DEFAULT_RUNTIME_ID, 'node-js');
});

test('registre : liste + capacités + extensions', () => {
  const ids = listRuntimeAdapters().map((a) => a.id);
  assert.ok(ids.includes('node-js') && ids.includes('python3'));
  assert.equal(RUNTIMES['node-js'].binary, 'node');           // compat V8
  assert.ok(RUNTIMES['node-js'].timeoutMs > 0);
  assert.ok(getRuntimeAdapter('node-js').extensions.includes('.mjs'));
  assert.deepEqual(getRuntimeAdapter('python3').extensions, ['.py']);
  assert.equal(getRuntimeAdapter('node-js').capabilities.execution, true);
  assert.equal(getRuntimeAdapter('python3').capabilities.multiFile, true);
});

test('adaptateur Node : harnais JS avec marqueur, entrée, args figés', () => {
  const a = getRuntimeAdapter('node-js');
  const h = a.buildHarness(nodeEx);
  assert.match(h, /solution\.mjs/);
  assert.ok(h.includes(LAB_RESULT_MARKER));
  assert.match(h, /await import/);
  assert.deepEqual(a.buildArgs(a.harnessFile), [a.harnessFile]);
  assert.match(a.harnessFile, /\.mjs$/);
  assert.equal(a.env().NODE_ENV, 'production');
});

test('adaptateur Python : harnais PY avec importlib, marqueur, entrée', () => {
  const a = getRuntimeAdapter('python3');
  const h = a.buildHarness(pyEx);
  assert.match(h, /importlib/);
  assert.ok(h.includes(LAB_RESULT_MARKER));
  assert.match(h, /solution\.py/);
  assert.match(a.harnessFile, /\.py$/);
  assert.equal(a.env().PYTHONDONTWRITEBYTECODE, '1');
});

test('détection : Node toujours disponible (chemin absolu)', () => {
  const d = detectRuntime('node-js');
  assert.equal(d.available, true);
  assert.equal(d.binary, process.execPath);
  assert.ok(d.version);
});

test('détection : runtime inconnu → indisponible, message clair', () => {
  const d = detectRuntime('ruby');
  assert.equal(d.available, false);
  assert.match(d.error, /inconnu/);
  const s = runtimeStatus('node-js');
  assert.equal(s.available, true);
  assert.equal(s.id, 'node-js');
});
