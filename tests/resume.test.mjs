// Tests de la logique pure de reprise & progression (lib/resume.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  dayStatus, resolveResume, resumeReasonText, countStatuses, progressOf, nextStatusFor,
} from '../lib/resume.mjs';

const days = Array.from({ length: 10 }, (_, i) => ({ day: i + 1 }));
const prog = (map) => ({ startDate: null, days: map, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
const st = (day, status) => ({ [String(day)]: { status } });

test('dayStatus : défensif', () => {
  assert.equal(dayStatus(prog({}), 3), 'not-started');
  assert.equal(dayStatus(prog(st(3, 'done')), 3), 'done');
  assert.equal(dayStatus(prog({ '3': { status: 'bogus' } }), 3), 'not-started');
  assert.equal(dayStatus(null, 3), 'not-started');
});

test('resolveResume : aucune progression → jour 1, start', () => {
  const r = resolveResume(days, prog({}));
  assert.deepEqual([r.day, r.reason, r.total], [1, 'start', 10]);
});

test('resolveResume : une journée en cours est prioritaire', () => {
  const r = resolveResume(days, prog({ ...st(1, 'done'), ...st(4, 'in-progress') }));
  assert.deepEqual([r.day, r.reason], [4, 'in-progress']);
});

test('resolveResume : première non terminée après la dernière terminée', () => {
  const r = resolveResume(days, prog({ ...st(1, 'done'), ...st(2, 'done'), ...st(3, 'done') }));
  assert.deepEqual([r.day, r.reason], [4, 'continue']);
});

test('resolveResume : progression discontinue (trou avant la dernière terminée)', () => {
  // 1 done, 2 non fait, 3 done → dernière terminée = 3, première non terminée après = 4.
  const r = resolveResume(days, prog({ ...st(1, 'done'), ...st(3, 'done') }));
  assert.deepEqual([r.day, r.reason], [4, 'continue']);
});

test('resolveResume : dernière journée terminée mais trous → reprend le trou', () => {
  const map = {};
  for (let d = 1; d <= 10; d++) if (d !== 5) map[String(d)] = { status: 'done' };
  const r = resolveResume(days, prog(map));
  assert.deepEqual([r.day, r.reason], [5, 'continue']);
});

test('resolveResume : tout terminé → complete', () => {
  const map = {};
  for (let d = 1; d <= 10; d++) map[String(d)] = { status: 'done' };
  const r = resolveResume(days, prog(map));
  assert.deepEqual([r.day, r.reason], [10, 'complete']);
});

test('resolveResume : liste vide / données invalides', () => {
  assert.deepEqual(resolveResume([], prog({})), { day: 1, reason: 'start', total: 0 });
  const r = resolveResume(days, { days: null });
  assert.equal(r.day, 1);
});

test('resumeReasonText : toutes les raisons ont un texte', () => {
  for (const reason of ['in-progress', 'continue', 'start', 'complete']) {
    assert.ok(resumeReasonText(reason).length > 0);
  }
});

test('countStatuses & progressOf', () => {
  const p = prog({ ...st(1, 'done'), ...st(2, 'done'), ...st(3, 'in-progress'), ...st(4, 'to-review') });
  const c = countStatuses(days, p);
  assert.deepEqual([c.done, c['in-progress'], c['to-review'], c['not-started'], c.total], [2, 1, 1, 6, 10]);
  assert.equal(progressOf(days, p), 20);
  assert.equal(progressOf([], p), 0);
});

test('nextStatusFor : transitions', () => {
  assert.equal(nextStatusFor('start', 'not-started'), 'in-progress');
  assert.equal(nextStatusFor('start', 'done'), 'done');
  assert.equal(nextStatusFor('complete', 'in-progress'), 'done');
  assert.equal(nextStatusFor('reopen', 'done'), 'in-progress');
  assert.equal(nextStatusFor('review', 'done'), 'to-review');
});
