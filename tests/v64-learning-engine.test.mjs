// V64 · Learning Engine (ADR-064) — modèle PUR : machine à états, commandes,
// idempotence, migration. Aucune I/O : ces tests ne touchent aucun fichier.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyCommand, nextSessionState, projectStatus, sessionView, openSessions,
  SESSION_STATES,
} from '../lib/learning-engine.mjs';
import { normalizeDay, migrateProgress, LEARNING_SCHEMA } from '../lib/learning.mjs';

const NOW = '2026-08-27T10:00:00.000Z';
const LATER = '2026-08-27T12:30:00.000Z';
const empty = () => ({ startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
const run = (p, cmd, now = NOW) => applyCommand(p, cmd, { now });
const day = (p, d = 1) => p.days[String(d)];

// ── Machine à états ────────────────────────────────────────────────────────

test('transitions légales : la table est exhaustive', () => {
  assert.equal(nextSessionState('not_started', 'START'), 'active');
  assert.equal(nextSessionState('active', 'PAUSE'), 'paused');
  assert.equal(nextSessionState('paused', 'RESUME'), 'active');
  assert.equal(nextSessionState('active', 'COMPLETE'), 'completed');
  assert.equal(nextSessionState('paused', 'COMPLETE'), 'completed');
  assert.equal(nextSessionState('completed', 'REOPEN'), 'active');
});

test('NOT_STARTED → COMPLETED est REFUSÉ (exigence du brief)', () => {
  assert.equal(nextSessionState('not_started', 'COMPLETE'), null);
  const r = run(empty(), { type: 'COMPLETE', day: 1 });
  assert.equal(r.ok, false);
  assert.equal(r.code, 'INVALID_TRANSITION');
});

test('INVALID_TRANSITION_DOES_NOT_MUTATE_PROGRESS : la progression est inchangée', () => {
  const before = empty();
  const snapshot = JSON.stringify(before);
  const r = run(before, { type: 'COMPLETE', day: 1 });
  assert.equal(r.ok, false);
  assert.equal(r.progress, undefined);           // rien à écrire
  assert.equal(JSON.stringify(before), snapshot); // objet d'entrée intact
});

test('COMPLETED → NOT_STARTED est inatteignable : aucune commande ne le produit', () => {
  for (const cmd of ['START', 'PAUSE', 'RESUME', 'COMPLETE', 'REOPEN']) {
    const target = nextSessionState('completed', cmd);
    assert.notEqual(target, 'not_started', `${cmd} ne doit pas ramener à not_started`);
  }
});

test('transitions absurdes refusées, une par une', () => {
  let p = run(empty(), { type: 'START', day: 3 }).progress;
  assert.equal(run(p, { type: 'RESUME', day: 3 }).code, 'INVALID_TRANSITION'); // active → RESUME
  assert.equal(run(p, { type: 'REOPEN', day: 3 }).code, 'INVALID_TRANSITION'); // active → REOPEN
  assert.equal(run(p, { type: 'START', day: 3 }).code, 'INVALID_TRANSITION');  // déjà démarrée
  p = run(p, { type: 'PAUSE', day: 3 }).progress;
  assert.equal(run(p, { type: 'PAUSE', day: 3 }).code, 'INVALID_TRANSITION');  // déjà en pause
});

// ── START ─────────────────────────────────────────────────────────────────

test('START_DAY_MUTATES_PROGRESS_EXACTLY_ONCE', () => {
  const r = run(empty(), { type: 'START', day: 12 });
  assert.equal(r.ok, true);
  const d = day(r.progress, 12);
  assert.equal(d.session.state, 'active');
  assert.equal(d.session.startedAt, NOW);   // A5 du CP0 : enfin écrit
  assert.equal(d.status, 'in-progress');    // projection
  assert.equal(Object.keys(r.progress.days).length, 1);

  // Un second START est refusé : il n'y a pas de « deuxième premier démarrage ».
  assert.equal(run(r.progress, { type: 'START', day: 12 }).ok, false);
});

test('START pose startDate si absente, et ne la réécrit jamais', () => {
  const r1 = run(empty(), { type: 'START', day: 1 });
  assert.equal(r1.progress.startDate, '2026-08-27');
  const r2 = run(r1.progress, { type: 'START', day: 2 }, LATER);
  assert.equal(r2.progress.startDate, '2026-08-27');
});

test('START refuse une journée hors [1,365]', () => {
  for (const d of [0, 366, -1, 1.5, 'x', null, undefined, NaN]) {
    assert.equal(run(empty(), { type: 'START', day: d }).code, 'INVALID_DAY', `jour ${d}`);
  }
});

// ── COMPLETE / idempotence ────────────────────────────────────────────────

test('COMPLETE_DAY_IS_IDEMPOTENT : completedAt n’est pas réécrit', () => {
  let p = run(empty(), { type: 'START', day: 5 }).progress;
  const first = run(p, { type: 'COMPLETE', day: 5 }, NOW);
  assert.equal(first.ok, true);
  assert.equal(day(first.progress, 5).session.completedAt, NOW);

  // Deux appels de plus, à une horloge DIFFÉRENTE.
  const second = run(first.progress, { type: 'COMPLETE', day: 5 }, LATER);
  const third = run(second.progress, { type: 'COMPLETE', day: 5 }, LATER);
  assert.equal(second.ok, true);
  assert.deepEqual(second.effects, ['noop:already-completed']);
  // Rien n'a bougé : réécrire cette progression sur disque est un no-op exact.
  assert.equal(JSON.stringify(second.progress), JSON.stringify(first.progress));
  assert.equal(day(third.progress, 5).session.completedAt, NOW);
  assert.equal(day(third.progress, 5).status, 'done');
});

test('COMPLETE depuis paused est légal', () => {
  let p = run(empty(), { type: 'START', day: 7 }).progress;
  p = run(p, { type: 'PAUSE', day: 7 }).progress;
  const r = run(p, { type: 'COMPLETE', day: 7 });
  assert.equal(r.ok, true);
  assert.equal(day(r.progress, 7).session.state, 'completed');
});

test('REOPEN efface completedAt (anomalie A6 du CP0) et compte les réouvertures', () => {
  let p = run(empty(), { type: 'START', day: 9 }).progress;
  p = run(p, { type: 'COMPLETE', day: 9 }).progress;
  const r = run(p, { type: 'REOPEN', day: 9 }, LATER);
  const d = day(r.progress, 9);
  assert.equal(d.session.state, 'active');
  assert.equal(d.session.completedAt, null);
  assert.equal(d.session.reopenCount, 1);
  assert.equal(d.status, 'in-progress');
});

// ── Projection du statut ──────────────────────────────────────────────────

test('status est une PROJECTION, jamais une entrée', () => {
  assert.equal(projectStatus({ state: 'not_started' }, {}), 'not-started');
  assert.equal(projectStatus({ state: 'active' }, {}), 'in-progress');
  assert.equal(projectStatus({ state: 'paused' }, {}), 'in-progress');
  assert.equal(projectStatus({ state: 'completed' }, {}), 'done');
  assert.equal(projectStatus({ state: 'completed' }, { comprehension: 'review' }), 'to-review');
});

test('un client ne peut pas imposer un statut : le champ est ignoré', () => {
  const r = run(empty(), { type: 'START', day: 2, status: 'done' });
  assert.equal(day(r.progress, 2).status, 'in-progress');
});

// ── Brouillon vs soumission ───────────────────────────────────────────────

test('SAVE_DRAFT n’ouvre PAS la session : écrire n’est pas commencer', () => {
  const r = run(empty(), { type: 'SAVE_DRAFT', day: 4, notes: 'une idée' });
  assert.equal(r.ok, true);
  assert.equal(day(r.progress, 4).session.state, 'not_started');
  assert.equal(day(r.progress, 4).status, 'not-started');
  assert.equal(day(r.progress, 4).notes, 'une idée');
});

test('SAVE_DRAFT vide est refusé', () => {
  assert.equal(run(empty(), { type: 'SAVE_DRAFT', day: 4 }).code, 'EMPTY_DRAFT');
});

test('SUBMIT exige une session ouverte', () => {
  const r = run(empty(), { type: 'SUBMIT', day: 6, stepId: 'act-1', content: 'ma réponse' });
  assert.equal(r.ok, false);
  assert.equal(r.code, 'SESSION_NOT_STARTED');
});

test('SUBMIT ajoute une soumission — il n’écrase jamais la précédente', () => {
  let p = run(empty(), { type: 'START', day: 6 }).progress;
  p = run(p, { type: 'SUBMIT', day: 6, stepId: 'act-1', content: 'v1' }).progress;
  p = run(p, { type: 'SUBMIT', day: 6, stepId: 'act-1', content: 'v2' }, LATER).progress;
  const d = day(p, 6);
  assert.equal(d.submissions.length, 2);
  assert.deepEqual(d.submissions.map((s) => s.content), ['v1', 'v2']);
  assert.deepEqual(d.submissions.map((s) => s.id), ['sub-act-1-1', 'sub-act-1-2']);
  assert.equal(d.attempts.count, 2); // le compteur legacy est enfin alimenté
});

test('SUBMIT vide est refusé', () => {
  const p = run(empty(), { type: 'START', day: 6 }).progress;
  assert.equal(run(p, { type: 'SUBMIT', day: 6, stepId: 'a', content: '   ' }).code, 'EMPTY_SUBMISSION');
});

test('SAVE_SUBMISSION_MUTATES_ONLY_TARGET_SUBMISSION', () => {
  let p = run(empty(), { type: 'START', day: 20 }).progress;
  p = run(p, { type: 'START', day: 21 }).progress;
  p = run(p, { type: 'SUBMIT', day: 20, stepId: 'a', content: 'A' }).progress;
  const day21Before = JSON.stringify(day(p, 21));
  p = run(p, { type: 'SUBMIT', day: 20, stepId: 'b', content: 'B' }, LATER).progress;

  // La journée voisine n'a pas bougé d'un octet.
  assert.equal(JSON.stringify(day(p, 21)), day21Before);
  // La première soumission non plus.
  const subs = day(p, 20).submissions;
  assert.equal(subs.length, 2);
  assert.equal(subs[0].content, 'A');
  assert.equal(subs[0].submittedAt, NOW);
  assert.equal(subs[1].submittedAt, LATER);
});

// ── Validation → preuve ───────────────────────────────────────────────────

test('une validation « passed » produit une preuve, idempotente', () => {
  let p = run(empty(), { type: 'START', day: 30 }).progress;
  const r = run(p, {
    type: 'SUBMIT', day: 30, stepId: 'ex-1', kind: 'exercise', content: 'code',
    validation: { status: 'passed', kind: 'exercise-tests', checkedAt: NOW, detail: '4/4', score: { passed: 4, total: 4 } },
  });
  assert.equal(r.ok, true);
  const d = day(r.progress, 30);
  assert.equal(d.evidence.length, 1);
  // L'identifiant dérive de l'ÉTAPE, pas de la soumission : la preuve atteste
  // que l'étape est validée, pas qu'une soumission a existé.
  assert.equal(d.evidence[0].id, 'sub-ev-ex-1');
  assert.equal(d.session.steps['ex-1'].state, 'done');

  // Conséquence directe : re-rendre un travail DÉJÀ validé ajoute bien une
  // soumission, mais ne duplique PAS la preuve du même fait.
  const resubmitted = run(r.progress, {
    type: 'SUBMIT', day: 30, stepId: 'ex-1', kind: 'exercise', content: 'code v2',
    validation: { status: 'passed', kind: 'exercise-tests', checkedAt: LATER, detail: '4/4', score: { passed: 4, total: 4 } },
  }, LATER);
  assert.equal(day(resubmitted.progress, 30).evidence.length, 1, 'la preuve ne doit pas être dupliquée');
  assert.equal(day(resubmitted.progress, 30).submissions.length, 2, 'la soumission doit être ajoutée');

  // Rattacher DEUX FOIS la même validation ne crée pas de deuxième preuve.
  const again = run(r.progress, {
    type: 'ATTACH_VALIDATION', day: 30, submissionId: 'sub-ex-1-1',
    validation: { status: 'passed', kind: 'exercise-tests', checkedAt: NOW, detail: '4/4', score: { passed: 4, total: 4 } },
  }, LATER);
  assert.equal(again.ok, true);
  assert.equal(day(again.progress, 30).evidence.length, 1);
});

test('une validation « failed » ne produit AUCUNE preuve et laisse l’étape en cours', () => {
  let p = run(empty(), { type: 'START', day: 31 }).progress;
  const r = run(p, {
    type: 'SUBMIT', day: 31, stepId: 'ex-1', kind: 'exercise', content: 'code',
    validation: { status: 'failed', kind: 'exercise-tests', checkedAt: NOW, detail: '1/4', score: { passed: 1, total: 4 } },
  });
  const d = day(r.progress, 31);
  assert.equal(d.evidence.length, 0);
  assert.equal(d.session.steps['ex-1'].state, 'in_progress');
});

test('une réponse ouverte est « manual », jamais « passed » automatiquement', () => {
  let p = run(empty(), { type: 'START', day: 32 }).progress;
  const r = run(p, { type: 'SUBMIT', day: 32, stepId: 'act-1', content: 'ma prose' });
  const sub = day(r.progress, 32).submissions[0];
  assert.equal(sub.validation, null);          // aucune note inventée
  assert.equal(day(r.progress, 32).evidence.length, 0);
});

// ── Sécurité (§32) ────────────────────────────────────────────────────────

test('identifiants dangereux rejetés : prototype, chemins, traversée', () => {
  const p = run(empty(), { type: 'START', day: 40 }).progress;
  for (const bad of ['__proto__', 'constructor', 'prototype', '../secret', 'a/b', 'a\\b', '..', '']) {
    const r = run(p, { type: 'SUBMIT', day: 40, stepId: bad, content: 'x' });
    assert.equal(r.ok, false, `stepId « ${bad} » devrait être refusé`);
    assert.equal(r.code, 'INVALID_STEP');
  }
});

test('la pollution de prototype ne passe pas par SAVE_DRAFT', () => {
  const r = run(empty(), { type: 'SAVE_DRAFT', day: 41, answers: { __proto__: 'x', ok: 'v' } });
  assert.equal(r.ok, true);
  assert.equal(day(r.progress, 41).answers.ok, 'v');
  assert.equal(Object.prototype.hasOwnProperty.call(day(r.progress, 41).answers, '__proto__'), false);
  assert.equal({}.x, undefined);
});

test('commande inconnue : refusée, sans écriture', () => {
  for (const t of ['DROP', '', null, 42, 'start', 'SET_STATUS']) {
    const r = run(empty(), { type: t });
    assert.equal(r.ok, false);
    assert.equal(r.code, 'UNKNOWN_COMMAND');
  }
});

test('horloge invalide : refusée', () => {
  assert.equal(applyCommand(empty(), { type: 'START', day: 1 }, { now: 'pas une date' }).code, 'INVALID_CLOCK');
});

// ── Migration (déterministe, idempotente, sans perte) ─────────────────────

test('migration : une journée V6 sans session en obtient une, dérivée du statut', () => {
  const legacy = {
    status: 'done', answer: 'ma réponse', notes: 'note', selfScore: 4,
    checklist: { 0: true }, updatedAt: '2026-05-01T08:00:00.000Z',
    completedAt: '2026-05-01T09:00:00.000Z',
  };
  const d = normalizeDay(legacy);
  assert.equal(d.session.state, 'completed');
  assert.equal(d.session.completedAt, '2026-05-01T09:00:00.000Z');
  assert.equal(d.session.startedAt, '2026-05-01T08:00:00.000Z');
  // SANS PERTE : tous les champs legacy sont conservés à l'identique.
  assert.equal(d.answer, 'ma réponse');
  assert.equal(d.notes, 'note');
  assert.equal(d.selfScore, 4);
  assert.deepEqual(d.checklist, { 0: true });
});

test('migration : idempotente — normalize(normalize(x)) === normalize(x)', () => {
  const samples = [
    {},
    { status: 'not-started' },
    { status: 'in-progress', updatedAt: '2026-05-01T08:00:00.000Z' },
    { status: 'in-progress', completedAt: '2026-05-01T09:00:00.000Z' }, // incohérent : A6
    { status: 'done', updatedAt: '2026-05-01T08:00:00.000Z' },
    { status: 'to-review', comprehension: 'review', updatedAt: '2026-05-02T08:00:00.000Z' },
    { status: 'done', session: { state: 'completed', startedAt: null, lastActiveAt: null, completedAt: '2026-01-01T00:00:00.000Z', reopenCount: 3, steps: { a: { state: 'done', updatedAt: null } } } },
  ];
  for (const s of samples) {
    const once = normalizeDay(s);
    const twice = normalizeDay(once);
    assert.deepEqual(twice, once, `non idempotent pour ${JSON.stringify(s)}`);
  }
});

test('migration : déterministe — aucune horloge, deux appels donnent le même résultat', () => {
  const s = { status: 'done', updatedAt: '2026-05-01T08:00:00.000Z' };
  assert.deepEqual(normalizeDay(s), normalizeDay(s));
});

test('migration : un progress.json vide reste valide', () => {
  const m = migrateProgress({});
  assert.equal(m.schemaVersion, LEARNING_SCHEMA);
  assert.deepEqual(m.days, {});
  assert.equal(m.startDate, null);
});

test('migration : le fichier RÉEL du propriétaire (days vide) migre sans perte', () => {
  const real = {
    version: '1',
    enrolledAt: '2026-08-03T23:05:41.225Z',
    lastOpenedAt: '2026-08-03T23:05:41.225Z',
    startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {},
  };
  const m = migrateProgress(real);
  assert.deepEqual(m.days, {});
  assert.deepEqual(m.skills, {});
  assert.equal(m.startDate, null);
});

test('une session persistée corrompue est rattrapée, pas propagée', () => {
  const d = normalizeDay({ status: 'in-progress', session: { state: 'DROP TABLE', steps: { a: 'x' }, reopenCount: -9 } });
  assert.ok(SESSION_STATES.includes(d.session.state));
  assert.equal(d.session.state, 'active'); // retombe sur la dérivation
  assert.equal(d.session.reopenCount, 0);
  assert.deepEqual(d.session.steps, {});
});

// ── Read-models ───────────────────────────────────────────────────────────

test('sessionView est dérivée — elle ne stocke rien en double', () => {
  let p = run(empty(), { type: 'START', day: 50 }).progress;
  p = run(p, {
    type: 'SUBMIT', day: 50, stepId: 'a', kind: 'exercise', content: 'c',
    validation: { status: 'passed', kind: 'exercise-tests', checkedAt: NOW, detail: 'ok', score: { passed: 2, total: 2 } },
  }).progress;
  const v = sessionView(day(p, 50), [{ id: 'a', label: 'Exercice', family: 'practice' }, { id: 'b', label: 'Autre', family: 'apply' }]);
  assert.equal(v.state, 'active');
  assert.equal(v.stepsTotal, 2);
  assert.equal(v.stepsDone, 1);
  assert.equal(v.validatedSubmissions, 1);
  assert.equal(v.canComplete, true);
  assert.equal(v.canStart, false);
  assert.equal(v.steps[1].state, 'pending');
});

test('sessionView sur une journée inconnue : état vide, jamais inventé', () => {
  const v = sessionView(undefined, []);
  assert.equal(v.state, 'not_started');
  assert.equal(v.stepsTotal, 0);
  assert.equal(v.startedAt, null);
  assert.equal(v.canStart, true);
});

test('openSessions liste les sessions ouvertes, triées', () => {
  let p = run(empty(), { type: 'START', day: 8 }).progress;
  p = run(p, { type: 'START', day: 3 }).progress;
  p = run(p, { type: 'PAUSE', day: 3 }).progress;
  p = run(p, { type: 'START', day: 5 }).progress;
  p = run(p, { type: 'COMPLETE', day: 5 }).progress;
  assert.deepEqual(openSessions(p).map((x) => [x.day, x.state]), [[3, 'paused'], [8, 'active']]);
});

// ── Commandes hors journée ────────────────────────────────────────────────

test('SET_SKILL borne le score et refuse hors [0,5]', () => {
  assert.equal(run(empty(), { type: 'SET_SKILL', skill: 'python', score: 3 }).progress.skills.python, 3);
  assert.equal(run(empty(), { type: 'SET_SKILL', skill: 'python', score: 6 }).code, 'INVALID_SCORE');
  assert.equal(run(empty(), { type: 'SET_SKILL', skill: 'python', score: -1 }).code, 'INVALID_SCORE');
  assert.equal(run(empty(), { type: 'SET_SKILL', skill: '__proto__', score: 3 }).code, 'INVALID_SKILL');
});

test('SET_COMPREHENSION planifie une révision réelle et projette to-review', () => {
  let p = run(empty(), { type: 'START', day: 60 }).progress;
  p = run(p, { type: 'COMPLETE', day: 60 }).progress;
  const r = run(p, { type: 'SET_COMPREHENSION', day: 60, value: 'review' }, LATER);
  const d = day(r.progress, 60);
  assert.equal(d.comprehension, 'review');
  assert.equal(d.correctionState, 'acknowledged');
  assert.ok(d.review.dueAt, 'une échéance de révision doit exister');
  assert.equal(d.status, 'to-review'); // projection tenant compte de la compréhension
});

test('ADD_EVIDENCE / REMOVE_EVIDENCE : preuve réelle, suppression vérifiée', () => {
  let p = run(empty(), { type: 'START', day: 70 }).progress;
  const add = run(p, { type: 'ADD_EVIDENCE', day: 70, evidence: { id: 'ev-1', title: 'Mon dépôt', type: 'repo', url: 'https://example.test/r' } });
  assert.equal(add.ok, true);
  assert.equal(day(add.progress, 70).evidence.length, 1);
  assert.equal(run(add.progress, { type: 'REMOVE_EVIDENCE', day: 70, evidenceId: 'inconnue' }).code, 'EVIDENCE_NOT_FOUND');
  const rm = run(add.progress, { type: 'REMOVE_EVIDENCE', day: 70, evidenceId: 'ev-1' });
  assert.equal(day(rm.progress, 70).evidence.length, 0);
});

test('ADD_EVIDENCE neutralise une URL dangereuse au lieu de la stocker', () => {
  const p = run(empty(), { type: 'START', day: 71 }).progress;
  const r = run(p, { type: 'ADD_EVIDENCE', day: 71, evidence: { title: 'X', type: 'note', url: 'javascript:alert(1)' } });
  assert.equal(r.ok, true);
  assert.equal(day(r.progress, 71).evidence[0].url, '');
});
