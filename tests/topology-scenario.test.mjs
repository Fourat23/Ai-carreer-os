// CP3 (V22) — simulation d'incident : allowlist, effets d'un drop-node/drop-zone,
// révélation d'un SPOF (service injoignable), pic de charge, déterminisme. PUR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runScenario, SCENARIOS } from '../lib/topology-scenario.mjs';

// Chaîne unique : client → lb → api → db  (lb est un SPOF).
const spofTopo = () => ({
  id: 'spof', title: 'SPOF', description: 'chaîne unique',
  zones: [{ id: 'az-a', label: 'A' }],
  nodes: [
    { id: 'client', kind: 'client', label: 'Client' },
    { id: 'lb', kind: 'load-balancer', label: 'LB', zone: 'az-a' },
    { id: 'api', kind: 'api', label: 'API', zone: 'az-a', props: { replicas: 1 } },
    { id: 'db', kind: 'relational-db', label: 'DB', zone: 'az-a', props: { public: false } },
  ],
  edges: [
    { id: 'e1', from: 'client', to: 'lb', kind: 'routes-to', props: { tls: true } },
    { id: 'e2', from: 'lb', to: 'api', kind: 'routes-to' },
    { id: 'e3', from: 'api', to: 'db', kind: 'writes' },
  ],
  skills: ['archi'], dayRefs: [78],
});

// HA : deux API sur deux zones derrière le LB.
const haTopo = () => {
  const t = spofTopo();
  t.zones.push({ id: 'az-b', label: 'B' });
  t.nodes.push({ id: 'api-b', kind: 'api', label: 'API B', zone: 'az-b', props: { replicas: 2 } });
  t.nodes.find((n) => n.id === 'api').zone = 'az-a';
  t.nodes.find((n) => n.id === 'api').props = { replicas: 2 };
  t.edges.push({ id: 'e4', from: 'lb', to: 'api-b', kind: 'routes-to' });
  return t;
};

test('allowlist des scénarios', () => {
  assert.deepEqual([...SCENARIOS].sort(), ['dependency-down', 'drop-node', 'drop-zone', 'traffic-spike']);
});

test('scénario inconnu → refusé', () => {
  assert.equal(runScenario(spofTopo(), { kind: 'nuke' }).ok, false);
});

test('drop-node du LB → service injoignable (SPOF révélé)', () => {
  const r = runScenario(spofTopo(), { kind: 'drop-node', target: 'lb' });
  assert.ok(r.ok);
  assert.equal(r.before.clientToService, true);
  assert.equal(r.after.clientToService, false);
  assert.equal(r.survived, false);
  assert.ok(r.diagnostics.some((d) => d.code === 'incident-service-unreachable' && d.severity === 'blocking'));
});

test('cible inconnue → refusée', () => {
  assert.equal(runScenario(spofTopo(), { kind: 'drop-node', target: 'ghost' }).ok, false);
});

test('HA : perte d\'une zone → service survit', () => {
  const r = runScenario(haTopo(), { kind: 'drop-zone', target: 'az-b' });
  assert.ok(r.ok);
  assert.equal(r.survived, true, 'le client atteint encore un service via la zone A');
});

test('drop-zone retire tous les nœuds de la zone', () => {
  const r = runScenario(haTopo(), { kind: 'drop-zone', target: 'az-b' });
  assert.deepEqual(r.effects.removed, ['api-b']);
});

test('traffic-spike : service mono-instance saturé', () => {
  const r = runScenario(spofTopo(), { kind: 'traffic-spike' });
  assert.ok(r.ok);
  assert.ok(r.diagnostics.some((d) => d.code === 'spike-saturation' && d.evidence.includes('api')));
});

test('dependency-down d\'une base non critique au chemin client', () => {
  // Retirer la DB ne coupe pas client→api (api reste joignable).
  const r = runScenario(spofTopo(), { kind: 'dependency-down', target: 'db' });
  assert.ok(r.ok);
  assert.equal(r.after.clientToService, true);
});

test('déterminisme : deux simulations identiques', () => {
  assert.deepEqual(
    runScenario(spofTopo(), { kind: 'drop-node', target: 'lb' }),
    runScenario(spofTopo(), { kind: 'drop-node', target: 'lb' }),
  );
});
