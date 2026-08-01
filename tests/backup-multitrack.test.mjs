// CP9 (V14) — sauvegarde/import multi-parcours : le format v3 préserve TOUS les
// parcours et le parcours actif ; les formats hérités migrent ; les entrées
// invalides sont refusées proprement (sans crash, sans fuite).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serializeBackupV3, parseBackupV3 } from '../lib/backup.mjs';
import { migrateToV7, enrollTrack, writeActiveTrack, activeTrackProgress } from '../lib/progress-store.mjs';
import { FULLSTACK_TRACK_ID, DEFAULT_TRACK_ID } from '../lib/catalogue.mjs';

function twoTracks() {
  let v3 = migrateToV7({ startDate: '2026-01-01', days: { '3': { status: 'done', answer: 'F3', notes: 'noteF' } }, skills: { rag: 3 }, weeklyReviews: {}, monthlyReviews: {} });
  v3 = enrollTrack(v3, FULLSTACK_TRACK_ID, '1');
  v3 = writeActiveTrack(v3, { ...activeTrackProgress(v3), days: { '50': { status: 'done', answer: 'FS50' } }, skills: { http: 3 } });
  return v3;
}

test('round-trip : deux parcours + parcours actif préservés', () => {
  const parsed = parseBackupV3(JSON.stringify(serializeBackupV3(twoTracks(), {})));
  assert.equal(parsed.ok, true);
  const p = parsed.v3;
  assert.deepEqual(Object.keys(p.tracks).sort(), [DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID].sort());
  assert.equal(p.activeTrackId, FULLSTACK_TRACK_ID);
  assert.equal(p.tracks[DEFAULT_TRACK_ID].days['3'].answer, 'F3');
  assert.equal(p.tracks[FULLSTACK_TRACK_ID].days['50'].answer, 'FS50');
  assert.equal(p.tracks[FULLSTACK_TRACK_ID].skills.http, 3);
  // Isolation préservée à travers la sauvegarde.
  assert.equal(p.tracks[DEFAULT_TRACK_ID].days['50'], undefined);
});

test('les stats de l’enveloppe reflètent le multi-parcours', () => {
  const wrapped = serializeBackupV3(twoTracks(), {});
  assert.equal(wrapped.stats.trackCount, 2);
  assert.equal(wrapped.stats.activeTrackId, FULLSTACK_TRACK_ID);
});

test('compatibilité : ancien format plat (V6) → parcours par défaut', () => {
  const flat = { startDate: '2026-01-01', days: { '1': { status: 'done', answer: 'legacy' } }, skills: {}, weeklyReviews: {}, monthlyReviews: {} };
  const parsed = parseBackupV3(JSON.stringify(flat)); // non enveloppé
  assert.equal(parsed.ok, true);
  assert.equal(parsed.v3.activeTrackId, DEFAULT_TRACK_ID);
  assert.equal(parsed.v3.tracks[DEFAULT_TRACK_ID].days['1'].answer, 'legacy');
});

test('refus propres : schéma trop récent, JSON corrompu, mauvaise app', () => {
  assert.equal(parseBackupV3(JSON.stringify({ app: 'ai-career-os', schemaVersion: 99, progress: twoTracks() })).ok, false);
  assert.equal(parseBackupV3('{json casse').ok, false);
  assert.equal(parseBackupV3(JSON.stringify({ app: 'autre-app', progress: twoTracks() })).ok, false);
});

test('anti-fuite : aucun workspace non autorisé importé', () => {
  const wrapped = serializeBackupV3(twoTracks(), { 'js-conditions': { files: { 'solution.mjs': 'ok', '../evil.mjs': 'x', 'secret.test.mjs': 'LEAK' } } });
  const allow = new Map([['js-conditions', new Set(['solution.mjs'])]]);
  const parsed = parseBackupV3(JSON.stringify(wrapped), allow);
  assert.equal(parsed.ok, true);
  assert.deepEqual(Object.keys(parsed.workspaces['js-conditions'].files), ['solution.mjs']);
});
