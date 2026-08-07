// CP8 (V24) — glossaire cybersécurité + surface « Que faire dans ce cas ? » (playbooks)
// + intégration recherche. Vérifie la RICHESSE des playbooks, la présence des termes,
// l'indexation (scénarios/playbooks/glossaire) et l'ABSENCE de fuite de données privées.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateGlossary, normalizeText } from '../lib/glossary-core.mjs';
import { buildIndex } from '../lib/search.mjs';
import { buildCatalogue } from '../lib/catalogue.mjs';
import { detectSecretCandidates } from '../lib/security.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const glossary = JSON.parse(readFileSync(R('curriculum/glossary/glossary.json'), 'utf8'));

const PB_REQUIRED = [
  'symptoms', 'firstChecks', 'containment', 'recommendedOrder', 'communication',
  'evidence', 'doNot', 'mitigation', 'correction', 'validation', 'delivery',
  'monitoring', 'documentation', 'prevention', 'exitCriteria',
];
const PB_DIR = R('data/playbooks');
const playbooks = existsSync(PB_DIR)
  ? readdirSync(PB_DIR).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(PB_DIR, f), 'utf8')))
  : [];

// ── Glossaire ──
test('glossaire : schéma global valide après ajouts V24', () => {
  const { errors } = validateGlossary(glossary);
  assert.deepEqual(errors, [], errors.slice(0, 5).join(' ; '));
});

test('glossaire : termes cybersécurité clés présents (rotation, révocation, supply chain, RBAC, incident)', () => {
  const has = (needle) => {
    const n = normalizeText(needle);
    return glossary.some((e) => [e.term, e.fullForm, ...(e.aliases ?? [])].filter(Boolean)
      .some((s) => normalizeText(s) === n));
  };
  for (const t of [
    'secret rotation', 'secret revocation', 'threat model', 'attack surface', 'defense in depth',
    'typosquatting', 'dependency confusion', 'lockfile', 'provenance', 'artifact signing',
    'securityContext', 'seccomp', 'NetworkPolicy', 'ClusterRoleBinding', 'wildcard permission',
    'privilege escalation', 'containment', 'eradication', 'remediation', 'severity',
    'indicator of compromise', 'CVSS', 'zero-day', 'kill switch', 'security gate', 'policy as code',
  ]) {
    assert.ok(has(t), `terme attendu absent du glossaire : ${t}`);
  }
});

test('glossaire : chaque relatedTerms pointe vers un id existant (intégrité des liens)', () => {
  const ids = new Set(glossary.map((e) => e.id));
  for (const e of glossary) for (const r of e.relatedTerms ?? []) {
    assert.ok(ids.has(r), `${e.id} → relation cassée ${r}`);
  }
});

// ── Playbooks « Que faire dans ce cas ? » ──
test('playbooks : au moins 15 cas professionnels présents', () => {
  assert.ok(playbooks.length >= 15, `attendu ≥ 15 playbooks, trouvé ${playbooks.length}`);
});

test('playbooks : chaque cas est exploitable (15 rubriques non vides) + domaine + id unique', () => {
  const ids = new Set();
  for (const p of playbooks) {
    assert.ok(p.id && typeof p.id === 'string', 'id manquant');
    assert.ok(!ids.has(p.id), `id dupliqué ${p.id}`); ids.add(p.id);
    assert.ok(p.situation || p.title, `${p.id} : situation manquante`);
    assert.ok(p.domain, `${p.id} : domaine manquant`);
    for (const k of PB_REQUIRED) {
      assert.ok(Array.isArray(p[k]) && p[k].length > 0, `${p.id} : rubrique ${k} vide`);
      assert.ok(p[k].every((x) => typeof x === 'string' && x.trim()), `${p.id} : rubrique ${k} a une entrée vide`);
    }
  }
});

test('playbooks : cas métier attendus couverts (secret, déploiement, dépendance, RBAC, kubernetes…)', () => {
  const ids = new Set(playbooks.map((p) => p.id));
  for (const id of [
    'prod-bug', 'broken-deploy', 'feature-regression', 'leaked-secret', 'compromised-dependency',
    'service-down', 'failed-migration', 'critical-vulnerability', 'excessive-permissions',
    'urgent-hotfix', 'rollback-impossible', 'network-incident', 'pipeline-blocked',
    'abnormal-metrics', 'kubernetes-incident',
  ]) {
    assert.ok(ids.has(id), `cas métier manquant : ${id}`);
  }
});

test('playbooks : aucun secret réaliste (valeurs factices uniquement)', () => {
  for (const p of playbooks) {
    for (const c of detectSecretCandidates(JSON.stringify(p))) {
      assert.ok(c.fake || c.confidence !== 'high', `${p.id} : secret trop réaliste`);
    }
  }
});

test('playbooks : dayRefs pointent vers des journées réelles', () => {
  const validDays = new Set(program.days.map((d) => d.day));
  for (const p of playbooks) for (const d of p.dayRefs ?? []) {
    assert.ok(validDays.has(d), `${p.id} : jour inexistant ${d}`);
  }
});

// ── Intégration recherche ──
test('recherche : scénarios, playbooks et glossaire indexés (cours/exercice/mission déjà couverts)', () => {
  const cat = buildCatalogue(program);
  const scenarios = [{ id: 'leaked-secret-config', title: 'Config avec secret', domain: 'secrets', skills: [] }];
  const pbSummaries = playbooks.map((p) => ({ id: p.id, title: p.title, situation: p.situation, domain: p.domain }));
  const glossSummaries = glossary.map((g) => ({ id: g.id, term: g.term, fullForm: g.fullForm ?? null, frenchMeaning: g.frenchMeaning, aliases: g.aliases ?? [] }));
  const idx = buildIndex(program, cat, [], [], [], [], [], scenarios, pbSummaries, glossSummaries);
  assert.ok(idx.some((i) => i.type === 'scenario' && i.href === '/security/leaked-secret-config'), 'scénario indexé');
  assert.ok(idx.some((i) => i.type === 'playbook' && i.href === '/security#playbook-leaked-secret'), 'playbook indexé');
  assert.ok(idx.some((i) => i.type === 'glossary' && i.href.startsWith('/glossary?q=')), 'terme de glossaire indexé');
});

test('recherche : anti-fuite — aucune rubrique interne/donnée privée dans l’index playbook/scénario', () => {
  const cat = buildCatalogue(program);
  const pbSummaries = playbooks.map((p) => ({ id: p.id, title: p.title, situation: p.situation, domain: p.domain }));
  const idx = buildIndex(program, cat, [], [], [], [], [], [], pbSummaries, []);
  const blob = JSON.stringify(idx.filter((i) => i.type === 'playbook'));
  // Les rubriques détaillées (correction, evidence, doNot…) ne doivent pas être indexées.
  assert.ok(!/"correction"|"evidence"|"doNot"|"exitCriteria"|"recommendedOrder"/.test(blob), 'aucune rubrique interne indexée');
});
