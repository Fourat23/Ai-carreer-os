// Tests du positionnement dans le parcours (lib/position.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextIncompleteDay, completedCount, expectedDay, progressPosition } from '../lib/position.mjs';

const days = Array.from({ length: 10 }, (_, i) => ({ day: i + 1 }));
const prog = (map, startDate = null) => ({ startDate, days: map, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
const st = (d, status) => ({ [String(d)]: { status } });
const NOW = new Date('2026-07-25T12:00:00Z');

test('progression vide', () => {
  const p = progressPosition(days, prog({}), NOW);
  assert.equal(p.resumeDay, 1);
  assert.equal(p.resumeReason, 'start');
  assert.equal(p.nextIncompleteDay, 1);
  assert.equal(p.currentProgressPosition, 0);
  assert.equal(p.complete, false);
});

test('journée en cours : reprise ≠ prochaine incomplète', () => {
  const p = progressPosition(days, prog({ ...st(1, 'done'), ...st(4, 'in-progress') }), NOW);
  assert.equal(p.resumeDay, 4);          // en cours prioritaire
  assert.equal(p.nextIncompleteDay, 2);  // première non terminée dans l'ordre
  assert.equal(p.currentProgressPosition, 1);
});

test('jours terminés non contigus', () => {
  const p = progressPosition(days, prog({ ...st(1, 'done'), ...st(3, 'done') }), NOW);
  assert.equal(p.nextIncompleteDay, 2);
  assert.equal(p.currentProgressPosition, 2);
  assert.equal(p.resumeDay, 4); // reprise = après la dernière terminée
});

test('jours à revoir comptent comme non terminés', () => {
  const p = progressPosition(days, prog({ ...st(1, 'done'), ...st(2, 'to-review') }), NOW);
  assert.equal(p.nextIncompleteDay, 2);
  assert.equal(p.currentProgressPosition, 1);
});

test('parcours terminé', () => {
  const map = {};
  for (let d = 1; d <= 10; d++) map[String(d)] = { status: 'done' };
  const p = progressPosition(days, prog(map), NOW);
  assert.equal(p.complete, true);
  assert.equal(p.nextIncompleteDay, null);
  assert.equal(p.resumeReason, 'complete');
  assert.equal(p.delay, 0);
  assert.equal(p.currentProgressPosition, 10);
});

test('journée future déjà commencée', () => {
  const p = progressPosition(days, prog({ ...st(8, 'in-progress') }), NOW);
  assert.equal(p.resumeDay, 8);
  assert.equal(p.nextIncompleteDay, 1);
});

test('expectedDay : date absente / invalide → null', () => {
  assert.equal(expectedDay(365, null), null);
  assert.equal(expectedDay(365, 'pas-une-date'), null);
});

test('expectedDay : bornée à [1, total]', () => {
  assert.equal(expectedDay(10, '2026-07-25', NOW), 1);       // démarré aujourd'hui → jour 1
  assert.equal(expectedDay(10, '2000-01-01', NOW), 10);      // très ancien → plafonné
});

test('delay / ahead calculés depuis la date de démarrage', () => {
  // démarré il y a 5 jours (attendu = jour 6), rien de terminé → retard 5.
  const start = '2026-07-20';
  const p = progressPosition(days, prog({}, start), NOW);
  assert.equal(p.expectedDay, 6);
  assert.equal(p.delay, 5);
  assert.equal(p.ahead, 0);
});

test('helpers isolés', () => {
  assert.equal(nextIncompleteDay(days, prog({ ...st(1, 'done') })), 2);
  assert.equal(completedCount(days, prog({ ...st(1, 'done'), ...st(2, 'done') })), 2);
  assert.equal(nextIncompleteDay([], prog({})), null);
});
