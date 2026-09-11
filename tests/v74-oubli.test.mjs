// V74 · CP9 — les candidats de modèle d'oubli.
//
// Ces tests ne cherchent PAS à désigner un gagnant : le rapport du CP9 montre
// que le classement se retourne selon l'hypothèse injectée ET selon la simple
// graine du générateur. Ils gardent ce qui, lui, doit être vrai quel que soit
// le modèle :
//
//   · un candidat rend une ÉCHÉANCE, jamais une probabilité de mémoire ;
//   · le produit n'a PAS changé de modèle par inadvertance ;
//   · tous les paramètres sont déclarés en un seul endroit.
import test from 'node:test';
import assert from 'node:assert/strict';
import { CANDIDATS, PARAMETRES, leitner } from '../scripts/v74/cp9-oubli.mjs';
import { planifier, echeanceDe } from '../lib/retention-scheduler.mjs';
import { INTERVALS } from '../lib/retention.mjs';

const NOW = '2026-06-01T00:00:00.000Z';
const J = 86_400_000;
const ilYA = (n) => new Date(Date.parse(NOW) - n * J).toISOString();

const f = (o = {}) => ({
  id: 'x', lastExposureAt: ilYA(100), lastRetrievalAt: ilYA(10),
  lastSuccessAt: ilYA(10), lastFailureAt: null, lastMeaningfulContactAt: ilYA(10),
  retrievalCount: 3, successfulRetrievalCount: 3, failedRetrievalCount: 0,
  consecutiveSuccesses: 3, applications: 0, transfers: 0,
  currentExpectedLevel: 4, nextCurriculumNeed: null, prereqDepth: null,
  meaningfulContacts: [{ at: ilYA(10), kind: 'retrieval' }], ...o,
});

// ── LE PRODUIT N'A PAS CHANGÉ DE MODÈLE ──────────────────────────────────

test('V74 · CP9 — le point d’injection `echeanceDeOf` vaut `echeanceDe` par défaut', () => {
  // C'est LA garantie que le CP9 n'a rien changé au comportement du produit :
  // l'étude a besoin d'injecter des modèles, le produit ne doit pas bouger.
  const fiches = [f({ id: 'a' }), f({ id: 'b', consecutiveSuccesses: 0 })];
  const opts = { now: NOW, formatsOf: () => ['cued'], recallOf: () => null };
  const defaut = planifier(fiches, opts);
  const explicite = planifier(fiches, { ...opts, echeanceDeOf: echeanceDe });
  assert.deepEqual(defaut, explicite);
});

test('V74 · CP9 — le modèle du produit reste celui de V66, paliers compris', () => {
  const e = echeanceDe(f({ consecutiveSuccesses: 2 }));
  assert.equal(e.intervalDays, INTERVALS[2]);
  // Et le candidat « Leitner » de l'étude est bien le même modèle.
  assert.equal(leitner(f({ consecutiveSuccesses: 2 })).intervalDays, INTERVALS[2]);
});

// ── AUCUN CANDIDAT NE REND UNE PROBABILITÉ DE MÉMOIRE ────────────────────

test('V74 · CP9 — un candidat rend une ÉCHÉANCE, jamais une probabilité (§2 du contrat)', () => {
  for (const c of CANDIDATS) {
    const r = c.f(f());
    assert.ok(r, `${c.id} n’a rien rendu`);
    assert.ok(typeof r.dueAt === 'string' && !Number.isNaN(Date.parse(r.dueAt)), `${c.id} : dueAt invalide`);
    assert.ok(Number.isInteger(r.intervalDays) && r.intervalDays >= 1, `${c.id} : intervalle non entier positif`);
    assert.ok(typeof r.basis === 'string' && r.basis.length > 0, `${c.id} : aucune justification`);
    // Rien qui ressemble à une probabilité ne doit sortir d'un candidat.
    for (const clef of Object.keys(r)) {
      assert.doesNotMatch(clef, /probab|memory|retention|score/i, `${c.id} expose « ${clef} »`);
    }
  }
});

test('V74 · CP9 — une notion jamais récupérée n’a d’échéance chez AUCUN candidat', () => {
  for (const c of CANDIDATS) {
    assert.equal(c.f(f({ lastRetrievalAt: null })), null,
      `${c.id} a fabriqué une échéance pour une notion jamais tentée`);
  }
});

// ── DÉTERMINISME ET BORNES ───────────────────────────────────────────────

test('V74 · CP9 — tous les candidats sont déterministes (B2)', () => {
  const fiche = f({ consecutiveSuccesses: 4, failedRetrievalCount: 1 });
  for (const c of CANDIDATS) assert.deepEqual(c.f(fiche), c.f(fiche), `${c.id} n’est pas déterministe`);
});

test('V74 · CP9 — aucun candidat ne rend un intervalle absurde', () => {
  // Une série très longue ne doit pas produire une échéance hors du parcours.
  const fiche = f({ consecutiveSuccesses: 40, successfulRetrievalCount: 40 });
  for (const c of CANDIDATS) {
    const r = c.f(fiche);
    assert.ok(r.intervalDays <= 365, `${c.id} : ${r.intervalDays} jours, soit plus d’une année de parcours`);
  }
});

test('V74 · CP9 — une série cassée ne peut jamais ALLONGER l’échéance', () => {
  let auMoinsUnRaccourcit = false;
  for (const c of CANDIDATS) {
    const sans = c.f(f({ consecutiveSuccesses: 3, failedRetrievalCount: 0 }));
    const avec = c.f(f({ consecutiveSuccesses: 0, failedRetrievalCount: 3 }));
    assert.ok(avec.intervalDays <= sans.intervalDays,
      `${c.id} : après des échecs, ${avec.intervalDays} j contre ${sans.intervalDays} j sans échec`);
    if (avec.intervalDays < sans.intervalDays) auMoinsUnRaccourcit = true;
  }
  // Sans cette seconde assertion, le test passerait encore si TOUS les
  // candidats ignoraient l'échec — c'est-à-dire exactement le défaut qu'il
  // prétend surveiller. `SEUILS` l'ignore effectivement, et c'est sa limite
  // documentée ; les autres doivent bel et bien raccourcir.
  assert.ok(auMoinsUnRaccourcit, 'aucun candidat ne raccourcit après un échec : le test ne mesure rien');
});

// ANOMALIE DE SONDE n° 10, TROUVÉE PAR MUTATION ET CORRIGÉE ICI.
// Le test ci-dessus comparait une série de 3 réussites à une série CASSÉE
// (`consecutiveSuccesses: 0`). Or `sm2` court-circuite : `serie === 0` rend
// 1 jour sans jamais consulter le facteur de facilité. **En inversant le signe
// du terme d'échec dans ce facteur, aucun test ne rougissait** — l'arithmétique
// qui distingue SM-2 des autres candidats n'était couverte par rien.
// Ce test-ci garde la série CONSTANTE et ne fait varier que l'historique
// d'échecs, ce qui force le passage par le facteur.
test('V74 · CP9 — à série égale, un historique d’échecs ne peut pas allonger l’échéance', () => {
  // Les valeurs ne sont pas quelconques : avec 3 réussites, le facteur de
  // facilité de `sm2` atteint son PLAFOND (2,8), et un plafond absorbe les
  // écarts — une inversion de signe y devenait invisible. Deux réussites
  // laissent le facteur à 2,7, sous le plafond, donc observable.
  let auMoinsUnSensible = false;
  for (const c of CANDIDATS) {
    const propre = c.f(f({ consecutiveSuccesses: 2, successfulRetrievalCount: 2, failedRetrievalCount: 0 }));
    const abime = c.f(f({ consecutiveSuccesses: 2, successfulRetrievalCount: 2, failedRetrievalCount: 2 }));
    assert.ok(abime.intervalDays <= propre.intervalDays,
      `${c.id} : 4 échecs au compteur ALLONGENT l’échéance (${abime.intervalDays} j contre ${propre.intervalDays} j)`);
    if (abime.intervalDays < propre.intervalDays) auMoinsUnSensible = true;
  }
  assert.ok(auMoinsUnSensible,
    'aucun candidat n’est sensible à l’historique d’échecs à série égale : le test ne mesure rien');
});

// ── LES PARAMÈTRES SONT DÉCLARÉS, PAS DISPERSÉS ─────────────────────────

test('V74 · CP9 — tous les paramètres sont déclarés en un seul endroit et sont des nombres', () => {
  const valeurs = Object.values(PARAMETRES).flat();
  assert.ok(valeurs.length >= 10, 'les paramètres doivent être publiés, pas cachés');
  for (const [k, v] of Object.entries(PARAMETRES)) {
    const liste = Array.isArray(v) ? v : [v];
    for (const x of liste) assert.ok(Number.isFinite(x), `${k} n’est pas un nombre fini`);
  }
});

test('V74 · CP9 — `evidence-aware` est INERTE sans preuve, et c’est la dette D4', () => {
  // Le rapport le dit : dans la simulation, ce candidat dégénère exactement en
  // Leitner parce que `evidence[]` ne porte pas le grain concept. Ce test garde
  // le fait, pour qu'on ne puisse pas croire à une équivalence de modèles.
  const sansPreuve = f({ applications: 0, transfers: 0 });
  const ev = CANDIDATS.find((c) => c.id === 'EVIDENCE').f(sansPreuve);
  assert.equal(ev.intervalDays, leitner(sansPreuve).intervalDays);

  // Avec des preuves, il s'en écarte bien — donc l'inertie vient des données,
  // pas du candidat.
  const avecPreuve = f({ applications: 2, transfers: 1 });
  assert.ok(CANDIDATS.find((c) => c.id === 'EVIDENCE').f(avecPreuve).intervalDays
    > leitner(avecPreuve).intervalDays);
});
