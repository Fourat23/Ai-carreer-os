// V77 · CP4 — CINQ ÉCHECS NE LAISSAIENT QU'UNE TRACE.
//
// ── LE DÉFAUT, MESURÉ EN HTTP AVANT D'ÉCRIRE UNE LIGNE ──────────────────
//
// Sept soumissions humaines sur le même diagnostic, serveur de production :
// cinq échecs `0/5`, une réussite `5/5`, une reprise. État écrit : **2 preuves,
// 0 tentative.** Les quatre échecs suivants recevaient « Ce résultat est déjà
// enregistré. »
//
// Et une seconde mesure, plus gênante : `0/5 → 1/5 → 4/5` gardait `0/5` puis
// `4/5`. La clé de preuve est `sourceType:sourceId:compétences:qualifiante` —
// **elle ignore le score**. Deux échecs de scores différents ont la même clé,
// donc c'est le PREMIER qui survit.
//
//   > Le produit gardait la première tentative et appelait ça un historique.
//
// C'est la cause de V74 · CP2, trois sprints plus tard : persister la
// PROJECTION (la preuve, dédupliquée par nature) et jeter le FAIT (la
// soumission, qui ne se déduplique pas).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  GENRES, SEUIL_PAR_DEFAUT, MAX_ASSESSMENT_ATTEMPTS,
  issueDuDiagnostic, normalizeAssessmentAttempt, normalizeAssessmentAttempts,
  assessmentAttemptKey, estUnRejeu, historiqueDuDiagnostic, lectureDuDiagnostic,
} from '../lib/assessment-attempt.mjs';
import { empreinteReponses } from '../lib/transfer-attempt.mjs';
import { applyCommand, COMMANDS } from '../lib/learning-engine.mjs';
import {
  migrateToV7, writeActiveTrack, activeTrackProgress, emptyFlat, FAITS_DU_PRODUIT,
} from '../lib/progress-store.mjs';
import { serializeBackupV3, parseBackupV3 } from '../lib/backup.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const base = { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} };
const T = (s) => `2026-09-01T10:00:${String(s).padStart(2, '0')}.000Z`;
const cmd = (o = {}) => ({
  type: 'RECORD_ASSESSMENT_ATTEMPT', assessmentId: 'async-messaging-queues',
  passed: 0, total: 5, seuil: 0.7, empreinte: 'q1=0&q2=0',
  provenance: { producer: 'assessment-grader', method: 'POST /api/assessments/[id]' }, ...o,
});

// ── 1 · LE SCÉNARIO EXACT QUE LE CP4 DOIT RENDRE OBSERVABLE ─────────────

test('V77 · CP4 — 5 échecs → réussite → reprise laissent SEPT faits distincts', () => {
  // La demande du sprint, mot pour mot : « 5 échecs → succès → retry → doublon
  // réseau doivent rester des faits distincts ». Sept soumissions humaines,
  // sept faits — et pas deux preuves.
  let p = { ...base };
  const soumissions = [
    { s: 1, passed: 0, emp: 'q1=0&q2=0' },
    { s: 12, passed: 0, emp: 'q1=0&q2=1' },
    { s: 24, passed: 1, emp: 'q1=1&q2=1' },
    { s: 36, passed: 2, emp: 'q1=1&q2=2' },
    { s: 48, passed: 3, emp: 'q1=1&q2=3' },
    { s: 59, passed: 5, emp: 'q1=1&q2=4' },   // le seuil est atteint
    { s: 11, passed: 5, emp: 'q1=1&q2=5' },   // reprise après coup
  ];
  for (const { s, passed, emp } of soumissions) {
    const at = s === 11 ? '2026-09-01T10:02:11.000Z' : T(s);
    const r = applyCommand(p, cmd({ passed, empreinte: emp }), { now: new Date(at) });
    assert.equal(r.ok, true);
    p = r.progress;
  }
  assert.equal(p.assessmentAttempts.length, 7);

  const h = lectureDuDiagnostic(p.assessmentAttempts, 'async-messaging-queues');
  assert.deepEqual(h.scores, ['0/5', '0/5', '1/5', '2/5', '3/5', '5/5', '5/5']);
  assert.equal(h.reussies, 2);
  assert.equal(h.echouees, 5);
});

test('V77 · CP4 — DÉFAUT MESURÉ : sous le seuil, une amélioration n’était pas un doublon', () => {
  // `0/5 → 1/5 → 4/5` : le produit gardait `0/5` et `4/5`, le `1/5` refusé
  // comme doublon parce que la clé de preuve ignore le score. Le fait, lui,
  // identifie un ACTE : trois soumissions, trois faits.
  let p = { ...base };
  for (const [i, passed] of [0, 1, 4].entries()) {
    p = applyCommand(p, cmd({ passed, empreinte: `essai${i}` }), { now: new Date(T(i * 10 + 1)) }).progress;
  }
  assert.deepEqual(
    p.assessmentAttempts.map((a) => `${a.passed}/${a.total}`),
    ['0/5', '1/5', '4/5'],
  );
});

// ── 2 · CE QUI DOIT ÊTRE FUSIONNÉ, ET CE QUI NE DOIT PAS L'ÊTRE ─────────

test('V77 · CP4 — un doublon réseau ne crée pas un huitième fait', () => {
  const r1 = applyCommand({ ...base }, cmd(), { now: new Date(T(1)) });
  const r2 = applyCommand(r1.progress, cmd(), { now: new Date(T(1)) });
  assert.deepEqual(r2.effects, ['noop:assessment-attempt:duplicate']);
  assert.equal(r2.progress.assessmentAttempts.length, 1);
});

test('V77 · CP4 — « corriger puis conserver » est UNE pensée, pas deux tentatives', () => {
  // L'interface appelle la route deux fois avec les MÊMES réponses : d'abord
  // pour corriger (`submit`), puis pour conserver (`keep`). Sans cette garde,
  // chaque diagnostic conservé compterait double et GONFLERAIT la courbe
  // d'échecs au lieu de la révéler.
  const r1 = applyCommand({ ...base }, cmd(), { now: new Date(T(1)) });
  const r2 = applyCommand(r1.progress, cmd(), { now: new Date(T(6)) }); // 5 s plus tard
  assert.deepEqual(r2.effects, ['noop:assessment-attempt:replay']);
  assert.equal(r2.progress.assessmentAttempts.length, 1);
});

test('V77 · CP4 — passé la fenêtre de rejeu, une soumission identique est un fait NEUF', () => {
  // Répondre deux fois la même chose à une minute d'intervalle n'est pas un
  // rejeu réseau : c'est quelqu'un qui réessaie sans rien changer, et c'est
  // une observation utile.
  const r1 = applyCommand({ ...base }, cmd(), { now: new Date(T(1)) });
  const r2 = applyCommand(r1.progress, cmd(), { now: new Date('2026-09-01T10:01:30.000Z') });
  assert.deepEqual(r2.effects, ['assessment-attempt:recorded']);
  assert.equal(r2.progress.assessmentAttempts.length, 2);
});

test('V77 · CP4 — des réponses DIFFÉRENTES à la même seconde sont deux faits', () => {
  const r1 = applyCommand({ ...base }, cmd({ empreinte: 'a=1' }), { now: new Date(T(1)) });
  const r2 = applyCommand(r1.progress, cmd({ empreinte: 'a=2' }), { now: new Date(T(1)) });
  assert.equal(r2.progress.assessmentAttempts.length, 2);
});

test('V77 · CP4 — l’empreinte ne dépend pas de l’ordre de sérialisation du client', () => {
  assert.equal(
    empreinteReponses({ q2: [3, 1], q1: 0 }),
    empreinteReponses({ q1: 0, q2: [1, 3] }),
  );
});

// ── 3 · L'ISSUE EST DÉRIVÉE, JAMAIS REÇUE ──────────────────────────────

test('V77 · CP4 — l’issue vient des compteurs et du seuil DÉCLARÉ, pas de l’appelant', () => {
  // Une issue fournie par celui qu'elle juge n'est pas une observation.
  const a = normalizeAssessmentAttempt(
    { assessmentId: 'x', passed: 0, total: 5, seuil: 0.7, outcome: 'success', reussiteGlobale: true, provenance: { producer: 'p' } },
    { now: T(1) },
  );
  assert.equal(a.outcome, 'failure');
  assert.equal(a.reussiteGlobale, false);
});

test('V77 · CP4 — le seuil de la fixture est recopié dans le fait, pas réinventé', () => {
  // 4/5 = 0,8 : au-dessus de 0,7, en dessous de 0,9. Le même score change de
  // sens selon le seuil déclaré — donc le seuil appartient au fait.
  const souple = normalizeAssessmentAttempt({ assessmentId: 'x', passed: 4, total: 5, seuil: 0.7, provenance: { producer: 'p' } }, { now: T(1) });
  const strict = normalizeAssessmentAttempt({ assessmentId: 'x', passed: 4, total: 5, seuil: 0.9, provenance: { producer: 'p' } }, { now: T(1) });
  assert.equal(souple.reussiteGlobale, true);
  assert.equal(strict.reussiteGlobale, false);
  assert.equal(souple.seuil, 0.7);
  assert.equal(strict.seuil, 0.9);
});

test('V77 · CP4 — un seuil absent ou absurde retombe sur celui du produit, jamais sur 0', () => {
  for (const seuil of [undefined, 0, -1, 2, 'beaucoup']) {
    const a = normalizeAssessmentAttempt({ assessmentId: 'x', passed: 0, total: 5, seuil, provenance: { producer: 'p' } }, { now: T(1) });
    assert.equal(a.seuil, SEUIL_PAR_DEFAUT);
    assert.equal(a.reussiteGlobale, false, 'un seuil absurde ne doit jamais rendre un 0/5 réussi');
  }
});

test('V77 · CP4 — `issueDuDiagnostic` : trois cas, aucun arrondi flatteur', () => {
  assert.equal(issueDuDiagnostic(5, 5, 0.7), 'success');
  assert.equal(issueDuDiagnostic(4, 5, 0.7), 'success');   // 0,8 ≥ 0,7
  assert.equal(issueDuDiagnostic(3, 5, 0.7), 'partial');   // 0,6 < 0,7
  assert.equal(issueDuDiagnostic(0, 5, 0.7), 'failure');
  assert.equal(issueDuDiagnostic(0, 0, 0.7), 'failure');   // rien soumis ≠ réussi
});

// ── 4 · CE QUE LE FAIT N'A PAS LE DROIT D'ÊTRE ─────────────────────────

test('V77 · CP4 — le fait ne porte AUCUN vocabulaire de maîtrise', () => {
  // `transformer assessment en mastery` est nommément interdit. Le garder vrai
  // se vérifie sur les CLÉS du fait, pas dans un commentaire.
  const a = normalizeAssessmentAttempt({ assessmentId: 'x', passed: 5, total: 5, provenance: { producer: 'p' } }, { now: T(1) });
  const cles = JSON.stringify(Object.keys(a));
  for (const interdit of ['mastery', 'maitrise', 'niveau', 'level', 'percentile', 'rang', 'score']) {
    assert.equal(cles.toLowerCase().includes(interdit), false, `« ${interdit} » ne doit pas être un champ du fait`);
  }
  const src = lire('lib/assessment-attempt.mjs').split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
  for (const interdit of ['mastery', 'percentile', 'ranking']) {
    assert.equal(src.includes(interdit), false, `le module ne doit pas calculer « ${interdit} »`);
  }
});

test('V77 · CP4 — la lecture rend des NOMBRES, jamais un jugement', () => {
  let p = { ...base };
  for (const [i, passed] of [0, 2, 5].entries()) {
    p = applyCommand(p, cmd({ passed, empreinte: `e${i}` }), { now: new Date(T(i * 20 + 1)) }).progress;
  }
  const l = lectureDuDiagnostic(p.assessmentAttempts, 'async-messaging-queues');
  assert.match(l.lecture, /0\/5 → 2\/5 → 5\/5/);
  for (const interdit of ['progress', 'stagn', 'maîtris', 'maitris', 'bon', 'mauvais']) {
    assert.equal(l.lecture.toLowerCase().includes(interdit), false, `la lecture ne doit pas juger (« ${interdit} »)`);
  }
});

test('V77 · CP4 — aucune soumission n’est une DONNÉE, pas un trou', () => {
  const l = lectureDuDiagnostic([], 'jamais-tente');
  assert.equal(l.tentatives, 0);
  assert.deepEqual(l.scores, []);
  assert.match(l.lecture, /Aucune soumission observée/);
});

// ── 5 · DISCIPLINE COMMUNE DES FAITS DU PRODUIT ────────────────────────

test('V77 · CP4 — provenance obligatoire, horloge serveur, version de schéma', () => {
  assert.equal(normalizeAssessmentAttempt({ assessmentId: 'x', passed: 0, total: 5 }, { now: T(1) }), null);
  const a = normalizeAssessmentAttempt({ assessmentId: 'x', passed: 0, total: 5, provenance: { producer: 'p' } }, { now: T(1) });
  assert.equal(a.at, T(1));
  assert.equal(a.grain, 'assessment');
  assert.ok(Number.isInteger(a.schemaVersion));
});

test('V77 · CP4 — le genre est un vocabulaire FERMÉ, et le défaut est le plus modeste', () => {
  assert.deepEqual([...GENRES], ['assessment', 'capstone']);
  const inconnu = normalizeAssessmentAttempt({ assessmentId: 'x', kind: 'mission', passed: 0, total: 1, provenance: { producer: 'p' } }, { now: T(1) });
  assert.equal(inconnu.kind, 'assessment');
  const c = normalizeAssessmentAttempt({ assessmentId: 'x', kind: 'capstone', simulation: true, passed: 0, total: 1, provenance: { producer: 'p' } }, { now: T(1) });
  assert.equal(c.kind, 'capstone');
  assert.equal(c.simulation, true);
});

test('V77 · CP4 — `simulation` est un BOOLÉEN, pas une phrase (dette D9)', () => {
  const a = normalizeAssessmentAttempt({ assessmentId: 'x', simulation: 'environnement simulé', passed: 0, total: 1, provenance: { producer: 'p' } }, { now: T(1) });
  assert.equal(a.simulation, false, 'du texte ne vaut pas une marque de simulation');
});

test('V77 · CP4 — une commande invalide échoue proprement, sans fait approximatif', () => {
  const r = applyCommand({ ...base }, cmd({ assessmentId: '' }), { now: new Date(T(1)) });
  assert.equal(r.ok, false);
  assert.equal(r.code, 'INVALID_ASSESSMENT_ATTEMPT');
});

test('V77 · CP4 — la liste persistée est triée et bornée', () => {
  const brut = [];
  for (let i = 0; i < MAX_ASSESSMENT_ATTEMPTS + 20; i += 1) {
    brut.push({ at: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString(), assessmentId: 'x', passed: 0, total: 1, empreinte: `e${i}`, provenance: { producer: 'p' } });
  }
  const n = normalizeAssessmentAttempts(brut);
  assert.equal(n.length, MAX_ASSESSMENT_ATTEMPTS);
  const dates = n.map((a) => a.at);
  assert.deepEqual(dates, [...dates].sort());
});

// ── 6 · LE DISQUE, ET LES QUATRE LISTES BLANCHES ───────────────────────

test('V77 · CP4 — le fait survit au disque ET à sa propre sauvegarde', () => {
  const r = applyCommand(activeTrackProgress(migrateToV7({})), cmd({ passed: 3 }), { now: new Date(T(1)) });
  const v3 = writeActiveTrack(migrateToV7({}), r.progress);

  const relu = activeTrackProgress(JSON.parse(JSON.stringify(v3)));
  assert.equal(relu.assessmentAttempts.length, 1);
  assert.equal(relu.assessmentAttempts[0].passed, 3);

  const restaure = parseBackupV3(JSON.stringify(serializeBackupV3(v3, {})), new Map());
  assert.equal(restaure.ok, true);
  const t = restaure.v3.tracks[restaure.v3.activeTrackId];
  assert.equal(t.assessmentAttempts.length, 1, 'perdu à la restauration de sa propre sauvegarde');

  assert.equal(FAITS_DU_PRODUIT.includes('assessmentAttempts'), true);
  assert.ok(Array.isArray(emptyFlat().assessmentAttempts));
});

// ── 7 · LA ROUTE ÉCRIT LE FAIT, ET AU BON ENDROIT ──────────────────────

test('V77 · CP4 — la route écrit la tentative AVANT la branche `record`', () => {
  // Le point décisif du checkpoint. L'interface corrige d'abord sans conserver
  // (`submit`) et ne conserve qu'ensuite (`keep`) : n'écrire que sous `record`
  // reviendrait à n'observer que les tentatives dont l'apprenant est assez
  // content pour les garder — la dissymétrie exacte que V74 · CP2 a corrigée.
  const src = lire('app/api/assessments/[id]/route.ts');
  const iFait = src.indexOf('RECORD_ASSESSMENT_ATTEMPT');
  const iRecord = src.indexOf('if (body.record !== true)');
  assert.ok(iFait > 0, 'la route n’écrit aucune tentative');
  assert.ok(iRecord > iFait, 'la tentative n’est écrite que si l’apprenant conserve');
  // Et le seuil vient de la fixture, pas d'une constante recopiée dans la route.
  assert.ok(src.includes('assessment.passThreshold'));
  assert.equal(COMMANDS.includes('RECORD_ASSESSMENT_ATTEMPT'), true);
});

test('V77 · CP4 — enregistrer une tentative ne crée AUCUNE preuve', () => {
  // On part de la progression NORMALISÉE : le moteur renormalise son entrée, et
  // comparer à un objet partiel ferait passer des champs simplement complétés
  // pour des champs modifiés.
  const avant = activeTrackProgress(migrateToV7({}));
  const r = applyCommand(avant, cmd({ passed: 5 }), { now: new Date(T(1)) });
  const bouge = Object.keys({ ...avant, ...r.progress })
    .filter((k) => JSON.stringify(r.progress[k]) !== JSON.stringify(avant[k]));
  assert.deepEqual(bouge, ['assessmentAttempts']);
});

test('V77 · CP4 — une tentative réussie ne se transforme pas en preuve qualifiante toute seule', () => {
  // La preuve reste produite par la route, avec sa propre clé et sa propre
  // déduplication. Le fait ne la remplace pas et ne la double pas.
  const r = applyCommand({ ...base }, cmd({ passed: 5 }), { now: new Date(T(1)) });
  assert.equal(r.progress.assessmentAttempts[0].reussiteGlobale, true);
  assert.equal((r.progress.evidence ?? []).length, 0);
});
