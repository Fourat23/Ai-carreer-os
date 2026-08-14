// CP2 (V43) — read-model de couverture de pratique PUR : projection fine→programme,
// dérivation des 7 dimensions, readiness (jamais dérivée du seul volume), matrice
// couvrant toutes les compétences, feedback diagnostique. Aucun I/O.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  COVERAGE_DIMENSIONS, READINESS_LEVELS, projectSkill,
  skillCoverage, coverageMatrix, coverageSummary, diagnosticFeedback,
} from '../lib/practice-coverage.mjs';

test('projection fine → programme', () => {
  assert.equal(projectSkill('conditions'), 'jsts');
  assert.equal(projectSkill('recursion'), 'algo');
  assert.equal(projectSkill('hashmap'), 'ds');
  assert.equal(projectSkill('linux'), 'gitlinux');
  assert.equal(projectSkill('http'), 'http'); // déjà programme
  assert.equal(projectSkill('js'), 'jsts');    // alias canonicalisé
});

const sources = {
  lessons: [{ slug: 'l-http', skills: ['http'] }, { slug: 'l-jsts', skills: ['jsts'] }],
  exercises: [
    { id: 'e1', skills: ['http'], difficulty: 2 }, { id: 'e2', skills: ['http'], difficulty: 3 }, { id: 'e3', skills: ['http'], difficulty: 2 },
    { id: 'e4', skills: ['conditions'], difficulty: 1 },
  ],
  assessments: [{ id: 'a-http', skills: ['http'], questions: [{ taxonomy: 'DIAGNOSIS' }, { taxonomy: 'TRANSFER' }] }],
  capstones: [{ id: 'c-http', skills: ['http', 'sql'], phases: [{ kind: 'diagnosis' }] }],
  transferChallenges: [{ id: 't-http', skills: ['http', 'archi'] }],
  missions: [{ id: 'm-http', skills: ['http'] }],
  misconceptions: [{ id: 'mis-x', skill: 'jsts', wrong: 'w', right: 'r', lessonRefs: ['l-jsts'], exerciseRefs: ['e4'] }],
};

test('skillCoverage http : dimensions full + readiness élevée', () => {
  const c = skillCoverage('http', sources);
  assert.equal(c.dimensions.foundation.level, 'full');
  assert.equal(c.dimensions.practice.level, 'full');    // 3 exos
  assert.equal(c.dimensions.autonomy.level, 'full');    // 1 exo diff≥3
  assert.equal(c.dimensions.diagnostic.level, 'full');  // assessment DIAGNOSIS + capstone diagnosis
  assert.equal(c.dimensions.transfer.level, 'full');    // défi de transfert
  assert.equal(c.dimensions.professional.level, 'full'); // capstone + mission
  assert.ok(['junior-ready', 'strong-junior'].includes(c.readiness));
  assert.deepEqual(c.gaps, []);
});

test('skillCoverage : readiness not-ready si pas de pratique', () => {
  const c = skillCoverage('secu', { lessons: [{ slug: 'l', skills: ['secu'] }], exercises: [] });
  assert.equal(c.dimensions.foundation.level, 'full');
  assert.equal(c.dimensions.practice.level, 'none');
  assert.equal(c.readiness, 'not-ready');
  assert.ok(c.gaps.includes('practice'));
});

test('readiness n\'est PAS dérivée du seul volume d\'exercices', () => {
  // 10 exercices faciles, aucune autonomie/diagnostic/transfert → au mieux foundational.
  const many = Array.from({ length: 10 }, (_, i) => ({ id: `x${i}`, skills: ['conditions'], difficulty: 1 }));
  const c = skillCoverage('jsts', { lessons: [{ slug: 'l', skills: ['jsts'] }], exercises: many });
  assert.equal(c.dimensions.practice.level, 'full');
  assert.equal(c.dimensions.autonomy.level, 'partial'); // ≥5 exos = variété, pas d'autonomie réelle
  assert.ok(['foundational', 'guided'].includes(c.readiness));
  assert.notEqual(c.readiness, 'junior-ready');
});

test('coverageMatrix couvre toutes les compétences de programme', () => {
  const program = { skills: [{ id: 'http', name: 'HTTP' }, { id: 'secu', name: 'Sécurité' }, { id: 'ml', name: 'ML' }] };
  const m = coverageMatrix(program, sources);
  assert.equal(m.length, 3);
  assert.ok(m.every((r) => READINESS_LEVELS.includes(r.readiness)));
  assert.ok(m.every((r) => COVERAGE_DIMENSIONS.every((d) => r.dimensions[d])));
});

test('coverageSummary agrège readiness et trous', () => {
  const program = { skills: [{ id: 'http', name: 'HTTP' }, { id: 'ml', name: 'ML' }] };
  const s = coverageSummary(coverageMatrix(program, sources));
  assert.equal(s.total, 2);
  assert.ok(s.gapsByDimension.foundation >= 1); // ml n'a aucune source ici
});

test('diagnosticFeedback : candidats compatibles par skill ou exercice', () => {
  const bySkill = diagnosticFeedback({ skill: 'jsts' }, sources.misconceptions);
  assert.equal(bySkill.candidates.length, 1);
  const byEx = diagnosticFeedback({ exerciseId: 'e4' }, sources.misconceptions);
  assert.equal(byEx.candidates.length, 1);
  assert.equal(diagnosticFeedback({ skill: 'inconnu' }, sources.misconceptions).candidates.length, 0);
});
