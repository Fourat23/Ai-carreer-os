// CP5 (V20) — adaptateur local borné : exécution RÉELLE (execFile, shell:false).
// Sécurité (allowlist, arguments, chemins), timeout, sortie plafonnée, stderr,
// code de sortie, annulation, nettoyage, env sans secret, métacaractères = données.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  LOCAL_ALLOWLIST, availability, prepare, cleanup, cancel, execute,
} from '../lib/terminal-local.mjs';

const baseTask = (over = {}) => ({
  id: 't', title: 'T', description: 'd', adapter: 'local',
  cwdPolicy: 'workspace', environmentPolicy: 'minimal',
  timeoutMs: 4000, maxStdoutBytes: 65536, maxStderrBytes: 8192, maxCombinedBytes: 131072,
  cleanupPolicy: 'always', expectedExitCodes: [0], skills: ['linux'], dayRefs: [72],
  executable: 'echo', argumentSchema: [{ name: 'msg', kind: 'literal', default: 'salut' }], ...over,
});
const lit = (name, def) => ({ name, kind: 'literal', default: def });

test('availability : local toujours disponible', () => {
  assert.equal(availability().state, 'available');
  assert.ok(LOCAL_ALLOWLIST.has('ls') && !LOCAL_ALLOWLIST.has('bash'));
});

test('succès : echo borné retourne la sortie, exit 0, status success', async () => {
  const s = prepare();
  const run = await execute(baseTask(), {}, s);
  assert.equal(run.status, 'success');
  assert.equal(run.exitCode, 0);
  assert.match(run.stdout, /salut/);
  assert.equal(run.truncated, false);
  cleanup(s.runToken);
});

test('binaire hors allowlist refusé (bash)', async () => {
  const s = prepare();
  const run = await execute(baseTask({ executable: 'bash', argumentSchema: [lit('c', '-c')] }), {}, s);
  assert.equal(run.status, 'failed');
  assert.match(run.diagnostic, /E_BINARY_NOT_ALLOWED/);
  cleanup(s.runToken);
});

test('argument invalide refusé (flag hors valeurs)', async () => {
  const s = prepare();
  const task = baseTask({ executable: 'ls', argumentSchema: [{ name: 'f', kind: 'flag', values: ['-l', '-la'], default: '-l' }] });
  const run = await execute(task, { f: '-rf' }, s);
  assert.equal(run.status, 'failed');
  assert.match(run.diagnostic, /E_ARG_INVALID/);
  cleanup(s.runToken);
});

test('chemin absolu / traversal refusés (jamais hors workspace)', async () => {
  const s = prepare();
  const task = baseTask({ executable: 'cat', argumentSchema: [{ name: 'p', kind: 'path', required: true }] });
  assert.match((await execute(task, { p: '/etc/passwd' }, s)).diagnostic, /E_ARG_INVALID/);
  assert.match((await execute(task, { p: '../../etc/passwd' }, s)).diagnostic, /E_ARG_INVALID/);
  cleanup(s.runToken);
});

test('cat lit un fichier DU workspace (chemin relatif validé)', async () => {
  const s = prepare();
  writeFileSync(join(s.workspaceDir, 'note.txt'), 'contenu-workspace');
  const task = baseTask({ executable: 'cat', argumentSchema: [{ name: 'p', kind: 'path', default: 'note.txt' }] });
  const run = await execute(task, {}, s);
  assert.equal(run.status, 'success');
  assert.match(run.stdout, /contenu-workspace/);
  cleanup(s.runToken);
});

test('timeout : boucle infinie interrompue (SIGKILL), status timed-out', async () => {
  const s = prepare();
  const task = baseTask({ executable: 'node', timeoutMs: 500, argumentSchema: [lit('e', '-e'), lit('src', 'while(true){}')] });
  const run = await execute(task, {}, s);
  assert.equal(run.status, 'timed-out');
  assert.equal(run.timedOut, true);
  cleanup(s.runToken);
});

test('sortie excessive : tronquée et signalée', async () => {
  const s = prepare();
  const task = baseTask({ executable: 'node', maxStdoutBytes: 100, argumentSchema: [lit('e', '-e'), lit('src', 'process.stdout.write("x".repeat(50000))')] });
  const run = await execute(task, {}, s);
  assert.equal(run.truncated, true);
  assert.ok(Buffer.from(run.stdout, 'utf8').length <= 100);
  cleanup(s.runToken);
});

test('stderr + code de sortie non nul → failed', async () => {
  const s = prepare();
  const task = baseTask({ executable: 'node', argumentSchema: [lit('e', '-e'), lit('src', 'process.stderr.write("boom");process.exit(3)')] });
  const run = await execute(task, {}, s);
  assert.equal(run.status, 'failed');
  assert.equal(run.exitCode, 3);
  assert.match(run.stderr, /boom/);
  cleanup(s.runToken);
});

test('annulation : SIGTERM interrompt une exécution longue, status cancelled', async () => {
  const s = prepare();
  const task = baseTask({ executable: 'node', timeoutMs: 10000, argumentSchema: [lit('e', '-e'), lit('src', 'setTimeout(()=>{},9000)')] });
  const p = execute(task, {}, { ...s, runId: 'run-cancel-1' });
  await new Promise((r) => setTimeout(r, 150));
  const c1 = cancel('run-cancel-1');
  const c2 = cancel('run-cancel-1'); // double annulation idempotente
  assert.equal(c1.cancelled, true);
  const run = await p;
  assert.equal(run.status, 'cancelled');
  assert.equal(run.cancelled, true);
  assert.equal(c2.cancelled ?? false, true);
  cleanup(s.runToken);
});

test('environnement minimal : aucun secret hérité', async () => {
  process.env.FAKE_TERMINAL_SECRET = 'top-secret-should-not-leak';
  const s = prepare();
  const task = baseTask({ executable: 'node', argumentSchema: [lit('e', '-e'), lit('src', 'console.log("secret="+(process.env.FAKE_TERMINAL_SECRET||"absent"))')] });
  const run = await execute(task, {}, s);
  assert.match(run.stdout, /secret=absent/);
  delete process.env.FAKE_TERMINAL_SECRET;
  cleanup(s.runToken);
});

test('métacaractères shell traités comme DONNÉES (aucune exécution shell)', async () => {
  const s = prepare();
  // echo reçoit "a; rm -rf /" comme un seul argument littéral → affiché tel quel
  const task = baseTask({ executable: 'echo', argumentSchema: [lit('msg', 'a; rm -rf / && whoami')] });
  const run = await execute(task, {}, s);
  assert.equal(run.status, 'success');
  assert.match(run.stdout, /a; rm -rf \/ && whoami/);
  cleanup(s.runToken);
});

test('nettoyage idempotent : workspace supprimé, double appel sûr', () => {
  const s = prepare();
  assert.equal(existsSync(s.workspaceDir), true);
  assert.equal(cleanup(s.runToken).cleaned, true);
  assert.equal(existsSync(s.workspaceDir), false);
  assert.equal(cleanup(s.runToken).cleaned, true); // idempotent
});
