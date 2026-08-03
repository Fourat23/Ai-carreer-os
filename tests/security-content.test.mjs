// CP3 (V24) — contenu : scénarios data/security/*.json valides contre le contexte
// réel, sans fuite, analysables ; l'état CORRIGÉ produit moins de diagnostics ;
// base CVE factice. PUR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateScenario, publicScenarioView } from '../lib/security.mjs';
import { analyzeScenario } from '../lib/security-analysis.mjs';
import { buildCatalogue } from '../lib/catalogue.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const program = JSON.parse(readFileSync(join(ROOT, 'data/program.json'), 'utf8'));
const validDays = new Set(program.days.map((d) => d.day));
const trackIds = new Set(buildCatalogue(program).tracks.map((t) => t.id));
const ctx = { skillIds: { has: (s) => isKnownSkill(s) }, validDays, trackIds };

const DIR = join(ROOT, 'data/security');
const files = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'cve-db.json') : [];
const cve = existsSync(join(DIR, 'cve-db.json')) ? JSON.parse(readFileSync(join(DIR, 'cve-db.json'), 'utf8')) : [];

test('au moins 3 scénarios livrés', () => {
  assert.ok(files.length >= 3, `scénarios : ${files.length}`);
});

test('chaque scénario est valide contre le contexte réel', () => {
  for (const f of files) {
    const s = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    const v = validateScenario(s, ctx);
    assert.ok(v.ok, `${f} invalide : ${v.errors.join(' ; ')}`);
  }
});

test('vue publique : aucune fuite de secret', () => {
  for (const f of files) {
    const s = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    const blob = JSON.stringify(publicScenarioView(s));
    assert.ok(!/sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{12,}/.test(blob), `${f} : fuite`);
  }
});

test('analyse déterministe ; l\'état corrigé ne dégrade jamais', () => {
  for (const f of files) {
    const s = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    const a1 = analyzeScenario(s, cve);
    assert.deepEqual(a1, analyzeScenario(s, cve), `${f} : non déterministe`);
    if (s.fixedArtifacts) {
      const af = analyzeScenario({ artifacts: s.fixedArtifacts }, cve);
      assert.ok(af.summary.total <= a1.summary.total, `${f} : l'état corrigé a plus de diagnostics que le vulnérable`);
    }
  }
});

test('« vulnerable-supply-chain » déclenche une dépendance vulnérable (CVE factice)', () => {
  const f = files.find((x) => x.includes('vulnerable-supply-chain'));
  if (!f) return;
  const s = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
  const codes = analyzeScenario(s, cve).diagnostics.map((d) => d.code);
  assert.ok(codes.includes('dependency-vulnerable'));
});

test('base CVE : uniquement des identifiants FACTICES', () => {
  const list = Array.isArray(cve) ? cve : (cve.entries ?? []);
  assert.ok(list.length > 0);
  assert.ok(list.every((e) => String(e.id).startsWith('FAKE-CVE-')), 'un id CVE non factice');
});
