// CP3 (V23) — réconciliation & simulation : état observé (pods/endpoints),
// incidents bornés, rollout + rollback, déterminisme. PUR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reconcile, simulateIncident, simulateRollout, INCIDENTS } from '../lib/manifest-reconcile.mjs';

const set = () => ({
  resources: [
    {
      apiVersion: 'apps/v1', kind: 'Deployment', metadata: { name: 'api', namespace: 'prod', labels: { app: 'api' } },
      spec: { replicas: 3, selector: { matchLabels: { app: 'api' } }, template: { metadata: { labels: { app: 'api' } }, spec: { containers: [{ name: 'api', image: 'r/api:1' }] } } },
    },
    { apiVersion: 'v1', kind: 'Service', metadata: { name: 'api', namespace: 'prod' }, spec: { selector: { app: 'api' }, ports: [{ port: 80 }] } },
  ],
});

test('reconcile : 3 pods désirés, endpoints = 3', () => {
  const r = reconcile(set());
  assert.equal(r.desiredPods, 3);
  assert.equal(r.endpoints['prod/api'], 3);
  assert.equal(r.warnings.length, 0);
});

test('reconcile : Service orphelin → warning + 0 endpoint', () => {
  const s = set(); s.resources[1].spec.selector = { app: 'nope' };
  const r = reconcile(s);
  assert.equal(r.endpoints['prod/api'], 0);
  assert.ok(r.warnings.length >= 1);
});

test('allowlist des incidents', () => {
  assert.ok(INCIDENTS.includes('crashloop') && INCIDENTS.includes('oomkilled') && INCIDENTS.includes('rollback-blocked'));
});

test('incident inconnu → refusé', () => {
  assert.equal(simulateIncident(set(), { kind: 'nuke' }).ok, false);
});

test('crashloop : pod affecté non prêt', () => {
  const r = simulateIncident(set(), { kind: 'crashloop', target: 'api' });
  assert.ok(r.ok);
  assert.ok(r.podStates.some((p) => p.phase === 'CrashLoopBackOff' && !p.ready));
  assert.ok(r.diagnostics[0].code === 'crashloop');
});

test('oomkilled : sévérité bloquante', () => {
  const r = simulateIncident(set(), { kind: 'oomkilled', target: 'api' });
  assert.ok(r.ok && r.diagnostics[0].severity === 'blocking');
});

test('no-endpoints : service injoignable', () => {
  const s = set(); s.resources[1].spec.selector = { app: 'nope' };
  const r = simulateIncident(s, { kind: 'no-endpoints' });
  assert.ok(r.ok && r.reachable === false);
});

test('regression : pods Running mais diagnostic de régression', () => {
  const r = simulateIncident(set(), { kind: 'regression' });
  assert.ok(r.ok && r.reachable === true);
  assert.equal(r.diagnostics[0].code, 'regression');
});

test('rollback-blocked : oriente vers roll-forward', () => {
  const r = simulateIncident(set(), { kind: 'rollback-blocked' });
  assert.ok(r.ok && r.diagnostics[0].glossary.includes('reg-roll-forward'));
});

test('cible inconnue → refusée', () => {
  assert.equal(simulateIncident(set(), { kind: 'crashloop', target: 'ghost' }).ok, false);
});

test('rollout RollingUpdate sain : se termine, dispo maintenue', () => {
  const r = simulateRollout(set().resources[0], { newImageHealthy: true });
  assert.equal(r.strategy, 'RollingUpdate');
  assert.equal(r.succeeded, true);
  assert.ok(r.steps.every((s) => s.available >= 2)); // replicas - maxUnavailable
  assert.equal(r.steps[r.steps.length - 1].available, 3);
});

test('rollout bloqué (image malsaine) : ne réussit pas', () => {
  const r = simulateRollout(set().resources[0], { newImageHealthy: false });
  assert.equal(r.succeeded, false);
  assert.ok(r.rollback.available === 3);
});

test('rollout Recreate : coupure (available 0 puis replicas)', () => {
  const d = set().resources[0]; d.spec.strategy = { type: 'Recreate' };
  const r = simulateRollout(d, { newImageHealthy: true });
  assert.equal(r.strategy, 'Recreate');
  assert.equal(r.steps[0].available, 0);
  assert.equal(r.steps[1].available, 3);
});

test('déterminisme : deux simulations identiques', () => {
  assert.deepEqual(simulateIncident(set(), { kind: 'crashloop', target: 'api' }), simulateIncident(set(), { kind: 'crashloop', target: 'api' }));
  assert.deepEqual(simulateRollout(set().resources[0], { newImageHealthy: true }), simulateRollout(set().resources[0], { newImageHealthy: true }));
});
