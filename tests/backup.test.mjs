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

test('serializeBackup : métadonnées multi-parcours (informatives)', () => {
  const b = serializeBackup(sample, new Date('2026-07-25T10:00:00Z'), { activeTrackId: 'ai-engineer-foundations-v1', trackCount: 2 });
  assert.equal(b.activeTrackId, 'ai-engineer-foundations-v1');
  assert.equal(b.trackCount, 2);
  // rétro-compatibilité : sans meta, aucun champ superflu
  const plain = serializeBackup(sample);
  assert.equal('activeTrackId' in plain, false);
  assert.equal('trackCount' in plain, false);
});

test('parseBackup : format wrappé valide (méta parcours tolérée)', () => {
  const b = serializeBackup(sample, new Date(), { activeTrackId: 'x', trackCount: 3 });
  const r = parseBackup(JSON.stringify(b));
  assert.equal(r.ok, true);
  assert.equal(r.version, SCHEMA_VERSION);
  assert.equal(r.progress.days['1'].status, 'done'); // méta parcours ignorée sans risque
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

// ── Checkpoint V5 : validation stricte de l'import ──
import { validateStrict, DAY_STATUSES } from '../lib/backup.mjs';

const wrap = (progress) => ({ app: 'ai-career-os', schemaVersion: 1, progress });

test('strict : jour 0 / 366 / 999 rejetés', () => {
  for (const bad of ['0', '366', '999']) {
    const r = parseBackup(wrap({ days: { [bad]: { status: 'done' } }, skills: {} }));
    assert.equal(r.ok, false, `jour ${bad}`);
    assert.match(r.error, /bornes/);
  }
});

test('strict : clé de jour non numérique rejetée', () => {
  const r = parseBackup(wrap({ days: { abc: { status: 'done' } }, skills: {} }));
  assert.equal(r.ok, false);
  assert.match(r.error, /non numérique/);
});

test('strict : statut inconnu rejeté', () => {
  const r = parseBackup(wrap({ days: { '1': { status: 'finished' } }, skills: {} }));
  assert.equal(r.ok, false);
  assert.match(r.error, /statut inconnu/);
});

test('strict : auto-évaluation hors bornes rejetée', () => {
  const r = parseBackup(wrap({ days: { '1': { status: 'done', selfScore: 9 } }, skills: {} }));
  assert.equal(r.ok, false);
});

test('strict : pollution de prototype rejetée', () => {
  const r = parseBackup('{"progress":{"days":{"__proto__":{"status":"done"}},"skills":{}}}');
  assert.equal(r.ok, false);
  assert.match(r.error, /interdite/);
});

test('strict : JSON corrompu → erreur propre', () => {
  const r = parseBackup('{ pas du json');
  assert.equal(r.ok, false);
  assert.match(r.error, /illisible|corrompu/i);
});

test('strict : schéma futur non supporté', () => {
  const r = parseBackup({ app: 'ai-career-os', schemaVersion: 99, progress: { days: {}, skills: {} } });
  assert.equal(r.ok, false);
  assert.match(r.error, /récent|supporté/i);
});

test('strict : mauvaise app rejetée', () => {
  const r = parseBackup({ app: 'autre-app', schemaVersion: 1, progress: { days: {}, skills: {} } });
  assert.equal(r.ok, false);
});

test('strict : objet vide / sans days rejeté', () => {
  assert.equal(parseBackup('{}').ok, false);
  assert.equal(parseBackup(JSON.stringify({ hello: 'world' })).ok, false);
});

test('strict : ancienne sauvegarde valide (legacy brut) acceptée', () => {
  const legacy = { startDate: '2026-06-15', days: { '1': { status: 'done' } }, skills: { rag: 3 } };
  const r = parseBackup(JSON.stringify(legacy));
  assert.equal(r.ok, true);
  assert.equal(r.version, 0);
  assert.equal(r.progress.days['1'].status, 'done');
});

test('strict : sauvegarde versionnée valide acceptée', () => {
  const r = parseBackup(wrap({ startDate: null, days: { '1': { status: 'in-progress' } }, skills: {} }));
  assert.equal(r.ok, true);
  assert.equal(r.version, 1);
});

test('strict : champs supplémentaires tolérés avec avertissement', () => {
  const r = parseBackup(wrap({ days: { '1': { status: 'done', hackerField: 'x' } }, skills: {} }));
  assert.equal(r.ok, true);
  assert.ok(r.warnings.some((w) => /supplémentaires/.test(w)));
  assert.equal('hackerField' in r.progress.days['1'], false); // retiré (objet reconstruit propre)
});

test('strict : date de démarrage invalide rejetée', () => {
  const r = parseBackup(wrap({ startDate: 'hier', days: {}, skills: {} }));
  assert.equal(r.ok, false);
});

test('strict : aucune mutation partielle après erreur', () => {
  const input = { days: { '1': { status: 'done' }, '999': { status: 'done' } }, skills: {} };
  const before = JSON.stringify(input);
  const r = parseBackup(input);
  assert.equal(r.ok, false);
  assert.equal(JSON.stringify(input), before); // entrée inchangée
});

test('strict : DAY_STATUSES = enum attendue', () => {
  assert.deepEqual([...DAY_STATUSES], ['not-started', 'in-progress', 'done', 'to-review']);
});

// ── V6 CP8 : préservation des données Active Learning ──
test('V6 : schemaVersion = 2', () => {
  assert.equal(SCHEMA_VERSION, 2);
  assert.equal(serializeBackup({ days: {} }).schemaVersion, 2);
});

test('V6 : answers/evidence/review préservés au round-trip', () => {
  const v6 = wrap({
    days: { '1': {
      status: 'done', answers: { 'sec-a': 'ma réponse' }, comprehension: 'partial',
      correctionState: 'acknowledged',
      review: { dueAt: '2026-08-01T00:00:00.000Z', interval: 3, repetitions: 0, ease: 2.4, lastReviewedAt: null, reason: 'x' },
      evidence: [{ id: 'e1', type: 'repo', title: 'Repo', description: '', url: 'https://github.com/me/x', skills: ['rag'], createdAt: '2026-07-01T00:00:00.000Z' }],
    } },
    skills: {},
  });
  v6.schemaVersion = 2;
  const r = parseBackup(v6);
  assert.equal(r.ok, true);
  const d = r.progress.days['1'];
  assert.equal(d.answers['sec-a'], 'ma réponse');
  assert.equal(d.comprehension, 'partial');
  assert.equal(d.correctionState, 'acknowledged');
  assert.equal(d.review.interval, 3);
  assert.equal(d.evidence[0].title, 'Repo');
});

test('V6 : URL de preuve dangereuse neutralisée', () => {
  const bad = wrap({ days: { '1': { status: 'in-progress', evidence: [{ id: 'e', type: 'repo', title: 'X', url: 'javascript:alert(1)' }] } }, skills: {} });
  bad.schemaVersion = 2;
  const r = parseBackup(bad);
  assert.equal(r.ok, true);
  assert.equal(r.progress.days['1'].evidence[0].url, '');
});

test('V6 : migration V5 (sv1) ajoute les champs Active Learning', () => {
  const v5 = { app: 'ai-career-os', schemaVersion: 1, progress: { days: { '1': { status: 'done', answer: 'x' } }, skills: {} } };
  const r = parseBackup(v5);
  assert.equal(r.ok, true);
  assert.equal(r.version, 1);
  assert.deepEqual(r.progress.days['1'].answers, {});
  assert.equal(r.progress.days['1'].correctionState, 'locked');
  assert.deepEqual(r.progress.days['1'].evidence, []);
  assert.equal(r.progress.days['1'].answer, 'x'); // legacy conservé
});

test('V6 : schéma futur (sv3) rejeté', () => {
  const r = parseBackup({ app: 'ai-career-os', schemaVersion: 3, progress: { days: {}, skills: {} } });
  assert.equal(r.ok, false);
  assert.match(r.error, /récent|supporté/i);
});

test('V6 : answers avec clé prototype ignorée (pas de pollution)', () => {
  const p = wrap({ days: { '1': { status: 'in-progress', answers: { '__proto__': 'evil', ok: 'v' } } }, skills: {} });
  p.schemaVersion = 2;
  const r = parseBackup(p);
  assert.equal(r.ok, true);
  assert.equal(Object.hasOwn(r.progress.days['1'].answers, '__proto__'), false);
  assert.equal(r.progress.days['1'].answers.ok, 'v');
});

test('V6 : chaîne de réponse trop longue tronquée', () => {
  const p = wrap({ days: { '1': { status: 'in-progress', answers: { a: 'x'.repeat(50000) } } }, skills: {} });
  p.schemaVersion = 2;
  const r = parseBackup(p);
  assert.equal(r.ok, true);
  assert.equal(r.progress.days['1'].answers.a.length, 20000);
});
