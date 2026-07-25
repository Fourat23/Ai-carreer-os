// Tests du moteur de révision espacée (lib/review.mjs) — horloge figée.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  baseInterval, calculateNextReview,
  getDueReviews, getUpcomingReviews, reviewSummary, completeReview,
} from '../lib/review.mjs';

const NOW = new Date('2026-07-25T12:00:00Z');
const addDaysIso = (n) => new Date(Date.UTC(2026, 6, 25) + n * 86_400_000).toISOString();

test('baseInterval : stratégie documentée', () => {
  assert.equal(baseInterval('review', null), 1);
  assert.equal(baseInterval('partial', null), 3);
  assert.equal(baseInterval('understood', 'low'), 7);
  assert.equal(baseInterval('understood', 'medium'), 14);
  assert.equal(baseInterval('understood', 'high'), 21);
});

test('calculateNextReview : déterministe pour une horloge donnée', () => {
  const a = calculateNextReview({ comprehension: 'partial', now: NOW });
  const b = calculateNextReview({ comprehension: 'partial', now: NOW });
  assert.deepEqual(a, b);
  assert.equal(a.interval, 3);
  assert.equal(a.dueAt, addDaysIso(3));
});

test('incompris → 1 jour, repetitions remises à 0', () => {
  const r = calculateNextReview({ comprehension: 'review', repetitions: 5, now: NOW });
  assert.equal(r.interval, 1);
  assert.equal(r.repetitions, 0);
  assert.equal(r.dueAt, addDaysIso(1));
});

test('révisions réussies successives : intervalle croissant plafonné', () => {
  let ease = 2.5, reps = 0;
  const seen = [];
  for (let i = 0; i < 6; i++) {
    const r = calculateNextReview({ comprehension: 'understood', confidence: 'medium', repetitions: reps, ease, now: NOW });
    seen.push(r.interval); ease = r.ease; reps = r.repetitions;
  }
  // croissant puis plafonné à 180
  for (let i = 1; i < seen.length; i++) assert.ok(seen[i] >= seen[i - 1]);
  assert.ok(seen[seen.length - 1] <= 180);
});

test('ease borné', () => {
  const hard = calculateNextReview({ comprehension: 'review', ease: 1.3, now: NOW });
  assert.ok(hard.ease >= 1.3);
  const easy = calculateNextReview({ comprehension: 'understood', ease: 3.5, now: NOW });
  assert.ok(easy.ease <= 3.5);
});

test('getDueReviews : dues et en retard, triées', () => {
  const days = {
    '1': { review: { dueAt: addDaysIso(-2), reason: 'r1' } },   // en retard 2j
    '2': { review: { dueAt: addDaysIso(0), reason: 'r2' } },    // aujourd'hui
    '3': { review: { dueAt: addDaysIso(5), reason: 'r3' } },    // futur (exclu)
    'x': { review: { dueAt: addDaysIso(-1) } },                 // clé invalide (exclu)
  };
  const due = getDueReviews(days, NOW);
  assert.deepEqual(due.map((d) => d.day), [1, 2]);
  assert.equal(due[0].overdueDays, 2);
});

test('getUpcomingReviews : futures dans la fenêtre', () => {
  const days = { '3': { review: { dueAt: addDaysIso(5), reason: 'r3' } }, '4': { review: { dueAt: addDaysIso(40), reason: 'r4' } } };
  const up = getUpcomingReviews(days, NOW, 30);
  assert.deepEqual(up.map((d) => d.day), [3]);
  assert.equal(up[0].inDays, 5);
});

test('reviewSummary : compteurs', () => {
  const days = {
    '1': { review: { dueAt: addDaysIso(-3) } },
    '2': { review: { dueAt: addDaysIso(0) } },
    '3': { review: { dueAt: addDaysIso(2) } },
  };
  const s = reviewSummary(days, NOW);
  assert.equal(s.dueToday, 2);
  assert.equal(s.overdue, 1);
  assert.equal(s.next.day, 3);
  assert.equal(s.total, 3);
});

test('completeReview : recalcule la suite ; aucune date invalide ne casse', () => {
  const next = completeReview({ repetitions: 1, ease: 2.5 }, 'good', NOW);
  assert.ok(next.dueAt);
  assert.equal(next.repetitions, 2);
  // date invalide en entrée → horloge de secours, pas de crash
  const safe = calculateNextReview({ comprehension: 'partial', now: 'pas-une-date' });
  assert.ok(safe.dueAt);
});

test('pas de révision dupliquée : une entrée par jour', () => {
  const days = { '1': { review: { dueAt: addDaysIso(-1) } } };
  const due = getDueReviews(days, NOW);
  assert.equal(due.filter((d) => d.day === 1).length, 1);
});
