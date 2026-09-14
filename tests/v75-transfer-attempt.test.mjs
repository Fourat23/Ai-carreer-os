// V75 · CP10 — `TransferAttempt` : le septième fait, et le dernier manquant.
//
// ── LA DISSYMÉTRIE QUE CE FAIT CORRIGE ──────────────────────────────────
//
// Le CP9 a rendu les 25 défis atteignables. Le produit écrivait alors une
// PREUVE quand l'apprenant conserve un résultat — et **rien du tout** quand le
// défi échoue, ou quand il réussit sans être conservé.
//
// C'est mot pour mot le défaut corrigé au CP2 de V74 pour les exercices :
// *« le système persistait la projection et jetait le fait. »* Sur un défi de
// transfert, l'échec est l'information la PLUS utile — c'est lui qui dit que la
// notion tient chez elle et cède ailleurs.
//
// ── CE QUI EST GARDÉ ICI ────────────────────────────────────────────────
//
//   · succès / partiel / échec, et **rien d'autre** (§10.2) ;
//   · cardinalité réelle des concepts et compétences (§10.1) ;
//   · une reprise est un fait NEUF, la précédente n'est jamais écrasée (§10.4) ;
//   · un rejeu réseau n'est pas une tentative humaine (§10.5) ;
//   · **`TRANSFER_SUCCESS != MASTERY`** (§10.3) ;
//   · la chaîne réelle UI → route → moteur → persistance → projection (§10.6).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  normalizeTransferAttempt, normalizeTransferAttempts, transferAttemptKey,
  outcomeDuTransfert, empreinteReponses, estUnRejeu, historiqueDuDefi,
  TRANSFER_OUTCOMES, FENETRE_REJEU_MS,
} from '../lib/transfer-attempt.mjs';
import { applyCommand } from '../lib/learning-engine.mjs';
import { projectLearnerMemory, collectContacts } from '../lib/learner-memory.mjs';
import { FAITS } from '../lib/event-model.mjs';
import { migrateToV7, writeActiveTrack, activeTrackProgress, emptyFlat } from '../lib/progress-store.mjs';

const vide = emptyFlat();

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const code = (p) => lire(p).split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');

const T0 = '2026-09-01T10:00:00.000Z';
const plus = (ms) => new Date(Date.parse(T0) + ms).toISOString();
const base = { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} };

const cmd = (o = {}) => ({
  type: 'RECORD_TRANSFER_ATTEMPT',
  challengeId: 'idempotence-http-to-queue',
  conceptIds: ['api-production-contracts', 'async-messaging-queues'],
  competencyIds: ['http', 'archi'],
  passed: 3, total: 3,
  empreinte: 'q1=0&q2=[0,1]&q3=1',
  sourceRef: '/transfer/idempotence-http-to-queue',
  provenance: { producer: 'transfer-grader', method: 'transfer-challenge' },
  ...o,
});

// ── LE CONTRAT DU CP2 EST RESPECTÉ À LA LETTRE ──────────────────────────

test('V75 · CP10 — le fait est celui que le CP2 avait DÉCLARÉ', () => {
  // Le contrat a inscrit `TransferAttempt` dans `FAITS` avant qu'il existe :
  // c'est le contrat qui décide de la forme, pas l'implémentation.
  const decl = FAITS.find((f) => f.nom === 'TransferAttempt');
  assert.ok(decl, 'le fait n’est plus déclaré au contrat');
  assert.equal(decl.grain, 'challenge');
  for (const prop of ['provenance', 'cle', 'horodate', 'version', 'conceptId']) {
    assert.ok(decl[prop], `le contrat exigeait ${prop}`);
  }
  const a = normalizeTransferAttempt(cmd({ at: T0 }), { now: T0 });
  assert.equal(a.grain, 'challenge');
  assert.equal(a.provenance.producer, 'transfer-grader');
  assert.ok(a.schemaVersion >= 2);
  assert.ok(transferAttemptKey(a).length > 0);
  assert.ok(Array.isArray(a.conceptIds));
});

test('V75 · CP10 — l’horloge vient du SERVEUR, jamais du client', () => {
  const a = normalizeTransferAttempt(cmd({ at: '1999-01-01T00:00:00.000Z' }), { now: T0 });
  // `normalizeEnvelope` prend `at` s'il est fourni PAR L'APPELANT SERVEUR ;
  // la route passe `nowIso`. Ce qu'on garde ici, c'est qu'un `at` absent ne
  // laisse jamais le fait sans date.
  const sansDate = normalizeTransferAttempt(cmd({ at: null }), { now: T0 });
  assert.equal(sansDate.at, T0);
  assert.ok(a.at);
});

// ── §10.2 · TROIS ISSUES, PAS UNE DE PLUS ───────────────────────────────

test('V75 · CP10 — success / partial / failure, et rien d’autre', () => {
  assert.deepEqual(TRANSFER_OUTCOMES, ['success', 'partial', 'failure']);
  assert.equal(outcomeDuTransfert(3, 3), 'success');
  assert.equal(outcomeDuTransfert(2, 3), 'partial');
  assert.equal(outcomeDuTransfert(0, 3), 'failure');
});

test('V75 · CP10 — l’issue est DÉRIVÉE, jamais reçue de l’appelant', () => {
  // Une issue fournie par celui qu'elle juge n'est pas une observation.
  const a = normalizeTransferAttempt(cmd({ passed: 0, total: 3, outcome: 'success' }), { now: T0 });
  assert.equal(a.outcome, 'failure', 'un appelant ne doit pas pouvoir s’auto-décerner un succès');
  assert.equal(a.validation.status, 'failed');
});

// ── §10.1 · LA CARDINALITÉ RÉELLE ───────────────────────────────────────

test('V75 · CP10 — plusieurs concepts et plusieurs compétences sont PRÉSERVÉS', () => {
  const a = normalizeTransferAttempt(cmd(), { now: T0 });
  assert.equal(a.conceptIds.length, 2);
  assert.equal(a.competencyIds.length, 2);
});

test('V75 · CP10 — aucun forçage au concept unique', () => {
  const src = lire('lib/transfer-attempt.mjs');
  assert.doesNotMatch(src, /conceptIds\[0\]|conceptId:\s*.*\[0\]/,
    'réduire la liste à son premier élément serait choisir au hasard');
});

// ── §10.3 · UN SUCCÈS N'EST PAS UNE MAÎTRISE ────────────────────────────

test('V75 · CP10 — le fait ne porte AUCUNE maîtrise ni probabilité', () => {
  const a = normalizeTransferAttempt(cmd(), { now: T0 });
  for (const interdit of ['mastery', 'maitrise', 'probability', 'memoryScore', 'confidence', 'niveau']) {
    assert.ok(!(interdit in a), `le fait porte un champ interdit : ${interdit}`);
  }
  // Ce qu'il porte est daté et circonstancié : CE défi, CE contexte, CET instant.
  assert.equal(a.challengeId, 'idempotence-http-to-queue');
  assert.equal(a.submittedAt, T0);
  assert.equal(a.sourceRef, '/transfer/idempotence-http-to-queue');
});

test('V75 · CP10 — aucun module du transfert n’invente de maîtrise', () => {
  for (const f of ['lib/transfer-attempt.mjs', 'app/api/transfer/[id]/route.ts']) {
    const src = code(f);
    assert.doesNotMatch(src, /\b(mastery|masteryLevel|forgettingProbability|memoryScore)\b/,
      `${f} fabrique un état interdit`);
  }
});

test('V75 · CP10 — `startedAt` du client est DÉCLARÉ, et nommé comme tel', () => {
  // Le serveur ne peut pas savoir quand l'apprenant a ouvert le défi. On accepte
  // sa valeur sans la maquiller en mesure — décision `scoreDeclare` du CP2.
  const a = normalizeTransferAttempt(cmd({ startedAtDeclare: plus(-60_000) }), { now: T0 });
  assert.equal(a.startedAtDeclare, plus(-60_000));
  assert.ok(!('startedAt' in a), 'le champ ne doit pas prétendre être mesuré');
  // Une ouverture postérieure à la soumission est refusée : on ne commence pas
  // une tentative après l'avoir finie.
  const faux = normalizeTransferAttempt(cmd({ startedAtDeclare: plus(60_000) }), { now: T0 });
  assert.equal(faux.startedAtDeclare, null);
});

// ── §10.4 · UNE REPRISE EST UN FAIT NEUF ────────────────────────────────

test('V75 · CP10 — failure → partial → success est RECONSTRUCTIBLE', () => {
  let p = base;
  const etapes = [
    { passed: 0, total: 3, at: plus(0), empreinte: 'a' },
    { passed: 2, total: 3, at: plus(60_000), empreinte: 'b' },
    { passed: 3, total: 3, at: plus(120_000), empreinte: 'c' },
  ];
  for (const e of etapes) {
    const r = applyCommand(p, cmd(e), { now: new Date(e.at) });
    assert.ok(r.ok, r.error);
    p = r.progress;
  }
  const h = historiqueDuDefi(p.transferAttempts, 'idempotence-http-to-queue');
  assert.deepEqual(h.map((a) => a.outcome), ['failure', 'partial', 'success']);
  // La première tentative n'a été ni écrasée ni corrigée.
  assert.equal(h[0].passed, 0);
  assert.equal(h[0].at, plus(0));
});

test('V75 · CP10 — `retryOf` chaîne la reprise sur la précédente', () => {
  let p = base;
  const r1 = applyCommand(p, cmd({ passed: 0, empreinte: 'a' }), { now: new Date(plus(0)) });
  p = r1.progress;
  const r2 = applyCommand(p, cmd({ passed: 3, empreinte: 'b' }), { now: new Date(plus(60_000)) });
  p = r2.progress;
  const h = historiqueDuDefi(p.transferAttempts, 'idempotence-http-to-queue');
  assert.equal(h[0].retryOf, null, 'la première tentative ne reprend rien');
  assert.equal(h[1].retryOf, transferAttemptKey(h[0]), 'la seconde doit pointer la première');
});

test('V75 · CP10 — une reprise APRÈS un succès reste enregistrée', () => {
  // Réessayer un défi déjà réussi est un fait légitime : le produit ne décide
  // pas qu'il n'y a plus rien à apprendre.
  let p = applyCommand(base, cmd({ passed: 3, empreinte: 'a' }), { now: new Date(plus(0)) }).progress;
  const r = applyCommand(p, cmd({ passed: 1, empreinte: 'b' }), { now: new Date(plus(86_400_000)) });
  assert.ok(r.ok);
  const h = historiqueDuDefi(r.progress.transferAttempts, 'idempotence-http-to-queue');
  assert.deepEqual(h.map((a) => a.outcome), ['success', 'partial']);
});

// ── §10.5 · DÉDUPLICATION ───────────────────────────────────────────────

test('V75 · CP10 — l’empreinte des réponses est STABLE', () => {
  // Sans stabilité, un simple changement d'ordre de clés créerait une fausse
  // « nouvelle tentative ».
  assert.equal(
    empreinteReponses({ q2: [1, 0], q1: 0 }),
    empreinteReponses({ q1: 0, q2: [0, 1] }),
  );
  assert.notEqual(empreinteReponses({ q1: 0 }), empreinteReponses({ q1: 1 }));
});

test('V75 · CP10 — une requête réseau REJOUÉE ne crée pas deux faits', () => {
  const p1 = applyCommand(base, cmd(), { now: new Date(plus(0)) }).progress;
  const r2 = applyCommand(p1, cmd(), { now: new Date(plus(1200)) });
  assert.ok(r2.ok);
  assert.ok(r2.effects.some((e) => e.startsWith('noop:')), 'un rejeu doit être un no-op');
  assert.equal(r2.progress.transferAttempts.length, 1);
});

test('V75 · CP10 — au-delà de la fenêtre, c’est une VRAIE tentative', () => {
  const p1 = applyCommand(base, cmd(), { now: new Date(plus(0)) }).progress;
  const r2 = applyCommand(p1, cmd(), { now: new Date(plus(FENETRE_REJEU_MS + 1000)) });
  assert.ok(r2.ok);
  assert.equal(r2.progress.transferAttempts.length, 2,
    'resoumettre une heure plus tard est une tentative, pas un rejeu');
});

test('V75 · CP10 — des réponses DIFFÉRENTES ne sont jamais un rejeu', () => {
  const a = normalizeTransferAttempt(cmd({ empreinte: 'a' }), { now: plus(0) });
  const b = normalizeTransferAttempt(cmd({ empreinte: 'b' }), { now: plus(500) });
  assert.equal(estUnRejeu(b, a), false);
});

test('V75 · CP10 — la clé métier distingue défi, seconde et réponses', () => {
  const a = normalizeTransferAttempt(cmd(), { now: plus(0) });
  const memeSeconde = normalizeTransferAttempt(cmd(), { now: plus(400) });
  assert.equal(transferAttemptKey(a), transferAttemptKey(memeSeconde));
  const autreDefi = normalizeTransferAttempt(cmd({ challengeId: 'autre' }), { now: plus(0) });
  assert.notEqual(transferAttemptKey(a), transferAttemptKey(autreDefi));
});

// ── DÉTERMINISME ET REJOUABILITÉ ────────────────────────────────────────

test('V75 · CP10 — la normalisation est déterministe et rejouable', () => {
  const a = normalizeTransferAttempt(cmd(), { now: T0 });
  const b = normalizeTransferAttempt(cmd(), { now: T0 });
  assert.deepEqual(a, b);
  // Et la liste se trie par DATE, jamais par ordre d'insertion.
  const desordre = [
    normalizeTransferAttempt(cmd({ empreinte: 'c' }), { now: plus(200_000) }),
    normalizeTransferAttempt(cmd({ empreinte: 'a' }), { now: plus(0) }),
    normalizeTransferAttempt(cmd({ empreinte: 'b' }), { now: plus(100_000) }),
  ];
  assert.deepEqual(normalizeTransferAttempts(desordre).map((x) => x.empreinte), ['a', 'b', 'c']);
});

test('V75 · CP10 — un fait mal formé est REFUSÉ, jamais réparé en silence', () => {
  assert.equal(normalizeTransferAttempt({ challengeId: '', passed: 1, total: 1 }, { now: T0 }), null);
  assert.equal(normalizeTransferAttempt(cmd({ challengeId: '' }), { now: T0 }), null);
  const r = applyCommand(base, cmd({ challengeId: '' }), { now: new Date(T0) });
  assert.equal(r.ok, false);
  assert.equal(r.code, 'INVALID_TRANSFER_ATTEMPT');
});

// ── §10.6 · LA CHAÎNE RÉELLE, DE BOUT EN BOUT ───────────────────────────

test('V75 · CP10 — la ROUTE écrit le fait, réussi OU NON, sans attendre `record`', () => {
  const route = code('app/api/transfer/[id]/route.ts');
  assert.match(route, /type: 'RECORD_TRANSFER_ATTEMPT'/, 'la route doit émettre la commande');
  // Le fait est écrit AVANT le garde-fou de la preuve : un échec, qui ne
  // produit jamais de preuve, doit quand même laisser une trace.
  const iFait = route.indexOf("RECORD_TRANSFER_ATTEMPT");
  const iGarde = route.indexOf('body.record !== true');
  assert.ok(iFait >= 0 && iGarde > iFait,
    'le fait doit être écrit avant le retour anticipé, sinon l’échec ne laisse rien');
});

test('V75 · CP10 — la route passe par le MOTEUR, pas par une écriture à la main', () => {
  const route = code('app/api/transfer/[id]/route.ts');
  assert.match(route, /applyCommand\(/);
  assert.doesNotMatch(route, /transferAttempts:\s*\[/,
    'la route ne doit pas fabriquer la liste elle-même : le moteur chaîne et déduplique');
});

test('V75 · CP10 — le fait atteint la PROJECTION (chaîne complète)', () => {
  // V74 a payé cher la leçon inverse : six modules écrits, aucun atteignable.
  const p = applyCommand(base, cmd({ passed: 0 }), { now: new Date(T0) }).progress;
  const contacts = collectContacts({ days: {}, transferAttempts: p.transferAttempts });
  const c = contacts.find((x) => x.kind === 'transfer');
  assert.ok(c, 'la tentative ne parvient pas au collecteur de contacts');
  assert.equal(c.outcome, 'failed');

  const proj = projectLearnerMemory({
    facts: { days: {}, transferAttempts: p.transferAttempts },
    context: { conceptDays: {}, conceptSkills: {}, skills: ['http', 'archi'] },
    now: T0,
  });
  const echecs = proj.competencies.reduce((n, f) => n + (f.transfersEchoues ?? 0), 0);
  assert.ok(echecs > 0, 'un échec au transfert reste invisible dans la projection');
});

test('V75 · CP10 — un SUCCÈS est compté une fois, pas deux', () => {
  // Deux sources disent « ce défi a été réussi » : la tentative et la preuve.
  // Les additionner compterait deux fois le même fait.
  const p = applyCommand(base, cmd({ passed: 3 }), { now: new Date(T0) }).progress;
  const evidence = [{
    id: 'idempotence-http-to-queue', sourceType: 'transfer-challenge',
    sourceId: 'idempotence-http-to-queue', competencyIds: ['http'], createdAt: T0,
    validation: { status: 'passed', kind: 'assessment-grade', checkedAt: T0 },
  }];
  const proj = projectLearnerMemory({
    facts: { days: {}, transferAttempts: p.transferAttempts, evidence },
    context: { conceptDays: {}, conceptSkills: {}, skills: ['http'] },
    now: T0,
  });
  const f = proj.competencies.find((x) => x.id === 'http');
  assert.equal(f.transfers, 1, 'le même défi réussi ne doit compter qu’une fois');
});

test('V75 · CP10 — un ÉCHEC ne gonfle jamais le compteur de succès', () => {
  // Mutation restée verte au premier passage : compter tout contact de
  // transfert comme une réussite. Mes tests n'utilisaient que des succès, si
  // bien que « échec = succès » passait inaperçu — c'est précisément le
  // contournement que tout ce checkpoint existe pour empêcher.
  const p = applyCommand(base, cmd({ passed: 0 }), { now: new Date(T0) }).progress;
  const proj = projectLearnerMemory({
    facts: { days: {}, transferAttempts: p.transferAttempts },
    context: { conceptDays: {}, conceptSkills: {}, skills: ['http', 'archi'] },
    now: T0,
  });
  for (const f of proj.competencies) {
    assert.equal(f.transfers, 0, `${f.id} compte un transfert réussi là où il n’y a qu’un échec`);
  }
  assert.ok(proj.competencies.some((f) => f.transfersEchoues > 0), 'l’échec doit être compté comme tel');
});

test('V75 · CP10 — un PARTIEL n’est pas un succès non plus', () => {
  const p = applyCommand(base, cmd({ passed: 2, total: 3 }), { now: new Date(T0) }).progress;
  assert.equal(p.transferAttempts[0].outcome, 'partial');
  const proj = projectLearnerMemory({
    facts: { days: {}, transferAttempts: p.transferAttempts },
    context: { conceptDays: {}, conceptSkills: {}, skills: ['http'] },
    now: T0,
  });
  assert.equal(proj.competencies.find((f) => f.id === 'http').transfers, 0);
});

test('V75 · CP10 — les read-models transmettent le fait', () => {
  for (const f of ['lib/plan-jour-server.ts', 'lib/backlog-server.ts']) {
    assert.match(code(f), /transferAttempts:\s*progress\.transferAttempts/,
      `${f} ne transmet pas le septième fait à la projection`);
  }
});

test('V75 · CP10 — l’échec au transfert est VISIBLE sur la surface', () => {
  const plan = code('lib/plan-jour-server.ts');
  assert.match(plan, /transfertsEchoues:/, 'le read-model doit exposer le compteur');
  const page = code('app/retention/page.tsx');
  assert.match(page, /\{plan\.transfertsEchoues > 0 &&/, 'la page doit le rendre');
  assert.match(page, /\{plan\.transfertsEchoues\}/, 'le nombre doit être affiché, pas seulement testé');
});

test('V75 · CP10 — le compteur atteint le grain CONCEPT, celui que la page lit', () => {
  // Vérification faite après coup : la page filtre `projection.concepts` sur
  // `firstExposureAt`. Un compteur qui ne vivrait qu'au grain COMPÉTENCE ne
  // remonterait jamais à l'écran, et le panneau resterait vide en silence.
  const CTX = {
    conceptDays: { 'api-production-contracts': [3] },
    conceptSkills: { 'api-production-contracts': ['http'] },
    dayConcepts: new Map([[3, ['api-production-contracts']]]),
    skills: ['http'], projectDays: [],
  };
  const jours = { 3: { status: 'done', startedAt: '2026-08-01T08:00:00.000Z', updatedAt: '2026-08-01T08:00:00.000Z' } };
  const p = applyCommand(base, cmd({
    challengeId: 'c1', conceptIds: ['api-production-contracts'],
    competencyIds: ['http'], passed: 0,
  }), { now: new Date('2026-08-20T10:00:00.000Z') }).progress;

  const proj = projectLearnerMemory({
    facts: { days: jours, transferAttempts: p.transferAttempts }, context: CTX, now: T0,
  });
  const f = proj.concepts.find((x) => x.id === 'api-production-contracts');
  assert.ok(f.firstExposureAt, 'la notion doit être rencontrée pour apparaître');
  assert.equal(f.transfersEchoues, 1, 'le grain CONCEPT doit porter l’échec de transfert');
});

test('V75 · CP10 — AUCUN fait n’est perdu par le disque (les DEUX listes blanches)', () => {
  // `flatOf` filtre à l'écriture, `activeTrackProgress` à la lecture. Un champ
  // oublié dans l'une ou l'autre est écrit puis invisible — trouvé en HTTP, et
  // il manquait dans les deux, pour DEUX faits (tentative de transfert **et**
  // pause du curriculum, restée non persistée depuis le CP7).
  const attendus = ['days', 'skills', 'weeklyReviews', 'monthlyReviews',
    'evidence', 'recallAttempts', 'exerciseAttempts', 'transferAttempts'];
  for (const champ of attendus) {
    assert.ok(champ in vide, `emptyFlat() ne déclare pas ${champ}`);
  }

  let v3 = migrateToV7({});
  const r = applyCommand(activeTrackProgress(v3), cmd({ passed: 0 }), { now: new Date(T0) });
  v3 = writeActiveTrack(v3, r.progress);
  assert.equal(activeTrackProgress(v3).transferAttempts.length, 1,
    'la tentative ne survit pas à un aller-retour disque');

  const pause = applyCommand(activeTrackProgress(v3), { type: 'SET_CURRICULUM_PAUSE', paused: true }, { now: new Date(T0) });
  v3 = writeActiveTrack(v3, pause.progress);
  assert.equal(activeTrackProgress(v3).curriculumPause?.paused, true,
    'la pause du curriculum ne survit pas à un aller-retour disque (défaut P7)');
});

test('V75 · CP10 — une reprise survit à l’aller-retour disque, sans écraser', () => {
  let v3 = migrateToV7({});
  for (const [passed, e, at] of [[0, 'x', T0], [3, 'y', plus(120_000)]]) {
    const r = applyCommand(activeTrackProgress(v3), cmd({ passed, empreinte: e }), { now: new Date(at) });
    v3 = writeActiveTrack(v3, r.progress);
  }
  const a = activeTrackProgress(v3).transferAttempts;
  assert.deepEqual(a.map((x) => x.outcome), ['failure', 'success']);
  assert.equal(a[1].retryOf, transferAttemptKey(a[0]));
});

test('V75 · CP10 — la progression accueille le fait sans migration', () => {
  // Aucune migration destructive : une progression sans `transferAttempts` se
  // lit exactement comme avant.
  const proj = projectLearnerMemory({
    facts: { days: {}, evidence: [] },
    context: { conceptDays: {}, conceptSkills: {}, skills: ['http'] },
    now: T0,
  });
  const f = proj.competencies.find((x) => x.id === 'http');
  assert.equal(f.transfers, 0);
  assert.equal(f.transfersEchoues, 0);
});
