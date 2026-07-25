// Tests du modèle Active Learning (lib/learning.mjs) — pur, exhaustif.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LEARNING_SCHEMA, normalizeDay, migrateProgress, safeUrl,
  updateAnswer, updateNotes, recordAttempt, updateSelfAssessment,
  setCorrectionState, setComprehension, scheduleReview, addEvidence, removeEvidence,
} from '../lib/learning.mjs';

test('normalizeDay : défauts V6 complets', () => {
  const d = normalizeDay(undefined);
  assert.equal(d.status, 'not-started');
  assert.equal(d.correctionState, 'locked');
  assert.deepEqual(d.answers, {});
  assert.deepEqual(d.evidence, []);
  assert.equal(d.review, null);
  assert.equal(d.attempts.count, 0);
  assert.equal(d.comprehension, null);
});

test('normalizeDay : conserve les champs V5 (rétro-compat)', () => {
  const v5 = { status: 'done', answer: 'ma réponse', notes: 'note', selfScore: 4, checklist: { '0': true }, updatedAt: '2026-01-01T00:00:00Z' };
  const d = normalizeDay(v5);
  assert.equal(d.answer, 'ma réponse');
  assert.equal(d.notes, 'note');
  assert.equal(d.selfScore, 4);
  assert.deepEqual(d.checklist, { '0': true });
  assert.equal(d.status, 'done');
});

test('normalizeDay : statut/état inconnus → sûrs', () => {
  const d = normalizeDay({ status: 'bogus', correctionState: 'hacked', comprehension: 'x' });
  assert.equal(d.status, 'not-started');
  assert.equal(d.correctionState, 'locked');
  assert.equal(d.comprehension, null);
});

test('migrateProgress : progress V5 minimal reste lisible, schéma posé', () => {
  const v5 = { startDate: '2026-06-15', days: { '1': { status: 'done', answer: 'x' } }, skills: { rag: 3 } };
  const m = migrateProgress(v5);
  assert.equal(m.schemaVersion, LEARNING_SCHEMA);
  assert.equal(m.startDate, '2026-06-15');
  assert.equal(m.days['1'].answer, 'x');
  assert.equal(m.days['1'].correctionState, 'locked'); // champ V6 ajouté
  assert.equal(m.skills.rag, 3);
});

test('migrateProgress : rejette clés de jour dangereuses / non numériques', () => {
  const m = migrateProgress({ days: { '__proto__': { status: 'done' }, abc: {}, '5': { status: 'in-progress' } } });
  assert.deepEqual(Object.keys(m.days), ['5']);
});

test('round-trip : les données V6 survivent à normalize', () => {
  let d = normalizeDay({});
  d = updateAnswer(d, 'sec-pratique', 'const x = 1');
  d = updateNotes(d, 'à relire');
  d = updateSelfAssessment(d, { level: 4, confidence: 'high' });
  d = addEvidence(d, { title: 'Repo', type: 'repo', url: 'https://github.com/me/x', skills: ['rag'] });
  const again = normalizeDay(JSON.parse(JSON.stringify(d)));
  assert.equal(again.answers['sec-pratique'], 'const x = 1');
  assert.equal(again.notes, 'à relire');
  assert.equal(again.selfAssessment.level, 4);
  assert.equal(again.evidence[0].title, 'Repo');
});

test('updateAnswer : réponses distinctes par section ; clé dangereuse ignorée', () => {
  let d = updateAnswer(normalizeDay({}), 'a', 'AAA');
  d = updateAnswer(d, 'b', 'BBB');
  assert.equal(d.answers.a, 'AAA');
  assert.equal(d.answers.b, 'BBB');
  const d2 = updateAnswer(d, '__proto__', 'evil');
  assert.equal(Object.hasOwn(d2.answers, '__proto__'), false); // aucune clé dangereuse ajoutée
  assert.equal(d2.answers.a, 'AAA'); // inchangé
});

test('updateNotes : indépendant des réponses', () => {
  let d = updateAnswer(normalizeDay({}), 'a', 'A');
  d = updateNotes(d, 'mes notes');
  assert.equal(d.notes, 'mes notes');
  assert.equal(d.answers.a, 'A');
});

test('recordAttempt : incrémente et horodate', () => {
  let d = recordAttempt(normalizeDay({}), { at: '2026-07-01T10:00:00Z', outcome: 'partial', summary: 'essai 1' });
  d = recordAttempt(d, { at: '2026-07-02T10:00:00Z', outcome: 'ok' });
  assert.equal(d.attempts.count, 2);
  assert.equal(d.attempts.lastAt, '2026-07-02T10:00:00Z');
  assert.equal(d.attempts.history.length, 2);
});

test('updateSelfAssessment : borne le niveau, valide la confiance', () => {
  const d = updateSelfAssessment(normalizeDay({}), { level: 99, confidence: 'nope' });
  assert.equal(d.selfAssessment.level, 5);
  assert.equal(d.selfAssessment.confidence, null);
});

test('correction & compréhension', () => {
  let d = setCorrectionState(normalizeDay({}), 'available');
  assert.equal(d.correctionState, 'available');
  d = setCorrectionState(d, 'bogus');
  assert.equal(d.correctionState, 'available'); // inchangé
  d = setComprehension(d, 'partial');
  assert.equal(d.comprehension, 'partial');
});

test('scheduleReview : borne intervalle et ease', () => {
  const d = scheduleReview(normalizeDay({}), { dueAt: '2026-08-01T00:00:00Z', interval: 99999, ease: 9, reason: 'à revoir' });
  assert.equal(d.review.interval, 3650);
  assert.equal(d.review.ease, 3.5);
  assert.equal(d.review.reason, 'à revoir');
});

test('evidence : ajout, dédup id, suppression', () => {
  let d = addEvidence(normalizeDay({}), { title: 'E1', type: 'exercise' });
  d = addEvidence(d, { title: 'E2', type: 'demo' });
  assert.equal(d.evidence.length, 2);
  const id = d.evidence[0].id;
  d = removeEvidence(d, id);
  assert.equal(d.evidence.length, 1);
  assert.equal(d.evidence[0].title, 'E2');
});

test('evidence : sans titre ignorée', () => {
  const d = addEvidence(normalizeDay({}), { type: 'note' });
  assert.equal(d.evidence.length, 0);
});

test('safeUrl : neutralise les schémas dangereux', () => {
  assert.equal(safeUrl('javascript:alert(1)'), '');
  assert.equal(safeUrl('data:text/html,x'), '');
  assert.equal(safeUrl('https://ex.com/a'), 'https://ex.com/a');
  assert.equal(safeUrl('./local/path'), './local/path');
  assert.equal(safeUrl('mailto:a@b.c'), 'mailto:a@b.c');
});

test('bornes de taille : texte tronqué', () => {
  const big = 'x'.repeat(50000);
  const d = updateNotes(normalizeDay({}), big);
  assert.equal(d.notes.length, 20000);
});

test('evidence : URL dangereuse neutralisée à la normalisation', () => {
  const d = addEvidence(normalizeDay({}), { title: 'X', url: 'javascript:evil()' });
  assert.equal(d.evidence[0].url, '');
});
