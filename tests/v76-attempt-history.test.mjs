// V76 · CP10 — L'HISTORIQUE DES TENTATIVES, ET LA COMPARAISON.
//
// ── CE QUE CES TESTS GARDENT ────────────────────────────────────────────
//
// Le CP0 avait trouvé un Workbench complet ; le CP10 trouve un historique
// complet lui aussi — **et personne pour le servir**. Le fait
// `ExerciseAttempt` existe depuis V74 · CP2, la surface tenait sa propre liste
// dans un `useState` vidé à chaque rechargement.
//
// Ces tests tiennent trois propriétés, dans cet ordre :
//
//   1. **le journal complète le fait, il ne le remplace pas** — une tentative
//      dont le journal est parti reste listée, avec `conserve: false` ;
//   2. **la comparaison nomme ce qui a changé**, y compris ce qui s'est CASSÉ
//      en chemin — la catégorie qu'on oublie, et celle qui explique un score
//      qui stagne ;
//   3. **rien de tout cela ne fuit** : ni test privé, ni correction.
//
// La leçon du CP9 est appliquée d'avance : ce fichier appelle des fonctions,
// il ne cherche pas de texte dans une route.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  cleDeJournal, entreeDeJournal, ajouterAuJournal, vueDeLHistorique,
  MAX_ENTREES, MAX_OCTETS_FICHIER,
} from '../lib/attempt-journal.mjs';
import { testsQuiOntChange, diffDeFichier, comparerTentatives } from '../lib/attempt-diff.mjs';
import { attemptKey, normalizeExerciseAttempt } from '../lib/exercise-attempt.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');

const T = (id, passed) => ({ id, name: `test ${id}`, passed });
const E = (at, passed, total, fichiers, tests, aides = []) => entreeDeJournal({
  exerciseId: 'ex', at, passed, total, phase: 'run', durationMs: 10,
  resultats: tests, fichiers, aides,
});

// ── 1 · LE JOURNAL SE RELIE AU FAIT PAR LA MÊME CLÉ ─────────────────────

test('V76 · CP10 — la clé du journal est EXACTEMENT celle du fait', () => {
  // Si les deux clés divergeaient, chaque tentative paraîtrait « non
  // conservée » alors que son journal serait là, juste à côté, sous un autre
  // nom. Le test compare les deux implémentations, pas une chaîne écrite à la
  // main.
  const fait = normalizeExerciseAttempt({
    exerciseId: 'ex', at: '2026-01-02T03:04:05.678Z', passed: 2, total: 3,
    provenance: { producer: 'lab-runner' },
  });
  assert.equal(cleDeJournal(fait), attemptKey(fait));
});

test('V76 · CP10 — deux rejeux du même lancement ne font qu’une entrée', () => {
  // Même idempotence que le fait (V74 §3.6) : un double-clic ou un rejeu réseau
  // ne doit pas dédoubler l'historique.
  const e = E('2026-01-02T03:04:05.000Z', 1, 2, { 'a.mjs': 'x' }, [T('t1', true)]);
  const j = ajouterAuJournal(ajouterAuJournal([], e), e);
  assert.equal(j.length, 1);
});

test('V76 · CP10 — le journal est BORNÉ, et garde les plus RÉCENTES', () => {
  let j = [];
  for (let i = 0; i < MAX_ENTREES + 6; i += 1) {
    j = ajouterAuJournal(j, E(`2026-01-0${1 + (i % 9)}T00:00:${String(i).padStart(2, '0')}.000Z`, i, 40, { 'a.mjs': `v${i}` }, []));
  }
  assert.ok(j.length <= MAX_ENTREES, `${j.length} entrées conservées`);
  // Trié par date croissante : la dernière est la plus récente.
  const dates = j.map((e) => e.at);
  assert.deepEqual(dates, [...dates].sort());
});

test('V76 · CP10 — la borne en OCTETS prime, mais ne vide jamais le journal', () => {
  // Une seule tentative sur un exercice lourd peut dépasser à elle seule : la
  // rendre inconsultable serait perdre l'historique précisément là où il sert.
  const gros = 'x'.repeat(5000);
  let j = [];
  for (let i = 0; i < 10; i += 1) {
    j = ajouterAuJournal(j, E(`2026-01-01T00:00:0${i}.000Z`, i, 10, { 'a.mjs': gros }, []), { maxOctets: 12_000 });
  }
  assert.ok(j.length >= 1, 'le journal est vide : la borne a tout emporté');
  assert.ok(JSON.stringify(j).length <= 12_000 || j.length === 1);

  // ── LE CAS QUE LA BORNE PROTÈGE RÉELLEMENT ──
  //
  // La mutation « la borne vide le journal » a SURVÉCU au premier passage : mes
  // entrées faisaient 5 000 octets pour une borne de 12 000, donc la boucle
  // s'arrêtait toujours à deux entrées sans jamais atteindre zéro. Le garde
  // `out.length > 1` ne sert que lorsqu'**une seule entrée dépasse à elle
  // seule** — c'est-à-dire sur l'exercice le plus lourd, celui où l'historique
  // est le plus utile.
  const enorme = ajouterAuJournal(
    [],
    E('2026-02-01T00:00:00.000Z', 0, 1, { 'a.mjs': 'z'.repeat(9000) }, []),
    { maxOctets: 1000 },
  );
  assert.equal(enorme.length, 1, 'une tentative trop lourde pour la borne devient inconsultable');
});

test('V76 · CP10 — un fichier trop long est tronqué, et le DIT', () => {
  // Tronquer en silence inventerait des suppressions qui n'ont pas eu lieu dans
  // le diff suivant.
  const e = E('2026-01-01T00:00:00.000Z', 0, 1, { 'a.mjs': 'y'.repeat(MAX_OCTETS_FICHIER + 500) }, []);
  assert.ok(e.files['a.mjs'].length < MAX_OCTETS_FICHIER + 500);
  assert.match(e.files['a.mjs'], /tronqué/);
});

test('V76 · CP10 — un résultat de test est reconnu sous SES DEUX noms de champ', () => {
  // ── LE DÉFAUT QUE LA SONDE `H11` A TROUVÉ, ET QUE MES TESTS MANQUAIENT ──
  //
  // Le produit nomme ce champ `testId` dans un RÉSULTAT (`lib/exercise.mjs`,
  // `splitAttempt`) et `id` dans un DESCRIPTEUR de test. Le journal ne lisait
  // que `id` : il acceptait la tentative, gardait le code, et jetait
  // silencieusement tous les résultats. La comparaison ne pouvait alors nommer
  // aucun test — exactement la chose pour laquelle elle existe.
  //
  // Mes tests unitaires ne pouvaient pas le voir : mes fixtures écrivaient
  // déjà `id`. *Un test qui fabrique ses propres données ne découvre jamais
  // qu'il les fabrique au mauvais format.*
  const e = entreeDeJournal({
    exerciseId: 'ex', at: '2026-01-01T00:00:01.000Z', passed: 1, total: 2,
    resultats: [
      { testId: 't-reel', name: 'comme le produit les produit', passed: true },
      { id: 't-descripteur', name: 'comme un descripteur les nomme', passed: false },
    ],
  });
  assert.deepEqual(e.tests.map((t) => t.id), ['t-reel', 't-descripteur']);
});

test('V76 · CP10 — une entrée sans exercice, sans date ou sans compteurs est REFUSÉE', () => {
  assert.equal(entreeDeJournal({ at: '2026-01-01T00:00:00.000Z', passed: 0, total: 1 }), null);
  assert.equal(entreeDeJournal({ exerciseId: 'ex', at: 'pas une date', passed: 0, total: 1 }), null);
  assert.equal(entreeDeJournal({ exerciseId: 'ex', at: '2026-01-01T00:00:00.000Z', passed: 0 }), null);
  assert.equal(entreeDeJournal(undefined), null);
});

// ── 2 · LE FAIT FAIT AUTORITÉ, LE JOURNAL COMPLÈTE ──────────────────────

test('V76 · CP10 — une tentative sans journal est LISTÉE, pas cachée', () => {
  // Masquer une tentative parce qu'on n'a plus son code réécrirait l'histoire
  // pour faire joli — et effacer l'histoire d'un échec est le contournement
  // `R4` de V75.
  const faits = [
    { exerciseId: 'ex', at: '2026-01-01T00:00:01.000Z', passed: 0, total: 3, allPassed: false, outcome: 'failure', phase: 'run', durationMs: 5 },
    { exerciseId: 'ex', at: '2026-01-01T00:00:02.000Z', passed: 3, total: 3, allPassed: true, outcome: 'success', phase: 'run', durationMs: 7 },
  ];
  const journal = [E('2026-01-01T00:00:02.000Z', 3, 3, { 'a.mjs': 'bon' }, [T('t1', true)])];
  const vue = vueDeLHistorique(faits, journal);
  assert.equal(vue.length, 2, 'une tentative a disparu de la vue');
  assert.equal(vue[0].at, '2026-01-01T00:00:02.000Z', 'la plus récente n’est pas en tête');
  assert.equal(vue[0].conserve, true);
  assert.equal(vue[1].conserve, false, 'la tentative sans journal se prétend conservée');
});

test('V76 · CP10 — les COMPTEURS affichés viennent du fait, jamais du journal', () => {
  // Le journal ne fait pas autorité. S'il contredit le fait, c'est le fait qui
  // gagne — sinon un journal corrompu réécrirait un score.
  const faits = [{ exerciseId: 'ex', at: '2026-01-01T00:00:02.000Z', passed: 3, total: 3, allPassed: true, outcome: 'success', phase: 'run', durationMs: 7 }];
  const menteur = { ...E('2026-01-01T00:00:02.000Z', 3, 3, {}, []), passed: 999, total: 999 };
  const vue = vueDeLHistorique(faits, [menteur]);
  assert.equal(vue[0].passed, 3);
  assert.equal(vue[0].total, 3);
});

test('V76 · CP10 — les AIDES lues rejoignent enfin l’historique', () => {
  // Le fait `hintViews` existe depuis le CP7 ; sans ce chemin, « réussi à la 4ᵉ
  // tentative » et « réussi à la 4ᵉ après avoir lu la correction » restaient
  // indiscernables dans l'historique.
  const faits = [{ exerciseId: 'ex', at: '2026-01-01T00:00:02.000Z', passed: 3, total: 3, allPassed: true, outcome: 'success', phase: 'run', durationMs: 7 }];
  const j = [E('2026-01-01T00:00:02.000Z', 3, 3, {}, [], ['INDICE', 'CORRECTION_COMPLETE'])];
  assert.deepEqual(vueDeLHistorique(faits, j)[0].aides, ['INDICE', 'CORRECTION_COMPLETE']);
});

// ── 3 · LA COMPARAISON NOMME CE QUI A CHANGÉ ────────────────────────────

test('V76 · CP10 — les tests réparés ET les tests cassés sont nommés', () => {
  const c = testsQuiOntChange(
    [T('a', false), T('b', true), T('c', false), T('d', true)],
    [T('a', true), T('b', false), T('c', false), T('d', true)],
  );
  assert.deepEqual(c.reussis, ['test a']);
  // La catégorie qu'on oublie, et celle qui explique un score qui stagne.
  assert.deepEqual(c.casses, ['test b']);
  assert.deepEqual(c.toujoursKO, ['test c']);
  assert.deepEqual(c.inchanges, ['test d']);
});

test('V76 · CP10 — un test absent d’avant n’est ni réparé ni cassé', () => {
  const c = testsQuiOntChange([], [T('neuf', true), T('autre', false)]);
  assert.deepEqual(c.reussis, [], 'un test inconnu est présenté comme réparé');
  assert.deepEqual(c.casses, []);
  assert.deepEqual(c.inchanges, ['test neuf']);
  assert.deepEqual(c.toujoursKO, ['test autre']);
});

test('V76 · CP10 — un fichier identique est DIT identique, pas rendu ligne à ligne', () => {
  const d = diffDeFichier('a\nb\nc\n', 'a\nb\nc\n');
  assert.equal(d.identique, true);
  assert.equal(d.lignes.length, 0);
});

test('V76 · CP10 — le diff ne rend QUE les passages qui changent', () => {
  // La propriété qui fait qu'un diff sert à quelque chose : rendre 400 lignes
  // identiques oblige à chercher le changement dedans, c'est-à-dire à faire le
  // travail qu'on voulait éviter.
  const avant = Array.from({ length: 60 }, (_, i) => `ligne ${i}`).join('\n');
  const apres = avant.replace('ligne 30', 'ligne 30 MODIFIÉE');
  const d = diffDeFichier(avant, apres);
  assert.equal(d.identique, false);
  assert.ok(d.lignes.length < 15, `${d.lignes.length} lignes rendues pour un changement d’une ligne`);
  assert.equal(d.ajoutees, 1);
  assert.equal(d.retirees, 1);
  assert.ok(d.lignes.some((l) => l.type === '+' && l.texte.includes('MODIFIÉE')));
  // Le contexte est là : un changement sans ses voisins n'est pas situable.
  assert.ok(d.lignes.some((l) => l.type === '=' && l.texte === 'ligne 29'));
});

test('V76 · CP10 — une coupure entre deux passages éloignés est ANNONCÉE', () => {
  // Sans elle, deux passages distants paraissent contigus et les numéros de
  // ligne deviennent un piège.
  const avant = Array.from({ length: 60 }, (_, i) => `l${i}`).join('\n');
  const apres = avant.replace('l5', 'l5X').replace('l50', 'l50X');
  const d = diffDeFichier(avant, apres);
  assert.ok(d.lignes.some((l) => l.type === '…'), 'aucune coupure signalée');
});

test('V76 · CP10 — les numéros de ligne rendus sont ceux des fichiers réels', () => {
  const d = diffDeFichier('a\nb\nc\nd\n', 'a\nB\nc\nd\n');
  const plus = d.lignes.find((l) => l.type === '+');
  const moins = d.lignes.find((l) => l.type === '-');
  assert.equal(plus.apres, 2);
  assert.equal(moins.avant, 2);
});

test('V76 · CP10 — comparer deux tentatives rend les tests, le diff et une lecture', () => {
  const a = E('2026-01-01T00:00:01.000Z', 1, 3, { 'a.mjs': 'const x = 1;\nexport default x;\n' }, [T('t1', true), T('t2', false), T('t3', false)]);
  const b = E('2026-01-01T00:00:09.000Z', 2, 3, { 'a.mjs': 'const x = 2;\nexport default x;\n' }, [T('t1', true), T('t2', true), T('t3', false)]);
  const c = comparerTentatives(a, b);
  assert.equal(c.lisible, true);
  assert.equal(c.ecart, 1);
  assert.deepEqual(c.tests.reussis, ['test t2']);
  assert.deepEqual(c.fichiersModifies, ['a.mjs']);
  assert.match(c.lecture, /a\.mjs/);
  assert.match(c.lecture, /test t2/);
});

test('V76 · CP10 — un score identique avec des tests différents est DIT', () => {
  // Le cas qui décourage : « toujours 2/3 », alors qu'un test a été réparé et
  // un autre cassé. Sans cette phrase, l'apprenant croit n'avoir rien fait.
  const a = E('2026-01-01T00:00:01.000Z', 2, 3, { 'a.mjs': 'v1' }, [T('t1', true), T('t2', true), T('t3', false)]);
  const b = E('2026-01-01T00:00:09.000Z', 2, 3, { 'a.mjs': 'v2' }, [T('t1', true), T('t2', false), T('t3', true)]);
  const c = comparerTentatives(a, b);
  assert.equal(c.ecart, 0);
  assert.deepEqual(c.tests.casses, ['test t2']);
  assert.match(c.lecture, /ne passent plus|ne passe plus/);
  assert.match(c.lecture, /pas les mêmes tests/);
});

test('V76 · CP10 — une tentative non conservée rend une comparaison ILLISIBLE, pas vide', () => {
  // Rendre une comparaison vide ressemblerait à « rien n'a changé », ce qui est
  // faux et décourageant.
  const b = E('2026-01-01T00:00:09.000Z', 2, 3, { 'a.mjs': 'v2' }, []);
  for (const manquant of [null, undefined]) {
    const c = comparerTentatives(manquant, b);
    assert.equal(c.lisible, false);
    assert.match(c.raison, /plus conservée/);
  }
});

test('V76 · CP10 — la lecture DÉCRIT et ne donne jamais la réponse', () => {
  // Même discipline qu'au CP6 : on nomme ce qu'on observe, jamais ce qu'il faut
  // écrire. Une comparaison qui dirait « remplace `>` par `>=` » ferait
  // l'exercice à la place de l'apprenant.
  const a = E('2026-01-01T00:00:01.000Z', 0, 2, { 'a.mjs': 'if (n > 10) {}' }, [T('t1', false)]);
  const b = E('2026-01-01T00:00:09.000Z', 2, 2, { 'a.mjs': 'if (n >= 10) {}' }, [T('t1', true)]);
  const { lecture } = comparerTentatives(a, b);
  for (const interdit of [/remplace\s+.+\s+par\s+/i, /écris\s+/i, /il faut (écrire|mettre|utiliser)/i, /la solution est/i]) {
    assert.doesNotMatch(lecture, interdit, `la lecture donne la réponse : « ${lecture} »`);
  }
});

// ── 4 · RIEN DE TOUT CELA NE FUIT ───────────────────────────────────────

test('V76 · CP10 — la route ne journalise QUE les résultats PUBLICS', () => {
  // Archiver les résultats complets contournerait l'anti-fuite par la porte
  // d'une fonctionnalité de confort — et un contournement qui passe par du
  // confort est celui qu'on ne voit pas venir.
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  const i = route.indexOf('consigner(ex.id');
  assert.ok(i > 0, 'la route ne consigne aucune tentative');
  const bloc = route.slice(i, i + 900);
  assert.match(bloc, /resultats:\s*publicResults/, 'le journal reçoit autre chose que les résultats publics');
  assert.ok(!/resultats:\s*attempt\.results/.test(bloc), 'le journal reçoit les résultats complets');
});

test('V76 · CP10 — le journal ne conserve que les fichiers ÉDITABLES', () => {
  // Un fichier de test caché archivé « pour le diff » serait lisible par
  // l'apprenant au tour suivant.
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  const i = route.indexOf('consigner(ex.id');
  const bloc = route.slice(i, i + 900);
  assert.match(bloc, /editables\.has\(p\)/, 'le journal archive des fichiers non éditables');
});

test('V76 · CP10 — l’entrée de journal ne retient d’un test que son id, son nom et son état', () => {
  // `expected` et `received` d'un test, même public, n'ont rien à faire dans un
  // journal : le diagnostic du CP6 les utilise à chaud, il ne les archive pas.
  const e = E('2026-01-01T00:00:01.000Z', 0, 1, {}, [
    { id: 't1', name: 'test t1', passed: false, expected: 'LA RÉPONSE', received: 'x', message: 'détail' },
  ]);
  assert.deepEqual(Object.keys(e.tests[0]).sort(), ['id', 'name', 'passed']);
  assert.ok(!JSON.stringify(e).includes('LA RÉPONSE'));
});

// ── 5 · LE JOURNAL SURVIT À UN `RESET` ──────────────────────────────────

test('V76 · CP10 — le journal vit HORS de l’espace de travail', () => {
  // `resetWorkspace` fait `rmSync(dir, { recursive: true })`. Un journal rangé
  // là serait emporté par un « Reset » — et le contrat §1.11 interdit qu'un
  // `RESET` efface l'histoire d'une tentative.
  const srv = lire('lib/attempt-journal-server.ts');
  // On regarde la RACINE déclarée, pas le fichier entier : il mentionne
  // `lab-workspaces` dans le commentaire qui explique justement pourquoi il ne
  // s'y range pas.
  const racine = srv.match(/^const ROOT = .*$/m)?.[0] ?? '';
  assert.match(racine, /'lab-journals'/, 'le journal n’a pas sa propre racine');
  assert.ok(!racine.includes('lab-workspaces'), 'le journal est rangé dans l’espace de travail : un Reset l’effacerait');
  const ignore = lire('.gitignore');
  assert.match(ignore, /^data\/lab-journals\/$/m, 'le journal n’est pas ignoré par git');
});

test('V76 · CP10 — aucune branche de `reset` ne touche au journal', () => {
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  for (const action of ["action === 'reset'", "action === 'reset-file'"]) {
    const i = route.indexOf(action);
    assert.ok(i > 0, `branche ${action} introuvable`);
    const bloc = route.slice(i, i + 400);
    assert.ok(!bloc.includes('journal') && !bloc.includes('consigner'),
      `${action} touche au journal : le contrat §1.11 l’interdit`);
  }
});

// ── 6 · CE QUI N'A PAS ÉTÉ CONSTRUIT ────────────────────────────────────

test('V76 · CP10 — aucun clone de Git n’a été construit', () => {
  // `G14` : le besoin démontré tient en une comparaison entre deux tentatives.
  // Branches, fusion, restauration et blâme n'ont été demandés par rien.
  const diff = lire('lib/attempt-diff.mjs');
  const journal = lire('lib/attempt-journal.mjs');
  for (const absent of ['branch', 'merge', 'revert', 'restaurer', 'blame', 'stash']) {
    assert.ok(!new RegExp(`export function [a-zA-Z]*${absent}`, 'i').test(diff + journal),
      `une fonction « ${absent} » a été construite sans besoin démontré`);
  }
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  assert.ok(!route.includes("'restore'"), 'une action de restauration a été ajoutée');
});

test('V76 · CP10 — la comparaison prend DEUX clés, et refuse le reste', () => {
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  const i = route.indexOf("action === 'compare'");
  assert.ok(i > 0, 'aucune action de comparaison');
  const bloc = route.slice(i, i + 1600);
  assert.match(bloc, /Deux tentatives sont nécessaires/, 'une comparaison incomplète n’est pas refusée');
  // L'ordre vient des DATES, pas de l'appelant : comparer « du récent vers
  // l'ancien » inverserait ajouts et suppressions.
  assert.match(bloc, /String\(ea\.at\) > String\(eb\.at\)/, 'l’ordre de comparaison dépend de l’appelant');
});
