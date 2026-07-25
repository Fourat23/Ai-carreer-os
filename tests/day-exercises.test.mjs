// Tests de la liaison jour↔exercice + enregistrement de réussite (purs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { buildDayExerciseIndex, exercisesForDay, daysForExercise } from '../lib/day-exercises.mjs';
import { recordExerciseSuccess, hasLabEvidence, labEvidenceUrl } from '../lib/lab-progress.mjs';

const known = new Set(['greeting', 'fizzbuzz']);
const dayNums = new Set([1, 8, 20]);

test('buildDayExerciseIndex : index bidirectionnel', () => {
  const idx = buildDayExerciseIndex({ '1': ['greeting'], '8': ['fizzbuzz'] }, known, dayNums);
  assert.deepEqual(exercisesForDay(idx, 1), ['greeting']);
  assert.deepEqual(daysForExercise(idx, 'fizzbuzz'), [8]);
  assert.deepEqual(exercisesForDay(idx, 99), []); // jour sans exercice
});

test('buildDayExerciseIndex : rejette jour inexistant et exercice inconnu', () => {
  assert.throws(() => buildDayExerciseIndex({ '999': ['greeting'] }, known, dayNums), /jour inexistant/);
  assert.throws(() => buildDayExerciseIndex({ '1': ['inconnu'] }, known, dayNums), /exercice inconnu/);
  assert.throws(() => buildDayExerciseIndex({ abc: ['greeting'] }, known, dayNums), /non numérique/);
});

test('buildDayExerciseIndex : dédoublonne, ignore clés dangereuses', () => {
  const idx = buildDayExerciseIndex({ '1': ['greeting', 'greeting'], __proto__: ['x'] }, known, dayNums);
  assert.deepEqual(exercisesForDay(idx, 1), ['greeting']);
  assert.equal(Object.hasOwn(Object.getPrototypeOf(idx.byDay), 'x'), false);
});

test('la fixture livrée est valide contre exercices + jours réels', () => {
  const raw = JSON.parse(readFileSync(new URL('../data/day-exercises.json', import.meta.url), 'utf8'));
  const days = new Set(Array.from({ length: 365 }, (_, i) => i + 1));
  // ids réels des fixtures d'exercices présentes sur le disque
  const exDir = new URL('../data/exercises/', import.meta.url);
  const ids = new Set(readdirSync(exDir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(new URL(f, exDir), 'utf8')).id));
  const idx = buildDayExerciseIndex(raw, ids, days);
  assert.ok(idx.byDay.size >= 8); // catalogue complet lié
});

const flat = { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} };

test('recordExerciseSuccess : ajoute preuve aux jours liés + relève compétences', () => {
  const next = recordExerciseSuccess(flat, { exerciseId: 'fizzbuzz', title: 'FizzBuzz', skills: ['javascript', 'algo'], dayRefs: [8] });
  const d = next.days['8'];
  assert.ok(hasLabEvidence(d, 'fizzbuzz'));
  assert.equal(d.evidence[0].url, labEvidenceUrl('fizzbuzz'));
  assert.equal(d.evidence[0].type, 'exercise');
  assert.equal(next.skills.javascript, 3);
  assert.equal(next.skills.algo, 3);
});

test('recordExerciseSuccess : idempotent (pas de preuve en double)', () => {
  const once = recordExerciseSuccess(flat, { exerciseId: 'greeting', title: 'Greeting', skills: ['javascript'], dayRefs: [1] });
  const twice = recordExerciseSuccess(once, { exerciseId: 'greeting', title: 'Greeting', skills: ['javascript'], dayRefs: [1] });
  assert.equal(twice.days['1'].evidence.length, 1);
  assert.equal(twice, once); // aucune modification → même référence renvoyée
});

test('recordExerciseSuccess : ne rétrograde pas une compétence déjà élevée', () => {
  const start = { ...flat, skills: { javascript: 5 } };
  const next = recordExerciseSuccess(start, { exerciseId: 'greeting', title: 'G', skills: ['javascript'], dayRefs: [1] });
  assert.equal(next.skills.javascript, 5); // reste à 5, pas ramené à 3
});

test('recordExerciseSuccess : sans jours liés → progression inchangée', () => {
  assert.equal(recordExerciseSuccess(flat, { exerciseId: 'x', title: 'X', skills: [], dayRefs: [] }), flat);
});
