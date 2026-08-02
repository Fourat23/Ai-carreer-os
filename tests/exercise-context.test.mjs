// CP2 (V16) — modèle pur de contexte de parcours des exercices.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCatalogue, DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID, SYSTEMS_CLOUD_TRACK_ID } from '../lib/catalogue.mjs';
import { trackDaySets, classifyExercise, matchesScope, reachableFromTrack, contextBadge } from '../lib/exercise-context.mjs';

const program = JSON.parse(readFileSync(new URL('../data/program.json', import.meta.url), 'utf8'));
const cat = buildCatalogue(program);
const sets = trackDaySets(cat);

test('trackDaySets : uniquement les parcours disponibles, jours résolus', () => {
  assert.deepEqual([...sets.keys()].sort(), [DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID, SYSTEMS_CLOUD_TRACK_ID].sort());
  assert.equal(sets.get(DEFAULT_TRACK_ID).size, 365);
  assert.equal(sets.get(FULLSTACK_TRACK_ID).size, 119);
  assert.equal(sets.get(BACKEND_TRACK_ID).size, 85);
  assert.equal(sets.get(BACKEND_TRACK_ID).has(82), false); // non contigu
});

test('exercice d’une journée du parcours actif (Foundations) → active, Jour N', () => {
  const ctx = classifyExercise([50], sets, DEFAULT_TRACK_ID); // j50 ∈ tous
  assert.equal(ctx.scope, 'active');
  assert.equal(ctx.inActive, true);
  assert.deepEqual(ctx.activeDays, [50]);
  assert.equal(contextBadge(ctx).label, 'Jour 50');
  assert.equal(matchesScope(ctx, 'active-day'), true);
});

test('exercice multi-parcours (j50 ∈ Foundations, Full-Stack, Backend, Systems & Cloud)', () => {
  const ctx = classifyExercise([50], sets, DEFAULT_TRACK_ID);
  assert.deepEqual(ctx.reachableTracks, [DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID, SYSTEMS_CLOUD_TRACK_ID].sort());
  assert.equal(ctx.multiTrack, true);
  assert.equal(matchesScope(ctx, 'multi'), true);
  // multi-parcours n'annule pas « actif » : pas d'exclusivité prétendue.
  assert.equal(ctx.inActive, true);
});

test('exercice d’un AUTRE parcours (Backend actif, exercice React j92)', () => {
  const ctx = classifyExercise([92], sets, BACKEND_TRACK_ID); // j92 ∉ backend (85j s'arrête à 86 sans 87+)
  assert.equal(ctx.inActive, false);
  assert.equal(ctx.scope, 'other');
  assert.ok(ctx.reachableTracks.includes(FULLSTACK_TRACK_ID));
  assert.ok(!ctx.reachableTracks.includes(BACKEND_TRACK_ID));
  assert.equal(contextBadge(ctx).kind, 'other');
  assert.equal(matchesScope(ctx, 'other'), true);
  assert.equal(matchesScope(ctx, 'active'), false);
});

test('exercice GLOBAL (journée d’aucun parcours disponible)', () => {
  const ctx = classifyExercise([250], sets, DEFAULT_TRACK_ID); // j250 ∈ Foundations seulement
  // j250 est dans Foundations (365j) → active, pas global. Prenons un exercice SANS journée.
  const g = classifyExercise([], sets, DEFAULT_TRACK_ID);
  assert.equal(g.scope, 'global');
  assert.equal(g.reachableTracks.length, 0);
  assert.equal(contextBadge(g).label, 'Corpus global');
  assert.equal(matchesScope(g, 'global'), true);
  // j250 : présent uniquement dans Foundations → active pour Foundations.
  assert.equal(ctx.scope, 'active');
});

test('exercice relié à PLUSIEURS journées du parcours actif', () => {
  const ctx = classifyExercise([5, 6, 9], sets, DEFAULT_TRACK_ID);
  assert.deepEqual(ctx.activeDays, [5, 6, 9]);
  assert.equal(contextBadge(ctx).label, '3 journées');
  assert.equal(matchesScope(ctx, 'active-day'), false); // pas exactement 1
  assert.equal(matchesScope(ctx, 'active'), true);
});

test('journées non contiguës : j81 et j83 dans Backend, j82 non', () => {
  assert.equal(classifyExercise([81], sets, BACKEND_TRACK_ID).inActive, true);
  assert.equal(classifyExercise([83], sets, BACKEND_TRACK_ID).inActive, true);
  assert.equal(classifyExercise([82], sets, BACKEND_TRACK_ID).inActive, false); // j82 exclu de Backend
});

test('parcours actif inconnu → aucun jour actif (dégradation propre)', () => {
  const ctx = classifyExercise([50], sets, 'parcours-inconnu');
  assert.equal(ctx.inActive, false);
  assert.equal(ctx.scope, 'other'); // atteignable ailleurs
  assert.ok(ctx.reachableTracks.length >= 1);
});

test('reachableFromTrack + filtres divers', () => {
  const ctx = classifyExercise([92], sets, BACKEND_TRACK_ID);
  assert.equal(reachableFromTrack(ctx, FULLSTACK_TRACK_ID), true);
  assert.equal(reachableFromTrack(ctx, BACKEND_TRACK_ID), false);
  assert.equal(reachableFromTrack(ctx, ''), true); // pas de filtre
  assert.equal(matchesScope(ctx, ''), true);
  assert.equal(matchesScope(ctx, 'all'), true);
});

test('pureté : les entrées ne sont pas mutées', () => {
  const input = [3, 1, 2];
  const before = JSON.stringify(input);
  classifyExercise(input, sets, DEFAULT_TRACK_ID);
  assert.equal(JSON.stringify(input), before); // input intact
});
