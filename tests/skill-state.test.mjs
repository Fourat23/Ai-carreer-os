// Tests des états de compétence purs (lib/skill-state.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { skillState, skillStats, SKILL_STATE_LABEL } from '../lib/skill-state.mjs';

test('skillState : règles ordonnées', () => {
  assert.equal(skillState({}), 'not-started');
  assert.equal(skillState({ daysStarted: 1 }), 'discovered');
  assert.equal(skillState({ daysDone: 3 }), 'practiced');
  assert.equal(skillState({ daysDone: 5, evidenceCount: 1 }), 'demonstrated');
  assert.equal(skillState({ daysDone: 5, evidenceCount: 2, hasToReview: true }), 'to-consolidate'); // à revoir prioritaire
});

test('SKILL_STATE_LABEL : libellés FR', () => {
  assert.equal(SKILL_STATE_LABEL.demonstrated, 'Démontrée');
  assert.equal(SKILL_STATE_LABEL['to-consolidate'], 'À consolider');
});

const program = {
  skills: [{ id: 'rag', name: 'RAG' }, { id: 'py', name: 'Python' }, { id: 'sql', name: 'SQL' }],
  days: [
    { day: 1, skill: 'rag' }, { day: 2, skill: 'rag' }, { day: 3, skill: 'rag' }, { day: 4, skill: 'rag' },
    { day: 5, skill: 'py' }, { day: 6, skill: 'py' },
    { day: 7, skill: 'sql' },
  ],
};
const prog = (days) => ({ startDate: null, days, skills: {}, weeklyReviews: {}, monthlyReviews: {} });

test('skillStats : compte jours/preuves + état', () => {
  const p = prog({
    '1': { status: 'done', updatedAt: '2026-07-01' },
    '2': { status: 'done', updatedAt: '2026-07-02' },
    '3': { status: 'done', updatedAt: '2026-07-03' },
    '5': { status: 'in-progress', updatedAt: '2026-07-04' },
    '7': { status: 'to-review', updatedAt: '2026-07-05' },
  });
  const stats = skillStats(program, p);
  const rag = stats.find((s) => s.id === 'rag');
  const py = stats.find((s) => s.id === 'py');
  const sql = stats.find((s) => s.id === 'sql');
  assert.deepEqual([rag.daysAssociated, rag.daysDone, rag.state], [4, 3, 'practiced']);
  assert.equal(py.state, 'discovered');       // 1 commencée
  assert.equal(sql.state, 'to-consolidate');  // 1 à revoir
});

test('skillStats : preuve → démontrée + comptage cross-day', () => {
  const p = prog({
    '1': { status: 'done', updatedAt: '2026-07-01', evidence: [{ id: 'e1', type: 'repo', title: 'x', skills: ['rag'], createdAt: '2026-07-06' }] },
  });
  const rag = skillStats(program, p).find((s) => s.id === 'rag');
  assert.equal(rag.evidenceCount, 1);
  assert.equal(rag.state, 'demonstrated');
  assert.equal(rag.lastActivityAt, '2026-07-06'); // date de la preuve la plus récente
});

test('skillStats : compétence inconnue dans une preuve ignorée proprement', () => {
  const p = prog({ '1': { status: 'done', evidence: [{ id: 'e', title: 'x', skills: ['inconnue'], createdAt: '2026-07-01' }] } });
  const stats = skillStats(program, p);
  assert.ok(stats.every((s) => s.id !== 'inconnue')); // pas de compétence fantôme
  assert.equal(stats.find((s) => s.id === 'rag').evidenceCount, 0);
});

test('skillStats : progression vide → tout non abordé', () => {
  const stats = skillStats(program, prog({}));
  assert.ok(stats.every((s) => s.state === 'not-started'));
});
