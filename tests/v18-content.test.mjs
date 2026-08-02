// V18 — verrouillage des missions d'ingénierie (grandit par checkpoint).
// Prouve que chaque mission livrée est valide, reliée aux bonnes journées/parcours,
// que ses exercices sont exécutables et anti-fuite, et que ses livrables couvrent
// réellement les notions ciblées.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { validateMission, publicMissionView } from '../lib/mission.mjs';
import { validateExercise } from '../lib/exercise.mjs';
import { DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID } from '../lib/catalogue.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';

const mission = (id) => JSON.parse(readFileSync(new URL(`../data/missions/${id}.json`, import.meta.url), 'utf8'));
const exercise = (id) => JSON.parse(readFileSync(new URL(`../data/exercises/${id}.json`, import.meta.url), 'utf8'));
const program = JSON.parse(readFileSync(new URL('../data/program.json', import.meta.url), 'utf8'));
const dayExercises = () => JSON.parse(readFileSync(new URL('../data/day-exercises.json', import.meta.url), 'utf8'));

const ctx = () => ({
  validDays: new Set(program.days.map((d) => d.day)),
  trackIds: new Set([DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID]),
  skillIds: { has: (s) => isKnownSkill(s) },
  exerciseIds: new Set(readdirSync(new URL('../data/exercises', import.meta.url)).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''))),
});

// ── CP3 : mission dette technique & maintenance ──────────────────────────────

test('CP3 — mission legacy-pricing-maintenance valide et reliée aux 3 parcours', () => {
  const m = mission('legacy-pricing-maintenance');
  assert.deepEqual(validateMission(m, ctx()), { ok: true, errors: [] });
  assert.equal(m.category, 'debt-maintenance');
  assert.deepEqual(m.trackRefs.sort(), [DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID].sort());
  assert.ok(m.dayRefs.includes(69), 'reliée au jour 69 (refactoring)');
});

test('CP3 — les livrables couvrent code auto + registre de dette + plan de maintenance', () => {
  const m = mission('legacy-pricing-maintenance');
  const byId = Object.fromEntries(m.deliverables.map((d) => [d.id, d]));
  assert.equal(byId.refactor.validation, 'auto');
  assert.equal(byId.refactor.exerciseRef, 'debt-legacy-refactor');
  assert.deepEqual(byId['debt-register'].docSpec.requiredSections.slice(0, 2), ['Registre de dette', 'Classification']);
  const plan = byId['maintenance-plan'].docSpec.requiredSections;
  for (const t of ['Corrective', 'Adaptative', 'Préventive', 'Évolutive', 'Dépréciation', 'Compatibilité', 'Changelog']) {
    assert.ok(plan.includes(t), `plan de maintenance doit exiger « ${t} »`);
  }
});

test('CP3 — exercice lié : valide, régression subtile, tests privés masqués', () => {
  const ex = exercise('debt-legacy-refactor');
  assert.deepEqual(validateExercise(ex), { ok: true, errors: [] });
  assert.ok(ex.tests.some((t) => t.private), 'garde des tests privés');
  assert.ok(/régression|arrondi/i.test(JSON.stringify(ex.tests.filter((t) => t.private))), 'les privés ciblent les régressions subtiles');
  // relié au jour 69 pour la preuve de compétence
  assert.ok(dayExercises()['69'].includes('debt-legacy-refactor'));
});

test('CP3 — vue publique de la mission : aucun attendu caché exposé', () => {
  const pub = JSON.stringify(publicMissionView(mission('legacy-pricing-maintenance')));
  assert.ok(!pub.includes('docSpec') && !pub.includes('requireMentions'), 'pas de spec interne');
  assert.ok(pub.includes('Registre de dette'), 'les sections attendues restent des critères publics');
});
