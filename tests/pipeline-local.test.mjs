// CP4 (V21) — adaptateur local borné : vérification RÉELLE de syntaxe (node
// --check, parse seul, aucune exécution), exécutable/arguments fixés, timeout,
// sortie bornée, nettoyage, Docker honnête. Plus restrictif que le terminal V20.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { availability, prepare, cleanup, runRealSyntaxCheck } from '../lib/pipeline-local.mjs';

test('availability : local prêt, Docker détecté honnêtement', async () => {
  const a = await availability();
  assert.equal(a.local, 'available');
  assert.ok(['available', 'cli-only', 'absent'].includes(a.docker.state), `état docker ${a.docker.state}`);
});

test('syntaxe VALIDE → success (parse réel, sans exécution)', async () => {
  const s = prepare();
  const r = await runRealSyntaxCheck(s.workspaceDir, 'export const f = (a, b) => a + b;\n');
  assert.equal(r.status, 'success');
  cleanup(s.runToken);
});

test('syntaxe INVALIDE → failed avec diagnostic borné', async () => {
  const s = prepare();
  const r = await runRealSyntaxCheck(s.workspaceDir, 'export const f = (a, b) => {{{ a + b;\n');
  assert.equal(r.status, 'failed');
  assert.ok(r.logs.join(' ').length > 0);
  cleanup(s.runToken);
});

test('node --check ne fait qu’ANALYSER : du code « dangereux » n’est jamais exécuté', async () => {
  const s = prepare();
  // Ce code lèverait/agirait s'il était EXÉCUTÉ ; --check ne fait que le parser → success.
  const r = await runRealSyntaxCheck(s.workspaceDir, 'process.exit(3); throw new Error("boom");\n');
  assert.equal(r.status, 'success'); // syntaxe valide, JAMAIS exécutée
  cleanup(s.runToken);
});

test('workspace absent → échec propre (pas de crash)', async () => {
  const r = await runRealSyntaxCheck('/tmp/does-not-exist-xyz', 'const a=1;');
  assert.equal(r.status, 'failed');
});

test('nettoyage idempotent : workspace supprimé, double appel sûr', () => {
  const s = prepare();
  assert.equal(existsSync(s.workspaceDir), true);
  assert.equal(cleanup(s.runToken).cleaned, true);
  assert.equal(existsSync(s.workspaceDir), false);
  assert.equal(cleanup(s.runToken).cleaned, true);
});
