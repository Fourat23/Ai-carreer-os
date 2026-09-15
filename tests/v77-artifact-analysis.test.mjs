// V77 · CP7 — QUATRE SURFACES ANALYSAIENT VRAIMENT, ET N'ÉCRIVAIENT RIEN.
//
// ── CE QUE LE CP0 A MESURÉ ──────────────────────────────────────────────
//
// `kubernetes`, `cloud-lab`, `cloud-foundations` et `security` valident un
// artefact contre un schéma (`422` s'il est mal formé), puis rendent des
// diagnostics classés par sévérité et par dimension. Réponse `200`, résultat
// substantiel, **zéro octet écrit**. C'est la moitié de la dette `D7` que le
// CP3 n'avait pas couverte.
//
// ── LE PIÈGE QUE CE CHECKPOINT DOIT ÉVITER ──────────────────────────────
//
// Il aurait été facile de traiter `0 diagnostic` comme une réussite : quatre
// surfaces de plus en `VALIDATED`, et un tableau de couverture flatteur. C'est
// faux, et la raison tient en une phrase :
//
//   > L'analyseur signale ce qu'il SAIT reconnaître.
//
// Une architecture vide déclenche peu de règles. `0 diagnostic` veut dire
// « rien de ce que je sais détecter », jamais « c'est juste ». Récompenser ce
// silence reviendrait à récompenser le vide.
//
// La seconde garde est moins visible et compte autant : les quatre routes
// acceptent `analyze` SANS artefact et analysent alors la fixture du produit.
// Enregistrer cela reviendrait à compter une page vue comme du travail.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  SURFACES_ANALYTIQUES, SEVERITES, CHAMPS_INTERDITS, MAX_ARTIFACT_ANALYSES,
  normalizeArtifactAnalysis, normalizeArtifactAnalyses, artifactAnalysisKey,
  empreinteDArtefact, historiqueDeLArtefact, lectureDesAnalyses,
} from '../lib/artifact-analysis.mjs';
import { applyCommand, COMMANDS } from '../lib/learning-engine.mjs';
import { migrateToV7, writeActiveTrack, activeTrackProgress, emptyFlat, FAITS_DU_PRODUIT } from '../lib/progress-store.mjs';
import { serializeBackupV3, parseBackupV3 } from '../lib/backup.mjs';
import { SURFACES_USAGE } from '../lib/usage-event.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const T = (s = 0) => `2026-09-15T12:00:${String(s).padStart(2, '0')}.000Z`;
const base = { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} };
const cmd = (o = {}) => ({
  type: 'RECORD_ARTIFACT_ANALYSIS', surface: 'kubernetes', artifactId: 'k8s-probes',
  artefactFourni: true, diagnostics: 3,
  parSeverite: { blocking: 1, risk: 2 }, dimensions: ['resilience'],
  empreinte: 'fnv1a-deadbeef-42',
  provenance: { producer: 'artifact-analyzer', method: 'POST /api/kubernetes/[id] action=analyze' },
  ...o,
});

// ── 1 · LA GARDE QUI COMPTE LE PLUS ────────────────────────────────────

test('V77 · CP7 — SANS artefact posté, AUCUN fait n’est écrit', () => {
  // Analyser la fixture du produit n'est pas un travail de l'apprenant : c'est
  // une page qui s'affiche. Refus, pas valeur par défaut.
  assert.equal(normalizeArtifactAnalysis(cmd({ artefactFourni: false }), { now: T() }), null);
  assert.equal(normalizeArtifactAnalysis(cmd({ artefactFourni: undefined }), { now: T() }), null);
  const r = applyCommand({ ...base }, cmd({ artefactFourni: false }), { now: new Date(T()) });
  assert.equal(r.ok, false);
  assert.equal(r.code, 'INVALID_ARTIFACT_ANALYSIS');
});

test('V77 · CP7 — les quatre routes ne notent l’analyse QUE si un artefact est fourni', () => {
  // Deux gardes, pas une : le module pur refuse, et l'écriture partagée sort
  // avant même d'appeler le moteur. Vérifié sur les quatre routes.
  const helper = lire('lib/artifact-analysis-server.ts');
  assert.match(helper, /if \(!artefactFourni\) return;/);
  for (const [f, champ] of [
    ['app/api/kubernetes/[id]/route.ts', 'body.manifest'],
    ['app/api/cloud-lab/[id]/route.ts', 'body.topology'],
    ['app/api/cloud-foundations/[id]/route.ts', 'body.architecture'],
    ['app/api/security/[id]/route.ts', 'body.scenario'],
  ]) {
    const src = lire(f);
    assert.ok(src.includes('noterAnalyse('), `${f} : aucune écriture`);
    assert.ok(src.includes(`Boolean(${champ} && typeof ${champ} === 'object')`),
      `${f} : la présence de l’artefact n’est pas testée`);
  }
});

test('V77 · CP7 — l’écriture vit dans UN seul module, pas recopiée quatre fois', () => {
  // Quatre copies de la même écriture divergeraient, et l'une finirait par
  // compter ce que les trois autres refusent. C'est la leçon des listes
  // blanches du CP3, appliquée avant d'en payer le prix.
  for (const f of ['app/api/kubernetes/[id]/route.ts', 'app/api/cloud-lab/[id]/route.ts',
    'app/api/cloud-foundations/[id]/route.ts', 'app/api/security/[id]/route.ts']) {
    assert.equal(lire(f).includes('RECORD_ARTIFACT_ANALYSIS'), false,
      `${f} construit la commande lui-même au lieu d’appeler l’écriture partagée`);
  }
  assert.ok(lire('lib/artifact-analysis-server.ts').includes('RECORD_ARTIFACT_ANALYSIS'));
});

// ── 2 · AUCUN VERDICT, JAMAIS ──────────────────────────────────────────

test('V77 · CP7 — `0 diagnostic` ne devient JAMAIS une réussite', () => {
  const a = normalizeArtifactAnalysis(cmd({ diagnostics: 0, parSeverite: {} }), { now: T() });
  assert.equal(a.diagnostics, 0);
  for (const champ of CHAMPS_INTERDITS) {
    assert.equal(champ in a, false, `« ${champ} » ne doit pas exister sur le fait`);
  }
  assert.equal(a.niveau, 'OBSERVED');
  const l = lectureDesAnalyses([a], 'kubernetes', 'k8s-probes');
  assert.equal(l.vautReussite, false);
});

test('V77 · CP7 — les champs d’issue envoyés par l’appelant n’entrent pas', () => {
  const a = normalizeArtifactAnalysis(
    cmd({ passed: true, score: 100, outcome: 'success', validation: { status: 'passed' } }),
    { now: T() },
  );
  for (const champ of CHAMPS_INTERDITS) assert.equal(champ in a, false, champ);
});

test('V77 · CP7 — le niveau est une CONSTANTE structurelle, pas un résultat', () => {
  // La surface ne sait pas juger, donc elle ne jugera jamais — quel que soit ce
  // qui est soumis, et quel que soit le nombre de diagnostics.
  for (const n of [0, 1, 50]) {
    const a = normalizeArtifactAnalysis(cmd({ diagnostics: n, niveau: 'VALIDATED' }), { now: T() });
    assert.equal(a.niveau, 'OBSERVED', `${n} diagnostics`);
  }
});

test('V77 · CP7 — `simulation` est une constante : aucun cluster, aucun cloud réel', () => {
  const a = normalizeArtifactAnalysis(cmd({ simulation: false }), { now: T() });
  assert.equal(a.simulation, true);
});

test('V77 · CP7 — la lecture décrit, et refuse de lire une baisse comme un progrès', () => {
  let p = { ...base };
  for (const [i, d] of [12, 7, 3].entries()) {
    p = applyCommand(p, cmd({ diagnostics: d, empreinte: `v${i}` }), { now: new Date(T(i)) }).progress;
  }
  const l = lectureDesAnalyses(p.artifactAnalyses, 'kubernetes', 'k8s-probes');
  assert.deepEqual(l.diagnostics, [12, 7, 3]);
  assert.match(l.lecture, /n’est pas un verdict/);
  for (const interdit of ['progress', 'amélior', 'réussi', 'mieux']) {
    assert.equal(l.lecture.toLowerCase().includes(interdit), false, `la lecture ne doit pas juger (« ${interdit} »)`);
  }
});

test('V77 · CP7 — aucun artefact soumis est une DONNÉE, pas un trou', () => {
  const l = lectureDesAnalyses([], 'security', 'jamais-touche');
  assert.equal(l.soumissions, 0);
  assert.match(l.lecture, /Aucun artefact soumis/);
});

// ── 3 · VOCABULAIRE ET DISCIPLINE COMMUNE ──────────────────────────────

test('V77 · CP7 — quatre surfaces, et le vocabulaire est FERMÉ', () => {
  assert.deepEqual([...SURFACES_ANALYTIQUES], ['kubernetes', 'cloud-lab', 'cloud-foundations', 'security']);
  assert.equal(normalizeArtifactAnalysis(cmd({ surface: 'pipelines' }), { now: T() }), null,
    '`pipelines` n’est PAS une surface analytique — la route n’accepte aucun candidat');
  assert.equal(normalizeArtifactAnalysis(cmd({ surface: 'terminal' }), { now: T() }), null);
});

test('V77 · CP7 — une sévérité inconnue n’entre pas (liste blanche, pas filtre)', () => {
  const a = normalizeArtifactAnalysis(
    cmd({ parSeverite: { blocking: 1, catastrophique: 9, maitrise: 0.9 } }),
    { now: T() },
  );
  assert.deepEqual(Object.keys(a.parSeverite), ['blocking']);
  assert.deepEqual([...SEVERITES], ['blocking', 'risk', 'warning', 'observation']);
});

test('V77 · CP7 — provenance obligatoire, horloge serveur, version de schéma', () => {
  assert.equal(normalizeArtifactAnalysis({ ...cmd(), provenance: undefined }, { now: T() }), null);
  const a = normalizeArtifactAnalysis(cmd(), { now: T() });
  assert.equal(a.at, T());
  assert.ok(Number.isInteger(a.schemaVersion));
});

// ── 4 · L'EMPREINTE, ET CE QU'ELLE DOIT DISTINGUER ─────────────────────

test('V77 · CP7 — deux artefacts DIFFÉRENTS ont des empreintes différentes', () => {
  // `empreinteReponses` sérialise `clé=valeur` : sur un manifeste imbriqué,
  // tout deviendrait `[object Object]` et deux architectures distinctes
  // auraient la même empreinte — l'inverse de ce qu'on demande à une empreinte.
  const a = { resources: [{ kind: 'Deployment', spec: { replicas: 1 } }] };
  const b = { resources: [{ kind: 'Deployment', spec: { replicas: 3 } }] };
  assert.notEqual(empreinteDArtefact(a), empreinteDArtefact(b));
});

test('V77 · CP7 — l’empreinte ne dépend pas de l’ordre des clés', () => {
  assert.equal(
    empreinteDArtefact({ b: 2, a: { y: 1, x: 2 } }),
    empreinteDArtefact({ a: { x: 2, y: 1 }, b: 2 }),
  );
});

test('V77 · CP7 — un rejeu réseau ne compte pas deux analyses', () => {
  const r1 = applyCommand({ ...base }, cmd(), { now: new Date(T()) });
  const r2 = applyCommand(r1.progress, cmd(), { now: new Date(T()) });
  assert.deepEqual(r2.effects, ['noop:artifact-analysis:duplicate']);
  assert.equal(r2.progress.artifactAnalyses.length, 1);
});

test('V77 · CP7 — deux VERSIONS d’un artefact sont deux productions, même seconde', () => {
  const r1 = applyCommand({ ...base }, cmd({ empreinte: 'v1' }), { now: new Date(T()) });
  const r2 = applyCommand(r1.progress, cmd({ empreinte: 'v2' }), { now: new Date(T()) });
  assert.equal(r2.progress.artifactAnalyses.length, 2);
  assert.notEqual(
    artifactAnalysisKey(r2.progress.artifactAnalyses[0]),
    artifactAnalysisKey(r2.progress.artifactAnalyses[1]),
  );
});

test('V77 · CP7 — les artefacts d’une surface ne fuient pas vers une autre', () => {
  let p = { ...base };
  p = applyCommand(p, cmd({ surface: 'kubernetes', artifactId: 'a' }), { now: new Date(T(1)) }).progress;
  p = applyCommand(p, cmd({ surface: 'security', artifactId: 'a' }), { now: new Date(T(2)) }).progress;
  assert.equal(historiqueDeLArtefact(p.artifactAnalyses, 'kubernetes', 'a').length, 1);
  assert.equal(historiqueDeLArtefact(p.artifactAnalyses, 'security', 'a').length, 1);
  assert.equal(historiqueDeLArtefact(p.artifactAnalyses, 'cloud-lab', 'a').length, 0);
});

// ── 5 · PERSISTANCE ────────────────────────────────────────────────────

test('V77 · CP7 — le fait survit au disque ET à sa propre sauvegarde', () => {
  const r = applyCommand(activeTrackProgress(migrateToV7({})), cmd(), { now: new Date(T()) });
  const v3 = writeActiveTrack(migrateToV7({}), r.progress);
  const relu = activeTrackProgress(JSON.parse(JSON.stringify(v3)));
  assert.equal(relu.artifactAnalyses.length, 1);

  const restaure = parseBackupV3(JSON.stringify(serializeBackupV3(v3, {})), new Map());
  const t = restaure.v3.tracks[restaure.v3.activeTrackId];
  assert.equal(t.artifactAnalyses.length, 1, 'perdu à la restauration de sa propre sauvegarde');

  assert.equal(FAITS_DU_PRODUIT.includes('artifactAnalyses'), true);
  assert.ok(Array.isArray(emptyFlat().artifactAnalyses));
  assert.equal(COMMANDS.includes('RECORD_ARTIFACT_ANALYSIS'), true);
});

test('V77 · CP7 — la liste est bornée et triée', () => {
  const brut = [];
  for (let i = 0; i < MAX_ARTIFACT_ANALYSES + 10; i += 1) {
    brut.push({ ...cmd({ empreinte: `e${i}` }), at: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString() });
  }
  const n = normalizeArtifactAnalyses(brut);
  assert.equal(n.length, MAX_ARTIFACT_ANALYSES);
  const dates = n.map((a) => a.at);
  assert.deepEqual(dates, [...dates].sort());
});

// ── 6 · `pipelines` — LE RENVERSEMENT DU CP1, TENU ─────────────────────

test('V77 · CP7 — `pipelines` n’écrit PAS d’ArtifactAnalysis, et c’est la décision', () => {
  // La route accepte `{ action, event, approved }` : aucun pipeline candidat.
  // L'apprenant choisit un déclencheur sur une fixture fournie par le produit —
  // deux apprenants obtiennent le même résultat. Le statut mesure la fixture,
  // pas la personne.
  const src = lire('app/api/pipelines/[id]/route.ts');
  assert.equal(src.includes('RECORD_ARTIFACT_ANALYSIS'), false);
  assert.equal(src.includes('noterAnalyse'), false);
  assert.equal(src.includes('RECORD_USAGE_EVENT'), true, 'l’usage, lui, est observable');
  assert.equal(SURFACES_USAGE.includes('pipelines'), true);
  // Et le verdict du pipeline n'est PAS recopié dans le fait.
  const bloc = src.slice(src.indexOf('RECORD_USAGE_EVENT'), src.indexOf('RECORD_USAGE_EVENT') + 600);
  for (const interdit of ['run.status', 'passed', 'success', 'failed', 'blocked']) {
    assert.equal(bloc.includes(interdit), false, `l’usage ne doit pas porter « ${interdit} »`);
  }
});

test('V77 · CP7 — aucune preuve ne naît d’une analyse d’artefact', () => {
  const avant = activeTrackProgress(migrateToV7({}));
  const r = applyCommand(avant, cmd(), { now: new Date(T()) });
  const bouge = Object.keys({ ...avant, ...r.progress })
    .filter((k) => JSON.stringify(r.progress[k]) !== JSON.stringify(avant[k]));
  assert.deepEqual(bouge, ['artifactAnalyses']);
});

test('V77 · CP7 — AUCUN moteur ne connaît `artifactAnalyses`', () => {
  for (const f of ['lib/competency.mjs', 'lib/retention.mjs', 'lib/recovery-mode.mjs', 'lib/evidence.mjs']) {
    const src = lire(f);
    assert.equal(src.includes('artifactAnalyses'), false, `${f} ne doit pas lire le champ`);
    assert.equal(src.includes('artifact-analysis'), false, `${f} ne doit pas importer le module`);
  }
});
