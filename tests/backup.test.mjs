// Tests de la sauvegarde/restauration pure (lib/backup.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEMA_VERSION, normalizeProgress, isProgressShape, backupStats,
  serializeBackup, migrate, parseBackup,
} from '../lib/backup.mjs';

const sample = {
  startDate: '2026-06-15',
  days: {
    '1': { status: 'done', notes: 'ok', answer: '' },
    '2': { status: 'in-progress', notes: '', answer: 'essai' },
    '3': { status: 'to-review', notes: '', answer: '' },
  },
  skills: { rag: 3, py: 2 },
  weeklyReviews: {}, monthlyReviews: {},
};

test('normalizeProgress : défauts sur objet vide / invalide', () => {
  const n = normalizeProgress(null);
  assert.deepEqual(n, { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
});

test('isProgressShape', () => {
  assert.equal(isProgressShape(sample), true);
  assert.equal(isProgressShape({ foo: 1 }), false);
  assert.equal(isProgressShape('x'), false);
});

test('backupStats : compte réel, aucune invention', () => {
  const s = backupStats(sample);
  assert.equal(s.daysTracked, 3);
  assert.equal(s.done, 1);
  assert.equal(s.inProgress, 1);
  assert.equal(s.toReview, 1);
  assert.equal(s.notes, 2); // jour 1 (notes) + jour 2 (answer)
  assert.equal(s.skillsRated, 2);
});

test('serializeBackup : enveloppe versionnée', () => {
  const b = serializeBackup(sample, new Date('2026-07-25T10:00:00Z'));
  assert.equal(b.app, 'ai-career-os');
  assert.equal(b.schemaVersion, SCHEMA_VERSION);
  assert.equal(b.exportedAt, '2026-07-25T10:00:00.000Z');
  assert.equal(b.progress.startDate, '2026-06-15');
  assert.equal(b.stats.done, 1);
});

test('parseBackup : format wrappé valide', () => {
  const b = serializeBackup(sample);
  const r = parseBackup(JSON.stringify(b));
  assert.equal(r.ok, true);
  assert.equal(r.version, SCHEMA_VERSION);
  assert.equal(r.progress.days['1'].status, 'done');
});

test('parseBackup : format legacy brut (progress.json v0)', () => {
  const r = parseBackup(JSON.stringify(sample));
  assert.equal(r.ok, true);
  assert.equal(r.version, 0);
  assert.equal(r.progress.skills.rag, 3);
});

test('parseBackup : JSON corrompu → erreur propre, pas de crash', () => {
  const r = parseBackup('{ pas du json ');
  assert.equal(r.ok, false);
  assert.match(r.error, /illisible|corrompu/i);
});

test('parseBackup : objet sans progression → rejet', () => {
  const r = parseBackup(JSON.stringify({ hello: 'world' }));
  assert.equal(r.ok, false);
});

test('parseBackup : accepte un objet déjà parsé', () => {
  const r = parseBackup(serializeBackup(sample));
  assert.equal(r.ok, true);
});

test('migrate : wrappé et legacy donnent la même progression', () => {
  const fromWrap = migrate(serializeBackup(sample));
  const fromRaw = migrate(sample);
  assert.deepEqual(fromWrap, fromRaw);
});

test('migrate : champs additionnels futurs ignorés sans risque', () => {
  const future = { app: 'ai-career-os', schemaVersion: 99, extra: { x: 1 }, progress: sample };
  const p = migrate(future);
  assert.equal(p.startDate, '2026-06-15');
});
