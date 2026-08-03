// CP3 (V21) — orchestrateur déterministe : trigger, DAG, dépendances, statuts,
// fail-fast, allowFailure, condition, approbation, annulation, masquage,
// action inconnue, déterminisme. PUR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTrigger, runPipeline } from '../lib/pipeline-engine.mjs';
import { runAction, ACTIONS } from '../lib/pipeline-actions.mjs';

const STAGES = [{ id: 'verify', name: 'V', order: 1 }, { id: 'package', name: 'P', order: 2 }];
const pipe = (jobs, over = {}) => ({ id: 'p', title: 'P', description: 'd', version: '1', trigger: ['pull_request'], stages: STAGES, jobs, skills: ['devops'], dayRefs: [326], ...over });
const ev = (over = {}) => ({ kind: 'pull_request', branch: 'main', ...over });
const J = (id, action, over = {}) => ({ id, name: id, stage: 'verify', action, timeoutMs: 3000, ...over });

test('resolveTrigger : événement + filtres de branche/tag', () => {
  assert.equal(resolveTrigger(pipe([]), ev()), true);
  assert.equal(resolveTrigger(pipe([], { branchFilters: ['main'] }), ev({ branch: 'dev' })), false);
  assert.equal(resolveTrigger(pipe([], { trigger: ['tag'], tagFilters: ['v1'] }), ev({ kind: 'tag', tag: 'v1' })), true);
  assert.equal(resolveTrigger(pipe([]), ev({ kind: 'push' })), false);
});

test('pipeline simple : tout réussit, statut global success', () => {
  const r = runPipeline(pipe([J('lint', 'lint', { with: { lintErrors: 0 } }), J('test', 'test', { with: { failed: 0, total: 5 } })]), ev());
  assert.equal(r.triggered, true);
  assert.equal(r.status, 'success');
  assert.equal(r.jobs.lint.status, 'success');
  assert.ok(r.durationMs > 0);
});

test('dépendances : build après lint+test ; artefact produit', () => {
  const r = runPipeline(pipe([
    J('lint', 'lint', { with: { lintErrors: 0 } }),
    J('test', 'test', { with: { failed: 0, total: 3 } }),
    J('build', 'build', { stage: 'package', needs: ['lint', 'test'], with: { buildOk: true }, artifactsOut: ['app.tgz'] }),
  ]), ev());
  assert.equal(r.status, 'success');
  assert.deepEqual(r.artifacts, [{ name: 'app.tgz' }]);
});

test('échec bloquant + fail-fast : lint échoue → build bloqué', () => {
  const r = runPipeline(pipe([
    J('lint', 'lint', { with: { lintErrors: 3 } }),
    J('build', 'build', { stage: 'package', needs: ['lint'], with: { buildOk: true } }),
  ]), ev());
  assert.equal(r.jobs.lint.status, 'failed');
  assert.equal(r.jobs.build.status, 'blocked');
  assert.equal(r.status, 'failed');
});

test('échec toléré (allowFailure) : n’échoue pas le global', () => {
  const r = runPipeline(pipe([
    J('flaky', 'test', { allowFailure: true, with: { failed: 1, total: 2 } }),
    J('build', 'build', { stage: 'package', needs: ['flaky'], with: { buildOk: true } }),
  ]), ev());
  assert.equal(r.jobs.flaky.status, 'failed');
  assert.equal(r.jobs.build.status, 'success'); // prérequis toléré → non bloqué
  assert.equal(r.status, 'success');
});

test('condition non satisfaite → job skipped', () => {
  const r = runPipeline(pipe([J('deploy', 'build', { condition: { branchIn: ['release'] }, with: { buildOk: true } })]), ev({ branch: 'main' }));
  assert.equal(r.jobs.deploy.status, 'skipped');
});

test('approbation : bloquée si non approuvée, réussie si approuvée', () => {
  const p = pipe([J('gate', 'approval', { stage: 'package' })]);
  assert.equal(runPipeline(p, ev(), { approved: false }).jobs.gate.status, 'blocked');
  assert.equal(runPipeline(p, ev(), { approved: true }).jobs.gate.status, 'success');
});

test('cycle → statut failed, aucune exécution', () => {
  const r = runPipeline(pipe([J('a', 'lint', { needs: ['b'] }), J('b', 'test', { needs: ['a'] })]), ev());
  assert.equal(r.status, 'failed');
  assert.match(r.diagnostic, /E_CYCLE/);
});

test('trigger non correspondant → skipped, non déclenché', () => {
  const r = runPipeline(pipe([J('lint', 'lint')]), ev({ kind: 'push' }));
  assert.equal(r.triggered, false);
  assert.equal(r.status, 'skipped');
});

test('annulation (cancelBefore) : les jobs suivants sont cancelled', () => {
  const r = runPipeline(pipe([J('lint', 'lint'), J('build', 'build', { stage: 'package', needs: ['lint'] })]), ev(), {}, { cancelBefore: 'build' });
  assert.equal(r.jobs.build.status, 'cancelled');
  assert.equal(r.status, 'cancelled');
});

test('masquage des secrets dans les logs + secret-scan', () => {
  const r = runPipeline(pipe([J('scan', 'secret-scan', { with: { log: 'deploying with token ghp_ABCDEFGH1234567890' }, secrets: ['GH'] })]),
    ev(), { secrets: { GH: 'ghp_ABCDEFGH1234567890' } });
  const blob = JSON.stringify(r.logs);
  assert.ok(!/ghp_ABCDEFGH/.test(blob), 'le secret ne doit jamais apparaître en clair');
  assert.ok(blob.includes('***') || /masqué/.test(blob));
});

test('action inconnue → failed E_UNKNOWN_ACTION', () => {
  assert.equal(runAction({ action: 'launch-missiles' }).status, 'failed');
  assert.match(runAction({ action: 'launch-missiles' }).logs[0], /E_UNKNOWN_ACTION/);
  assert.equal(Object.keys(ACTIONS).length, 10);
});

test('déterminisme : mêmes entrées → même sortie', () => {
  const build = () => runPipeline(pipe([J('lint', 'lint', { with: { lintErrors: 0 } }), J('test', 'test', { with: { failed: 1, total: 4 } })]), ev(), {}, { clock: () => 1000 });
  assert.deepEqual(build(), build());
});
