// CP9 (V39) — modèle d'évaluation PUR : validation structurelle + invariants
// déterministes, correction par comparaison de données (mcq/multi/predict),
// répartition par taxonomie, pont évaluation → preuve. Aucun I/O, aucun réseau.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAssessment, validateQuestion, gradeQuestion, gradeAssessment,
  assessmentTaxonomySummary, assessmentToEvidence, TAXONOMY, QUESTION_KINDS,
} from '../lib/assessment.mjs';

const baseQ = { id: 'q', taxonomy: 'RECALL', kind: 'mcq', prompt: 'p', explanation: 'e', options: ['a', 'b', 'c'], answer: 1 };
const valid = {
  id: 'a', title: 'A', skills: ['archi'], lessonRefs: ['x'], remediation: ['y'],
  questions: [
    { ...baseQ },
    { id: 'q2', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'p', explanation: 'e', options: ['a', 'b', 'c', 'd'], answer: [0, 2] },
    { id: 'q3', taxonomy: 'TRANSFER', kind: 'predict', prompt: 'p', explanation: 'e', answer: '17' },
  ],
};

test('taxonomie et types exposés', () => {
  assert.deepEqual([...TAXONOMY], ['RECALL', 'UNDERSTANDING', 'APPLICATION', 'DIAGNOSIS', 'TRANSFER']);
  assert.deepEqual([...QUESTION_KINDS], ['mcq', 'multi', 'predict']);
});

test('validateAssessment accepte une évaluation bien formée', () => {
  const v = validateAssessment(valid);
  assert.ok(v.ok, v.errors.join(' ; '));
});

test('validateAssessment rejette objets et champs manquants', () => {
  assert.equal(validateAssessment(null).ok, false);
  assert.equal(validateAssessment({}).ok, false);
  assert.equal(validateAssessment({ id: 'a', title: 'A', skills: [], questions: [baseQ] }).ok, false); // skills vide
  assert.equal(validateAssessment({ id: 'a', title: 'A', skills: ['x'], questions: [] }).ok, false); // aucune question
});

test('invariants déterministes : index bornés, pas de flottant, multi ensembliste', () => {
  assert.ok(validateQuestion({ ...baseQ, answer: 9 })); // index hors bornes → message d'erreur
  assert.ok(validateQuestion({ ...baseQ, kind: 'predict', options: undefined, answer: 1.5 })); // flottant rejeté
  assert.ok(validateQuestion({ id: 'q', taxonomy: 'RECALL', kind: 'multi', prompt: 'p', explanation: 'e', options: ['a', 'b'], answer: [0, 0] })); // doublons rejetés
  assert.equal(validateQuestion({ ...baseQ }), null); // valide → null
});

test('validateQuestion exige une explication (feedback)', () => {
  assert.ok(validateQuestion({ ...baseQ, explanation: '' }));
});

test('gradeQuestion mcq : exact', () => {
  assert.equal(gradeQuestion(baseQ, 1).passed, true);
  assert.equal(gradeQuestion(baseQ, 0).passed, false);
  assert.equal(gradeQuestion(baseQ, undefined).passed, false);
});

test('gradeQuestion multi : égalité ensembliste, ordre indifférent', () => {
  const q = { id: 'q', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'p', explanation: 'e', options: ['a', 'b', 'c', 'd'], answer: [0, 2] };
  assert.equal(gradeQuestion(q, [2, 0]).passed, true);
  assert.equal(gradeQuestion(q, [0]).passed, false);
  assert.equal(gradeQuestion(q, [0, 2, 3]).passed, false);
  assert.equal(gradeQuestion(q, 'x').passed, false);
});

test('gradeQuestion predict : trim + coercition entier/chaîne', () => {
  const qs = { id: 'q', taxonomy: 'TRANSFER', kind: 'predict', prompt: 'p', explanation: 'e', answer: '17' };
  assert.equal(gradeQuestion(qs, ' 17 ').passed, true);
  assert.equal(gradeQuestion(qs, '18').passed, false);
  const qi = { id: 'q', taxonomy: 'TRANSFER', kind: 'predict', prompt: 'p', explanation: 'e', answer: 42 };
  assert.equal(gradeQuestion(qi, 42).passed, true);
  assert.equal(gradeQuestion(qi, '42').passed, true);
});

test('gradeAssessment agrège compteurs + répartition par taxonomie', () => {
  const r = gradeAssessment(valid, { q: 1, q2: [2, 0], q3: '17' });
  assert.equal(r.total, 3);
  assert.equal(r.passed, 3);
  assert.equal(r.ratio, 1);
  assert.equal(r.passedOverall, true);
  assert.equal(r.byTaxonomy.RECALL.passed, 1);
  assert.equal(r.byTaxonomy.TRANSFER.total, 1);
  assert.deepEqual(r.weakSkills, []);
});

test('gradeAssessment : échec global → weakSkills = compétences (indice)', () => {
  const r = gradeAssessment(valid, { q: 0, q2: [1], q3: 'non' });
  assert.equal(r.passedOverall, false);
  assert.deepEqual(r.weakSkills, ['archi']);
});

test('passThreshold respecté', () => {
  const a = { ...valid, passThreshold: 1 };
  const r = gradeAssessment(a, { q: 1, q2: [2, 0], q3: 'non' }); // 2/3
  assert.equal(r.passedOverall, false);
});

test('assessmentToEvidence : réussite → preuve typée assessment ; échec → null', () => {
  const pass = gradeAssessment(valid, { q: 1, q2: [2, 0], q3: '17' });
  const ev = assessmentToEvidence(valid, pass, new Date('2026-08-14T00:00:00Z'));
  assert.equal(ev.type, 'assessment');
  assert.deepEqual(ev.skills, ['archi']);
  assert.equal(ev.createdAt, '2026-08-14T00:00:00.000Z');
  const fail = gradeAssessment(valid, { q: 0, q2: [1], q3: 'non' });
  assert.equal(assessmentToEvidence(valid, fail), null);
});

test('assessmentTaxonomySummary compte les questions par niveau', () => {
  const s = assessmentTaxonomySummary([valid]);
  assert.equal(s.RECALL, 1);
  assert.equal(s.APPLICATION, 1);
  assert.equal(s.TRANSFER, 1);
  assert.equal(s.DIAGNOSIS, 0);
});
