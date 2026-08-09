// CP8/CP10 (V35) — cohérence de bout en bout : parcours Data/ML activé + burn-down
// de dette (0 leçon sans on-ramp) + graphe sain. Déterministe, pur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildCatalogue, resolveTrackDays, isTrackAvailable, DATA_ML_TRACK_ID, DEFAULT_TRACK_ID } from '../lib/catalogue.mjs';
import { buildCurriculumGraph, auditCurriculumGraph } from '../lib/curriculum-graph.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const J = (p) => JSON.parse(readFileSync(R(p), 'utf8'));
const program = J('data/program.json');
const cat = buildCatalogue(program);

test('e2e V35 : parcours Data/ML DISPONIBLE, modules résolus, jours réels', () => {
  const t = cat.tracks.find((x) => x.id === DATA_ML_TRACK_ID);
  assert.ok(t, 'data-ml-v1 présent');
  assert.equal(t.status, 'available');
  assert.ok(isTrackAvailable(t));
  assert.ok(t.moduleRefs.length >= 5, 'au moins 5 modules');
  const days = resolveTrackDays(cat, DATA_ML_TRACK_ID);
  assert.ok(days.length > 0, 'jours résolus > 0');
  assert.equal(days.length, t.totalDays, 'durée dérivée = jours résolus');
  const valid = new Set(program.days.map((d) => d.day));
  for (const d of days) assert.ok(valid.has(d), `jour réel ${d}`);
});

test('e2e V35 : chaque module Data/ML référence des jours réels (aucune copie)', () => {
  const t = cat.tracks.find((x) => x.id === DATA_ML_TRACK_ID);
  for (const mid of t.moduleRefs) {
    const m = cat.modules[mid];
    assert.ok(m, `module ${mid} présent`);
    assert.ok(m.dayRefs.length > 0, `${mid} : au moins un jour`);
  }
});

test('e2e V35 : Data/ML est DISTINCT du parcours AI Engineer (sous-ensemble focalisé)', () => {
  const dml = new Set(resolveTrackDays(cat, DATA_ML_TRACK_ID));
  const aiEng = new Set(resolveTrackDays(cat, DEFAULT_TRACK_ID));
  assert.ok(dml.size < aiEng.size, 'Data/ML est plus focalisé que les 365 jours');
  // il exclut une part significative (frontend/JS/web) → identité distincte
  assert.ok(dml.size <= aiEng.size * 0.75, 'Data/ML exclut une part notable du programme');
});

test('e2e V35 : burn-down — 0 leçon sans on-ramp', () => {
  const dir = R('curriculum/lessons');
  const missing = readdirSync(dir).filter((f) => f.endsWith('.md'))
    .filter((f) => !/^## 🌍/m.test(readFileSync(join(dir, f), 'utf8')));
  assert.deepEqual(missing, [], `leçons sans on-ramp : ${missing.join(', ')}`);
});

test('e2e V35 : les 6 parcours historiques restent DISPONIBLES', () => {
  for (const id of ['ai-engineer-foundations-v1', 'fullstack-typescript', 'backend-engineer-v1', 'systems-cloud-foundations-v1', 'appsec-cloud-security-v1', 'cloud-devops-engineer-v1']) {
    const t = cat.tracks.find((x) => x.id === id);
    assert.ok(t && t.status === 'available', `${id} disponible`);
  }
});

test('e2e V35 : il reste des parcours ANNONCÉS (pas de sur-promotion)', () => {
  const announced = cat.tracks.filter((t) => t.status === 'announced').map((t) => t.id);
  assert.ok(announced.includes('ai-fullstack-v1'), 'ai-fullstack reste annoncé');
});

test('e2e V35 : aucune anomalie bloquante sur le curriculum réel', () => {
  const plans = ['v27', 'v28', 'v29', 'v30', 'v31', 'v32', 'v33', 'v34', 'v35'].map((v) => J(`docs/architecture/${v}-lessons-plan.json`).prereq).filter(Boolean);
  const idsOf = (dir) => new Set(readdirSync(R(dir)).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));
  const known = {
    exercises: idsOf('data/exercises'), missions: idsOf('data/missions'), playbooks: idsOf('data/playbooks'),
    labs: new Set(['terminal', 'pipeline', 'cloud-topology', 'kubernetes', 'security', 'cloud-architecture']),
    reachableExercises: new Set(Object.values(J('data/day-exercises.json')).flat()),
  };
  const rep = auditCurriculumGraph(buildCurriculumGraph({ lessons: program.lessons, prereqPlans: plans, known }));
  assert.equal(rep.blocking.length, 0, rep.blocking.map((b) => `${b.type}:${b.subject}`).join(' | '));
});
