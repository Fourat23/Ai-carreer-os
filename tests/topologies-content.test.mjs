// CP4 (V22) — contenu : toutes les topologies data/topologies/*.json sont valides
// contre le contexte réel (jours/parcours/compétences), sans fuite dans la vue
// publique, ids uniques, et analysables (l'analyse ne casse jamais). PUR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateTopology, publicTopologyView } from '../lib/topology.mjs';
import { analyzeTopology } from '../lib/topology-analysis.mjs';
import { buildCatalogue } from '../lib/catalogue.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const program = JSON.parse(readFileSync(join(ROOT, 'data/program.json'), 'utf8'));
const validDays = new Set(program.days.map((d) => d.day));
const trackIds = new Set(buildCatalogue(program).tracks.map((t) => t.id));
const ctx = { skillIds: { has: (s) => isKnownSkill(s) }, validDays, trackIds };

const DIR = join(ROOT, 'data/topologies');
const files = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith('.json')) : [];

test('au moins 3 topologies livrées', () => {
  assert.ok(files.length >= 3, `topologies trouvées : ${files.length}`);
});

test('chaque topologie est valide contre le contexte réel', () => {
  for (const f of files) {
    const t = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    const v = validateTopology(t, ctx);
    assert.ok(v.ok, `${f} invalide : ${v.errors.join(' ; ')}`);
  }
});

test('ids uniques', () => {
  const ids = files.map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')).id);
  assert.equal(new Set(ids).size, ids.length);
});

test('vue publique : aucune fuite de secret', () => {
  for (const f of files) {
    const t = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    const blob = JSON.stringify(publicTopologyView(t));
    assert.ok(!/sk-[A-Za-z0-9]{8,}|ghp_[A-Za-z0-9]{8,}|AKIA[0-9A-Z]{12,}/.test(blob), `${f} : fuite de secret`);
  }
});

test('chaque topologie est analysable (déterministe, sans exception)', () => {
  for (const f of files) {
    const t = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    const a1 = analyzeTopology(t);
    const a2 = analyzeTopology(t);
    assert.deepEqual(a1, a2, `${f} : analyse non déterministe`);
    assert.ok(a1.summary.total >= 0);
  }
});

test('la topologie « exposed-monolith » déclenche bien des défauts critiques', () => {
  const f = files.find((x) => x.includes('exposed-monolith'));
  if (!f) return; // topologie optionnelle
  const t = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
  const codes = analyzeTopology(t).diagnostics.map((d) => d.code);
  assert.ok(codes.includes('db-public-exposure'));
  assert.ok(codes.includes('no-backup'));
});
