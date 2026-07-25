// Tests du store multi-parcours v3 (lib/progress-store.mjs) — pur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PROGRESS_SCHEMA, migrateToV7, activeTrackProgress, writeActiveTrack,
  enrollTrack, setActiveTrack, tracksMeta, emptyFlat,
} from '../lib/progress-store.mjs';
import { DEFAULT_TRACK_ID } from '../lib/catalogue.mjs';

const NOW = '2026-07-25T12:00:00.000Z';

const v6 = {
  startDate: '2026-06-15',
  days: {
    '1': { status: 'done', answers: { 'sec-a': 'ma réponse' }, comprehension: 'partial',
      evidence: [{ id: 'e1', type: 'repo', title: 'Repo', description: '', url: 'https://x.com', skills: ['rag'], createdAt: NOW }],
      review: { dueAt: NOW, interval: 3, repetitions: 0, ease: 2.4, lastReviewedAt: null, reason: 'x' } },
  },
  skills: { rag: 3 },
  weeklyReviews: {}, monthlyReviews: {},
};

test('migrateToV7 : V6 plat → v3 sous le parcours par défaut, actif', () => {
  const v3 = migrateToV7(v6, NOW);
  assert.equal(v3.schemaVersion, PROGRESS_SCHEMA);
  assert.equal(v3.activeTrackId, DEFAULT_TRACK_ID);
  const t = v3.tracks[DEFAULT_TRACK_ID];
  assert.equal(t.startDate, '2026-06-15');
  assert.equal(t.days['1'].answers['sec-a'], 'ma réponse'); // réponse conservée
  assert.equal(t.days['1'].evidence[0].title, 'Repo');       // preuve conservée
  assert.equal(t.days['1'].review.interval, 3);              // révision conservée
  assert.equal(t.skills.rag, 3);
  assert.ok(t.enrolledAt && t.lastOpenedAt);
});

test('migrateToV7 : idempotent (v3 → v3, données stables)', () => {
  const once = migrateToV7(v6, NOW);
  const twice = migrateToV7(once, NOW);
  assert.deepEqual(twice.tracks[DEFAULT_TRACK_ID].days, once.tracks[DEFAULT_TRACK_ID].days);
  assert.equal(twice.activeTrackId, once.activeTrackId);
});

test('activeTrackProgress : vue plate V6 du parcours actif', () => {
  const flat = activeTrackProgress(migrateToV7(v6, NOW));
  assert.equal(flat.days['1'].answers['sec-a'], 'ma réponse');
  assert.equal(flat.startDate, '2026-06-15');
  assert.equal(flat.skills.rag, 3);
});

test('writeActiveTrack : réécrit le parcours actif, préserve les autres', () => {
  let v3 = enrollTrack(migrateToV7(v6, NOW), 'backend-engineer-v1', '1', NOW); // actif = backend
  v3 = setActiveTrack(v3, DEFAULT_TRACK_ID, NOW); // revient au parcours actuel
  const flat = activeTrackProgress(v3);
  flat.days['2'] = { status: 'in-progress' };
  const w = writeActiveTrack(v3, flat, NOW);
  assert.equal(w.tracks[DEFAULT_TRACK_ID].days['2'].status, 'in-progress');
  assert.ok(w.tracks['backend-engineer-v1']); // autre parcours intact
  assert.equal(w.tracks[DEFAULT_TRACK_ID].days['1'].answers['sec-a'], 'ma réponse');
});

test('enrollTrack / setActiveTrack', () => {
  const v3 = enrollTrack(migrateToV7({}, NOW), 'data-ml-v1', '1', NOW);
  assert.equal(v3.activeTrackId, 'data-ml-v1');
  assert.ok(v3.tracks['data-ml-v1']);
  const back = setActiveTrack(v3, DEFAULT_TRACK_ID, NOW);
  assert.equal(back.activeTrackId, DEFAULT_TRACK_ID);
  // setActiveTrack vers un parcours non inscrit → inchangé
  assert.equal(setActiveTrack(v3, 'jamais-inscrit', NOW).activeTrackId, 'data-ml-v1');
});

test('pollution de prototype : clé de parcours dangereuse ignorée', () => {
  const v3 = migrateToV7({ schemaVersion: 3, activeTrackId: 'x', tracks: { '__proto__': { days: {} }, x: { days: {} } } }, NOW);
  assert.equal(Object.hasOwn(v3.tracks, '__proto__'), false);
  assert.ok(v3.tracks.x);
});

test('tracksMeta : métadonnées légères', () => {
  const v3 = enrollTrack(migrateToV7(v6, NOW), 'backend-engineer-v1', '1', NOW);
  const meta = tracksMeta(v3);
  const found = meta.find((m) => m.id === DEFAULT_TRACK_ID);
  assert.equal(found.daysTracked, 1);
  assert.ok(meta.find((m) => m.id === 'backend-engineer-v1').active); // dernier inscrit = actif
});

test('emptyFlat : forme V6 vide', () => {
  assert.deepEqual(emptyFlat(), { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
  assert.deepEqual(activeTrackProgress(migrateToV7({}, NOW)).days, {});
});
