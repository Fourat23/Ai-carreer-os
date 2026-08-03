// CP2 (V22) — modèle de topologie pur : validation (ids, kinds, cycles,
// dépendances résolues, bornes, secret brut, clés dangereuses, zones/env,
// rattachement pédagogique), cycle, chaîne, vue publique anti-fuite. PUR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  NODE_KINDS, EDGE_KINDS, ENVIRONMENTS, TOPOLOGY_CAPS,
  findCycle, longestChain, validateTopology, publicTopologyView,
} from '../lib/topology.mjs';

const ctx = () => ({
  skillIds: { has: (s) => ['archi', 'devops', 'testing', 'http'].includes(s) },
  validDays: new Set([78, 79, 80, 81]),
  trackIds: new Set(['systems-cloud-foundations-v1']),
});

const topo = (over = {}) => ({
  id: 'three-tier', title: 'Trois tiers', description: 'client → LB → api → db',
  environments: ['production'],
  zones: [{ id: 'az-a', label: 'Zone A' }, { id: 'az-b', label: 'Zone B' }],
  nodes: [
    { id: 'client', kind: 'client', label: 'Client' },
    { id: 'lb', kind: 'load-balancer', label: 'Load balancer', zone: 'az-a', environment: 'production' },
    { id: 'api-a', kind: 'api', label: 'API A', zone: 'az-a', environment: 'production' },
    { id: 'api-b', kind: 'api', label: 'API B', zone: 'az-b', environment: 'production' },
    { id: 'db', kind: 'relational-db', label: 'Base', zone: 'az-a', environment: 'production', props: { public: false } },
  ],
  edges: [
    { id: 'e1', from: 'client', to: 'lb', kind: 'routes-to' },
    { id: 'e2', from: 'lb', to: 'api-a', kind: 'routes-to' },
    { id: 'e3', from: 'lb', to: 'api-b', kind: 'routes-to' },
    { id: 'e4', from: 'api-a', to: 'db', kind: 'writes' },
    { id: 'e5', from: 'api-b', to: 'db', kind: 'writes' },
  ],
  objectives: [{ id: 'ha', kind: 'availability', target: 'multi-zone' }],
  skills: ['archi'], dayRefs: [78], trackScope: ['systems-cloud-foundations-v1'],
  ...over,
});

test('constantes : kinds, environnements, plafonds', () => {
  assert.ok(NODE_KINDS.includes('load-balancer') && NODE_KINDS.includes('secret-store'));
  assert.ok(EDGE_KINDS.includes('replicates-to') && EDGE_KINDS.includes('depends-on'));
  assert.deepEqual(ENVIRONMENTS, ['development', 'testing', 'staging', 'preproduction', 'production']);
  assert.ok(TOPOLOGY_CAPS.maxNodes > 0 && TOPOLOGY_CAPS.maxEdges > 0);
});

test('topologie valide → aucune erreur', () => {
  assert.deepEqual(validateTopology(topo(), ctx()), { ok: true, errors: [] });
});

test('id kebab-case obligatoire', () => {
  const r = validateTopology(topo({ id: 'Trois Tiers' }), ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('id invalide')));
});

test('kind de nœud inconnu refusé', () => {
  const t = topo();
  t.nodes[1] = { id: 'lb', kind: 'kubernetes', label: 'K8s' };
  const r = validateTopology(t, ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('kind inconnu')));
});

test('arête vers un nœud inexistant refusée', () => {
  const t = topo();
  t.edges.push({ id: 'e9', from: 'api-a', to: 'ghost', kind: 'reads' });
  const r = validateTopology(t, ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('cible inconnue')));
});

test('cycle de dépendances détecté et refusé', () => {
  const t = topo({
    nodes: [{ id: 'a', kind: 'api', label: 'A' }, { id: 'b', kind: 'api', label: 'B' }],
    edges: [
      { id: 'x', from: 'a', to: 'b', kind: 'depends-on' },
      { id: 'y', from: 'b', to: 'a', kind: 'depends-on' },
    ],
  });
  const r = validateTopology(t, ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('cycle de dépendances')));
  assert.ok(findCycle(t.nodes, t.edges));
});

test('replicates-to est un flux bidirectionnel légitime (pas un cycle)', () => {
  const t = topo({
    nodes: [{ id: 'p', kind: 'relational-db', label: 'Primaire' }, { id: 'r', kind: 'relational-db', label: 'Réplica' }],
    edges: [
      { id: 'a', from: 'p', to: 'r', kind: 'replicates-to' },
      { id: 'b', from: 'r', to: 'p', kind: 'replicates-to' },
    ],
  });
  assert.equal(findCycle(t.nodes, t.edges), null);
});

test('secret en clair dans props refusé', () => {
  const t = topo();
  t.nodes[4].props = { apiKey: 'sk-abcdefgh12345678' };
  const r = validateTopology(t, ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('secret en clair')));
});

test('clé dangereuse refusée', () => {
  const t = topo();
  t.nodes[4].props = { __proto__: { polluted: true } };
  // eslint-disable-next-line no-proto
  const r = validateTopology(JSON.parse(JSON.stringify(t)), ctx());
  // JSON round-trip neutralise __proto__ ; on teste une clé littérale dangereuse.
  const t2 = topo();
  t2.nodes[4].props = { constructor: 'x' };
  const r2 = validateTopology(t2, ctx());
  assert.ok(!r2.ok && r2.errors.some((e) => e.includes('clé dangereuse')));
  void r;
});

test('trop de nœuds refusé (borne)', () => {
  const many = Array.from({ length: TOPOLOGY_CAPS.maxNodes + 1 }, (_, i) => ({ id: `n${i}`, kind: 'api', label: `N${i}` }));
  const r = validateTopology(topo({ nodes: many, edges: [] }), ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('trop de nœuds')));
});

test('compétence inconnue refusée', () => {
  const r = validateTopology(topo({ skills: ['sorcellerie'] }), ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('compétence inconnue')));
});

test('journée inexistante refusée', () => {
  const r = validateTopology(topo({ dayRefs: [999] }), ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('journée inexistante')));
});

test('longestChain calcule la profondeur du DAG', () => {
  assert.equal(longestChain(topo().nodes, topo().edges), 4); // client → lb → api → db (4 nœuds)
});

test('vue publique : sans secret, structure analysable', () => {
  const t = topo();
  t.nodes[4].props = { token: 'ghp_abcdefgh12345678', public: false };
  const v = publicTopologyView(t);
  const blob = JSON.stringify(v);
  assert.ok(!/ghp_[A-Za-z0-9]{8,}/.test(blob), 'aucun secret dans la vue publique');
  assert.ok(blob.includes('***'));
  assert.equal(v.nodes.length, 5);
  assert.ok(v.nodes.every((n) => 'kind' in n && 'id' in n));
});
