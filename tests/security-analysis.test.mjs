// CP3 (V24) — analyseur & incident : chaque famille de règle se déclenche sur une
// fixture ciblée, déterminisme, décisions de reprise, ordre de réponse à une fuite.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeScenario } from '../lib/security-analysis.mjs';
import { simulateIncident, decideRecovery, secretResponseOrder, INCIDENTS } from '../lib/security-incident.mjs';

const cve = [{ id: 'FAKE-CVE-2024-0002', package: 'axios', affectedBelow: '1.6.0', fixed: '1.6.0', severity: 'critical', cwe: 'CWE-918' }];
const codes = (scn) => analyzeScenario(scn, cve).diagnostics.map((d) => d.code);

test('secret en clair (config) → diagnostic', () => {
  const scn = { artifacts: [{ id: 'c', kind: 'config', content: { api: { key: 'sk-FAKEABCDEFGH1234567890EXAMPLE' } } }] };
  assert.ok(codes(scn).includes('hardcoded-secret'));
});

test('secret dans un log → secret-in-log', () => {
  const scn = { artifacts: [{ id: 'l', kind: 'log', content: 'TOKEN=sk-FAKEABCDEFGH1234567890EXAMPLE' }] };
  assert.ok(codes(scn).includes('secret-in-log'));
});

test('RBAC wildcard → diagnostic', () => {
  const scn = { artifacts: [{ id: 'r', kind: 'rbac', content: { kind: 'Role', rules: [{ verbs: ['*'], resources: ['*'] }] } }] };
  assert.ok(codes(scn).includes('rbac-wildcard'));
});

test('dépendance non verrouillée + vulnérable + typosquatting', () => {
  const scn = { artifacts: [{ id: 'lk', kind: 'lockfile', content: { dependencies: [{ name: 'axios', version: '1.5.0' }, { name: 'lodash', version: '^4.17.0' }, { name: 'expresss', version: '4.0.0' }] } }] };
  const c = codes(scn);
  assert.ok(c.includes('dependency-vulnerable') && c.includes('dependency-unpinned') && c.includes('typosquatting'));
});

test('durcissement k8s : root + capabilities + image latest', () => {
  const scn = { artifacts: [{ id: 'm', kind: 'manifest', content: { kind: 'Deployment', spec: { template: { spec: { containers: [{ name: 'a', image: 'x:latest', securityContext: { capabilities: { add: ['NET_ADMIN'] } } }] } } } } }] };
  const c = codes(scn);
  assert.ok(c.includes('workload-root') && c.includes('capabilities-excessive') && c.includes('image-untrusted-tag'));
});

test('en-têtes de sécurité manquants', () => {
  const scn = { artifacts: [{ id: 'h', kind: 'headers', content: { 'x-frame-options': 'DENY' } }] };
  assert.ok(codes(scn).includes('missing-security-headers'));
});

test('pipeline journalise un secret', () => {
  const scn = { artifacts: [{ id: 'p', kind: 'pipeline', content: 'run: echo $DEPLOY_TOKEN' }] };
  assert.ok(codes(scn).includes('pipeline-logs-secret'));
});

test('scénario sain → aucun diagnostic', () => {
  const scn = { artifacts: [{ id: 'ok', kind: 'config', content: { db: { host: 'db', passwordFrom: 'secretKeyRef:x/y' } } }] };
  assert.equal(analyzeScenario(scn, cve).summary.total, 0);
});

test('synthèse : limites documentées', () => {
  const a = analyzeScenario({ artifacts: [] }, cve);
  assert.ok(a.summary.limits.length >= 2);
});

test('allowlist des incidents', () => {
  assert.ok(INCIDENTS.includes('secret-leak') && INCIDENTS.includes('dependency-compromise'));
});

test('réponse à fuite de secret : révocation AVANT rotation', () => {
  const o = secretResponseOrder();
  assert.equal(o[0], 'revocation');
  assert.ok(o.indexOf('revocation') < o.indexOf('rotation'));
});

test('decideRecovery : migration bloque → roll-forward', () => {
  assert.equal(decideRecovery({ dataMigrationBlocks: true, reversible: true }), 'roll-forward');
  assert.equal(decideRecovery({ reversible: true }), 'rollback');
  assert.equal(decideRecovery({ reversible: false, urgent: true }), 'hotfix');
  assert.equal(decideRecovery({}), 'mitigation');
});

test('simulateIncident : phases déterministes + ordre', () => {
  const r = simulateIncident({ incident: 'secret-leak' }, 'secret-leak');
  assert.ok(r.ok);
  assert.equal(r.phases.length, 6);
  assert.equal(r.order[0], 'revocation');
  assert.deepEqual(simulateIncident({}, 'secret-leak'), simulateIncident({}, 'secret-leak'));
});

test('simulateIncident : inconnu → refusé', () => {
  assert.equal(simulateIncident({}, 'nope').ok, false);
});
