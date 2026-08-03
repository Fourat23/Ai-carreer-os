// CP2 (V23) — modèle pur de manifest : validation (kinds, metadata, refs, bornes,
// anti-secret, clés dangereuses, rattachement) + résolveurs (selectorMatches,
// serviceEndpoints, podsOf) + vue publique anti-fuite. PUR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  KINDS, SERVICE_TYPES, STRATEGIES, MANIFEST_CAPS,
  validateManifestSet, publicManifestView, selectorMatches, serviceEndpoints, podsOf, containersOf,
} from '../lib/manifest.mjs';

const ctx = () => ({
  skillIds: { has: (s) => ['http', 'testing', 'debugging', 'linux'].includes(s) },
  validDays: new Set([320, 321, 81]),
  trackIds: new Set(['systems-cloud-foundations-v1']),
});

const set = (over = {}) => ({
  id: 'api-deploy', title: 'API + Service', description: 'un Deployment et son Service',
  resources: [
    {
      apiVersion: 'apps/v1', kind: 'Deployment',
      metadata: { name: 'api', namespace: 'prod', labels: { app: 'api' } },
      spec: {
        replicas: 3, selector: { matchLabels: { app: 'api' } },
        strategy: { type: 'RollingUpdate' },
        template: {
          metadata: { labels: { app: 'api' } },
          spec: { containers: [{ name: 'api', image: 'registry/api:1.2.3', ports: [{ containerPort: 8080 }], resources: { requests: { cpu: '100m', memory: '128Mi' }, limits: { cpu: '200m', memory: '256Mi' } }, readinessProbe: { httpGet: { path: '/health', port: 8080 } } }] },
        },
      },
    },
    {
      apiVersion: 'v1', kind: 'Service',
      metadata: { name: 'api', namespace: 'prod' },
      spec: { type: 'ClusterIP', selector: { app: 'api' }, ports: [{ port: 80, targetPort: 8080 }] },
    },
  ],
  skills: ['http'], dayRefs: [320], trackScope: ['systems-cloud-foundations-v1'],
  ...over,
});

test('constantes', () => {
  assert.ok(KINDS.includes('Deployment') && KINDS.includes('StatefulSet'));
  assert.deepEqual(SERVICE_TYPES, ['ClusterIP', 'NodePort', 'LoadBalancer']);
  assert.deepEqual(STRATEGIES, ['RollingUpdate', 'Recreate']);
  assert.ok(MANIFEST_CAPS.maxResources > 0);
});

test('scénario valide → aucune erreur', () => {
  assert.deepEqual(validateManifestSet(set(), ctx()), { ok: true, errors: [] });
});

test('kind inconnu refusé', () => {
  const s = set(); s.resources[0].kind = 'Frobnicator';
  const r = validateManifestSet(s, ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('kind inconnu')));
});

test('metadata.name invalide refusé', () => {
  const s = set(); s.resources[0].metadata.name = 'API_Prod';
  const r = validateManifestSet(s, ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('metadata.name invalide')));
});

test('ressource dupliquée refusée', () => {
  const s = set(); s.resources.push(JSON.parse(JSON.stringify(s.resources[0])));
  const r = validateManifestSet(s, ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('dupliquée')));
});

test('secret en clair refusé', () => {
  const s = set();
  s.resources[0].spec.template.spec.containers[0].env = [{ name: 'TOKEN', value: 'ghp_abcdefgh12345678' }];
  const r = validateManifestSet(s, ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('secret en clair')));
});

test('clé dangereuse refusée', () => {
  const s = set(); s.resources[0].spec.constructor = 'x';
  const r = validateManifestSet(s, ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('clé dangereuse')));
});

test('replicas négatif refusé', () => {
  const s = set(); s.resources[0].spec.replicas = -2;
  const r = validateManifestSet(s, ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('replicas')));
});

test('type de Service inconnu refusé', () => {
  const s = set(); s.resources[1].spec.type = 'Magic';
  const r = validateManifestSet(s, ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('type de Service')));
});

test('trop de ressources refusé (borne)', () => {
  const many = Array.from({ length: MANIFEST_CAPS.maxResources + 1 }, (_, i) => ({
    apiVersion: 'v1', kind: 'ConfigMap', metadata: { name: `cm-${i}` }, spec: {},
  }));
  const r = validateManifestSet(set({ resources: many }), ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('trop de ressources')));
});

test('compétence inconnue refusée', () => {
  const r = validateManifestSet(set({ skills: ['sorcellerie'] }), ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('compétence inconnue')));
});

test('journée inexistante refusée', () => {
  const r = validateManifestSet(set({ dayRefs: [999] }), ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('journée inexistante')));
});

test('selectorMatches : matche si tous les labels présents', () => {
  assert.equal(selectorMatches({ app: 'api' }, { app: 'api', tier: 'back' }), true);
  assert.equal(selectorMatches({ matchLabels: { app: 'api' } }, { app: 'web' }), false);
  assert.equal(selectorMatches({}, { app: 'api' }), false); // selector vide ne matche pas
});

test('serviceEndpoints : trouve le Deployment ciblé', () => {
  const s = set();
  const eps = serviceEndpoints(s.resources[1], s.resources);
  assert.equal(eps.length, 1);
  assert.equal(eps[0].kind, 'Deployment');
});

test('serviceEndpoints : 0 si selector orphelin', () => {
  const s = set(); s.resources[1].spec.selector = { app: 'inexistant' };
  assert.equal(serviceEndpoints(s.resources[1], s.resources).length, 0);
});

test('podsOf : replicas du Deployment', () => {
  assert.equal(podsOf(set().resources[0]), 3);
  assert.equal(podsOf({ kind: 'Job', spec: {} }), 1);
  assert.equal(podsOf({ kind: 'Service', spec: {} }), 0);
});

test('containersOf : conteneurs du gabarit', () => {
  assert.equal(containersOf(set().resources[0]).length, 1);
});

test('vue publique : sans secret, structure analysable', () => {
  const s = set();
  s.resources[0].spec.template.spec.containers[0].env = [{ name: 'K', value: 'sk-abcdefgh12345678' }];
  const v = publicManifestView(s);
  const blob = JSON.stringify(v);
  assert.ok(!/sk-[A-Za-z0-9]{8,}/.test(blob), 'aucun secret dans la vue publique');
  assert.ok(blob.includes('***'));
  assert.equal(v.resources.length, 2);
});
