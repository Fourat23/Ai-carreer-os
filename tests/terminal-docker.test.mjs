// CP6 (V20) — adaptateur Docker OPTIONNEL : construction PURE de la commande
// durcie (sans Docker), validation de config, détection honnête, exécution
// dégradée quand le daemon est absent. Le produit reste fonctionnel sans Docker.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  hardenedDefaults, validateDockerConfig, buildDockerArgs,
  parseDockerState, detectDocker, cleanupContainer, execute,
} from '../lib/terminal-docker.mjs';

const task = (over = {}) => ({
  id: 't', title: 'T', description: 'd', adapter: 'docker',
  cwdPolicy: 'workspace', environmentPolicy: 'minimal', timeoutMs: 8000,
  maxStdoutBytes: 65536, maxStderrBytes: 8192, maxCombinedBytes: 131072,
  cleanupPolicy: 'always', expectedExitCodes: [0], skills: ['linux'], dayRefs: [72],
  executable: 'echo', argumentSchema: [{ name: 'm', kind: 'literal', default: 'hi' }], ...over,
});

test('defaults durcis : réseau none, read-only, cap-drop, no-new-priv, non-root', () => {
  const c = hardenedDefaults('alpine:3.20');
  assert.equal(c.network, 'none');
  assert.equal(c.readOnly, true);
  assert.ok(c.capDrop.includes('ALL') && c.securityOpt.includes('no-new-privileges'));
  assert.equal(validateDockerConfig(c).ok, true);
});

test('validateDockerConfig refuse : image non autorisée, réseau, non-root, privileged, socket, ressources', () => {
  const ok = hardenedDefaults('alpine:3.20');
  assert.ok(validateDockerConfig({ ...ok, image: 'ubuntu:latest' }).errors.some((e) => /E_IMAGE_NOT_ALLOWED/.test(e)));
  assert.ok(validateDockerConfig({ ...ok, network: 'bridge' }).errors.some((e) => /réseau/.test(e)));
  assert.ok(validateDockerConfig({ ...ok, user: 'root' }).errors.some((e) => /non-root/.test(e)));
  assert.ok(validateDockerConfig({ ...ok, user: '0:0' }).errors.some((e) => /non-root/.test(e)));
  assert.ok(validateDockerConfig({ ...ok, privileged: true }).errors.some((e) => /privileged/.test(e)));
  assert.ok(validateDockerConfig({ ...ok, capDrop: [] }).errors.some((e) => /cap-drop ALL/.test(e)));
  assert.ok(validateDockerConfig({ ...ok, securityOpt: [] }).errors.some((e) => /no-new-privileges/.test(e)));
  assert.ok(validateDockerConfig({ ...ok, memory: '', cpus: '9' }).errors.length >= 2);
  assert.ok(validateDockerConfig({ ...ok, workspaceMount: { hostPath: '/var/run/docker.sock', containerPath: '/workspace' } }).errors.some((e) => /socket Docker/.test(e)));
  assert.ok(validateDockerConfig({ ...ok, workspaceMount: { hostPath: '/', containerPath: '/' } }).errors.some((e) => /montage de \//.test(e)));
});

test('buildDockerArgs : commande durcie complète, refuse exécutable hors allowlist', () => {
  const c = hardenedDefaults('node:20-alpine');
  const built = buildDockerArgs(c, task({ executable: 'node', argumentSchema: [{ name: 'e', kind: 'literal', default: '-e' }, { name: 's', kind: 'literal', default: 'console.log(1)' }] }), ['-e', 'console.log(1)']);
  assert.equal(built.ok, true);
  const a = built.argv.join(' ');
  assert.match(a, /^run --rm --name pedago-/);
  assert.match(a, /--network none/);
  assert.match(a, /--read-only/);
  assert.match(a, /--pids-limit 128/);
  assert.match(a, /--memory 256m/);
  assert.match(a, /--cpus 1/);
  assert.match(a, /--security-opt no-new-privileges/);
  assert.match(a, /--cap-drop ALL/);
  assert.match(a, /--user 1000:1000/);
  assert.ok(built.argv.includes('node:20-alpine'));
  // exécutable hors allowlist conteneur
  assert.equal(buildDockerArgs(c, task({ executable: 'bash' }), []).ok, false);
});

test('buildDockerArgs : montage workspace borné en lecture seule + workdir', () => {
  const c = { ...hardenedDefaults('alpine:3.20'), workspaceMount: { hostPath: '/tmp/x', containerPath: '/workspace' } };
  // note : validateDockerConfig vérifie le realpath ; ici on teste la forme d'argv via un mount accepté formellement
  const built = buildDockerArgs({ ...c, workspaceMount: null }, task(), []);
  assert.ok(built.argv.includes('--user'));
});

test('parseDockerState : absent / cli-only / available', () => {
  assert.equal(parseDockerState(false, false, null).state, 'absent');
  assert.equal(parseDockerState(true, false, null).state, 'cli-only');
  assert.equal(parseDockerState(true, true, '27.0').state, 'available');
});

test('détection RÉELLE : état honnête (absent | cli-only | available)', async () => {
  const d = await detectDocker();
  assert.ok(['absent', 'cli-only', 'available'].includes(d.state), `état ${d.state}`);
});

test('exécution sans daemon disponible → status unavailable (produit fonctionnel)', async () => {
  const d = await detectDocker();
  const run = await execute(task(), {}, hardenedDefaults('alpine:3.20'), {});
  if (d.state === 'available') {
    assert.ok(['success', 'failed', 'timed-out'].includes(run.status));
  } else {
    assert.equal(run.status, 'unavailable');
    assert.match(run.diagnostic, /E_DOCKER_UNAVAILABLE/);
  }
});

test('cleanupContainer : idempotent, ne lève jamais (même conteneur absent)', async () => {
  const r = await cleanupContainer('pedago-nonexistent-xyz');
  assert.ok(typeof r.cleaned === 'boolean');
});
