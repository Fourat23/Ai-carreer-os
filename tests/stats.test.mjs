// Tests de la logique de progression (réimplémentée en JS pour rester sans build TS).
// Ces tests valident le comportement attendu de lib/progress-stats.ts.
// Toute divergence entre cette logique et le TS doit être corrigée dans les deux.

import { test } from 'node:test';
import assert from 'node:assert/strict';

// Réplique fidèle de computeStats (voir lib/progress-stats.ts).
function computeStats(days, progress) {
  const totalDays = days.length;
  let completedDays = 0, inProgressDays = 0, toReviewDays = 0;
  for (const d of days) {
    const s = progress.days[String(d.day)]?.status;
    if (s === 'done') completedDays++;
    else if (s === 'in-progress') inProgressDays++;
    else if (s === 'to-review') toReviewDays++;
  }
  let currentDay = totalDays;
  for (const d of days) {
    if ((progress.days[String(d.day)]?.status ?? '') !== 'done') { currentDay = d.day; break; }
  }
  let nextDeliverable = null;
  for (const d of days) {
    if ((progress.days[String(d.day)]?.status ?? '') === 'done') continue;
    if (d.deliverable) { nextDeliverable = { day: d.day, title: d.title, deliverable: d.deliverable }; break; }
  }
  return {
    totalDays, completedDays, inProgressDays, toReviewDays,
    percent: totalDays ? Math.round((completedDays / totalDays) * 100) : 0,
    currentDay, nextDeliverable,
  };
}

const days = [
  { day: 1, title: 'A', deliverable: 'livrable A' },
  { day: 2, title: 'B', deliverable: 'livrable B' },
  { day: 3, title: 'C', deliverable: null },
  { day: 4, title: 'D', deliverable: 'livrable D' },
];

test('aucune progression : currentDay=1, 0%', () => {
  const s = computeStats(days, { days: {} });
  assert.equal(s.currentDay, 1);
  assert.equal(s.percent, 0);
  assert.equal(s.nextDeliverable.day, 1);
});

test('jour 1 terminé : currentDay avance, pourcentage mis à jour', () => {
  const s = computeStats(days, { days: { '1': { status: 'done' } } });
  assert.equal(s.currentDay, 2);
  assert.equal(s.completedDays, 1);
  assert.equal(s.percent, 25);
  assert.equal(s.nextDeliverable.day, 2);
});

test('prochain livrable saute les jours sans livrable', () => {
  const s = computeStats(days, { days: { '1': { status: 'done' }, '2': { status: 'done' } } });
  // jour 3 n'a pas de livrable, donc le prochain livrable est le jour 4
  assert.equal(s.currentDay, 3);
  assert.equal(s.nextDeliverable.day, 4);
});

test('compte les statuts en cours et à revoir', () => {
  const s = computeStats(days, { days: { '1': { status: 'in-progress' }, '2': { status: 'to-review' } } });
  assert.equal(s.inProgressDays, 1);
  assert.equal(s.toReviewDays, 1);
  assert.equal(s.currentDay, 1); // in-progress n'est pas "done"
});

test('tout terminé : currentDay = dernier, 100%', () => {
  const all = {};
  for (const d of days) all[String(d.day)] = { status: 'done' };
  const s = computeStats(days, { days: all });
  assert.equal(s.percent, 100);
  assert.equal(s.currentDay, 4);
  assert.equal(s.nextDeliverable, null);
});
