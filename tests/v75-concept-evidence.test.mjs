// V75 · CP3 — D4 : une preuve peut porter ses CONCEPTS.
//
// Ce que ces tests gardent :
//   · le champ est une LISTE — le CP0 a mesuré 67 exercices multi-concepts PAR
//     CONCEPTION, et forcer un concept unique reviendrait à en choisir un au
//     hasard, c'est-à-dire à fabriquer de la donnée ;
//   · il est ADDITIF — `competencyIds` n'est jamais retiré, et une preuve
//     ancienne sans concepts reste parfaitement valide ;
//   · une preuve qui DÉCLARE ses concepts n'est plus diluée sur toutes les
//     leçons de sa journée.
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEvidence, normalizeEvidenceRecord, programConcepts, MAX_CONCEPTS } from '../lib/evidence.mjs';
import { collectContacts, projectLearnerMemory } from '../lib/learner-memory.mjs';

const NOW = '2026-09-01T10:00:00.000Z';
const base = {
  sourceType: 'exercise', sourceId: 'ex-1', competencyIds: ['python'],
  validation: { status: 'passed', kind: 'exercise-tests', checkedAt: NOW },
  provenance: { producer: 'test', method: 'unit' },
};

// ── LE CHAMP EST UNE LISTE, ET C'EST LA DÉCISION ────────────────────────

test('V75 · CP3 — une preuve peut porter PLUSIEURS concepts', () => {
  const r = makeEvidence({ ...base, conceptIds: ['python-basics', 'sql-joins'] }, { now: NOW });
  assert.ok(r.ok, r.error);
  assert.deepEqual(r.evidence.conceptIds, ['python-basics', 'sql-joins']);
});

test('V75 · CP3 — le champ est ADDITIF : les compétences ne sont jamais retirées', () => {
  const r = makeEvidence({ ...base, conceptIds: ['python-basics'] }, { now: NOW });
  assert.deepEqual(r.evidence.competencyIds, ['python'], 'competencyIds doit survivre');
  assert.ok(r.evidence.conceptIds.length > 0);
});

test('V75 · CP3 — une preuve SANS concept reste parfaitement valide', () => {
  // 137 exercices sur 376 sont réellement ambigus (CP0). Exiger un concept les
  // rendrait tous irrecevables, ou pousserait à en inventer un.
  const r = makeEvidence(base, { now: NOW });
  assert.ok(r.ok, r.error);
  assert.deepEqual(r.evidence.conceptIds, []);
});

test('V75 · CP3 — une liste vide signifie « concept inconnu », pas « aucun concept »', () => {
  // Le champ EXISTE toujours, même vide. L'omettre rendrait indiscernables
  // « on ne sait pas » et « il n'y en a pas » — le contournement G9 de V74.
  const r = makeEvidence(base, { now: NOW });
  assert.ok('conceptIds' in r.evidence, 'le champ doit être présent même vide');
});

// ── VALIDATION DE FORME ─────────────────────────────────────────────────

test('V75 · CP3 — un identifiant mal formé est écarté, pas stocké', () => {
  assert.deepEqual(programConcepts(['Python Basics', '../etc', 'ok-slug', '', null]), ['ok-slug']);
  assert.deepEqual(programConcepts('pas-un-tableau'), []);
});

test('V75 · CP3 — les doublons sont écartés et la liste est bornée', () => {
  assert.deepEqual(programConcepts(['a', 'a', 'b']), ['a', 'b']);
  const trop = Array.from({ length: 40 }, (_, i) => `c-${i}`);
  const r = makeEvidence({ ...base, conceptIds: trop }, { now: NOW });
  assert.ok(r.evidence.conceptIds.length <= MAX_CONCEPTS);
});

// ── AUCUNE MIGRATION DESTRUCTIVE ────────────────────────────────────────

test('V75 · CP3 — une preuve ANCIENNE, sans `conceptIds`, se relit sans broncher', () => {
  const ancienne = {
    id: 'ev-exercise-vieux', sourceType: 'exercise', sourceId: 'vieux',
    competencyIds: ['python'], createdAt: NOW,
    validation: { status: 'passed', kind: 'exercise-tests', checkedAt: NOW },
    provenance: { producer: 'lab-runner', method: 'tests' },
  };
  const n = normalizeEvidenceRecord(ancienne);
  assert.ok(n, 'une preuve antérieure au contrat doit rester lisible');
  assert.deepEqual(n.conceptIds, [], 'elle reçoit une liste vide, pas un rejet');
  assert.deepEqual(n.competencyIds, ['python']);
});

// ── L'EFFET RÉEL SUR LA PROJECTION ──────────────────────────────────────

test('V75 · CP3 — le contact de preuve transporte les concepts déclarés', () => {
  const contacts = collectContacts({
    days: {}, evidence: [{
      id: 'e1', sourceType: 'exercise', sourceId: 'x', competencyIds: ['python'],
      conceptIds: ['alpha', 'beta'], createdAt: NOW, dayId: 2,
      validation: { status: 'passed', kind: 'exercise-tests', checkedAt: NOW },
    }],
  });
  const ev = contacts.find((c) => c.kind === 'evidence');
  assert.deepEqual(ev.conceptIds, ['alpha', 'beta']);
});

test('V75 · CP3 — une preuve qui DÉCLARE ses concepts n’est plus diluée sur sa journée', () => {
  // La journée 2 enseigne trois leçons. La preuve n'en démontre qu'une.
  // Avant le CP3, elle créditait les trois.
  const CTX = {
    conceptDays: { alpha: [2], beta: [2], gamma: [2] },
    conceptSkills: { alpha: ['python'], beta: ['python'], gamma: ['python'] },
    dayConcepts: new Map([[2, ['alpha', 'beta', 'gamma']]]),
    projectDays: [], skills: ['python'],
  };
  const jours = {
    2: { status: 'done', startedAt: '2026-08-01T08:00:00.000Z', updatedAt: '2026-08-01T08:00:00.000Z' },
  };
  const preuve = (conceptIds) => ({
    id: 'e1', sourceType: 'exercise', sourceId: 'x', competencyIds: ['python'],
    conceptIds, createdAt: '2026-08-02T09:00:00.000Z', dayId: 2,
    validation: { status: 'passed', kind: 'exercise-tests', checkedAt: '2026-08-02T09:00:00.000Z' },
  });
  const projete = (conceptIds) => projectLearnerMemory({
    facts: { days: jours, evidence: [preuve(conceptIds)] }, context: CTX, now: NOW,
  }).concepts;

  const cible = projete(['alpha']);
  const a = cible.find((f) => f.id === 'alpha');
  const g = cible.find((f) => f.id === 'gamma');
  assert.ok(a.lastEvidenceAt, 'la notion démontrée doit recevoir la preuve');
  assert.equal(g.lastEvidenceAt, null, 'une notion NON démontrée ne doit pas la recevoir');

  // Et sans concepts déclarés, le comportement d'avant est conservé : la preuve
  // retombe sur les leçons de la journée. C'est un repli, pas une régression.
  const sans = projete([]);
  assert.ok(sans.find((f) => f.id === 'gamma').lastEvidenceAt,
    'sans concept déclaré, le rattachement par journée reste le repli');
});
