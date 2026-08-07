// CP4 (V16) — read-model agrégé multi-parcours (pur, lecture seule).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCatalogue, DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID, isTrackAvailable } from '../lib/catalogue.mjs';
import { migrateToV7, enrollTrack, writeActiveTrack, activeTrackProgress, setActiveTrack } from '../lib/progress-store.mjs';
import { recordExerciseSuccess } from '../lib/lab-progress.mjs';
import { aggregateTracks } from '../lib/track-aggregate.mjs';

const program = JSON.parse(readFileSync(new URL('../data/program.json', import.meta.url), 'utf8'));
const cat = buildCatalogue(program);

test('un seul parcours (Foundations) : une ligne, durée réelle', () => {
  const v3 = migrateToV7({ startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
  const rows = aggregateTracks(cat, v3, program);
  // Une ligne par parcours DISPONIBLE du catalogue (dérivé, jamais un compte magique).
  assert.equal(rows.length, cat.tracks.filter(isTrackAvailable).length);
  const f = rows.find((r) => r.trackId === DEFAULT_TRACK_ID);
  assert.equal(f.totalDays, 365);
  assert.equal(f.completedDays, 0);
  assert.equal(f.percent, 0);
  assert.equal(f.started, false);
  assert.equal(f.active, true); // Foundations actif par défaut
  assert.equal(rows[0].active, true); // parcours actif en tête
});

test('trois parcours : progression indépendante, chaque ligne conserve trackId', () => {
  let v3 = migrateToV7({ startDate: '2026-01-01', days: { '1': { status: 'done' }, '2': { status: 'done' }, '3': { status: 'in-progress' } }, skills: { rag: 3 }, weeklyReviews: {}, monthlyReviews: {} });
  v3 = enrollTrack(v3, BACKEND_TRACK_ID, '1');
  v3 = writeActiveTrack(v3, { ...activeTrackProgress(v3), days: { '50': { status: 'done' } }, skills: { http: 3 } });
  const rows = aggregateTracks(cat, v3, program);
  const f = rows.find((r) => r.trackId === DEFAULT_TRACK_ID);
  const b = rows.find((r) => r.trackId === BACKEND_TRACK_ID);
  const fs = rows.find((r) => r.trackId === FULLSTACK_TRACK_ID);
  assert.equal(f.completedDays, 2);
  assert.equal(f.inProgress, 1);
  assert.equal(f.skillsCount, 1);
  assert.equal(b.completedDays, 1);   // j50 dans Backend
  assert.equal(b.totalDays, 85);
  assert.equal(b.skillsCount, 1);     // http
  assert.equal(fs.started, false);    // Full-Stack non démarré
  assert.equal(b.active, true);       // Backend actif
  // Chaque ligne conserve son trackId ; aucune contamination.
  assert.notEqual(f.completedDays, b.completedDays);
});

test('parcours terminé : 100 %', () => {
  // Simuler un parcours Backend actif entièrement terminé (85 jours réels).
  let v3 = migrateToV7({ startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
  v3 = enrollTrack(v3, BACKEND_TRACK_ID, '1');
  const flat = activeTrackProgress(v3);
  const allDone = {};
  // Journées réelles du parcours Backend.
  for (const d of program.days) if (d.day <= 86 && d.day !== 82) allDone[String(d.day)] = { status: 'done' };
  v3 = writeActiveTrack(v3, { ...flat, days: allDone });
  const rows = aggregateTracks(cat, v3, program);
  const b = rows.find((r) => r.trackId === BACKEND_TRACK_ID);
  assert.equal(b.completedDays, 85);
  assert.equal(b.percent, 100);
  assert.equal(b.complete, true);
});

test('preuve + révision : dernière preuve et compteur de révisions', () => {
  let v3 = migrateToV7({ startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
  v3 = enrollTrack(v3, BACKEND_TRACK_ID, '1');
  const withProof = recordExerciseSuccess(activeTrackProgress(v3), { exerciseId: 'api-router', title: 'Routeur REST', skills: ['http'], dayRefs: [52] });
  v3 = writeActiveTrack(v3, withProof);
  const b = aggregateTracks(cat, v3, program).find((r) => r.trackId === BACKEND_TRACK_ID);
  assert.ok(b.lastEvidence);
  assert.equal(b.lastEvidence.day, 52);
  assert.match(b.lastEvidence.title, /Routeur/);
  assert.equal(typeof b.reviewsDue, 'number');
});

test('données migrées depuis le format plat → parcours par défaut agrégé', () => {
  const rows = aggregateTracks(cat, migrateToV7({ startDate: '2026-01-01', days: { '1': { status: 'done' } }, skills: {}, weeklyReviews: {}, monthlyReviews: {} }), program);
  const f = rows.find((r) => r.trackId === DEFAULT_TRACK_ID);
  assert.equal(f.completedDays, 1);
  assert.equal(f.started, true);
});

test('lecture seule : aggregateTracks ne mute pas l’état v3', () => {
  const v3 = migrateToV7({ startDate: null, days: { '1': { status: 'done' } }, skills: { rag: 3 }, weeklyReviews: {}, monthlyReviews: {} });
  const before = JSON.stringify(v3);
  aggregateTracks(cat, v3, program);
  assert.equal(JSON.stringify(v3), before); // aucune mutation
});

test('parcours actif reflété + basculement', () => {
  let v3 = migrateToV7({ startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
  v3 = enrollTrack(v3, FULLSTACK_TRACK_ID, '1');
  v3 = setActiveTrack(v3, DEFAULT_TRACK_ID);
  const rows = aggregateTracks(cat, v3, program);
  assert.equal(rows[0].trackId, DEFAULT_TRACK_ID); // actif en tête
  assert.equal(rows[0].active, true);
  assert.equal(rows.filter((r) => r.active).length, 1);
});
