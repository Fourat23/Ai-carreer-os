// CP5 (V44) — read-model de ladder L0-L5 PUR et DÉRIVÉ. Projection fine→programme
// réutilisée ; échelons dérivés de la difficulté cognitive et des sources existantes ;
// « complete » = fondation + montée autonome + sommet diagnostic/transfert. Aucun I/O.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import {
  LADDER_STEPS, LADDER_LABEL, skillLadder, ladderMatrix, exerciseLadderPosition,
} from '../lib/practice-ladder.mjs';
import { LESSONS } from '../scripts/data/lessons-map.mjs';

test('constantes : 6 échelons étiquetés', () => {
  assert.deepEqual(LADDER_STEPS, ['L0', 'L1', 'L2', 'L3', 'L4', 'L5']);
  for (const s of LADDER_STEPS) assert.equal(typeof LADDER_LABEL[s], 'string');
});

const sources = {
  lessons: [{ slug: 'l-jsts', skills: ['jsts'] }],
  exercises: [
    { id: 'js-guided', skills: ['conditions'], difficulty: 1 }, // L1 (projeté jsts)
    { id: 'js-apply', skills: ['jsts'], difficulty: 2 },        // L2
    { id: 'js-strategy', skills: ['jsts'], difficulty: 3 },     // L3
    { id: 'react-debug-list', skills: ['jsts'], difficulty: 3 }, // L4 (debug)
  ],
  assessments: [{ id: 'a-jsts', skills: ['jsts'], questions: [{ taxonomy: 'DIAGNOSIS' }, { taxonomy: 'TRANSFER' }] }],
  capstones: [],
  transferChallenges: [{ id: 't-jsts', skills: ['jsts'] }],
};

test('skillLadder jsts : tous les échelons présents, complète', () => {
  const l = skillLadder('jsts', sources);
  for (const s of LADDER_STEPS) assert.equal(l.steps[s].present, true, `${s} devrait être présent`);
  assert.equal(l.complete, true);
  assert.deepEqual(l.missing, []);
  // Chaque échelon cite une provenance non vide.
  for (const s of LADDER_STEPS) assert.ok(l.steps[s].from.length > 0);
});

test('projection fine → programme dans la ladder (conditions → jsts)', () => {
  const l = skillLadder('jsts', sources);
  assert.ok(l.steps.L1.from.some((f) => f.includes('js-guided')));
});

test('ladder creuse : L0 + L4/L5 sans L1-L3 ⇒ incomplète, missing corrects', () => {
  const hollow = {
    lessons: [{ slug: 'l-secu', skills: ['secu'] }],
    exercises: [],
    assessments: [{ id: 'a-secu', skills: ['secu'], questions: [{ taxonomy: 'DIAGNOSIS' }] }],
    transferChallenges: [{ id: 't-secu', skills: ['secu'] }],
  };
  const l = skillLadder('secu', hollow);
  assert.equal(l.steps.L0.present, true);
  assert.equal(l.steps.L1.present, false);
  assert.equal(l.steps.L4.present, true); // assessment DIAGNOSIS
  assert.equal(l.steps.L5.present, true); // défi de transfert
  assert.equal(l.complete, false);
  assert.deepEqual(l.missing, ['L1', 'L2', 'L3']);
});

test('L4 via capstone diagnosis, L5 via capstone', () => {
  const l = skillLadder('http', {
    lessons: [{ slug: 'l', skills: ['http'] }],
    exercises: [{ id: 'e', skills: ['http'], difficulty: 3 }],
    capstones: [{ id: 'c-http', skills: ['http'], phases: [{ kind: 'diagnosis' }] }],
  });
  assert.ok(l.steps.L4.from.some((f) => f.includes('capstone c-http')));
  assert.ok(l.steps.L5.from.some((f) => f.includes('capstone c-http')));
});

test('exerciseLadderPosition : difficulté cognitive + debug', () => {
  assert.equal(exerciseLadderPosition({ id: 'x', difficulty: 1 }), 'L1');
  assert.equal(exerciseLadderPosition({ id: 'x', difficulty: 2 }), 'L2');
  assert.equal(exerciseLadderPosition({ id: 'x', difficulty: 3 }), 'L3');
  assert.equal(exerciseLadderPosition({ id: 'x', difficulty: 4 }), 'L4');
  assert.equal(exerciseLadderPosition({ id: 'react-debug-list', difficulty: 3 }), 'L4'); // debug prime
  assert.equal(exerciseLadderPosition(null), null);
});

test('pureté : aucune mutation des sources', () => {
  const snap = JSON.stringify(sources);
  skillLadder('jsts', sources);
  ladderMatrix({ skills: [{ id: 'jsts', name: 'JS/TS' }] }, sources);
  assert.equal(JSON.stringify(sources), snap);
});

// Fumée sur données réelles : ≥ 10 compétences examinées ; au moins les compétences
// à pratique de code réelle ont une ladder complète (FLOOR C).
test('ladderMatrix sur données réelles : ≥10 compétences, ≥6 complètes', () => {
  const load = (d) => readdirSync(new URL(`../data/${d}/`, import.meta.url)).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(new URL(`../data/${d}/${f}`, import.meta.url), 'utf8')));
  const program = JSON.parse(readFileSync(new URL('../data/program.json', import.meta.url), 'utf8'));
  const exercises = load('exercises');
  const sources = {
    lessons: LESSONS.map((l) => ({ slug: l.file.replace(/\.md$/, ''), skills: l.skills || [] })),
    exercises: exercises.map((e) => ({ id: e.id, skills: e.skills || [], difficulty: e.difficulty })),
    assessments: load('assessments'), capstones: load('capstones'), transferChallenges: load('transfer-challenges'),
  };
  const m = ladderMatrix(program, sources);
  assert.ok(m.length >= 10, 'la matrice couvre toutes les compétences de programme');
  const complete = m.filter((r) => r.complete);
  assert.ok(complete.length >= 6, `attendu ≥6 ladders complètes, obtenu ${complete.length}`);
  // Les compétences à pratique de code réelle DOIVENT être complètes.
  for (const s of ['algo', 'ds', 'jsts', 'http', 'gitlinux']) {
    const row = m.find((r) => r.skill === s);
    assert.equal(row.complete, true, `ladder de ${s} devrait être complète`);
  }
});
