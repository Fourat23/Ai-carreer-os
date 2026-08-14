// CP9 (V39) — RELIER sans second moteur : une preuve issue d'une évaluation réussie
// (type 'assessment') est consommée par skill-state.mjs SANS règle nouvelle. On
// vérifie la non-régression : evidence assessment → compétence « demonstrated »,
// et que 'assessment' est un type de preuve reconnu par le modèle Active Learning.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gradeAssessment, assessmentToEvidence } from '../lib/assessment.mjs';
import { skillState, skillStats } from '../lib/skill-state.mjs';
import { EVIDENCE_TYPES, normalizeDay } from '../lib/learning.mjs';

test("'assessment' est un type de preuve reconnu", () => {
  assert.ok(EVIDENCE_TYPES.includes('assessment'));
});

test('normalizeDay conserve une preuve de type assessment', () => {
  const day = normalizeDay({
    status: 'in-progress',
    evidence: [{ type: 'assessment', title: 'Diag', skills: ['archi'], createdAt: '2026-08-14T00:00:00.000Z' }],
  });
  const ev = day.evidence.find((e) => e.type === 'assessment');
  assert.ok(ev, 'preuve assessment conservée');
  assert.deepEqual(ev.skills, ['archi']);
});

test('une preuve assessment fait passer la compétence à demonstrated (aucune règle nouvelle)', () => {
  // Règle existante : evidenceCount >= 1 → demonstrated.
  assert.equal(skillState({ daysDone: 0, daysStarted: 1, evidenceCount: 1 }), 'demonstrated');

  const program = { skills: [{ id: 'archi', name: 'Architecture' }], days: [{ day: 1, skill: 'archi' }] };
  const a = {
    id: 'system-design-scaling', title: 'SD', skills: ['archi'],
    questions: [{ id: 'q', taxonomy: 'RECALL', kind: 'mcq', prompt: 'p', explanation: 'e', options: ['a', 'b'], answer: 0 }],
  };
  const res = gradeAssessment(a, { q: 0 });
  const ev = assessmentToEvidence(a, res, new Date('2026-08-14T00:00:00Z'));
  const progress = { days: { 1: { status: 'in-progress', evidence: [ev] } } };
  const stats = skillStats(program, progress);
  const archi = stats.find((s) => s.id === 'archi');
  assert.equal(archi.evidenceCount, 1);
  assert.equal(archi.state, 'demonstrated');
});
