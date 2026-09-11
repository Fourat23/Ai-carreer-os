// V74 · CP11 — le transfert entre compétences.
//
// Ce que ces tests gardent : **le moteur ne doit plus appeler « transfert » une
// co-occurrence de compétences.** Le CP11 a mesuré que 269 journées sur 365
// (74 %) portaient des leçons couvrant au moins deux compétences ; un signal
// qui s'allume trois fois sur quatre ne distingue rien, et surtout il ne mesure
// pas ce qu'il prétend.
import test from 'node:test';
import assert from 'node:assert/strict';
import { projectLearnerMemory, collectContacts } from '../lib/learner-memory.mjs';
import { EVIDENCE_SOURCE_TYPES, QUALIFYING_SOURCE_TYPES } from '../lib/evidence.mjs';
import { TRANSFER_LEVELS, isTransferLevel } from '../lib/transfer-taxonomy.mjs';

const NOW = '2026-06-01T00:00:00.000Z';
const CTX = {
  conceptDays: { alpha: [1, 2] },
  conceptSkills: { alpha: ['python', 'sql'] },
  // Une Map à clés NUMÉRIQUES, comme la construit `lib/learner-memory-server.ts`.
  // Un objet simple donnerait des clés « 1 » et « 2 » en CHAÎNE, que la recherche
  // par `dayRef` (un nombre) ne retrouverait jamais : les contacts de preuve
  // seraient silencieusement rattachés à aucun concept, et trois de ces tests
  // échoueraient pour une raison qui n'a rien à voir avec le transfert.
  dayConcepts: new Map([[1, ['alpha']], [2, ['alpha']]]),
  transferDays: [1, 2],
  projectDays: [],
  skills: ['python', 'sql'],
};
const jours = {
  1: { status: 'done', startedAt: '2026-05-01T08:00:00.000Z', updatedAt: '2026-05-01T08:00:00.000Z' },
  2: { status: 'done', startedAt: '2026-05-02T08:00:00.000Z', updatedAt: '2026-05-02T08:00:00.000Z' },
};
const preuve = (sourceType, at = '2026-05-02T09:00:00.000Z') => ({
  id: `ev-${sourceType}`, sourceType, sourceId: 'x', competencyIds: ['python'],
  createdAt: at, dayId: 2, validation: { status: 'passed', kind: 'k', checkedAt: at },
});
const fiche = (facts) => projectLearnerMemory({ facts: { days: jours, ...facts }, context: CTX, now: NOW })
  .concepts.find((f) => f.id === 'alpha');

// ── LE COMPTEUR DIT DÉSORMAIS LA VÉRITÉ ─────────────────────────────────

test('V74 · CP11 — une journée à deux compétences n’est PAS un transfert', () => {
  const f = fiche({ evidence: [preuve('exercise')] });
  assert.equal(f.transfers, 0,
    'un contact sur une journée « ≥ 2 compétences » ne doit plus compter comme transfert');
});

test('V74 · CP11 — la co-occurrence est conservée, sous son vrai nom', () => {
  const f = fiche({ evidence: [preuve('exercise')] });
  assert.ok(f.cooccurrencesCompetences > 0,
    'l’information reste réelle : elle change seulement de nom');
});

test('V74 · CP11 — un défi de transfert RÉUSSI compte, lui, comme un transfert', () => {
  const f = fiche({ evidence: [preuve('transfer-challenge')] });
  assert.equal(f.transfers, 1);
});

test('V74 · CP11 — un défi NON validé ne compte pas (M3 inchangé)', () => {
  const nonValide = { ...preuve('transfer-challenge'), validation: { status: 'failed', kind: 'k', checkedAt: NOW } };
  assert.equal(fiche({ evidence: [nonValide] }).transfers, 0);
});

test('V74 · CP11 — le type de la preuve traverse bien la collecte des contacts', () => {
  // Sans cela, le filtre sur `sourceType` serait du code mort : il ne pourrait
  // JAMAIS être vrai, et le compteur vaudrait zéro pour une mauvaise raison.
  const contacts = collectContacts({ days: jours, evidence: [preuve('transfer-challenge')] });
  const ev = contacts.find((c) => c.kind === 'evidence');
  assert.ok(ev, 'la preuve doit produire un contact');
  assert.equal(ev.sourceType, 'transfer-challenge');
});

// ── LE SIGNAL SILENCIEUX ────────────────────────────────────────────────

test('V74 · CP11 — « su, mais jamais hors de son contexte » est signalé', () => {
  const rappelReussi = [{
    conceptId: 'alpha', at: '2026-05-03T09:00:00.000Z', format: 'free', outcome: 'recalled',
    provenance: { producer: 'test', method: '' },
  }];
  const f = fiche({ recallAttempts: rappelReussi });
  assert.equal(f.successfulRetrievalCount, 1);
  assert.equal(f.jamaisTransfere, true,
    'une notion réussie mais jamais transférée doit porter le signal');
});

test('V74 · CP11 — le signal s’éteint dès qu’un transfert existe', () => {
  const f = fiche({
    recallAttempts: [{
      conceptId: 'alpha', at: '2026-05-03T09:00:00.000Z', format: 'free', outcome: 'recalled',
      provenance: { producer: 'test', method: '' },
    }],
    evidence: [preuve('transfer-challenge')],
  });
  assert.equal(f.jamaisTransfere, false);
});

test('V74 · CP11 — une notion JAMAIS réussie ne porte pas le signal : il serait trompeur', () => {
  // « Jamais transféré » n'a de sens que pour une notion qu'on sait déjà
  // restituer. Le dire d'une notion jamais réussie confondrait deux manques
  // très différents.
  assert.equal(fiche({}).jamaisTransfere, false);
});

// ── LE VOCABULAIRE DES PREUVES ──────────────────────────────────────────

test('V74 · CP11 — `transfer-challenge` est un type de preuve, et il est qualifiant', () => {
  assert.ok(EVIDENCE_SOURCE_TYPES.includes('transfer-challenge'));
  assert.ok(QUALIFYING_SOURCE_TYPES.has('transfer-challenge'));
});

test('V74 · CP11 — la taxonomie de distance EXISTANTE est réutilisée, pas redéfinie', () => {
  // Le CP11 ne crée aucune échelle de transfert : `lib/transfer-taxonomy.mjs`
  // porte T0→T5 depuis longtemps, et les 25 défis s'y adossent.
  assert.deepEqual(TRANSFER_LEVELS, ['T0', 'T1', 'T2', 'T3', 'T4', 'T5']);
  assert.ok(isTransferLevel('T5'));
  assert.ok(!isTransferLevel('T9'));
});

// ── DÉTERMINISME ────────────────────────────────────────────────────────

test('V74 · CP11 — B2 : la projection reste strictement déterministe', () => {
  const facts = { days: jours, evidence: [preuve('transfer-challenge'), preuve('exercise')] };
  const a = projectLearnerMemory({ facts, context: CTX, now: NOW });
  const b = projectLearnerMemory({ facts, context: CTX, now: NOW });
  assert.deepEqual(a, b);
});
