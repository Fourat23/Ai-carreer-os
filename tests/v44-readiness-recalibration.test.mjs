// CP13 (V44) — recalibrage CONSERVATEUR de la readiness (ADR-044 D7). « strong-junior »
// exige une AUTONOMIE EXÉCUTABLE (≥ 1 exercice de code réel, difficulté ≥ 3), pas
// seulement des labs simulés. Une compétence dont la pratique/autonomie ne vient QUE de
// labs plafonne à junior-ready. PUR ; aucun I/O.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { skillCoverage } from '../lib/practice-coverage.mjs';

// Compétence adossée à un vrai exercice de code difficulté ≥ 3 + transfert + diagnostic.
const codeBacked = {
  lessons: [{ slug: 'l', skills: ['http'] }],
  exercises: [
    { id: 'e1', skills: ['http'], difficulty: 2 }, { id: 'e2', skills: ['http'], difficulty: 4 }, { id: 'e3', skills: ['http'], difficulty: 3 },
  ],
  assessments: [{ id: 'a', skills: ['http'], questions: [{ taxonomy: 'DIAGNOSIS' }] }],
  capstones: [{ id: 'c', skills: ['http'], phases: [{ kind: 'diagnosis' }] }],
  transferChallenges: [{ id: 't', skills: ['http'] }],
  missions: [{ id: 'm', skills: ['http'] }],
};

// Même profil mais l'autonomie/pratique ne vient QUE de labs (aucun exercice de code).
const labOnly = {
  lessons: [{ slug: 'l', skills: ['secu'] }],
  exercises: [],
  labs: [{ id: 'security', skills: ['secu'] }, { id: 'security-2', skills: ['secu'] }, { id: 'security-3', skills: ['secu'] }],
  assessments: [{ id: 'a', skills: ['secu'], questions: [{ taxonomy: 'DIAGNOSIS' }] }],
  capstones: [{ id: 'c', skills: ['secu'], phases: [{ kind: 'diagnosis' }] }],
  transferChallenges: [{ id: 't', skills: ['secu'] }],
};

test('autonomie exécutable (exercice ≥ d3) ⇒ strong-junior possible', () => {
  const c = skillCoverage('http', codeBacked);
  assert.equal(c.dimensions.autonomy.level, 'full');
  assert.ok(c.dimensions.autonomy.from.some((f) => /exo/.test(f)), 'autonomie adossée à un exercice');
  assert.equal(c.readiness, 'strong-junior');
});

test('autonomie labs-only (aucun exercice) ⇒ plafonné à junior-ready', () => {
  const c = skillCoverage('secu', labOnly);
  assert.equal(c.dimensions.autonomy.level, 'full'); // les labs signalent une autonomie…
  assert.ok(!c.dimensions.autonomy.from.some((f) => /exo/.test(f)), '…mais pas de pratique de code');
  assert.equal(c.dimensions.transfer.level, 'full');
  assert.equal(c.readiness, 'junior-ready'); // pas strong-junior : conservateur
});

test('le recalibrage ne dégrade PAS une compétence sans transfert plein', () => {
  // Sans transfert plein, on n'était de toute façon pas strong-junior : inchangé.
  const noTransfer = { ...codeBacked, transferChallenges: [], assessments: [{ id: 'a', skills: ['http'], questions: [{ taxonomy: 'DIAGNOSIS' }] }] };
  const c = skillCoverage('http', noTransfer);
  assert.notEqual(c.readiness, 'strong-junior');
});
