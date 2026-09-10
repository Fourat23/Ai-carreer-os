// V74 · CP2 — le Learner Memory Model, et les règles du contrat gelé qu'il applique.
//
// Ces tests ne vérifient pas « que ça marche » : ils vérifient les propriétés
// que le contrat déclare, une par une, et notamment celles qu'une
// implémentation complaisante casserait sans bruit.
import test from 'node:test';
import assert from 'node:assert/strict';
import { projectLearnerMemory, collectContacts } from '../lib/learner-memory.mjs';
import { normalizeExerciseAttempt, normalizeExerciseAttempts, attemptKey, outcomeOf } from '../lib/exercise-attempt.mjs';

const NOW = '2026-03-01T00:00:00.000Z';
const ctx = {
  skills: ['ds'],
  conceptDays: { 'data-structures-intro': [34] },
  dayConcepts: new Map([[34, ['data-structures-intro']]]),
  conceptSkills: new Map([['data-structures-intro', ['ds']]]),
  exerciseConcept: new Map([['ds-stack', 'data-structures-intro']]),
  exerciseSkills: new Map([['ds-stack', ['ds']]]),
  projectDays: new Set(), transferDays: new Set(),
  expectedLevelBySkill: new Map([['ds', 2]]), projectDaysBySkill: new Map(),
  prereqDepth: new Map(), startDate: '2026-01-01',
};
const jour = (extra = {}) => ({ '34': { startedAt: '2026-02-03T09:00:00.000Z', correctionState: 'locked', submissions: [], ...extra } });
const exo = (o = {}) => ({ exerciseId: 'ds-stack', at: '2026-02-03T10:00:00.000Z', passed: 3, total: 3, phase: 'run', correctionSeen: false, dayRefs: [34], provenance: { producer: 'lab-runner' }, ...o });
const proj = (facts) => projectLearnerMemory({ facts, context: ctx, now: NOW });
const fiche = (p) => p.concepts.find((c) => c.id === 'data-structures-intro');

// ── le fait lui-même ──────────────────────────────────────────────────────

test('V74 · un échec est un fait normalisable — c’est le défaut que le CP0 a trouvé', () => {
  const a = normalizeExerciseAttempt(exo({ passed: 0, total: 4 }));
  assert.equal(a.outcome, 'failure');
  assert.equal(a.allPassed, false);
});

test('V74 · l’issue est DÉRIVÉE des compteurs, pas fournie par l’appelant', () => {
  // Un appelant qui mentirait sur l'issue n'a aucun effet : les compteurs sont le fait.
  const a = normalizeExerciseAttempt(exo({ passed: 1, total: 4, outcome: 'success' }));
  assert.equal(a.outcome, 'partial');
  assert.equal(outcomeOf(4, 4), 'success');
  assert.equal(outcomeOf(0, 4), 'failure');
});

test('V74 · une tentative sans producteur est REFUSÉE, jamais réparée en silence', () => {
  assert.equal(normalizeExerciseAttempt({ ...exo(), provenance: {} }), null);
  assert.equal(normalizeExerciseAttempt({ ...exo(), provenance: undefined }), null);
});

test('V74 · `correctionSeen` vaut true par défaut : le doute joue CONTRE le compteur', () => {
  const a = normalizeExerciseAttempt({ ...exo(), correctionSeen: undefined });
  assert.equal(a.correctionSeen, true);
});

test('V74 · clé métier : un rejeu à la même seconde est le MÊME fait', () => {
  const a = normalizeExerciseAttempt(exo());
  const b = normalizeExerciseAttempt(exo({ at: '2026-02-03T10:00:00.999Z' }));
  assert.equal(attemptKey(a), attemptKey(b));
  assert.equal(normalizeExerciseAttempts([exo(), exo()]).length, 1);
});

test('V74 · une phase non exécutée ne peut pas être un succès', () => {
  const a = normalizeExerciseAttempt(exo({ phase: 'compile', passed: 3, total: 3 }));
  assert.equal(a.outcome, 'failure');
  assert.equal(a.allPassed, false);
});

// ── MEANINGFUL_CONTACT (§1.2) ─────────────────────────────────────────────

test('V74 · G2 — une journée `done` n’est PAS un contact significatif', () => {
  const p = proj({ days: { '34': { status: 'done', completedAt: '2026-02-03T18:00:00.000Z', submissions: [] } } });
  assert.equal(fiche(p).meaningfulContacts.length, 0);
  assert.equal(fiche(p).lastMeaningfulContactAt, null);
  // …mais l'EXPOSITION existe : la question a un sens, elle n'est simplement pas prouvée.
  assert.ok(fiche(p).lastExposureAt);
});

test('V74 · une soumission VIDE n’est pas un contact significatif', () => {
  const p = proj({ days: jour({ submissions: [{ at: '2026-02-03T11:00:00.000Z', content: '   ' }] }) });
  assert.equal(fiche(p).meaningfulContacts.length, 0);
});

test('V74 · G8 — une preuve NON validée ne compte pas', () => {
  const p = proj({ days: jour(), evidence: [{ id: 'e1', competencyIds: ['ds'], createdAt: '2026-02-04T10:00:00.000Z', validation: { status: 'pending' } }] });
  assert.equal(p.competencies.find((c) => c.id === 'ds').meaningfulContacts.length, 0);
});

// ── RETRIEVAL (§1.5) ──────────────────────────────────────────────────────

test('V74 · R-b — correction ouverte AVANT ⇒ contact significatif mais PAS récupération', () => {
  const p = proj({ days: jour(), exerciseAttempts: [exo({ correctionSeen: true })] });
  assert.equal(fiche(p).meaningfulContacts.length, 1);
  assert.equal(fiche(p).retrievalCount, 0);
  assert.equal(fiche(p).successfulRetrievalCount, 0);
});

test('V74 · R-c — la deuxième tentative du même exercice le même jour n’est pas une récupération', () => {
  const p = proj({ days: jour(), exerciseAttempts: [exo({ passed: 0 }), exo({ at: '2026-02-03T11:00:00.000Z' })] });
  assert.equal(fiche(p).meaningfulContacts.length, 2);
  assert.equal(fiche(p).retrievalCount, 1);
  // La récupération retenue est la PREMIÈRE : celle qui a échoué.
  assert.equal(fiche(p).failedRetrievalCount, 1);
  assert.equal(fiche(p).successfulRetrievalCount, 0);
});

test('V74 · R-c — le lendemain, la même tâche redevient une récupération', () => {
  const p = proj({ days: jour(), exerciseAttempts: [exo({ passed: 0 }), exo({ at: '2026-02-04T10:00:00.000Z' })] });
  assert.equal(fiche(p).retrievalCount, 2);
  assert.equal(fiche(p).successfulRetrievalCount, 1);
});

test('V74 · §3.4 — un exercice AMBIGU n’est rattaché à aucun concept', () => {
  // `exerciseConcept` ne contient pas cet exercice : aucune leçon ne le déclare seule.
  const p = proj({ days: jour(), exerciseAttempts: [exo({ exerciseId: 'ambigu-xyz' })] });
  assert.equal(fiche(p).meaningfulContacts.length, 0);
});

test('V74 · §1.6 — `partial` ne fait NI progresser NI casser la série', () => {
  const base = [exo({ at: '2026-02-03T10:00:00.000Z' }), exo({ at: '2026-02-04T10:00:00.000Z' })];
  const sans = proj({ days: jour(), exerciseAttempts: base });
  const avec = proj({ days: jour(), exerciseAttempts: [...base, exo({ at: '2026-02-05T10:00:00.000Z', passed: 1 })] });
  assert.equal(sans.concepts.find((c) => c.id === 'data-structures-intro').consecutiveSuccesses, 2);
  assert.equal(avec.concepts.find((c) => c.id === 'data-structures-intro').consecutiveSuccesses, 2);
});

test('V74 · un échec CASSE la série', () => {
  const p = proj({ days: jour(), exerciseAttempts: [
    exo({ at: '2026-02-03T10:00:00.000Z' }), exo({ at: '2026-02-04T10:00:00.000Z' }),
    exo({ at: '2026-02-05T10:00:00.000Z', passed: 0 }),
  ] });
  assert.equal(fiche(p).consecutiveSuccesses, 0);
  assert.equal(fiche(p).failedRetrievalCount, 1);
});

// ── B1 · rejouabilité ─────────────────────────────────────────────────────

test('V74 · B1 — la projection est STRICTEMENT identique à entrée identique', () => {
  const facts = { days: jour(), exerciseAttempts: [exo(), exo({ at: '2026-02-05T10:00:00.000Z' })] };
  assert.deepEqual(proj(facts), proj(facts));
});

test('V74 · B1 — la projection ne dépend PAS de l’ordre d’insertion des faits', () => {
  const a = [exo({ at: '2026-02-03T10:00:00.000Z' }), exo({ at: '2026-02-05T10:00:00.000Z' })];
  assert.deepEqual(
    proj({ days: jour(), exerciseAttempts: a }),
    proj({ days: jour(), exerciseAttempts: [...a].reverse() }),
  );
});

test('V74 · aucune horloge implicite : `now` est injecté et seul lui décide', () => {
  const facts = { days: jour(), exerciseAttempts: [exo()] };
  const p1 = projectLearnerMemory({ facts, context: ctx, now: '2026-03-01T00:00:00.000Z' });
  const p2 = projectLearnerMemory({ facts, context: ctx, now: '2026-06-01T00:00:00.000Z' });
  // Les faits ne bougent pas ; seule la position dans le parcours change.
  assert.deepEqual(p1.concepts, p2.concepts);
  assert.notEqual(p1.currentDay, p2.currentDay);
});

test('V74 · sans date de début, la position n’est PAS devinée', () => {
  const p = projectLearnerMemory({ facts: { days: jour() }, context: { ...ctx, startDate: null }, now: NOW });
  assert.equal(p.currentDay, 0);
});

// ── contacts bruts ────────────────────────────────────────────────────────

test('V74 · les contacts sont triés par date, puis par force du signal', () => {
  const cs = collectContacts({
    days: { '34': { startedAt: '2026-02-03T09:00:00.000Z', submissions: [{ at: '2026-02-03T10:00:00.000Z', content: 'x' }] } },
    exerciseAttempts: [exo()],
    recallAttempts: [{ conceptId: 'data-structures-intro', at: '2026-02-03T10:00:00.000Z', outcome: 'recalled', format: 'free' }],
  });
  assert.deepEqual(cs.map((c) => c.kind), ['retrieval', 'exercise', 'submission']);
});
