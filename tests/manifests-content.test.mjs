// CP4 (V23) — contenu : tous les scénarios data/manifests/*.json sont valides
// contre le contexte réel, sans fuite dans la vue publique, ids uniques, et
// analysables (l'analyse ne casse jamais). PUR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateManifestSet, publicManifestView } from '../lib/manifest.mjs';
import { analyzeManifests } from '../lib/manifest-analysis.mjs';
import { buildCatalogue } from '../lib/catalogue.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const program = JSON.parse(readFileSync(join(ROOT, 'data/program.json'), 'utf8'));
const validDays = new Set(program.days.map((d) => d.day));
const trackIds = new Set(buildCatalogue(program).tracks.map((t) => t.id));
const ctx = { skillIds: { has: (s) => isKnownSkill(s) }, validDays, trackIds };

const DIR = join(ROOT, 'data/manifests');
const files = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith('.json')) : [];

test('au moins 3 scénarios livrés', () => {
  assert.ok(files.length >= 3, `scénarios : ${files.length}`);
});

test('chaque scénario est valide contre le contexte réel', () => {
  for (const f of files) {
    const s = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    const v = validateManifestSet(s, ctx);
    assert.ok(v.ok, `${f} invalide : ${v.errors.join(' ; ')}`);
  }
});

test('ids uniques', () => {
  const ids = files.map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')).id);
  assert.equal(new Set(ids).size, ids.length);
});

test('vue publique : aucune fuite de secret', () => {
  for (const f of files) {
    const s = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    const blob = JSON.stringify(publicManifestView(s));
    assert.ok(!/sk-[A-Za-z0-9]{8,}|ghp_[A-Za-z0-9]{8,}|AKIA[0-9A-Z]{12,}/.test(blob), `${f} : fuite`);
  }
});

test('chaque scénario est analysable (déterministe)', () => {
  for (const f of files) {
    const s = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    assert.deepEqual(analyzeManifests(s), analyzeManifests(s), `${f} : non déterministe`);
  }
});

test('« broken-service » déclenche bien un Service sans endpoints', () => {
  const f = files.find((x) => x.includes('broken-service'));
  if (!f) return;
  const s = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
  assert.ok(analyzeManifests(s).diagnostics.some((d) => d.code === 'svc-no-endpoints'));
});
