// V74 · CP3 — la priorité de réactivation, et surtout son EXPLICABILITÉ.
import test from 'node:test';
import assert from 'node:assert/strict';
import { prioriteDe, prioriser, statutDe, comptesParStatut, POIDS, POIDS_TOTAL } from '../lib/retention-priority.mjs';

const NOW = '2026-03-01T00:00:00.000Z';
const f = (o = {}) => ({
  id: 'x', lastExposureAt: '2026-01-01T00:00:00.000Z', lastRetrievalAt: null,
  lastSuccessAt: null, lastFailureAt: null, lastEvidenceAt: null,
  lastMeaningfulContactAt: '2026-01-01T00:00:00.000Z',
  successfulRetrievalCount: 0, failedRetrievalCount: 0, retrievalCount: 0,
  consecutiveSuccesses: 0, applications: 0, transfers: 0,
  currentExpectedLevel: null, nextCurriculumNeed: null, prereqDepth: null,
  meaningfulContacts: [{ at: '2026-01-01T00:00:00.000Z', kind: 'submission' }], ...o,
});

test('V74 · les poids somment à 100 — aucune dérive silencieuse', () => {
  assert.equal(POIDS_TOTAL, 100);
  assert.ok(Object.values(POIDS).every((p) => Number.isInteger(p) && p > 0));
});

// ── B10 : toute priorité est explicable ───────────────────────────────────

test('V74 · B10 — toute unité proposée porte une trace citant ses facteurs', () => {
  const l = prioriser([
    f({ id: 'a', lastSuccessAt: '2026-01-10T00:00:00.000Z', retrievalCount: 1 }),
    f({ id: 'b', lastFailureAt: '2026-02-20T00:00:00.000Z', retrievalCount: 1 }),
    f({ id: 'c', currentExpectedLevel: 4 }),
  ], { now: NOW });
  assert.ok(l.length >= 3);
  for (const p of l) {
    assert.ok(p.facteurs.length > 0, `${p.id} n'a aucun facteur`);
    assert.ok(p.pourquoi && p.pourquoi.length > 10, `${p.id} n'a pas de justification`);
    assert.equal(p.score, p.facteurs.reduce((a, x) => a + x.points, 0));
    for (const fa of p.facteurs) assert.ok(fa.phrase && fa.id && Number.isInteger(fa.points));
  }
});

test('V74 · la justification cite AU PLUS deux facteurs — au-delà ce n’est plus une justification', () => {
  const p = prioriteDe(f({
    lastFailureAt: '2026-02-20T00:00:00.000Z', retrievalCount: 3,
    currentExpectedLevel: 4, prereqDepth: 7,
    nextCurriculumNeed: { day: 200, inDays: 2 },
  }), { now: NOW });
  assert.ok(p.facteurs.length > 2);
  // On teste sur les identifiants cités, pas sur un découpage de texte :
  // certaines phrases contiennent elles-mêmes « , et », et une sonde qui
  // découperait la chaîne mesurerait la ponctuation, pas la règle.
  assert.equal(p.pourquoiFacteurs.length, 2);
  assert.deepEqual(p.pourquoiFacteurs, p.facteurs.slice(0, 2).map((x) => x.id));
});

test('V74 · aucune phrase de justification ne contient un score chiffré de mémoire', () => {
  const p = prioriteDe(f({ lastSuccessAt: '2026-01-10T00:00:00.000Z', retrievalCount: 1 }), { now: NOW });
  assert.doesNotMatch(p.pourquoi, /0[.,]\d{2,}/);
  for (const fa of p.facteurs) assert.doesNotMatch(fa.phrase, /score|probabilit|0[.,]\d{2,}/i);
});

// ── les statuts (§2), et leur ordre d'évaluation ──────────────────────────

test('V74 · UNKNOWN — jamais aucun contact significatif', () => {
  assert.equal(statutDe(f({ lastMeaningfulContactAt: null }), null, NOW), 'UNKNOWN');
});

test('V74 · OVERDUE — un échec non repris prime, même sans échéance', () => {
  assert.equal(statutDe(f({ lastFailureAt: '2026-02-25T00:00:00.000Z' }), null, NOW), 'OVERDUE');
  // …mais une réussite postérieure le referme.
  assert.equal(statutDe(f({ lastFailureAt: '2026-02-25T00:00:00.000Z', lastSuccessAt: '2026-02-26T00:00:00.000Z' }), null, NOW), 'HEALTHY');
});

test('V74 · DUE / SOON / OVERDUE se départagent par la tolérance de 7 jours', () => {
  assert.equal(statutDe(f(), '2026-03-01T00:00:00.000Z', NOW), 'DUE');
  assert.equal(statutDe(f(), '2026-02-26T00:00:00.000Z', NOW), 'DUE');       // 3 j de retard
  assert.equal(statutDe(f(), '2026-02-20T00:00:00.000Z', NOW), 'OVERDUE');   // 9 j de retard
  assert.equal(statutDe(f(), '2026-03-02T00:00:00.000Z', NOW), 'SOON');
  assert.equal(statutDe(f(), '2026-04-01T00:00:00.000Z', NOW), 'HEALTHY');
});

// ── les facteurs, un par un ───────────────────────────────────────────────

// SONDE CORRIGÉE — TROU TROUVÉ PAR LA MUTATION M10 DU CP14.
//
// La première version posait `lastSuccessAt` **sans poser `lastRetrievalAt`**,
// laissé à `null` par la fixture. Or le code lit `lastSuccessAt ?? lastRetrievalAt` :
// avec un `lastRetrievalAt` nul, **les deux ordres de repli donnent le même
// résultat**. En inversant l'expression (`lastRetrievalAt ?? lastSuccessAt`),
// aucun test ne rougissait.
//
// Le test posait donc exactement le cas où la règle n'a rien à décider. Il
// fallait le cas DISCRIMINANT, qui est aussi le cas réel que G5 vise : une
// tentative RÉCENTE qui a ÉCHOUÉ, et une réussite ANCIENNE. C'est là que
// « récent ne protège pas » veut dire quelque chose.
test('V74 · G5 — « récent » ne protège pas : c’est le dernier RAPPEL RÉUSSI qui compte', () => {
  const p = prioriteDe(f({
    lastMeaningfulContactAt: '2026-02-28T00:00:00.000Z',
    // Tentative d'hier — mais ÉCHOUÉE. Elle ne doit rien rafraîchir.
    lastRetrievalAt: '2026-02-28T00:00:00.000Z',
    lastFailureAt: '2026-02-28T00:00:00.000Z',
    // Dernière réussite : deux mois plus tôt.
    lastSuccessAt: '2026-01-01T00:00:00.000Z',
    retrievalCount: 2, successfulRetrievalCount: 1, failedRetrievalCount: 1,
  }), { now: NOW });
  const anc = p.facteurs.find((x) => x.id === 'ancienneteRappel');
  assert.ok(anc, 'le facteur d’ancienneté doit être cité');
  assert.ok(anc.valeur >= 55,
    `l’ancienneté se compte depuis la RÉUSSITE (attendu ≥ 55 j, obtenu ${anc.valeur}) : `
    + 'une tentative récente mais ratée ne doit pas rajeunir la notion');
});

test('V74 · « exposé mais jamais mis à l’épreuve » est un signal, et il est silencieux sans lui', () => {
  const p = prioriteDe(f({ retrievalCount: 0 }), { now: NOW });
  assert.ok(p.facteurs.some((x) => x.id === 'jamaisTente'));
  // dès qu'une récupération existe, le facteur disparaît
  const q = prioriteDe(f({ retrievalCount: 1, lastSuccessAt: '2026-02-01T00:00:00.000Z' }), { now: NOW });
  assert.ok(!q.facteurs.some((x) => x.id === 'jamaisTente'));
});

test('V74 · un besoin curriculaire lointain ne presse pas, un besoin proche oui', () => {
  const loin = prioriteDe(f({ nextCurriculumNeed: { day: 300, inDays: 60 } }), { now: NOW });
  const proche = prioriteDe(f({ nextCurriculumNeed: { day: 200, inDays: 2 } }), { now: NOW });
  assert.ok(!loin.facteurs.some((x) => x.id === 'besoinProche'));
  assert.ok(proche.facteurs.some((x) => x.id === 'besoinProche'));
});

test('V74 · un niveau promis de 1 ou 2 n’ajoute rien — l’exposition suffit', () => {
  assert.ok(!prioriteDe(f({ currentExpectedLevel: 2 }), { now: NOW }).facteurs.some((x) => x.id === 'niveauPromis'));
  assert.ok(prioriteDe(f({ currentExpectedLevel: 4 }), { now: NOW }).facteurs.some((x) => x.id === 'niveauPromis'));
});

test('V74 · « travaillé mais jamais sans la réponse sous les yeux » est distingué', () => {
  const p = prioriteDe(f({ retrievalCount: 0, meaningfulContacts: [{ kind: 'exercise' }, { kind: 'evidence' }] }), { now: NOW });
  assert.ok(p.facteurs.some((x) => x.id === 'contactPassif'));
});

// ── déterminisme et ordre ─────────────────────────────────────────────────

test('V74 · B2 — l’ordre est TOTAL : deux exécutions rendent la même liste', () => {
  const fiches = ['a', 'b', 'c', 'd'].map((id) => f({ id, currentExpectedLevel: 4 }));
  const a = prioriser(fiches, { now: NOW });
  const b = prioriser([...fiches].reverse(), { now: NOW });
  assert.deepEqual(a.map((x) => x.id), b.map((x) => x.id));
});

test('V74 · une unité jamais exposée n’est jamais proposée', () => {
  const l = prioriser([f({ id: 'z', lastExposureAt: null, lastMeaningfulContactAt: null })], { now: NOW });
  assert.equal(l.length, 0);
});

test('V74 · les comptes par statut portent sur TOUTES les fiches, pas seulement les prioritaires', () => {
  const c = comptesParStatut([
    f({ id: 'a' }), f({ id: 'b', lastMeaningfulContactAt: null }),
    f({ id: 'c', lastFailureAt: '2026-02-25T00:00:00.000Z' }),
  ], { now: NOW });
  assert.equal(c.UNKNOWN + c.OVERDUE + c.DUE + c.SOON + c.HEALTHY, 3);
  assert.equal(c.UNKNOWN, 1);
  assert.equal(c.OVERDUE, 1);
});
