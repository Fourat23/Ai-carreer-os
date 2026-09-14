// V76 · CP7 — L'AIDE CONSULTÉE EST UN FAIT.
//
// ── LE TROU QUE CE CHECKPOINT BOUCHE ────────────────────────────────────
//
// Le CP0 avait mesuré que l'échelle d'aide montait sur le NOMBRE d'échecs. Le
// CP6 lui a donné le symptôme. Restait le plus gênant des trois : **rien
// n'enregistrait qu'une aide avait été lue.**
//
// Trois conséquences, toutes dans le produit d'avant :
//   · une réussite après trois indices était indiscernable d'une réussite
//     immédiate — alors que le contrat gelé (§1.12) exige que la provenance le
//     montre ;
//   · l'échelle reproposait la marche que l'apprenant venait de lire ;
//   · monter volontairement jusqu'à la correction ne laissait aucune trace.
//
// ── LA PROPRIÉTÉ QUI PRIME SUR TOUTES LES AUTRES ────────────────────────
//
// **Ce fait ne dévalue jamais une réussite.** Il décrit. Le contrat interdit
// d'en faire une pénalité ou un score, et plusieurs tests ci-dessous existent
// uniquement pour empêcher cette dérive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  ACTIONS_AIDE, normalizeHintView, normalizeHintViews, hintViewKey,
  actionsVues, aidesDe, provenanceDeLaReussite,
} from '../lib/hint-view.mjs';
import { applyCommand } from '../lib/learning-engine.mjs';
import { migrateToV7, writeActiveTrack, activeTrackProgress, emptyFlat } from '../lib/progress-store.mjs';
import { remedier } from '../lib/remediation.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const T0 = '2026-09-01T10:00:00.000Z';
const base = { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} };
const cmd = (o = {}) => ({
  type: 'RECORD_HINT_VIEW', exerciseId: 'py-debug-grades', action: 'INDICE', niveau: 1,
  provenance: { producer: 'lab-runner', method: 'echelle-aide' }, ...o,
});

// ── 1 · LE FAIT RESPECTE LE CONTRAT DES SEPT AUTRES ─────────────────────

test('V76 · CP7 — le fait porte horloge serveur, provenance et version de schéma', () => {
  const v = normalizeHintView({ exerciseId: 'x', action: 'INDICE', provenance: { producer: 'p' } }, { now: T0 });
  assert.equal(v.at, T0);
  assert.equal(v.schemaVersion, 2);
  assert.equal(v.provenance.producer, 'p');
});

test('V76 · CP7 — sans provenance, sans exercice ou avec une action inconnue : REFUSÉ', () => {
  const now = { now: T0 };
  assert.equal(normalizeHintView({ exerciseId: 'x', action: 'INDICE' }, now), null, 'provenance absente acceptée');
  assert.equal(normalizeHintView({ action: 'INDICE', provenance: { producer: 'p' } }, now), null, 'exercice absent accepté');
  assert.equal(normalizeHintView({ exerciseId: 'x', action: 'MAGIE', provenance: { producer: 'p' } }, now), null, 'vocabulaire ouvert');
});

test('V76 · CP7 — le doute joue CONTRE le crédit : une aide d’origine inconnue est « servie »', () => {
  // Même posture que `correctionSeen` depuis V74 : on ne crédite pas une
  // démarche qu'on n'a pas observée.
  const v = normalizeHintView(cmd({ declenchee: undefined }), { now: T0 });
  assert.equal(v.declenchee, 'auto');
  const d = normalizeHintView(cmd({ declenchee: 'demandee' }), { now: T0 });
  assert.equal(d.declenchee, 'demandee');
});

// ── 2 · PERSISTANCE — LE DÉFAUT P7 DE V75, QUI NE DOIT PAS REVENIR ──────

test('V76 · CP7 — l’aide consultée survit à un ALLER-RETOUR RÉEL par le store', () => {
  // `curriculumPause` a vécu trois checkpoints dans UNE SEULE des deux listes
  // blanches du store, et n'a jamais atteint le disque — les tests de l'époque
  // appelaient `applyCommand` sur un objet plat, jamais `writeActiveTrack`.
  const r = applyCommand(base, cmd(), { now: new Date(T0) });
  assert.equal(r.ok, true);
  const relu = activeTrackProgress(writeActiveTrack(migrateToV7({}, T0), r.progress, T0));
  assert.equal(relu.hintViews.length, 1, 'l’aide n’a pas survécu à l’écriture');
  assert.equal(relu.hintViews[0].action, 'INDICE');
  assert.equal(relu.hintViews[0].exerciseId, 'py-debug-grades');
});

test('V76 · CP7 — `emptyFlat` déclare le champ : une progression neuve n’a pas de trou', () => {
  assert.ok(Array.isArray(emptyFlat().hintViews));
});

test('V76 · CP7 — deux affichages de la même aide à la même seconde = UN fait', () => {
  const p1 = applyCommand(base, cmd(), { now: new Date(T0) }).progress;
  const r2 = applyCommand(p1, cmd(), { now: new Date(T0) });
  assert.ok(r2.effects.some((e) => e.startsWith('noop:')), `attendu un no-op, reçu ${r2.effects.join(',')}`);
  assert.equal(r2.progress.hintViews.length, 1);
  // Mais une marche DIFFÉRENTE est bien un fait neuf.
  const r3 = applyCommand(p1, cmd({ action: 'MODELE_MENTAL', niveau: 2 }), { now: new Date(T0) });
  assert.equal(r3.progress.hintViews.length, 2);
});

// ── 3 · L'ÉCHELLE NE PIÉTINE PLUS ───────────────────────────────────────

test('V76 · CP7 — une marche déjà lue n’est pas reproposée à l’identique', () => {
  const attempts = [{ exerciseId: 'e', at: T0, phase: 'run', passed: 0, total: 3, allPassed: false }];
  const sections = { modeleMental: true, erreurs: true, exempleGuide: true, correction: true };
  const sans = remedier({ attempts, exerciseId: 'e', now: T0, sections, testsEchoues: [{ name: 'un cas' }] });
  assert.ok(sans, 'aucune aide proposée : le test ne prouve rien');
  const avec = remedier({
    attempts, exerciseId: 'e', now: T0, sections, testsEchoues: [{ name: 'un cas' }],
    dejaVues: [sans.action],
  });
  assert.ok(avec, 'l’échelle ne propose plus rien alors qu’il reste des marches');
  assert.notEqual(avec.action, sans.action, `la marche « ${sans.action} » a été reproposée`);
});

test('V76 · CP7 — si TOUT a été lu, l’échelle ne saute PAS à la correction', () => {
  // Le contournement dangereux : vider les marches disponibles ferait tomber
  // dans la branche de repli, c'est-à-dire donner la réponse — l'inverse exact
  // de ce que le contrat exige (§1.10).
  const attempts = [{ exerciseId: 'e', at: T0, phase: 'run', passed: 1, total: 3, allPassed: false }];
  const sections = { modeleMental: true, erreurs: true, exempleGuide: true, correction: true };
  const r = remedier({
    attempts, exerciseId: 'e', now: T0, sections, testsEchoues: [{ name: 'un cas' }],
    dejaVues: [...ACTIONS_AIDE],
  });
  assert.ok(r, 'plus aucune aide alors que l’apprenant échoue encore');
  assert.notEqual(r.action, 'CORRECTION_COMPLETE',
    'toutes les marches lues font sauter à la correction : l’échelle a disparu');
  // ── LA MUTATION QUI A SURVÉCU AU PREMIER PASSAGE ──
  //
  // Remplacer le repli par la liste vide ne donnait PAS la correction : ça
  // renvoyait « reprends plus tard ». Mon test s'en satisfaisait, alors que
  // c'est une autre façon de ne plus aider — l'apprenant échoue encore, du
  // matériel existe, et le produit répond qu'il n'a rien. L'échelle doit
  // continuer à proposer une MARCHE RÉELLE tant qu'elle en a.
  assert.notEqual(r.action, 'TENTATIVE_DIFFEREE',
    'l’échelle renvoie « reprends plus tard » alors que du matériel d’aide existe encore');
  assert.ok(r.niveau < 5, `l’échelon a sauté à ${r.niveau}`);
});

// ── 4 · LA PROVENANCE DÉCRIT, ELLE NE PUNIT PAS ─────────────────────────

test('V76 · CP7 — une réussite reste une réussite, quelles que soient les aides', () => {
  const vues = [
    normalizeHintView(cmd({ action: 'INDICE' }), { now: T0 }),
    normalizeHintView(cmd({ action: 'CORRECTION_COMPLETE' }), { now: '2026-09-01T10:05:00.000Z' }),
  ];
  const p = provenanceDeLaReussite(vues, 'py-debug-grades');
  assert.equal(p.reussite, true, 'une réussite a été retirée : le contrat l’interdit');
  assert.equal(p.correctionVue, true);
  assert.equal(p.aidesConsultees, 2);
  assert.match(p.lecture, /après avoir consulté la correction/);
});

test('V76 · CP7 — sans aide, la provenance le dit simplement', () => {
  const p = provenanceDeLaReussite([], 'x');
  assert.equal(p.reussite, true);
  assert.equal(p.aidesConsultees, 0);
  assert.match(p.lecture, /sans aide/);
});

test('V76 · CP7 — la provenance ne produit NI score, NI pourcentage, NI pénalité', () => {
  // La dérive tentante : « réussi à 60 % parce que deux aides ont été lues ».
  // Ce serait exactement le score fabriqué que le contrat de V75 interdisait.
  const src = lire('lib/hint-view.mjs');
  const code = src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
  for (const interdit of [/score/i, /penalit/i, /malus/i, /pourcentage/i, /ratio/i, /note\s*=/i]) {
    assert.doesNotMatch(code, interdit, `vocabulaire de notation dans le module : ${interdit}`);
  }
  const p = provenanceDeLaReussite([normalizeHintView(cmd(), { now: T0 })], 'py-debug-grades');
  assert.deepEqual(Object.keys(p).sort(), ['actions', 'aidesConsultees', 'correctionVue', 'lecture', 'reussite']);
});

// ── 5 · LE BRANCHEMENT ──────────────────────────────────────────────────

test('V76 · CP7 — la route ENREGISTRE l’aide servie, et la passe à l’échelle', () => {
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  assert.match(route, /RECORD_HINT_VIEW/, 'la route n’enregistre aucune aide');
  assert.match(route, /dejaVues:\s*actionsVues\(/, 'l’échelle ne reçoit pas les marches déjà lues');
  // L'écriture doit précéder le rendu : une aide affichée puis perdue au
  // rafraîchissement ferait croire à l'échelle qu'elle n'a rien donné.
  const iEcrit = route.indexOf('RECORD_HINT_VIEW');
  const iRendu = route.lastIndexOf('NextResponse.json({ ok: true, attempt');
  assert.ok(iEcrit > 0 && iRendu > iEcrit, 'l’aide est rendue avant d’être enregistrée');
});

test('V76 · CP7 — les DEUX listes blanches du store portent le champ', () => {
  const s = lire('lib/progress-store.mjs');
  const iEcriture = s.indexOf('function flatOf');
  const iLecture = s.indexOf('function activeTrackProgress');
  assert.ok(iEcriture > 0 && iLecture > iEcriture);
  assert.ok(s.slice(iEcriture, iLecture).includes('hintViews'), 'absent de la liste blanche d’ÉCRITURE');
  assert.ok(s.slice(iLecture).includes('hintViews'), 'absent de la liste blanche de LECTURE');
});

test('V76 · CP7 — les aides d’un exercice ne fuient pas vers un autre', () => {
  const vues = [
    normalizeHintView(cmd({ exerciseId: 'a', action: 'INDICE' }), { now: T0 }),
    normalizeHintView(cmd({ exerciseId: 'b', action: 'MODELE_MENTAL' }), { now: T0 }),
  ];
  assert.deepEqual(actionsVues(vues, 'a'), ['INDICE']);
  assert.deepEqual(actionsVues(vues, 'b'), ['MODELE_MENTAL']);
  assert.equal(aidesDe(vues, 'c').length, 0);
});

test('V76 · CP7 — la liste persistée est triée et dédupliquée à la lecture', () => {
  const tard = normalizeHintView(cmd({ action: 'MODELE_MENTAL' }), { now: '2026-09-02T10:00:00.000Z' });
  const tot = normalizeHintView(cmd({ action: 'INDICE' }), { now: T0 });
  const l = normalizeHintViews([tard, tot, tot]);
  assert.equal(l.length, 2, 'doublon conservé');
  assert.ok(l[0].at < l[1].at, 'liste non triée par date');
  assert.equal(hintViewKey(l[0]), hintViewKey(tot));
});

test('V76 · CP7 — la provenance est RENDUE, et sans aucune marque de dévaluation', () => {
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  assert.match(route, /provenanceDeLaReussite\(/, 'la route ne calcule pas la provenance');
  const payload = route.slice(route.lastIndexOf('NextResponse.json({ ok: true, attempt'));
  assert.match(payload.slice(0, 400), /\bprovenance\b/, 'la provenance n’est pas publiée');

  const ui = lire('app/lab/[exerciseId]/LabWorkspace.tsx');
  assert.match(ui, /setProvenance/, 'la surface ne lit pas la provenance');
  assert.match(ui, /provenance\.lecture/, 'la phrase de provenance n’est pas rendue');

  // Le ton compte autant que le fait : une réussite après aide reste une
  // réussite. Ni avertissement, ni badge, ni couleur d'alerte.
  const css = lire('app/globals.css');
  const bloc = css.slice(css.indexOf('.lab-provenance'), css.indexOf('.lab-provenance') + 300);
  assert.ok(bloc.length > 20, 'la provenance n’a pas de style propre');
  assert.doesNotMatch(bloc, /--danger|--warn|--error|red/i,
    'la provenance est rendue comme un avertissement : le contrat l’interdit');
});
