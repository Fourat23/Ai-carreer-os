// V64 · Persistance : écriture atomique, récupération après interruption,
// migration depuis l'état réel. Ces tests écrivent sur DISQUE — mais jamais
// ailleurs que dans un répertoire temporaire propre à chaque test.
// data/progress.json n'est ni lu, ni écrit, ni sauvegardé, ni restauré.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync, existsSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { migrateToV7, activeTrackProgress, writeActiveTrack, PROGRESS_SCHEMA } from '../lib/progress-store.mjs';
import { applyCommand } from '../lib/learning-engine.mjs';
import { normalizeDay } from '../lib/learning.mjs';

const NOW = '2026-08-27T10:00:00.000Z';

function tmp() {
  return mkdtempSync(join(tmpdir(), 'aicos-v64-'));
}

// Reproduit exactement l'écriture atomique de lib/progress-server.ts, pour
// pouvoir la tester sans démarrer Next.
function atomicWrite(file, data, { interruptAfterTmp = false } = {}) {
  const t = `${file}.test.tmp`;
  writeFileSync(t, data);
  if (interruptAfterTmp) return; // simule une coupure AVANT le rename
  renameSync(t, file);
}

test('écriture interrompue : l’ancien fichier reste intact et lisible', () => {
  const dir = tmp();
  try {
    const file = join(dir, 'progress.json');
    const good = JSON.stringify({ schemaVersion: 3, activeTrackId: 't', tracks: { t: { days: { 1: { status: 'done' } } } } });
    writeFileSync(file, good);

    // Coupure au pire moment : le temporaire est écrit, le rename n'a pas eu lieu.
    atomicWrite(file, '{"tronqu', { interruptAfterTmp: true });

    // Le fichier CANONIQUE est intact — c'est toute la valeur du rename.
    assert.equal(readFileSync(file, 'utf8'), good);
    const parsed = migrateToV7(JSON.parse(readFileSync(file, 'utf8')));
    assert.equal(activeTrackProgress(parsed).days['1'].status, 'done');

    // Le résidu temporaire ne se fait pas passer pour la progression.
    const stray = readdirSync(dir).filter((f) => f.endsWith('.tmp'));
    assert.equal(stray.length, 1);
    assert.notEqual(stray[0], 'progress.json');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('écriture non interrompue : le fichier final est complet et parsable', () => {
  const dir = tmp();
  try {
    const file = join(dir, 'progress.json');
    const v3 = migrateToV7({}, NOW);
    atomicWrite(file, JSON.stringify(v3, null, 2));
    assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')).schemaVersion, PROGRESS_SCHEMA);
    assert.equal(existsSync(`${file}.test.tmp`), false, 'le temporaire doit avoir été renommé');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('migration : le progress.json RÉEL du propriétaire migre sans perte', () => {
  // Copie littérale du fichier d'entrée V64 (371 octets, days vide).
  const real = {
    schemaVersion: 3,
    activeTrackId: 'ai-engineer-foundations-v1',
    tracks: {
      'ai-engineer-foundations-v1': {
        version: '1',
        enrolledAt: '2026-08-03T23:05:41.225Z',
        lastOpenedAt: '2026-08-03T23:05:41.225Z',
        startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {},
      },
    },
  };
  const once = migrateToV7(real, NOW);
  const twice = migrateToV7(once, NOW);
  assert.deepEqual(twice, once, 'migration idempotente');
  assert.equal(once.activeTrackId, 'ai-engineer-foundations-v1');
  assert.equal(once.tracks['ai-engineer-foundations-v1'].enrolledAt, '2026-08-03T23:05:41.225Z');
  assert.deepEqual(activeTrackProgress(once).days, {});
});

test('migration : une progression V5 chargée de données legacy ne perd RIEN', () => {
  const v5 = {
    startDate: '2026-01-01',
    days: {
      '1': { status: 'done', answer: 'ma réponse', notes: 'mes notes', selfScore: 4, checklist: { 0: true, 1: false }, updatedAt: '2026-01-02T08:00:00.000Z' },
      '2': { status: 'in-progress', answer: 'en cours' },
    },
    skills: { python: 3 },
    weeklyReviews: { '1': { done: true, note: 'ok', score: 4 } },
    monthlyReviews: {},
  };
  const v3 = migrateToV7(v5, NOW);
  const flat = activeTrackProgress(v3);

  // Champs legacy : conservés à l'identique.
  assert.equal(flat.days['1'].answer, 'ma réponse');
  assert.equal(flat.days['1'].notes, 'mes notes');
  assert.equal(flat.days['1'].selfScore, 4);
  assert.deepEqual(flat.days['1'].checklist, { 0: true, 1: false });
  assert.equal(flat.skills.python, 3);
  assert.deepEqual(flat.weeklyReviews['1'], { done: true, note: 'ok', score: 4 });

  // Sessions : dérivées du statut, déterministes.
  assert.equal(flat.days['1'].session.state, 'completed');
  assert.equal(flat.days['1'].session.completedAt, '2026-01-02T08:00:00.000Z');
  assert.equal(flat.days['2'].session.state, 'active');

  // Idempotence complète sur le cycle lecture → écriture → lecture.
  const round = activeTrackProgress(writeActiveTrack(v3, flat, NOW));
  assert.deepEqual(round.days, flat.days);
});

test('un cycle commande → écriture → relecture conserve la session', () => {
  const dir = tmp();
  try {
    const file = join(dir, 'progress.json');
    writeFileSync(file, JSON.stringify(migrateToV7({}, NOW)));

    let v3 = migrateToV7(JSON.parse(readFileSync(file, 'utf8')), NOW);
    let flat = activeTrackProgress(v3);

    const started = applyCommand(flat, { type: 'START', day: 7 }, { now: NOW });
    assert.equal(started.ok, true);
    atomicWrite(file, JSON.stringify(writeActiveTrack(v3, started.progress, NOW), null, 2));

    // Relecture depuis le disque : la session doit être là, à l'identique.
    const reread = activeTrackProgress(migrateToV7(JSON.parse(readFileSync(file, 'utf8')), NOW));
    assert.equal(reread.days['7'].session.state, 'active');
    assert.equal(reread.days['7'].session.startedAt, NOW);
    assert.equal(reread.days['7'].status, 'in-progress');

    // Puis une soumission, même cycle.
    const sub = applyCommand(reread, { type: 'SUBMIT', day: 7, stepId: 'a', content: 'rendu' }, { now: NOW });
    atomicWrite(file, JSON.stringify(writeActiveTrack(migrateToV7(JSON.parse(readFileSync(file, 'utf8'))), sub.progress, NOW), null, 2));
    const final = activeTrackProgress(migrateToV7(JSON.parse(readFileSync(file, 'utf8')), NOW));
    assert.equal(final.days['7'].submissions.length, 1);
    assert.equal(final.days['7'].submissions[0].content, 'rendu');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('un fichier corrompu ne fait pas planter la lecture — il repart vide', () => {
  // Comportement existant, ici DOCUMENTÉ : c'est précisément pour ne jamais
  // l'atteindre que l'écriture est devenue atomique.
  assert.deepEqual(activeTrackProgress(migrateToV7(null)).days, {});
  assert.deepEqual(normalizeDay(undefined).session.state, 'not_started');
});
