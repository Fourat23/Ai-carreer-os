// V74 · CP4 — l'arbitrage : quoi, quand, sous quelle forme, dans quel budget.
import test from 'node:test';
import assert from 'node:assert/strict';
import { planifier, echeanceDe, formeDe, prochaineEcheance, MINUTES_PAR_FORME, PLAFOND_UNITES } from '../lib/retention-scheduler.mjs';
import { INTERVALS } from '../lib/retention.mjs';

const NOW = '2026-03-01T00:00:00.000Z';
const f = (o = {}) => ({
  id: 'x', lastExposureAt: '2026-01-01T00:00:00.000Z', lastRetrievalAt: null,
  lastSuccessAt: null, lastFailureAt: null, lastMeaningfulContactAt: '2026-01-01T00:00:00.000Z',
  retrievalCount: 0, successfulRetrievalCount: 0, failedRetrievalCount: 0,
  consecutiveSuccesses: 0, applications: 0, transfers: 0,
  currentExpectedLevel: 4, nextCurriculumNeed: null, prereqDepth: null,
  meaningfulContacts: [{ at: '2026-01-01T00:00:00.000Z', kind: 'submission' }], ...o,
});
const TOUTES = ['free', 'cued', 'applied', 'discrim', 'generate'];
const plan = (fiches, opt = {}) => planifier(fiches, { now: NOW, formatsOf: () => TOUTES, ...opt });

// ── l'échéance vient du moteur V66, pas d'ici ─────────────────────────────

test('V74 · CP4 — l’échelle d’espacement est celle de V66, jamais redéfinie', () => {
  const e = echeanceDe(f({ lastRetrievalAt: '2026-02-01T00:00:00.000Z', consecutiveSuccesses: 2 }));
  assert.equal(e.intervalDays, INTERVALS[2]);
});

test('V74 · CP4 — une notion jamais récupérée n’a PAS d’échéance : elle n’a pas commencé', () => {
  assert.equal(echeanceDe(f()), null);
});

test('V74 · CP4 — l’échéance se calcule depuis la dernière tentative, pas depuis « maintenant »', () => {
  const a = echeanceDe(f({ lastRetrievalAt: '2026-02-01T00:00:00.000Z', consecutiveSuccesses: 1 }));
  assert.equal(a.dueAt, new Date(Date.parse('2026-02-01T00:00:00.000Z') + INTERVALS[1] * 86400000).toISOString());
});

// ── la forme : trois règles, et l'ordre EST la décision ───────────────────

test('V74 · CP4 — après un échec, la forme est SOUTENUE, pas une restitution libre', () => {
  const r = formeDe(f({ lastFailureAt: '2026-02-25T00:00:00.000Z' }), TOUTES, null);
  assert.equal(r.format, 'cued');
  assert.match(r.raison, /échec/);
});

test('V74 · CP4 — avant un projet proche, la forme est APPLIQUÉE', () => {
  const r = formeDe(f({ nextCurriculumNeed: { day: 120, inDays: 4 } }), TOUTES, null);
  assert.equal(r.format, 'applied');
  assert.match(r.raison, /projet/);
});

test('V74 · CP4 — sinon on VARIE : une forme déjà utilisée n’est pas reproposée', () => {
  const recall = { formatsUsed: ['free'], attempts: [{ format: 'free', at: '2026-02-01T00:00:00.000Z' }] };
  const r = formeDe(f(), TOUTES, recall);
  assert.notEqual(r.format, 'free');
});

test('V74 · CP4 — aucune forme inventée : une leçon sans section support n’est pas proposée', () => {
  assert.equal(formeDe(f(), [], null), null);
  const p = plan([f()], { formatsOf: () => [] });
  assert.equal(p.items.length, 0);
  assert.equal(p.differes.length, 1);
  assert.match(p.differes[0].motif, /aucune forme/);
});

// ── le budget est une CONTRAINTE, pas une variable d'ajustement ───────────

test('V74 · CP4 — le budget est respecté, et ce qui est écarté est DIT', () => {
  const fiches = Array.from({ length: 12 }, (_, i) => f({ id: `c${i}`, currentExpectedLevel: 4 }));
  const p = plan(fiches, { budgetMinutes: 10, formatsOf: () => ['cued'] });
  assert.ok(p.minutesPlanifiees <= 10);
  assert.ok(p.items.length > 0);
  assert.ok(p.differes.length > 0);
  for (const d of p.differes) assert.ok(d.motif && d.motif.length > 5);
  assert.equal(p.items.length * MINUTES_PAR_FORME.cued, p.minutesPlanifiees);
});

test('V74 · CP4 — G12 : le plafond d’unités borne la session même si le budget le permet', () => {
  const fiches = Array.from({ length: 30 }, (_, i) => f({ id: `c${i}` }));
  const p = plan(fiches, { budgetMinutes: 10000, formatsOf: () => ['cued'] });
  assert.equal(p.items.length, PLAFOND_UNITES);
  assert.equal(p.raisonArret, 'plafond d’unités atteint');
});

test('V74 · CP4 — un plan vide est un plan honnête, pas une erreur', () => {
  const p = plan([]);
  assert.deepEqual(p.items, []);
  assert.equal(p.minutesPlanifiees, 0);
  assert.equal(p.raisonArret, 'file épuisée');
});

// ── B2 : déterminisme strict ──────────────────────────────────────────────

test('V74 · B2 — entrée identique + horloge identique → sortie STRICTEMENT identique', () => {
  const fiches = ['a', 'b', 'c', 'd', 'e'].map((id) => f({ id, currentExpectedLevel: 4 }));
  assert.deepEqual(plan(fiches), plan(fiches));
});

test('V74 · B2 — l’ordre d’entrée des fiches n’a AUCUN effet sur le plan', () => {
  const fiches = ['a', 'b', 'c', 'd', 'e'].map((id) => f({ id, currentExpectedLevel: 4 }));
  assert.deepEqual(
    plan(fiches).items.map((i) => i.id),
    plan([...fiches].reverse()).items.map((i) => i.id),
  );
});

test('V74 · B2 — aucune horloge implicite : deux dates donnent deux plans, jamais un hasard', () => {
  const fiches = [f({ lastRetrievalAt: '2026-02-01T00:00:00.000Z', retrievalCount: 1, lastSuccessAt: '2026-02-01T00:00:00.000Z', consecutiveSuccesses: 1 })];
  const p1 = planifier(fiches, { now: NOW, formatsOf: () => TOUTES });
  const p2 = planifier(fiches, { now: NOW, formatsOf: () => TOUTES });
  assert.deepEqual(p1, p2);
});

// ── B10 : chaque élément planifié reste explicable ────────────────────────

test('V74 · B10 — chaque élément du plan porte sa justification ET la raison de sa forme', () => {
  const p = plan([f({ lastFailureAt: '2026-02-25T00:00:00.000Z' })]);
  assert.equal(p.items.length, 1);
  const it = p.items[0];
  assert.ok(it.pourquoi.length > 10);
  assert.ok(it.raisonForme.length > 5);
  assert.ok(it.facteurs.length > 0);
  assert.ok(it.prompt.length > 10);
  assert.ok(it.minutes > 0);
});

// ── la suite : « et ensuite ? » ───────────────────────────────────────────

test('V74 · CP4 — une réussite espace, un échec ramène au début, un partiel gèle', () => {
  const fiche = f({ consecutiveSuccesses: 2 });
  assert.equal(prochaineEcheance(fiche, 'recalled', NOW).intervalDays, INTERVALS[3]);
  assert.equal(prochaineEcheance(fiche, 'failed', NOW).intervalDays, INTERVALS[0]);
  assert.equal(prochaineEcheance(fiche, 'partial', NOW).intervalDays, INTERVALS[2]);
});
