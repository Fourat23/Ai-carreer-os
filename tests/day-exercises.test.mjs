// Tests de la liaison jour↔exercice + enregistrement de réussite (purs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { buildDayExerciseIndex, exercisesForDay, daysForExercise, selectDayExercises } from '../lib/day-exercises.mjs';
import { recordExerciseSuccess, hasLabEvidence, labEvidenceUrl } from '../lib/lab-progress.mjs';

const known = new Set(['greeting', 'fizzbuzz']);
const dayNums = new Set([1, 8, 20]);

test('buildDayExerciseIndex : index bidirectionnel', () => {
  const idx = buildDayExerciseIndex({ '1': ['greeting'], '8': ['fizzbuzz'] }, known, dayNums);
  assert.deepEqual(exercisesForDay(idx, 1), ['greeting']);
  assert.deepEqual(daysForExercise(idx, 'fizzbuzz'), [8]);
  assert.deepEqual(exercisesForDay(idx, 99), []); // jour sans exercice
});

test('buildDayExerciseIndex : rejette jour inexistant et exercice inconnu', () => {
  assert.throws(() => buildDayExerciseIndex({ '999': ['greeting'] }, known, dayNums), /jour inexistant/);
  assert.throws(() => buildDayExerciseIndex({ '1': ['inconnu'] }, known, dayNums), /exercice inconnu/);
  assert.throws(() => buildDayExerciseIndex({ abc: ['greeting'] }, known, dayNums), /non numérique/);
});

test('buildDayExerciseIndex : dédoublonne, ignore clés dangereuses', () => {
  const idx = buildDayExerciseIndex({ '1': ['greeting', 'greeting'], __proto__: ['x'] }, known, dayNums);
  assert.deepEqual(exercisesForDay(idx, 1), ['greeting']);
  assert.equal(Object.hasOwn(Object.getPrototypeOf(idx.byDay), 'x'), false);
});

test('la fixture livrée est valide contre exercices + jours réels', () => {
  const raw = JSON.parse(readFileSync(new URL('../data/day-exercises.json', import.meta.url), 'utf8'));
  const days = new Set(Array.from({ length: 365 }, (_, i) => i + 1));
  // ids réels des fixtures d'exercices présentes sur le disque
  const exDir = new URL('../data/exercises/', import.meta.url);
  const ids = new Set(readdirSync(exDir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(new URL(f, exDir), 'utf8')).id));
  const idx = buildDayExerciseIndex(raw, ids, days);
  assert.ok(idx.byDay.size >= 8); // catalogue complet lié
});

// ── CP7 : sélection/ordre d'affichage d'une journée (pur) ──
test('selectDayExercises : ordonne par difficulté puis id, statut via preuve', () => {
  const idx = buildDayExerciseIndex(
    { '36': ['ts-fizzbuzz', 'ts-greeter', 'ts-typed-average'] },
    new Set(['ts-fizzbuzz', 'ts-greeter', 'ts-typed-average']),
    new Set([36]),
  );
  const defs = {
    'ts-greeter': { title: 'Salutation', runtime: 'typescript', language: 'typescript', difficulty: 1 },
    'ts-typed-average': { title: 'Moyenne', runtime: 'typescript', language: 'typescript', difficulty: 2 },
    'ts-fizzbuzz': { title: 'FizzBuzz', runtime: 'typescript', language: 'typescript', difficulty: 2 },
  };
  const out = selectDayExercises(idx, 36, defs, (id) => id === 'ts-greeter');
  // d1 d'abord, puis d2 triés par id (ts-fizzbuzz < ts-typed-average)
  assert.deepEqual(out.map((x) => x.id), ['ts-greeter', 'ts-fizzbuzz', 'ts-typed-average']);
  assert.equal(out[0].status, 'passed');
  assert.equal(out[1].status, 'todo');
  assert.equal(out[0].runtime, 'typescript');
  assert.equal(out[1].difficulty, 2);
});

test('selectDayExercises : accepte une fonction résolveur et ignore les ids inconnus', () => {
  const idx = buildDayExerciseIndex({ '36': ['ts-greeter', 'fantome'] }, new Set(['ts-greeter', 'fantome']), new Set([36]));
  const out = selectDayExercises(idx, 36, (id) => (id === 'ts-greeter' ? { title: 'G', runtime: 'typescript', difficulty: 1 } : null));
  assert.deepEqual(out.map((x) => x.id), ['ts-greeter']); // fantome résolu à null → ignoré
  assert.equal(out[0].status, 'todo'); // isPassed par défaut = false
});

test('selectDayExercises : défaut runtime node-js si absent, jour vide → []', () => {
  const idx = buildDayExerciseIndex({ '8': ['fizzbuzz'] }, new Set(['fizzbuzz']), new Set([8]));
  const out = selectDayExercises(idx, 8, { fizzbuzz: { title: 'FB' } });
  assert.equal(out[0].runtime, 'node-js');
  assert.deepEqual(selectDayExercises(idx, 999, {}), []);
});

// ── CP8 (V11) : exercices web liés à des journées frontend ──
test('la fixture lie des exercices web à des journées frontend', () => {
  const raw = JSON.parse(readFileSync(new URL('../data/day-exercises.json', import.meta.url), 'utf8'));
  const exDir = new URL('../data/exercises/', import.meta.url);
  const defs = {};
  for (const f of readdirSync(exDir).filter((n) => n.endsWith('.json'))) {
    const e = JSON.parse(readFileSync(new URL(f, exDir), 'utf8'));
    defs[e.id] = e;
  }
  const ids = new Set(Object.keys(defs));
  const days = new Set(Array.from({ length: 365 }, (_, i) => i + 1));
  const idx = buildDayExerciseIndex(raw, ids, days);
  const day87 = selectDayExercises(idx, 87, defs);
  assert.ok(day87.length >= 3);
  assert.ok(day87.every((x) => x.runtime === 'web'));
  // ordonné par difficulté croissante
  for (let i = 1; i < day87.length; i++) assert.ok(day87[i - 1].difficulty <= day87[i].difficulty);
});

test('recordExerciseSuccess : réussite web → preuve canonique, AUCUNE mutation de compétence (V65)', () => {
  const flatWeb = { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} };
  const next = recordExerciseSuccess(flatWeb, { exerciseId: 'web-card', title: 'Carte', skills: ['html', 'css', 'accessibility'], dayRefs: [87] });
  assert.equal(hasLabEvidence(next.days['87'], 'web-card'), true);
  assert.equal(next.days['87'].evidence[0].url, '/lab/web-card');
  assert.equal(next.days['87'].evidence[0].type, 'exercise'); // même type que Node/Python/TS
  // V65 : recordExerciseSuccess n'écrit plus AUCUN niveau de compétence (P2).
  assert.deepEqual(next.skills ?? {}, flat.skills ?? {}, 'aucune mutation directe de compétence');
  assert.ok((next.evidence ?? []).length > 0, 'une preuve canonique est créée à la place');
  // V65 : recordExerciseSuccess n'écrit plus AUCUN niveau de compétence (P2).
  assert.deepEqual(next.skills ?? {}, flat.skills ?? {}, 'aucune mutation directe de compétence');
  assert.ok((next.evidence ?? []).length > 0, 'une preuve canonique est créée à la place');
});

const flat = { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} };

test('recordExerciseSuccess : ajoute preuve aux jours liés, sans relever aucun niveau (V65)', () => {
  const next = recordExerciseSuccess(flat, { exerciseId: 'fizzbuzz', title: 'FizzBuzz', skills: ['javascript', 'algo'], dayRefs: [8] });
  const d = next.days['8'];
  assert.ok(hasLabEvidence(d, 'fizzbuzz'));
  assert.equal(d.evidence[0].url, labEvidenceUrl('fizzbuzz'));
  assert.equal(d.evidence[0].type, 'exercise');
  // V65 : recordExerciseSuccess n'écrit plus AUCUN niveau de compétence (P2).
  assert.deepEqual(next.skills ?? {}, flat.skills ?? {}, 'aucune mutation directe de compétence');
  assert.ok((next.evidence ?? []).length > 0, 'une preuve canonique est créée à la place');
  // V65 : recordExerciseSuccess n'écrit plus AUCUN niveau de compétence (P2).
  assert.deepEqual(next.skills ?? {}, flat.skills ?? {}, 'aucune mutation directe de compétence');
  assert.ok((next.evidence ?? []).length > 0, 'une preuve canonique est créée à la place');
});

test('recordExerciseSuccess : idempotent (pas de preuve en double)', () => {
  const once = recordExerciseSuccess(flat, { exerciseId: 'greeting', title: 'Greeting', skills: ['javascript'], dayRefs: [1] });
  const twice = recordExerciseSuccess(once, { exerciseId: 'greeting', title: 'Greeting', skills: ['javascript'], dayRefs: [1] });
  assert.equal(twice.days['1'].evidence.length, 1);
  assert.equal(twice, once); // aucune modification → même référence renvoyée
});

test('recordExerciseSuccess : l’auto-évaluation déclarée n’est jamais touchée (V65)', () => {
  const start = { ...flat, skills: { javascript: 5 } };
  const next = recordExerciseSuccess(start, { exerciseId: 'greeting', title: 'G', skills: ['javascript'], dayRefs: [1] });
  assert.equal(next.skills.javascript, 5); // reste à 5, pas ramené à 3
});

test('recordExerciseSuccess : sans jours liés → progression inchangée', () => {
  assert.equal(recordExerciseSuccess(flat, { exerciseId: 'x', title: 'X', skills: [], dayRefs: [] }), flat);
});

// ── CP8 : les réussites Python produisent les mêmes preuves que Node ──
test('recordExerciseSuccess : Python multi-compétences → preuve canonique, aucun niveau écrit (V65)', () => {
  const flatPy = { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} };
  const next = recordExerciseSuccess(flatPy, {
    exerciseId: 'py-debug-average', title: 'Débogage moyenne',
    skills: ['python', 'algo', 'testing'], dayRefs: [150],
  });
  const d = next.days['150'];
  assert.equal(hasLabEvidence(d, 'py-debug-average'), true);
  assert.equal(d.evidence[0].url, '/lab/py-debug-average');
  assert.equal(d.evidence[0].type, 'exercise'); // même type que Node
  // V65 : recordExerciseSuccess n'écrit plus AUCUN niveau de compétence (P2).
  assert.deepEqual(next.skills ?? {}, flat.skills ?? {}, 'aucune mutation directe de compétence');
  assert.ok((next.evidence ?? []).length > 0, 'une preuve canonique est créée à la place');
  // V65 : recordExerciseSuccess n'écrit plus AUCUN niveau de compétence (P2).
  assert.deepEqual(next.skills ?? {}, flat.skills ?? {}, 'aucune mutation directe de compétence');
  assert.ok((next.evidence ?? []).length > 0, 'une preuve canonique est créée à la place');
  // V65 : recordExerciseSuccess n'écrit plus AUCUN niveau de compétence (P2).
  assert.deepEqual(next.skills ?? {}, flat.skills ?? {}, 'aucune mutation directe de compétence');
  assert.ok((next.evidence ?? []).length > 0, 'une preuve canonique est créée à la place');
  // idempotent : relancer ne duplique pas la preuve
  const again = recordExerciseSuccess(next, { exerciseId: 'py-debug-average', title: 'x', skills: ['python'], dayRefs: [150] });
  assert.equal(again.days['150'].evidence.length, 1);
  assert.equal(again, next);
});

// ── CP3 (V13) : rôles pédagogiques dérivés + rapport de charge ───────────────
import { assignDayRoles, dayLoadReport, prerequisiteSatisfied, MAX_DAY_LOAD } from '../lib/day-exercises.mjs';

test('assignDayRoles : principal (1er), remédiation (debug), défi (≥ principal+2), complément', () => {
  const items = [
    { id: 'a-intro', difficulty: 1, debug: false },
    { id: 'b-more', difficulty: 2, debug: false },
    { id: 'c-debug-x', difficulty: 2, debug: true },
    { id: 'd-hard', difficulty: 3, debug: false },
  ];
  const r = assignDayRoles(items);
  assert.equal(r.get('a-intro'), 'principal');
  assert.equal(r.get('b-more'), 'complement');
  assert.equal(r.get('c-debug-x'), 'remediation');
  assert.equal(r.get('d-hard'), 'challenge'); // 3 >= 1+2
  assert.deepEqual(assignDayRoles([]), new Map());
});

test('selectDayExercises : expose un rôle dérivé (principal en tête)', () => {
  const idx = buildDayExerciseIndex({ '10': ['x-debug', 'x-base'] }, new Set(['x-debug', 'x-base']), new Set([10]));
  const out = selectDayExercises(idx, 10, {
    'x-base': { title: 'Base', runtime: 'node-js', difficulty: 1 },
    'x-debug': { title: 'Debug', runtime: 'node-js', difficulty: 2 },
  });
  assert.equal(out[0].id, 'x-base');
  assert.equal(out[0].role, 'principal');
  assert.equal(out[1].role, 'remediation'); // id contient "debug"
});

test('dayLoadReport : signale les journées au-dessus de la cible (advisory, ne lève pas)', () => {
  const idx = buildDayExerciseIndex(
    { '1': ['a'], '2': ['b', 'c', 'd', 'e'] },
    new Set(['a', 'b', 'c', 'd', 'e']), new Set([1, 2]),
  );
  const rep = dayLoadReport(idx);
  assert.deepEqual(rep.find((r) => r.day === 1), { day: 1, count: 1, over: false });
  assert.deepEqual(rep.find((r) => r.day === 2), { day: 2, count: 4, over: true }); // > 3
  assert.equal(MAX_DAY_LOAD, 3);
});

test('prerequisiteSatisfied : la journée liée doit être ≥ à la journée d’intro', () => {
  assert.equal(prerequisiteSatisfied(31, 30), true);
  assert.equal(prerequisiteSatisfied(16, 15), true);
  assert.equal(prerequisiteSatisfied(5, 8), false);
});
