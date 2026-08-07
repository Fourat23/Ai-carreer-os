// CP2 (V25) — modèle cloud provider-aware : validation, CIDR, projection graphe,
// vue publique anti-fuite, analyse déterministe (composée avec la disponibilité V22)
// et estimation de coût FACTICE. Modules purs, sans I/O.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCloudArchitecture, publicCloudView, toTopology, detectCloudSecretLike,
  isCidr, cidrsOverlap, cidrRange, PROVIDERS, CLOUD_RESOURCE_KINDS,
} from '../lib/cloud-architecture.mjs';
import { analyzeCloud, cloudRuleCodes } from '../lib/cloud-analysis.mjs';
import { estimateMonthlyCost } from '../lib/cloud-cost.mjs';

const ctx = { skillIds: { has: () => true }, validDays: new Set([78, 79]), trackIds: new Set(['systems-cloud-foundations-v1']) };

/** Architecture valide minimale (AWS, multi-AZ, base privée). */
function validArch(over = {}) {
  return {
    id: 'aws-ha-api', title: 'API HA', description: 'API multi-AZ',
    provider: 'aws', region: 'eu-west-1', zones: [{ id: 'az-a', label: 'AZ A' }, { id: 'az-b', label: 'AZ B' }],
    need: 'API disponible', constraints: ['budget maîtrisé'],
    resources: [
      { id: 'lb', kind: 'load-balancer', label: 'ALB', zone: 'az-a' },
      { id: 'api-a', kind: 'api', label: 'API A', zone: 'az-a' },
      { id: 'api-b', kind: 'api', label: 'API B', zone: 'az-b' },
      { id: 'db', kind: 'managed-db', label: 'RDS', zone: 'az-a', props: { backup: true } },
      { id: 'db-standby', kind: 'managed-db', label: 'RDS standby', zone: 'az-b', props: { backup: true } },
      { id: 'backup', kind: 'backup', label: 'Sauvegardes', props: { restoreTested: true } },
      { id: 'mon', kind: 'monitoring', label: 'CloudWatch' },
    ],
    edges: [
      { id: 'e1', from: 'lb', to: 'api-a', kind: 'routes-to' },
      { id: 'e2', from: 'lb', to: 'api-b', kind: 'routes-to' },
      { id: 'e3', from: 'api-a', to: 'db', kind: 'writes' },
      { id: 'e4', from: 'api-b', to: 'db', kind: 'writes' },
      { id: 'e5', from: 'db', to: 'db-standby', kind: 'replicates-to' },
      { id: 'e6', from: 'backup', to: 'db', kind: 'backs-up' },
    ],
    identities: [{ id: 'api-role', type: 'role', policies: [{ actions: ['s3:GetObject'], resources: ['arn:aws:s3:::FAKE-bucket/*'], effect: 'allow' }] }],
    network: { cidr: '10.0.0.0/16', subnets: [{ id: 'sn-pub', cidr: '10.0.1.0/24', public: true }, { id: 'sn-priv', cidr: '10.0.2.0/24', public: false }] },
    observability: { logs: true, metrics: true },
    skills: ['archi'], dayRefs: [78], trackScope: ['systems-cloud-foundations-v1'],
    ...over,
  };
}

test('CIDR : format, plage et chevauchement (pur, déterministe)', () => {
  assert.equal(isCidr('10.0.0.0/16'), true);
  assert.equal(isCidr('10.0.0.0/33'), false);
  assert.equal(isCidr('300.0.0.0/8'), false);
  assert.equal(isCidr('nope'), false);
  const r = cidrRange('10.0.1.0/24');
  assert.equal(r.end - r.start, 255);
  assert.equal(cidrsOverlap('10.0.0.0/16', '10.0.1.0/24'), true);   // /24 inclus dans /16
  assert.equal(cidrsOverlap('10.0.1.0/24', '10.0.2.0/24'), false);  // disjoints
  assert.equal(cidrsOverlap('10.0.0.0/24', '10.0.0.128/25'), true); // recouvrement partiel
});

test('validation : une architecture correcte passe', () => {
  const v = validateCloudArchitecture(validArch(), ctx);
  assert.ok(v.ok, v.errors.join(' ; '));
});

test('validation : provider/région/kind/CIDR invalides sont refusés', () => {
  assert.equal(validateCloudArchitecture(validArch({ provider: 'gcp' }), ctx).ok, false);
  assert.equal(validateCloudArchitecture(validArch({ region: '' }), ctx).ok, false);
  assert.equal(validateCloudArchitecture(validArch({ resources: [{ id: 'x', kind: 'quantum', label: 'X' }] }), ctx).ok, false);
  assert.equal(validateCloudArchitecture(validArch({ network: { cidr: 'bad', subnets: [] } }), ctx).ok, false);
});

test('validation : clé dangereuse et credential réaliste inliné refusés', () => {
  // Clé dangereuse via JSON.parse (un littéral { __proto__ } fixe le prototype, pas une clé propre).
  const withProto = validArch({ resources: [JSON.parse('{"id":"r1","kind":"vm","label":"V","props":{"__proto__":{"x":1}}}')], edges: [], identities: [], network: null });
  assert.equal(validateCloudArchitecture(withProto, ctx).ok, false);
  // Défense en profondeur : AUCUN credential inliné dans les props (référencer via
  // le modèle d'identités), qu'il soit réaliste OU factice — le graphe V22 le refuse.
  const realSecret = validArch({ resources: [{ id: 'r1', kind: 'vm', label: 'V', props: { key: 'AKIA1234567890ABCDEF' } }], edges: [], identities: [], network: null });
  assert.equal(validateCloudArchitecture(realSecret, ctx).ok, false, 'credential AKIA réaliste doit être refusé');
  // Les ARN/valeurs factices NON credential-like (ex. arn:...FAKE-bucket) restent acceptés (cf. validArch).
  assert.equal(validateCloudArchitecture(validArch(), ctx).ok, true, 'ARN factice non credential-like accepté');
});

test('detectCloudSecretLike : distingue factice et réaliste', () => {
  assert.equal(detectCloudSecretLike('AKIAFAKEEXAMPLE00000')[0].fake, true);
  const real = detectCloudSecretLike('AKIA1234567890ABCDEF');
  assert.equal(real.length, 1);
  assert.equal(real[0].fake, false);
});

test('toTopology : ressources→nœuds, identités/security-group exclus, arêtes valides', () => {
  const arch = validArch({ resources: [...validArch().resources, { id: 'sg', kind: 'security-group', label: 'SG' }], identities: [{ id: 'r', type: 'role', policies: [{ actions: ['x'] }] }] });
  const topo = toTopology(arch);
  const ids = topo.nodes.map((n) => n.id);
  assert.ok(!ids.includes('sg'), 'security-group exclu du graphe');
  assert.ok(ids.includes('db'), 'managed-db présent');
  assert.equal(topo.nodes.find((n) => n.id === 'db').kind, 'relational-db', 'managed-db projeté sur relational-db');
});

test('vue publique : masque credentials et policies, résume wildcard sans fuite', () => {
  const arch = validArch({ identities: [{ id: 'admin', type: 'role', policies: [{ actions: ['*'], resources: ['*'], effect: 'allow' }] }] });
  const pub = publicCloudView(arch);
  const blob = JSON.stringify(pub);
  assert.ok(!/"actions"/.test(blob), 'les actions de policy ne sont pas exposées');
  const admin = pub.identities.find((i) => i.id === 'admin');
  assert.equal(admin.hasWildcard, true, 'wildcard signalé sans exposer le détail');
  assert.equal(admin.policyCount, 1);
});

test('analyse : IAM wildcard, stockage public, DB publique, overlap CIDR, no-backup, no-observability, oversized', () => {
  const bad = validArch({
    resources: [
      { id: 'db', kind: 'managed-db', label: 'DB', public: true },          // db-public + no-backup
      { id: 'bucket', kind: 'object-storage', label: 'S3', public: true },  // storage-public
      { id: 'vm', kind: 'vm', label: 'VM' },
    ],
    edges: [],
    identities: [{ id: 'admin', type: 'role', policies: [{ actions: ['*'], resources: ['*'], effect: 'allow' }] }],
    network: { cidr: '10.0.0.0/16', subnets: [{ id: 's1', cidr: '10.0.1.0/24' }, { id: 's2', cidr: '10.0.1.0/25' }] },
    observability: {},
    costHints: [{ resourceId: 'vm', sizing: 'oversized', monthlyUnits: 3 }],
  });
  const res = analyzeCloud(bad, []);
  const codes = new Set(res.diagnostics.map((d) => d.id));
  for (const c of ['iam-wildcard', 'storage-public', 'db-public', 'network-cidr-overlap', 'resilience-no-backup', 'observability-missing', 'finops-oversized']) {
    assert.ok(codes.has(c), `diagnostic attendu manquant : ${c}`);
  }
  // Chaque diagnostic est honnête : real/simulated + provider + confiance.
  for (const d of res.diagnostics) {
    assert.equal(typeof d.real, 'boolean');
    assert.equal(d.provider, 'aws');
    assert.ok(['high', 'medium', 'low'].includes(d.confidence));
  }
  assert.ok(res.summary.limits.length >= 2, 'limites déclarées');
});

test('analyse : une architecture saine ne produit aucun diagnostic bloquant/risque', () => {
  const res = analyzeCloud(validArch(), []);
  const bad = res.diagnostics.filter((d) => d.severity === 'blocking' || d.severity === 'risk');
  assert.equal(bad.length, 0, `diagnostics inattendus : ${bad.map((d) => d.id).join(', ')}`);
});

test('analyse : compose la disponibilité V22 (SPOF détecté sur single-instance)', () => {
  // Une seule API derrière le LB → SPOF applicatif détecté par analyzeTopology.
  const spof = validArch({
    resources: [
      { id: 'lb', kind: 'load-balancer', label: 'LB', zone: 'az-a' },
      { id: 'api', kind: 'api', label: 'API', zone: 'az-a' },
      { id: 'db', kind: 'managed-db', label: 'DB', zone: 'az-a', props: { backup: true } },
    ],
    edges: [{ id: 'e1', from: 'lb', to: 'api', kind: 'routes-to' }, { id: 'e2', from: 'api', to: 'db', kind: 'writes' }],
  });
  const res = analyzeCloud(spof, []);
  assert.ok(res.diagnostics.some((d) => d.id.startsWith('topo-')), 'un diagnostic de disponibilité V22 est intégré');
});

test('coût : estimation FACTICE déterministe, étiquetée simulée', () => {
  const pb = [{ kind: 'vm', cost: 40 }, { kind: 'managed-db', cost: 60 }];
  const arch = validArch({ resources: [{ id: 'vm', kind: 'vm', label: 'V' }, { id: 'db', kind: 'managed-db', label: 'D', props: { backup: true } }], edges: [], costHints: [{ resourceId: 'vm', monthlyUnits: 2 }] });
  const c1 = estimateMonthlyCost(arch, pb);
  const c2 = estimateMonthlyCost(arch, pb);
  assert.deepEqual(c1, c2, 'déterministe');
  assert.equal(c1.total, 40 * 2 + 60, 'vm×2 + db');
  assert.equal(c1.simulated, true);
  assert.match(c1.disclaimer, /FACTICE|PÉDAGOGIQUE/i);
  assert.equal(c1.currency, 'FAKE-UNITS');
});

test('méta : providers, kinds, codes de règles exposés', () => {
  assert.deepEqual(PROVIDERS, ['aws', 'azure', 'generic']);
  assert.ok(CLOUD_RESOURCE_KINDS.includes('vm') && CLOUD_RESOURCE_KINDS.includes('managed-db'));
  assert.ok(cloudRuleCodes().includes('iamWildcard'));
});
