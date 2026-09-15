// V77 · CP3 — LE TERMINAL : UN USAGE, PAS UNE RÉUSSITE.
//
// ── LA QUESTION DU CHECKPOINT ───────────────────────────────────────────
//
// Le CP0 a mesuré les deux moitiés du problème du terminal. Il **exécute
// vraiment** : `exitCode 0`, 263 octets de sortie, bac à sable, commande
// allowlistée. Et il n'en garde **rien** : zéro octet écrit.
//
// La tentation évidente était d'écrire `TerminalAttempt(success = true)` et de
// gagner une surface sur le tableau de couverture. Le CP0 a mesuré pourquoi
// c'était faux : les trois tâches ne portent aucun critère de réussite
// pédagogique, et leurs arguments sont des ÉNUMÉRATIONS FERMÉES.
// `term-list-files` fait choisir entre `-1`, `-l` et `-la` — trois options
// valides. Sa description dit d'elle-même « démonstration d'exécution bornée ».
//
//   > Un apprenant qui choisit `-la` parmi trois options valides n'a rien
//   > démontré.
//
// D'où la politique `USAGE_ONLY` : on écrit que la chose a EU LIEU, jamais
// qu'elle a réussi. La plupart des tests ci-dessous existent pour empêcher
// cette dérive, pas pour vérifier que le fait s'écrit.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  SURFACES_USAGE, ACTIONS_USAGE, MAX_USAGE_EVENTS, CHAMPS_INTERDITS,
  normalizeUsageEvent, normalizeUsageEvents, usageEventKey, usageDe,
} from '../lib/usage-event.mjs';
import { applyCommand, COMMANDS } from '../lib/learning-engine.mjs';
import {
  migrateToV7, writeActiveTrack, activeTrackProgress, emptyFlat,
  normaliserLesFaits, FAITS_DU_PRODUIT,
} from '../lib/progress-store.mjs';
import { serializeBackupV3, parseBackupV3 } from '../lib/backup.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const T0 = '2026-09-01T10:00:00.000Z';
const base = { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} };
const cmd = (o = {}) => ({
  type: 'RECORD_USAGE_EVENT', surface: 'terminal', action: 'run', ref: 'term-list-files',
  detail: { adapter: 'local', exitCode: 0, durationMs: 42 },
  provenance: { producer: 'terminal-route', method: 'POST /api/terminal/[taskId] action=run' },
  ...o,
});

// ── 1 · LE FAIT RESPECTE LA DISCIPLINE DES HUIT AUTRES ──────────────────

test('V77 · CP3 — horloge serveur, provenance obligatoire, version de schéma', () => {
  const e = normalizeUsageEvent({ surface: 'terminal', action: 'run', ref: 't', provenance: { producer: 'p' } }, { now: T0 });
  assert.equal(e.at, T0);
  assert.equal(e.schemaVersion, 1);
  assert.equal(e.provenance.producer, 'p');
});

test('V77 · CP3 — un fait sans producteur est REFUSÉ, jamais réparé', () => {
  const e = normalizeUsageEvent({ surface: 'terminal', action: 'run', ref: 't' }, { now: T0 });
  assert.equal(e, null);
});

test('V77 · CP3 — le vocabulaire est fermé : surface et action inconnues sont refusées', () => {
  assert.equal(normalizeUsageEvent({ surface: 'lab', action: 'run', ref: 't', provenance: { producer: 'p' } }, { now: T0 }), null);
  assert.equal(normalizeUsageEvent({ surface: 'terminal', action: 'passed', ref: 't', provenance: { producer: 'p' } }, { now: T0 }), null);
  assert.deepEqual([...SURFACES_USAGE], ['terminal', 'pipelines']);
  assert.deepEqual([...ACTIONS_USAGE], ['run']);
});

// ── 2 · CONTRAINTE N°5 — AUCUNE ISSUE, JAMAIS ───────────────────────────
//
// La contrainte la plus importante du CP3. Si elle cède, l'événement d'usage
// devient un `TerminalAttempt` déguisé, c'est-à-dire exactement ce que le
// contrat gelé interdit.

test('V77 · CP3 — les champs d’issue envoyés par l’appelant N’ENTRENT PAS dans le fait', () => {
  const e = normalizeUsageEvent({
    surface: 'terminal', action: 'run', ref: 't', provenance: { producer: 'p' },
    detail: { adapter: 'local', exitCode: 0, passed: true, success: true, score: 100, allPassed: true, validation: { status: 'passed' } },
  }, { now: T0 });
  // ── DÉFAUT TROUVÉ PAR LA MUTATION `M01` DU CP14 ──
  //
  // Ce test parcourait `CHAMPS_INTERDITS` pour construire ses assertions : vider
  // la liste le rendait **vert avec zéro assertion**. Un test qui dérive ses
  // attentes de la chose qu'il teste ne teste rien.
  //
  // La liste est donc pinée ici, en clair, ET les champs sont vérifiés un par un.
  assert.deepEqual([...CHAMPS_INTERDITS],
    ['passed', 'success', 'outcome', 'score', 'allPassed', 'validation'],
    'la liste des champs interdits ne doit ni rétrécir ni se vider');
  for (const champ of ['passed', 'success', 'outcome', 'score', 'allPassed', 'validation']) {
    assert.equal(champ in e.detail, false, `« ${champ} » ne doit pas entrer dans le détail`);
    assert.equal(champ in e, false, `« ${champ} » ne doit pas entrer dans le fait`);
  }
  assert.deepEqual(Object.keys(e.detail).sort(), ['adapter', 'exitCode']);
});

test('V77 · CP3 — le détail est une LISTE BLANCHE : un champ non prévu est écarté même s’il est inoffensif', () => {
  // Retirer les champs interdits laisserait passer tout ce qu'on n'a pas pensé
  // à interdire. C'est la différence entre filtrer et lister.
  const e = normalizeUsageEvent({
    surface: 'terminal', action: 'run', ref: 't', provenance: { producer: 'p' },
    detail: { adapter: 'local', stdout: 'total 24', commandPreview: 'ls -la', maitrise: 0.9 },
  }, { now: T0 });
  assert.deepEqual(Object.keys(e.detail), ['adapter']);
});

test('V77 · CP3 — la lecture d’un usage dit « constaté », jamais « réussi »', () => {
  const evs = [cmd(), cmd()].map((c, i) => normalizeUsageEvent(c, { now: `2026-09-0${i + 1}T10:00:00.000Z` }));
  const u = usageDe(evs, 'terminal');
  assert.equal(u.vautReussite, false);
  assert.equal(u.executions, 2);
  assert.match(u.lecture, /aucune réussite mesurée/);
  assert.doesNotMatch(u.lecture, /réussi[e]?s?\b(?! mesurée)|maîtris|progress|score/i);
});

test('V77 · CP3 — `exitCode: 0` est enregistré SANS être interprété', () => {
  // 0 ne veut pas dire « réussi » : il veut dire que le processus s'est terminé
  // sans erreur. Le fait porte l'observation et aucune conclusion.
  const e = normalizeUsageEvent(cmd(), { now: T0 });
  assert.equal(e.detail.exitCode, 0);
  const u = usageDe([e], 'terminal');
  assert.equal(u.vautReussite, false);
});

test('V77 · CP3 — aucune surface n’est utilisée : la lecture le DIT, sans compenser', () => {
  const u = usageDe([], 'terminal');
  assert.equal(u.executions, 0);
  assert.deepEqual(u.refsDistinctes, []);
  assert.equal(u.premier, null);
  assert.match(u.lecture, /Aucune utilisation observée/);
});

// ── 3 · IDEMPOTENCE ─────────────────────────────────────────────────────

test('V77 · CP3 — un rejeu réseau ne compte pas deux exécutions', () => {
  const r1 = applyCommand({ ...base }, cmd(), { now: new Date(T0) });
  const r2 = applyCommand(r1.progress, cmd(), { now: new Date(T0) });
  assert.equal(r1.effects.includes('usage-event:recorded'), true);
  assert.deepEqual(r2.effects, ['noop:usage-event:duplicate']);
  assert.equal(r2.progress.usageEvents.length, 1);
});

test('V77 · CP3 — deux exécutions à des secondes différentes sont deux faits', () => {
  const r1 = applyCommand({ ...base }, cmd(), { now: new Date('2026-09-01T10:00:00.000Z') });
  const r2 = applyCommand(r1.progress, cmd(), { now: new Date('2026-09-01T10:00:05.000Z') });
  assert.equal(r2.progress.usageEvents.length, 2);
  assert.notEqual(usageEventKey(r2.progress.usageEvents[0]), usageEventKey(r2.progress.usageEvents[1]));
});

test('V77 · CP3 — une commande invalide échoue proprement, sans écrire un fait approximatif', () => {
  const r = applyCommand({ ...base }, cmd({ ref: '' }), { now: new Date(T0) });
  assert.equal(r.ok, false);
  assert.equal(r.code, 'INVALID_USAGE_EVENT');
});

// ── 4 · CONTRAINTE N°2 — AUCUNE PREUVE, ET N°3 — AUCUN MOTEUR ───────────

test('V77 · CP3 — enregistrer un usage NE MODIFIE QUE `usageEvents`', () => {
  // Le test de la contrainte n°2 ET de la n°3 à la fois : si le seul champ qui
  // bouge est `usageEvents`, aucune preuve n'est née et aucun fait pédagogique
  // n'a été touché. Les moteurs, eux, ne lisent que les autres champs.
  const avant = { ...base, evidence: [], recallAttempts: [], exerciseAttempts: [], transferAttempts: [], hintViews: [] };
  const r = applyCommand(avant, cmd(), { now: new Date(T0) });
  assert.equal(r.ok, true);
  // Comparaison par VALEUR : le moteur renormalise la progression en entrée, de
  // sorte qu'une comparaison d'identité verrait bouger des tableaux au contenu
  // inchangé et raterait la question posée.
  const bouge = Object.keys({ ...avant, ...r.progress })
    .filter((k) => JSON.stringify(r.progress[k]) !== JSON.stringify(avant[k]));
  assert.deepEqual(bouge, ['usageEvents']);
  assert.deepEqual(r.progress.evidence, []);
});

test('V77 · CP3 — AUCUN moteur ne connaît le champ `usageEvents`', () => {
  // Une dépendance, pas une convention de commentaire : si un moteur importait
  // le module ou lisait le champ, ce test tomberait.
  for (const f of ['lib/competency.mjs', 'lib/retention.mjs', 'lib/recovery-mode.mjs', 'lib/evidence.mjs', 'lib/curriculum-adaptatif.mjs']) {
    const src = lire(f);
    if (!src) continue;
    assert.equal(src.includes('usageEvents'), false, `${f} ne doit pas lire usageEvents`);
    assert.equal(src.includes('usage-event'), false, `${f} ne doit pas importer usage-event`);
  }
});

test('V77 · CP3 — `usage-event.mjs` ne mentionne aucun vocabulaire de preuve', () => {
  const src = lire('lib/usage-event.mjs');
  for (const interdit of ['makeEvidence', 'appendEvidence', 'QUALIFYING', 'competency', 'retention']) {
    assert.equal(src.includes(interdit), false, `le module ne doit pas dépendre de « ${interdit} »`);
  }
});

// ── 5 · CONTRAINTE N°1 — UN CHAMP SÉPARÉ, ET N°4 — BORNÉ / EXPORTABLE ───

test('V77 · CP3 — le fait survit à un aller-retour par le DISQUE (les quatre listes blanches)', () => {
  // Les tests unitaires du défaut P7 de V75 passaient en appelant `applyCommand`
  // sur un objet plat ; le disque, lui, ne gardait rien. On traverse donc la
  // persistance réelle.
  const r = applyCommand(activeTrackProgress(migrateToV7({})), cmd(), { now: new Date(T0) });
  const v3 = writeActiveTrack(migrateToV7({}), r.progress);
  const relu = activeTrackProgress(JSON.parse(JSON.stringify(v3)));
  assert.equal(relu.usageEvents.length, 1);
  assert.equal(relu.usageEvents[0].ref, 'term-list-files');
  assert.equal('usageEvents' in emptyFlat(), true);
});

test('V77 · CP3 — les six faits du produit passent tous par la MÊME énumération', () => {
  // La liste vit à un seul endroit ; c'est ce qui empêche un fait d'exister dans
  // trois listes blanches sur quatre — le défaut P7, payé deux fois.
  const faits = normaliserLesFaits({}, { daysPourHeritage: {} });
  assert.deepEqual(Object.keys(faits).sort(), [...FAITS_DU_PRODUIT].sort());
  const vide = emptyFlat();
  for (const f of FAITS_DU_PRODUIT) assert.equal(Array.isArray(vide[f]), true, `${f} manque à l'état vide`);
});

test('V77 · CP3 — DÉFAUT MESURÉ : les faits ne survivaient pas à leur propre sauvegarde', () => {
  // Avant correction, `validateStrict` — quatrième liste blanche, dans
  // `lib/backup.mjs` — reconstruisait la progression importée à partir de
  // `startDate`, `days`, `skills` et des deux revues seulement. L'export était
  // fidèle, la restauration muette.
  const plat = activeTrackProgress(migrateToV7({}));
  plat.usageEvents = [normalizeUsageEvent(cmd(), { now: T0 })];
  plat.hintViews = [{ at: T0, exerciseId: 'x', action: 'INDICE', niveau: 1, declenchee: 'auto', provenance: { producer: 'p', method: '' }, schemaVersion: 2 }];
  const v3 = writeActiveTrack(migrateToV7({}), plat);

  const sauvegarde = JSON.stringify(serializeBackupV3(v3, {}));
  const relu = parseBackupV3(sauvegarde, new Map());
  assert.equal(relu.ok, true);
  const t = relu.v3.tracks[relu.v3.activeTrackId];
  assert.equal(t.usageEvents.length, 1, 'un usage exporté doit revenir de sa sauvegarde');
  assert.equal(t.hintViews.length, 1, 'une aide consultée doit revenir de sa sauvegarde');
});

test('V77 · CP3 — un fichier importé ne gagne AUCUN droit : les faits invalides restent refusés', () => {
  // La correction ci-dessus cesse de jeter ce que les normaliseurs acceptent.
  // Elle ne doit pas cesser de refuser ce qu'ils rejettent.
  const v3 = migrateToV7({});
  const t = v3.tracks[v3.activeTrackId];
  t.usageEvents = [
    { at: T0, surface: 'terminal', action: 'run', ref: 'ok', provenance: { producer: 'p' } },
    { at: T0, surface: 'kubernetes', action: 'run', ref: 'ko', provenance: { producer: 'p' } }, // surface hors vocabulaire
    { at: T0, surface: 'terminal', action: 'run', ref: 'sans-producteur' },                     // provenance absente
  ];
  const relu = parseBackupV3(JSON.stringify(serializeBackupV3(v3, {})), new Map());
  const lus = relu.v3.tracks[relu.v3.activeTrackId].usageEvents;
  assert.equal(lus.length, 1);
  assert.equal(lus[0].ref, 'ok');
});

test('V77 · CP3 — la liste est BORNÉE : au-delà du plafond, les plus récentes restent', () => {
  const brut = [];
  for (let i = 0; i < MAX_USAGE_EVENTS + 50; i += 1) {
    brut.push({ at: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString(), surface: 'terminal', action: 'run', ref: `t${i}`, provenance: { producer: 'p' } });
  }
  const n = normalizeUsageEvents(brut);
  assert.equal(n.length, MAX_USAGE_EVENTS);
  assert.equal(n[n.length - 1].ref, `t${MAX_USAGE_EVENTS + 49}`);
});

// ── 6 · LA ROUTE DU TERMINAL ÉCRIT VRAIMENT, ET N’ÉCRIT QUE ÇA ──────────

test('V77 · CP3 — la route du terminal enregistre l’usage après une exécution', () => {
  const src = lire('app/api/terminal/[taskId]/route.ts');
  assert.equal(src.includes('RECORD_USAGE_EVENT'), true);
  // Les deux adaptateurs, pas un seul : le CP0 a mesuré `local` mais `docker`
  // exécute la même chose.
  assert.equal((src.match(/noterUsage\(taskId, '(local|docker)'/g) ?? []).length, 2);
  // Et RIEN d'autre : la route ne doit pas avoir gagné une preuve au passage.
  for (const interdit of ['makeEvidence', 'appendEvidence', 'RECORD_EXERCISE_ATTEMPT', 'TerminalAttempt']) {
    assert.equal(src.includes(interdit), false, `la route ne doit pas écrire « ${interdit} »`);
  }
});

test('V77 · CP3 — la commande existe dans le moteur et n’expose aucun champ d’issue', () => {
  assert.equal(COMMANDS.includes('RECORD_USAGE_EVENT'), true);
  const d = lire('lib/learning-engine.d.ts');
  const bloc = d.slice(d.indexOf("type: 'RECORD_USAGE_EVENT'"), d.indexOf("type: 'RECORD_USAGE_EVENT'") + 500);
  for (const champ of CHAMPS_INTERDITS) {
    assert.equal(new RegExp(`\\b${champ}\\b\\s*[?:]`).test(bloc), false, `le type ne doit pas exposer « ${champ} »`);
  }
});
