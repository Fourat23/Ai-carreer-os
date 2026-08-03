// CP3 (V23) — analyseur : chaque famille de diagnostic se déclenche sur une
// fixture minimale et NE se déclenche PAS sur un manifest sain ; déterminisme ;
// synthèse cohérente. PUR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeManifests, SEVERITIES, CATEGORIES } from '../lib/manifest-analysis.mjs';

const codes = (set) => analyzeManifests(set).diagnostics.map((d) => d.code);

// Manifest SAIN : Deployment 3 replicas, probes, requests/limits, image épinglée,
// namespace, labels, SA dédié, non-root ; Service avec endpoints.
const healthy = () => ({
  resources: [
    {
      apiVersion: 'apps/v1', kind: 'Deployment',
      metadata: { name: 'api', namespace: 'prod', labels: { app: 'api' } },
      spec: {
        replicas: 3, selector: { matchLabels: { app: 'api' } }, strategy: { type: 'RollingUpdate', rollingUpdate: { maxUnavailable: '25%' } },
        template: {
          metadata: { labels: { app: 'api' } },
          spec: {
            serviceAccountName: 'api-sa',
            containers: [{
              name: 'api', image: 'registry/api:1.2.3', ports: [{ containerPort: 8080 }],
              securityContext: { runAsNonRoot: true, runAsUser: 1000 },
              resources: { requests: { cpu: '100m', memory: '128Mi' }, limits: { cpu: '200m', memory: '256Mi' } },
              readinessProbe: { httpGet: { path: '/ready', port: 8080 } },
              livenessProbe: { httpGet: { path: '/live', port: 8080 }, initialDelaySeconds: 15 },
            }],
          },
        },
      },
    },
    {
      apiVersion: 'v1', kind: 'Service',
      metadata: { name: 'api', namespace: 'prod', labels: { app: 'api' } },
      spec: { type: 'ClusterIP', selector: { app: 'api' }, ports: [{ port: 80, targetPort: 8080 }] },
    },
  ],
});

test('manifest sain → aucun blocking/risk', () => {
  const { diagnostics, summary } = analyzeManifests(healthy());
  assert.equal(summary.bySeverity.blocking, 0, `blocking: ${diagnostics.filter((d) => d.severity === 'blocking').map((d) => d.code)}`);
  assert.equal(summary.bySeverity.risk, 0, `risk: ${diagnostics.filter((d) => d.severity === 'risk').map((d) => d.code)}`);
});

test('Service sans endpoints → blocking', () => {
  const s = healthy(); s.resources[1].spec.selector = { app: 'inexistant' };
  assert.ok(codes(s).includes('svc-no-endpoints'));
});

test('selector du contrôleur incohérent → blocking', () => {
  const s = healthy(); s.resources[0].spec.selector = { matchLabels: { app: 'autre' } };
  assert.ok(codes(s).includes('selector-template-mismatch'));
});

test('image latest → risk', () => {
  const s = healthy(); s.resources[0].spec.template.spec.containers[0].image = 'registry/api:latest';
  assert.ok(codes(s).includes('image-latest'));
});

test('image sans tag → risk', () => {
  const s = healthy(); s.resources[0].spec.template.spec.containers[0].image = 'registry/api';
  assert.ok(codes(s).includes('image-no-tag'));
});

test('requests/limits absents → risk/warning', () => {
  const s = healthy(); delete s.resources[0].spec.template.spec.containers[0].resources;
  const c = codes(s);
  assert.ok(c.includes('no-requests') && c.includes('no-limits'));
});

test('limite mémoire < request → risk', () => {
  const s = healthy(); s.resources[0].spec.template.spec.containers[0].resources.limits.memory = '64Mi';
  assert.ok(codes(s).includes('mem-limit-below-request'));
});

test('readiness absente → risk', () => {
  const s = healthy(); delete s.resources[0].spec.template.spec.containers[0].readinessProbe;
  assert.ok(codes(s).includes('no-readiness-probe'));
});

test('liveness trop agressive → warning', () => {
  const s = healthy(); s.resources[0].spec.template.spec.containers[0].livenessProbe.initialDelaySeconds = 1;
  assert.ok(codes(s).includes('liveness-aggressive'));
});

test('probe sur port non déclaré → risk', () => {
  const s = healthy(); s.resources[0].spec.template.spec.containers[0].readinessProbe.httpGet.port = 9999;
  assert.ok(codes(s).includes('probe-bad-port'));
});

test('conteneur privilégié → blocking', () => {
  const s = healthy(); s.resources[0].spec.template.spec.containers[0].securityContext.privileged = true;
  assert.ok(codes(s).includes('privileged-container'));
});

test('run as root → warning', () => {
  const s = healthy(); s.resources[0].spec.template.spec.containers[0].securityContext = {};
  assert.ok(codes(s).includes('run-as-root'));
});

test('secret en clair (env) → risk', () => {
  const s = healthy(); s.resources[0].spec.template.spec.containers[0].env = [{ name: 'DB_PASSWORD', value: 'hunter2' }];
  assert.ok(codes(s).includes('plaintext-secret-env'));
});

test('secret dans ConfigMap → risk', () => {
  const s = healthy(); s.resources.push({ apiVersion: 'v1', kind: 'ConfigMap', metadata: { name: 'cfg', namespace: 'prod' }, data: { api_token: 'x' } });
  assert.ok(codes(s).includes('secret-in-configmap'));
});

test('single replica en prod → warning', () => {
  const s = healthy(); s.resources[0].spec.replicas = 1;
  assert.ok(codes(s).includes('single-replica-prod'));
});

test('stratégie Recreate → warning', () => {
  const s = healthy(); s.resources[0].spec.strategy = { type: 'Recreate' };
  assert.ok(codes(s).includes('recreate-strategy'));
});

test('StatefulSet sans persistance → risk', () => {
  const s = healthy(); s.resources[0].kind = 'StatefulSet';
  assert.ok(codes(s).includes('statefulset-no-persistence'));
});

test('Ingress sans Service → risk', () => {
  const s = healthy();
  s.resources.push({ apiVersion: 'networking.k8s.io/v1', kind: 'Ingress', metadata: { name: 'ing', namespace: 'prod' }, spec: { rules: [{ http: { paths: [{ backend: { service: { name: 'ghost' } } }] } }] } });
  assert.ok(codes(s).includes('ingress-no-service'));
});

test('PVC sans stockage → risk', () => {
  const s = healthy(); s.resources.push({ apiVersion: 'v1', kind: 'PersistentVolumeClaim', metadata: { name: 'data', namespace: 'prod' }, spec: {} });
  assert.ok(codes(s).includes('pvc-no-storage'));
});

test('déterminisme : deux analyses identiques', () => {
  const s = healthy(); s.resources[1].spec.selector = { app: 'inexistant' };
  assert.deepEqual(analyzeManifests(s), analyzeManifests(s));
});

test('synthèse : sévérités et catégories connues', () => {
  const { summary } = analyzeManifests(healthy());
  assert.ok(SEVERITIES.every((sv) => sv in summary.bySeverity));
  assert.ok(CATEGORIES.every((c) => c in summary.byCategory));
});
