// CP3 (V22) — moteur d'analyse : chaque famille de diagnostic se déclenche sur
// une fixture minimale et NE se déclenche PAS sur une topologie saine ;
// déterminisme (2 exécutions identiques) ; synthèse cohérente. PUR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeTopology, SEVERITIES } from '../lib/topology-analysis.mjs';

const codes = (topo) => analyzeTopology(topo).diagnostics.map((d) => d.code);

// Topologie SAINE : client → LB → 2 API (multi-zone) → DB privée + backup testé + monitoring.
const healthy = () => ({
  id: 'sane', title: 'Saine', description: 'HA propre',
  environments: ['production'],
  zones: [{ id: 'az-a', label: 'A' }, { id: 'az-b', label: 'B' }],
  nodes: [
    { id: 'client', kind: 'client', label: 'Client' },
    { id: 'lb', kind: 'load-balancer', label: 'LB', zone: 'az-a', environment: 'production', props: { managed: true } },
    { id: 'api-a', kind: 'api', label: 'API A', zone: 'az-a', environment: 'production', props: { replicas: 2 } },
    { id: 'api-b', kind: 'api', label: 'API B', zone: 'az-b', environment: 'production', props: { replicas: 2 } },
    { id: 'db', kind: 'relational-db', label: 'DB', zone: 'az-a', environment: 'production', props: { public: false } },
    { id: 'db-r', kind: 'relational-db', label: 'DB réplica', zone: 'az-b', environment: 'production', props: { public: false } },
    { id: 'bak', kind: 'backup', label: 'Backup', props: { restoreTested: true } },
    { id: 'mon', kind: 'monitoring', label: 'Monitoring' },
  ],
  edges: [
    { id: 'e1', from: 'client', to: 'lb', kind: 'routes-to', props: { tls: true } },
    { id: 'e2', from: 'lb', to: 'api-a', kind: 'routes-to' },
    { id: 'e3', from: 'lb', to: 'api-b', kind: 'routes-to' },
    { id: 'e4', from: 'api-a', to: 'db', kind: 'writes' },
    { id: 'e5', from: 'api-b', to: 'db', kind: 'writes' },
    { id: 'e6', from: 'db', to: 'db-r', kind: 'replicates-to' },
    { id: 'e7', from: 'bak', to: 'db', kind: 'backs-up' },
    { id: 'e8', from: 'mon', to: 'api-a', kind: 'monitors' },
  ],
  skills: ['archi'], dayRefs: [78],
});

test('topologie saine → aucun diagnostic bloquant/risque', () => {
  const { diagnostics, summary } = analyzeTopology(healthy());
  assert.equal(summary.bySeverity.blocking, 0);
  assert.equal(summary.bySeverity.risk, 0, `risques inattendus : ${diagnostics.filter((d) => d.severity === 'risk').map((d) => d.code)}`);
});

test('base de données exposée publiquement → blocking', () => {
  const t = healthy(); t.nodes[4].props = { public: true };
  assert.ok(codes(t).includes('db-public-exposure'));
});

test('deux services sans load balancer → risk', () => {
  const t = healthy();
  t.nodes = t.nodes.filter((n) => n.id !== 'lb');
  t.edges = t.edges.filter((e) => e.from !== 'lb').concat([{ id: 'ec', from: 'client', to: 'api-a', kind: 'routes-to', props: { tls: true } }]);
  assert.ok(codes(t).includes('no-load-balancer'));
});

test('aucune observabilité → warning', () => {
  const t = healthy(); t.nodes = t.nodes.filter((n) => n.id !== 'mon');
  assert.ok(codes(t).includes('no-monitoring'));
});

test('point de défaillance unique → risk', () => {
  const t = healthy();
  // un seul API, dépendu, non répliqué
  t.nodes = t.nodes.filter((n) => n.id !== 'api-b' && n.id !== 'db-r');
  t.edges = t.edges.filter((e) => e.to !== 'api-b' && e.from !== 'api-b' && e.to !== 'db-r' && e.from !== 'db-r');
  assert.ok(codes(t).includes('single-point-of-failure'));
});

test('service stateful avec autoscaling → risk', () => {
  const t = healthy(); t.nodes[2].props = { stateful: true, autoscaling: true };
  assert.ok(codes(t).includes('stateful-autoscaling'));
});

test('stockage éphémère pour données persistantes → risk', () => {
  const t = healthy(); t.nodes[4].props = { public: false, storage: 'ephemeral' };
  assert.ok(codes(t).includes('ephemeral-persistence'));
});

test('base sans sauvegarde → risk', () => {
  const t = healthy(); t.nodes = t.nodes.filter((n) => n.id !== 'bak');
  assert.ok(codes(t).includes('no-backup'));
});

test('sauvegarde non testée → warning', () => {
  const t = healthy(); t.nodes.find((n) => n.id === 'bak').props = { restoreTested: false };
  assert.ok(codes(t).includes('backup-no-restore-test'));
});

test('subnet privé avec accès public → risk', () => {
  const t = healthy();
  t.nodes.push({ id: 'sub', kind: 'subnet', label: 'Privé', props: { visibility: 'private' } });
  t.edges.push({ id: 'ep', from: 'client', to: 'sub', kind: 'routes-to', props: { tls: true } });
  assert.ok(codes(t).includes('private-subnet-public-access'));
});

test('flux public sans TLS → risk', () => {
  const t = healthy(); delete t.edges[0].props;
  assert.ok(codes(t).includes('missing-tls-public'));
});

test('secret hors coffre → risk', () => {
  const t = healthy(); t.nodes[2].props = { replicas: 2, holdsSecrets: true };
  assert.ok(codes(t).includes('secret-outside-store'));
});

test('staging relié à la production → blocking', () => {
  const t = healthy();
  t.environments = ['staging', 'production'];
  t.nodes.push({ id: 'stg', kind: 'api', label: 'API staging', environment: 'staging' });
  t.edges.push({ id: 'es', from: 'stg', to: 'db', kind: 'writes' });
  assert.ok(codes(t).includes('staging-points-to-prod'));
});

test('canary sans métrique → risk ; blue/green sans bascule → risk', () => {
  const t1 = healthy(); t1.nodes = t1.nodes.filter((n) => n.id !== 'mon'); t1.nodes[1].props = { deployStrategy: 'canary' };
  assert.ok(codes(t1).includes('canary-no-metric'));
  const t2 = healthy(); t2.nodes = t2.nodes.filter((n) => n.id !== 'lb'); t2.edges = t2.edges.filter((e) => e.from !== 'lb').concat([{ id: 'ec', from: 'client', to: 'api-a', kind: 'routes-to', props: { tls: true } }]);
  t2.nodes.find((n) => n.id === 'api-a').props = { replicas: 2, deployStrategy: 'blue-green' };
  assert.ok(codes(t2).includes('blue-green-no-switch'));
});

test('service de production à instance unique → warning', () => {
  const t = healthy(); t.nodes[2].props = { replicas: 1 };
  assert.ok(codes(t).includes('under-provisioned'));
});

test('déterminisme : deux analyses identiques', () => {
  const t = healthy(); t.nodes[4].props = { public: true };
  assert.deepEqual(analyzeTopology(t), analyzeTopology(t));
});

test('synthèse : sévérités connues, dimensions triées', () => {
  const { summary } = analyzeTopology(healthy());
  assert.ok(SEVERITIES.every((s) => s in summary.bySeverity));
  assert.deepEqual(summary.dimensions, [...summary.dimensions].sort());
});
