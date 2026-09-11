// V74 · CP8 — l'orchestration de l'espacement.
//
// Deux règles y sont nées, et chacune est née d'une MESURE qui a rougi :
//
//   1. **une notion qui n'est pas due ne prend pas la place d'une notion qui
//      l'est** — la simulation avait mesuré 44 % des propositions sur des
//      notions `HEALTHY` chez un apprenant qui réussit 9 fois sur 10 ;
//   2. **une session n'est jamais intégralement composée de retard** — la
//      correction n° 1, seule, avait fait passer de 0 à 49 le nombre de notions
//      rencontrées et JAMAIS proposées en 180 jours.
//
// Ces tests gardent les deux, et surtout **gardent le fait qu'elles ne
// s'annulent pas l'une l'autre**.
import test from 'node:test';
import assert from 'node:assert/strict';
import { prioriser } from '../lib/retention-priority.mjs';
import { planifier, echeanceDe, PLACES_DECOUVERTE } from '../lib/retention-scheduler.mjs';

const NOW = '2026-06-01T00:00:00.000Z';
const J = 86_400_000;
const ilYA = (n) => new Date(Date.parse(NOW) - n * J).toISOString();

const f = (o = {}) => ({
  id: 'x', lastExposureAt: ilYA(200), lastRetrievalAt: null,
  lastSuccessAt: null, lastFailureAt: null, lastMeaningfulContactAt: ilYA(200),
  retrievalCount: 0, successfulRetrievalCount: 0, failedRetrievalCount: 0,
  consecutiveSuccesses: 0, applications: 0, transfers: 0,
  currentExpectedLevel: 4, nextCurriculumNeed: null, prereqDepth: null,
  meaningfulContacts: [{ at: ilYA(200), kind: 'submission' }], ...o,
});

/** Une notion À JOUR : rappelée avec succès hier, donc due dans longtemps. */
const saine = (id) => f({
  id, lastRetrievalAt: ilYA(1), lastSuccessAt: ilYA(1),
  lastMeaningfulContactAt: ilYA(1), retrievalCount: 5, successfulRetrievalCount: 5,
  consecutiveSuccesses: 5, meaningfulContacts: [{ at: ilYA(1), kind: 'retrieval' }],
});

/** Une notion EN RETARD : dernier rappel il y a longtemps, série courte. */
const enRetard = (id, jours = 60) => f({
  id, lastRetrievalAt: ilYA(jours), lastSuccessAt: ilYA(jours),
  lastMeaningfulContactAt: ilYA(jours), retrievalCount: 1, successfulRetrievalCount: 1,
  consecutiveSuccesses: 1, meaningfulContacts: [{ at: ilYA(jours), kind: 'retrieval' }],
});

/** Une notion EXPOSÉE MAIS JAMAIS TENTÉE : aucun contact significatif. */
const jamaisTentee = (id) => f({
  id, lastMeaningfulContactAt: null, meaningfulContacts: [],
});

const dueAtOf = (fiches) => (id) => echeanceDe(fiches.find((x) => x.id === id))?.dueAt ?? null;
const ordonner = (fiches) => prioriser(fiches, { dueAtOf: dueAtOf(fiches), now: NOW });

// ── RÈGLE 1 · le statut décide de la bande, le score du rang DANS la bande ──

// NOTE DE MÉTHODE — ce test a d'abord été écrit sous la forme « une notion à
// jour ne passe pas devant une notion en retard », avec deux fiches ordinaires.
// **Il passait aussi bien AVANT qu'APRÈS le changement du CP8** : avec des
// valeurs par défaut, la fiche en retard a naturellement le meilleur score, si
// bien que les deux ordres donnent le même résultat. Il ne mesurait donc pas la
// règle, seulement une coïncidence de données.
//
// La version ci-dessous force le cas discriminant : la fiche à jour a le
// MEILLEUR score (30 contre 20, vérifié), donc seul un tri par bande peut la
// laisser derrière.
test('V74 · CP8 — la bande prime sur le score, y compris quand le score dit l’inverse', () => {
  const gonflee = {
    ...saine('saine'),
    currentExpectedLevel: 5, prereqDepth: 9,
    nextCurriculumNeed: { inDays: 1, day: 200 },
  };
  const retard = enRetard('retard', 40);
  const scores = prioriser([gonflee, retard], { dueAtOf: dueAtOf([gonflee, retard]), now: NOW });
  const sSaine = scores.find((p) => p.id === 'saine');
  const sRetard = scores.find((p) => p.id === 'retard');

  // Le cas n'a d'intérêt que si le score de la fiche SAINE est bien le plus
  // haut. Si un réglage futur inversait cela, le test doit le dire plutôt que
  // de continuer à passer pour une mauvaise raison.
  assert.ok(sSaine.score > sRetard.score,
    `le cas n’est plus discriminant : saine ${sSaine.score} vs retard ${sRetard.score}`);
  assert.equal(scores[0].id, 'retard');
});

test('V74 · CP8 — même avec un score ÉCRASANT, la notion à jour reste derrière', () => {
  // On maximise tout ce qui peut gonfler le score de la fiche saine : niveau
  // promis au plus haut, prérequis profond, projet imminent. Elle doit
  // malgré tout rester derrière une fiche en retard au score modeste.
  const gonflee = {
    ...saine('saine'),
    currentExpectedLevel: 5, prereqDepth: 9,
    nextCurriculumNeed: { inDays: 1, day: 200 },
  };
  const ordre = ordonner([gonflee, enRetard('retard', 40)]).map((p) => p.id);
  assert.equal(ordre[0], 'retard');
});

test('V74 · CP8 — DANS une bande, c’est bien le score qui ordonne', () => {
  const vieux = enRetard('vieux', 120);
  const recent = enRetard('recent', 20);
  const ordre = ordonner([recent, vieux]).map((p) => p.id);
  assert.equal(ordre[0], 'vieux', 'à statut égal, l’ancienneté doit primer');
});

test('V74 · CP8 — rien n’est EXCLU : sans retard, les notions à jour remplissent la séance', () => {
  const p = planifier([saine('a'), saine('b')], {
    now: NOW, formatsOf: () => ['free', 'cued'], recallOf: () => null,
  });
  assert.ok(p.items.length > 0, 'une séance sans retard ne doit pas être vide');
});

test('V74 · CP8 — le tri reste TOTAL, donc déterministe (B2)', () => {
  const fiches = [enRetard('b', 30), enRetard('a', 30), saine('c'), jamaisTentee('d')];
  const un = ordonner(fiches).map((p) => p.id);
  const deux = ordonner([...fiches].reverse()).map((p) => p.id);
  assert.deepEqual(un, deux, 'l’ordre d’entrée ne doit avoir aucun effet');
});

// ── RÈGLE 2 · une séance n'est jamais intégralement composée de retard ─────

test('V74 · CP8 — une notion JAMAIS TENTÉE entre dans la séance même sous une file de retard', () => {
  // Vingt notions en retard : sans place réservée, elles prennent toute la
  // séance et la notion jamais tentée attend indéfiniment — elle n'a pas
  // d'échéance, donc rien ne la fera jamais monter d'elle-même.
  const fiches = [
    ...Array.from({ length: 20 }, (_, i) => enRetard(`r${i}`, 90 + i)),
    jamaisTentee('neuve'),
  ];
  const p = planifier(fiches, {
    now: NOW, budgetMinutes: 20,
    formatsOf: () => ['free', 'cued', 'applied', 'discrim', 'generate'],
    recallOf: () => null,
  });
  assert.ok(p.items.some((i) => i.id === 'neuve'),
    `la notion jamais tentée a été évincée : ${p.items.map((i) => i.id).join(', ')}`);
});

test('V74 · CP8 — la place réservée est TÔT, sinon le budget l’évince avant d’y arriver', () => {
  // Le facteur limitant est le BUDGET, pas le plafond d'unités. Avec un budget
  // qui ne laisse passer que trois unités, une réservation placée en dernière
  // position ne servirait jamais.
  const fiches = [
    ...Array.from({ length: 20 }, (_, i) => enRetard(`r${i}`, 90 + i)),
    jamaisTentee('neuve'),
  ];
  const p = planifier(fiches, {
    now: NOW, budgetMinutes: 9, formatsOf: () => ['cued'], recallOf: () => null,
  });
  assert.ok(p.items.length <= 3, 'le budget doit bien être le facteur limitant ici');
  assert.ok(p.items.some((i) => i.id === 'neuve'),
    `la réservation a été évincée par le budget : ${p.items.map((i) => i.id).join(', ')}`);
});

test('V74 · CP8 — la place réservée coûte EXACTEMENT une unité, pas davantage', () => {
  const fiches = [
    ...Array.from({ length: 20 }, (_, i) => enRetard(`r${i}`, 90 + i)),
    ...Array.from({ length: 5 }, (_, i) => jamaisTentee(`n${i}`)),
  ];
  const p = planifier(fiches, {
    now: NOW, budgetMinutes: 40,
    formatsOf: () => ['cued'], recallOf: () => null,
  });
  const neuves = p.items.filter((i) => i.id.startsWith('n')).length;
  assert.equal(neuves, PLACES_DECOUVERTE,
    `${neuves} notions jamais tentées servies au lieu de ${PLACES_DECOUVERTE}`);
});

test('V74 · CP8 — la première place reste au RETARD : la réservation ne renverse pas la priorité', () => {
  const fiches = [
    ...Array.from({ length: 10 }, (_, i) => enRetard(`r${i}`, 90 + i)),
    jamaisTentee('neuve'),
  ];
  const p = planifier(fiches, {
    now: NOW, budgetMinutes: 30, formatsOf: () => ['cued'], recallOf: () => null,
  });
  assert.notEqual(p.items[0].id, 'neuve', 'la séance doit s’ouvrir sur le plus en retard');
});

test('V74 · CP8 — une notion SOON ou HEALTHY ne bénéficie PAS de la place réservée', () => {
  // Elles ont une échéance : elles deviendront DUE d'elles-mêmes. Seule une
  // notion sans échéance peut mourir de faim, et c'est le seul cas protégé.
  const fiches = [
    ...Array.from({ length: 20 }, (_, i) => enRetard(`r${i}`, 90 + i)),
    saine('saine'),
  ];
  const p = planifier(fiches, {
    now: NOW, budgetMinutes: 12, formatsOf: () => ['cued'], recallOf: () => null,
  });
  assert.ok(!p.items.some((i) => i.id === 'saine'),
    'une notion à jour ne doit pas consommer la place réservée aux notions jamais tentées');
});

// ── les deux règles ne s'annulent pas ─────────────────────────────────────

test('V74 · CP8 — sous file de retard, la séance sert du retard ET la notion neuve', () => {
  const fiches = [
    ...Array.from({ length: 20 }, (_, i) => enRetard(`r${i}`, 90 + i)),
    jamaisTentee('neuve'),
  ];
  const p = planifier(fiches, {
    now: NOW, budgetMinutes: 20, formatsOf: () => ['cued'], recallOf: () => null,
  });
  const retards = p.items.filter((i) => i.id.startsWith('r')).length;
  assert.ok(retards >= 1, 'le retard doit rester majoritairement servi');
  assert.ok(p.items.some((i) => i.id === 'neuve'));
  assert.ok(retards > PLACES_DECOUVERTE,
    'la place réservée ne doit pas devenir la majorité de la séance');
});

test('V74 · CP8 — l’espacement n’est PAS uniformisé : le plan reste déterminé par l’apprenant', () => {
  // Le brief interdit de chercher « 7 jours partout ». Deux fiches de séries
  // différentes doivent recevoir des échéances DIFFÉRENTES — l'uniformité
  // serait le signe que le moteur ignore l'apprenant.
  const court = echeanceDe(f({ lastRetrievalAt: ilYA(10), consecutiveSuccesses: 0 }));
  const long = echeanceDe(f({ lastRetrievalAt: ilYA(10), consecutiveSuccesses: 4 }));
  assert.notEqual(court.intervalDays, long.intervalDays);
  assert.ok(long.intervalDays > court.intervalDays,
    'une série de réussites doit ÉTIRER l’intervalle, pas le figer');
});
