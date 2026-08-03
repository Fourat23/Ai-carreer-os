// CP2 (V24) — modèle pur de sécurité : détection prudente de secrets (vrais/faux
// positifs), validation (domaines, artefacts, bornes, refus de secret réaliste,
// rattachement), vue publique anti-fuite. PUR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DOMAINS, ARTIFACT_KINDS, INCIDENTS, SECURITY_CAPS,
  detectSecretCandidates, validateScenario, publicScenarioView,
} from '../lib/security.mjs';

const ctx = () => ({
  skillIds: { has: (s) => ['http', 'testing', 'debugging', 'linux', 'git'].includes(s) },
  validDays: new Set([67, 68, 85, 298]),
  trackIds: new Set(['systems-cloud-foundations-v1']),
});

const scn = (over = {}) => ({
  id: 'leaked-secret', title: 'Secret en clair', description: 'un token factice dans une config',
  domain: 'secrets', difficulty: 2,
  artifacts: [
    { id: 'app-config', kind: 'config', content: { db: { host: 'db', password: 'FAKE-changeme-123' } } },
    { id: 'ci-log', kind: 'log', content: 'export TOKEN=FAKE_EXAMPLE_TOKEN_do_not_use' },
  ],
  skills: ['http'], dayRefs: [68], trackScope: ['systems-cloud-foundations-v1'],
  ...over,
});

test('constantes', () => {
  assert.ok(DOMAINS.includes('secrets') && DOMAINS.includes('supply-chain') && DOMAINS.includes('rbac'));
  assert.ok(ARTIFACT_KINDS.includes('lockfile') && ARTIFACT_KINDS.includes('rbac'));
  assert.ok(INCIDENTS.includes('secret-leak'));
  assert.ok(SECURITY_CAPS.maxArtifacts > 0);
});

test('scénario valide (secrets factices) → aucune erreur', () => {
  assert.deepEqual(validateScenario(scn(), ctx()), { ok: true, errors: [] });
});

test('secret TROP RÉALISTE refusé', () => {
  const s = scn();
  s.artifacts[0].content.db.password = 'ghp_ABCDEFGHIJKLMNOP1234567890';
  const r = validateScenario(s, ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('trop réaliste')));
});

test('detectSecretCandidates : motif fort → high confidence', () => {
  const c = detectSecretCandidates('token = sk-ABCDEFGHIJKLMNOPQRST1234');
  assert.ok(c.length >= 1 && c[0].confidence === 'high');
});

test('detectSecretCandidates : marqueur FAKE → non « high »', () => {
  const c = detectSecretCandidates('ghp_FAKEFAKEFAKEFAKE12345678');
  assert.ok(c.every((x) => x.fake || x.confidence !== 'high'));
});

test('detectSecretCandidates : chaîne banale → aucun high (faux positif évité)', () => {
  const c = detectSecretCandidates('le renard brun saute par-dessus le chien');
  assert.ok(c.every((x) => x.confidence !== 'high'));
});

test('detectSecretCandidates : hash sans contexte → low', () => {
  // base64/hex long sans nom de champ sensible : ne doit pas être « high ».
  const c = detectSecretCandidates('checksum a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0');
  assert.ok(c.every((x) => x.confidence !== 'high'));
});

test('domaine inconnu refusé', () => {
  const r = validateScenario(scn({ domain: 'magie' }), ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('domaine inconnu')));
});

test('kind d\'artefact inconnu refusé', () => {
  const s = scn(); s.artifacts[0].kind = 'wizardry';
  const r = validateScenario(s, ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('kind inconnu')));
});

test('clé dangereuse refusée', () => {
  const s = scn(); s.artifacts[0].content = { constructor: 'x' };
  const r = validateScenario(s, ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('clé dangereuse')));
});

test('trop d\'artefacts refusé (borne)', () => {
  const many = Array.from({ length: SECURITY_CAPS.maxArtifacts + 1 }, (_, i) => ({ id: `a-${i}`, kind: 'config', content: {} }));
  const r = validateScenario(scn({ artifacts: many }), ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('trop d\'artefacts')));
});

test('compétence inconnue refusée', () => {
  const r = validateScenario(scn({ skills: ['sorcellerie'] }), ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('compétence inconnue')));
});

test('journée inexistante refusée', () => {
  const r = validateScenario(scn({ dayRefs: [999] }), ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('journée inexistante')));
});

test('incident inconnu refusé', () => {
  const r = validateScenario(scn({ incident: 'apocalypse' }), ctx());
  assert.ok(!r.ok && r.errors.some((e) => e.includes('incident inconnu')));
});

test('vue publique : masque les valeurs sensibles, garde la structure', () => {
  const s = scn();
  s.artifacts.push({ id: 'k', kind: 'env', content: 'APIKEY=sk-REALLYLONGKEY1234567890ABCD' });
  const v = publicScenarioView(s);
  const blob = JSON.stringify(v);
  assert.ok(!/sk-[A-Za-z0-9]{16,}/.test(blob), 'clé masquée');
  assert.ok(blob.includes('***'));
  assert.equal(v.artifacts.length, 3);
  assert.ok(v.artifacts.every((a) => 'kind' in a && 'id' in a));
});
