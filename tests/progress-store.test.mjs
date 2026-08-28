// Tests du store multi-parcours v3 (lib/progress-store.mjs) — pur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PROGRESS_SCHEMA, migrateToV7, activeTrackProgress, writeActiveTrack,
  enrollTrack, setActiveTrack, tracksMeta, emptyFlat,
} from '../lib/progress-store.mjs';
import { DEFAULT_TRACK_ID } from '../lib/catalogue.mjs';

const NOW = '2026-07-25T12:00:00.000Z';

const v6 = {
  startDate: '2026-06-15',
  days: {
    '1': { status: 'done', answers: { 'sec-a': 'ma réponse' }, comprehension: 'partial',
      evidence: [{ id: 'e1', type: 'repo', title: 'Repo', description: '', url: 'https://x.com', skills: ['rag'], createdAt: NOW }],
      review: { dueAt: NOW, interval: 3, repetitions: 0, ease: 2.4, lastReviewedAt: null, reason: 'x' } },
  },
  skills: { rag: 3 },
  weeklyReviews: {}, monthlyReviews: {},
};

test('migrateToV7 : V6 plat → v3 sous le parcours par défaut, actif', () => {
  const v3 = migrateToV7(v6, NOW);
  assert.equal(v3.schemaVersion, PROGRESS_SCHEMA);
  assert.equal(v3.activeTrackId, DEFAULT_TRACK_ID);
  const t = v3.tracks[DEFAULT_TRACK_ID];
  assert.equal(t.startDate, '2026-06-15');
  assert.equal(t.days['1'].answers['sec-a'], 'ma réponse'); // réponse conservée
  assert.equal(t.days['1'].evidence[0].title, 'Repo');       // preuve conservée
  assert.equal(t.days['1'].review.interval, 3);              // révision conservée
  assert.equal(t.skills.rag, 3); // auto-évaluation DÉCLARÉE : conservée telle quelle (V65)
  assert.ok(t.enrolledAt && t.lastOpenedAt);
});

test('migrateToV7 : idempotent (v3 → v3, données stables)', () => {
  const once = migrateToV7(v6, NOW);
  const twice = migrateToV7(once, NOW);
  assert.deepEqual(twice.tracks[DEFAULT_TRACK_ID].days, once.tracks[DEFAULT_TRACK_ID].days);
  assert.equal(twice.activeTrackId, once.activeTrackId);
});

test('activeTrackProgress : vue plate V6 du parcours actif', () => {
  const flat = activeTrackProgress(migrateToV7(v6, NOW));
  assert.equal(flat.days['1'].answers['sec-a'], 'ma réponse');
  assert.equal(flat.startDate, '2026-06-15');
  assert.equal(flat.skills.rag, 3); // auto-évaluation déclarée
});

test('writeActiveTrack : réécrit le parcours actif, préserve les autres', () => {
  let v3 = enrollTrack(migrateToV7(v6, NOW), 'backend-engineer-v1', '1', NOW); // actif = backend
  v3 = setActiveTrack(v3, DEFAULT_TRACK_ID, NOW); // revient au parcours actuel
  const flat = activeTrackProgress(v3);
  flat.days['2'] = { status: 'in-progress' };
  const w = writeActiveTrack(v3, flat, NOW);
  assert.equal(w.tracks[DEFAULT_TRACK_ID].days['2'].status, 'in-progress');
  assert.ok(w.tracks['backend-engineer-v1']); // autre parcours intact
  assert.equal(w.tracks[DEFAULT_TRACK_ID].days['1'].answers['sec-a'], 'ma réponse');
});

test('enrollTrack / setActiveTrack', () => {
  const v3 = enrollTrack(migrateToV7({}, NOW), 'data-ml-v1', '1', NOW);
  assert.equal(v3.activeTrackId, 'data-ml-v1');
  assert.ok(v3.tracks['data-ml-v1']);
  const back = setActiveTrack(v3, DEFAULT_TRACK_ID, NOW);
  assert.equal(back.activeTrackId, DEFAULT_TRACK_ID);
  // setActiveTrack vers un parcours non inscrit → inchangé
  assert.equal(setActiveTrack(v3, 'jamais-inscrit', NOW).activeTrackId, 'data-ml-v1');
});

test('pollution de prototype : clé de parcours dangereuse ignorée', () => {
  const v3 = migrateToV7({ schemaVersion: 3, activeTrackId: 'x', tracks: { '__proto__': { days: {} }, x: { days: {} } } }, NOW);
  assert.equal(Object.hasOwn(v3.tracks, '__proto__'), false);
  assert.ok(v3.tracks.x);
});

test('tracksMeta : métadonnées légères', () => {
  const v3 = enrollTrack(migrateToV7(v6, NOW), 'backend-engineer-v1', '1', NOW);
  const meta = tracksMeta(v3);
  const found = meta.find((m) => m.id === DEFAULT_TRACK_ID);
  assert.equal(found.daysTracked, 1);
  assert.ok(meta.find((m) => m.id === 'backend-engineer-v1').active); // dernier inscrit = actif
});

test('emptyFlat : forme V6 vide', () => {
  assert.deepEqual(emptyFlat(), { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {}, evidence: [] });
  assert.deepEqual(activeTrackProgress(migrateToV7({}, NOW)).days, {});
});

// ── Migration des formats hérités V4/V5 (plats, sans champs Active Learning) ──
const v4 = { // V4 : progression plate legacy, pas de schemaVersion
  startDate: '2026-01-10',
  days: { '3': { status: 'done', selfScore: 4, answer: 'texte legacy', notes: 'note', checklist: { a: true }, updatedAt: NOW } },
  skills: { git: 2 },
};
const v5 = { // V5 : idem + schemaVersion, modèle de position unifié
  schemaVersion: 1,
  startDate: '2026-02-20',
  days: { '7': { status: 'in-progress', selfScore: null, answer: '', notes: '', checklist: {}, updatedAt: NOW } },
  skills: {}, weeklyReviews: {}, monthlyReviews: {},
};

test('migrateToV7 : V4 plat legacy → v3 sous parcours par défaut (aucune perte)', () => {
  const v3 = migrateToV7(v4, NOW);
  assert.equal(v3.schemaVersion, PROGRESS_SCHEMA);
  const t = v3.tracks[DEFAULT_TRACK_ID];
  assert.equal(t.startDate, '2026-01-10');
  assert.equal(t.days['3'].status, 'done');
  assert.equal(t.days['3'].answer, 'texte legacy'); // champ cœur conservé
  assert.equal(t.skills.git, 2); // auto-évaluation déclarée : conservée telle quelle
  // champs Active Learning matérialisés par la migration (jamais undefined)
  assert.ok(t.days['3'].answers && typeof t.days['3'].answers === 'object');
});

test('migrateToV7 : V5 (schemaVersion 1) → v3 ; idempotent', () => {
  const once = migrateToV7(v5, NOW);
  assert.equal(once.tracks[DEFAULT_TRACK_ID].days['7'].status, 'in-progress');
  const twice = migrateToV7(once, NOW);
  assert.deepEqual(twice.tracks[DEFAULT_TRACK_ID].days, once.tracks[DEFAULT_TRACK_ID].days);
});

test('activeTrackProgress : vue plate lisible depuis V4 et V5', () => {
  assert.equal(activeTrackProgress(migrateToV7(v4, NOW)).days['3'].answer, 'texte legacy');
  assert.equal(activeTrackProgress(migrateToV7(v5, NOW)).days['7'].status, 'in-progress');
});

// ── CP5 (V14) : isolation stricte entre deux parcours (scénario complet) ─────
import { recordExerciseSuccess } from '../lib/lab-progress.mjs';

// V65 : la compétence n'est plus un niveau écrit mais une PREUVE dans le registre.
// L'isolation entre parcours se vérifie donc sur le registre, pas sur skills[].
const hasEv = (flat, skill) => (flat.evidence ?? []).some((e) => e.competencyIds.includes(skill));

import { FULLSTACK_TRACK_ID } from '../lib/catalogue.mjs';

test('isolation : progression indépendante entre Fondations et Full-Stack', () => {
  // 1) Fondations possède une progression réelle.
  let v3 = migrateToV7({ startDate: '2026-01-01', days: {
    '3': { status: 'done', answer: 'fondations j3', notes: 'note F', selfScore: 4 },
  }, skills: { rag: 3 }, weeklyReviews: {}, monthlyReviews: {} }, NOW);
  assert.equal(v3.activeTrackId, DEFAULT_TRACK_ID);
  const foundSnapshot = JSON.stringify(v3.tracks[DEFAULT_TRACK_ID]);

  // 2) L'utilisateur démarre Full-Stack (inscription + activation).
  v3 = enrollTrack(v3, FULLSTACK_TRACK_ID, '1', NOW);
  assert.equal(v3.activeTrackId, FULLSTACK_TRACK_ID);

  // 3) Il complète une activité DANS Full-Stack (réponse + réussite d'exercice).
  const fsFlat = activeTrackProgress(v3);
  const withAnswer = { ...fsFlat, days: { ...fsFlat.days, '50': { status: 'done', answer: 'fullstack j50', notes: 'note FS' } } };
  const withProof = recordExerciseSuccess(withAnswer, { exerciseId: 'http-status', title: 'HTTP', skills: ['http'], dayRefs: [50] });
  v3 = writeActiveTrack(v3, withProof, NOW);

  // 4-5) Retour à Fondations : progression STRICTEMENT inchangée.
  v3 = setActiveTrack(v3, DEFAULT_TRACK_ID, NOW);
  const foundAfter = activeTrackProgress(v3);
  assert.equal(foundAfter.days['3'].answer, 'fondations j3');
  assert.equal(foundAfter.days['3'].notes, 'note F');
  assert.equal(foundAfter.days['50'], undefined); // l'activité FS n'a PAS contaminé Fondations
  assert.equal(hasEv(foundAfter, 'http'), false, 'la preuve FS ne fuit pas dans Fondations');
  assert.equal(foundAfter.skills.rag, 3, 'l’auto-évaluation déclarée de Fondations est restée');

  // 6-7) Retour à Full-Stack : progression correctement restaurée.
  v3 = setActiveTrack(v3, FULLSTACK_TRACK_ID, NOW);
  const fsAfter = activeTrackProgress(v3);
  assert.equal(fsAfter.days['50'].answer, 'fullstack j50');
  assert.equal(fsAfter.days['50'].evidence.length, 1);
  assert.ok(hasEv(fsAfter, 'http'), 'preuve → compétence projetée dans FS uniquement');
  assert.equal(fsAfter.days['3'], undefined); // Fondations n'a pas fuité dans FS
});

test('isolation : la preuve d’un parcours ne contamine jamais l’autre', () => {
  let v3 = migrateToV7(emptyFlat(), NOW);
  v3 = enrollTrack(v3, FULLSTACK_TRACK_ID, '1', NOW);
  const proof = recordExerciseSuccess(activeTrackProgress(v3), { exerciseId: 'ds-stack', title: 'Pile', skills: ['stack'], dayRefs: [33] });
  v3 = writeActiveTrack(v3, proof, NOW);
  // Fondations reste vierge.
  const found = v3.tracks[DEFAULT_TRACK_ID];
  assert.deepEqual(found.skills, {});
  assert.equal(Object.keys(found.days).length, 0);
});

// ── CP5 (V15) : isolation stricte des TROIS parcours ─────────────────────────
import { BACKEND_TRACK_ID } from '../lib/catalogue.mjs';

test('isolation : Backend n’altère ni Fondations ni Full-Stack', () => {
  // Fondations a une progression ; Full-Stack en a une autre.
  let v3 = migrateToV7({ startDate: '2026-01-01', days: { '3': { status: 'done', answer: 'F3' } }, skills: { rag: 3 }, weeklyReviews: {}, monthlyReviews: {} }, NOW);
  v3 = enrollTrack(v3, FULLSTACK_TRACK_ID, '1', NOW);
  v3 = writeActiveTrack(v3, { ...activeTrackProgress(v3), days: { '92': { status: 'done', answer: 'FS92' } }, skills: { react: 3 } }, NOW);

  // Démarrage Backend + activité + réussite d'exercice.
  v3 = enrollTrack(v3, BACKEND_TRACK_ID, '1', NOW);
  assert.equal(v3.activeTrackId, BACKEND_TRACK_ID);
  const be = recordExerciseSuccess({ ...activeTrackProgress(v3), days: { '50': { status: 'done', answer: 'BE50' } } }, { exerciseId: 'api-router', title: 'Routeur', skills: ['http'], dayRefs: [52] });
  v3 = writeActiveTrack(v3, be, NOW);

  // Fondations strictement inchangé.
  const f = v3.tracks[DEFAULT_TRACK_ID];
  assert.equal(f.days['3'].answer, 'F3');
  assert.equal(f.days['50'], undefined);
  assert.equal(f.days['52'], undefined);
  assert.equal(hasEv(f, 'http'), false);

  // Full-Stack strictement inchangé.
  const fs = v3.tracks[FULLSTACK_TRACK_ID];
  assert.equal(fs.days['92'].answer, 'FS92');
  assert.equal(fs.days['50'], undefined);
  assert.equal(fs.skills.react, 3, 'auto-évaluation déclarée du parcours FS');
  assert.equal(hasEv(fs, 'http'), false);

  // Backend possède sa propre progression + preuve + compétence.
  const b = v3.tracks[BACKEND_TRACK_ID];
  assert.equal(b.days['50'].answer, 'BE50');
  assert.equal(b.days['52'].evidence.length, 1);
  assert.ok(hasEv(b, 'http'));
  assert.equal(b.days['3'], undefined);   // Fondations n'a pas fuité
  assert.equal(b.days['92'], undefined);  // Full-Stack n'a pas fuité
});

test('isolation : bascule aller-retour entre les trois parcours conserve chaque état', () => {
  let v3 = migrateToV7(emptyFlat(), NOW);
  v3 = enrollTrack(v3, FULLSTACK_TRACK_ID, '1', NOW);
  v3 = writeActiveTrack(v3, { ...activeTrackProgress(v3), skills: { react: 3 } }, NOW);
  v3 = enrollTrack(v3, BACKEND_TRACK_ID, '1', NOW);
  v3 = writeActiveTrack(v3, { ...activeTrackProgress(v3), skills: { http: 3 } }, NOW);
  // Retour Fondations, puis Full-Stack, puis Backend.
  v3 = setActiveTrack(v3, DEFAULT_TRACK_ID, NOW);
  assert.deepEqual(activeTrackProgress(v3).skills, {});
  v3 = setActiveTrack(v3, FULLSTACK_TRACK_ID, NOW);
  assert.equal(activeTrackProgress(v3).skills.react, 3);
  v3 = setActiveTrack(v3, BACKEND_TRACK_ID, NOW);
  assert.equal(activeTrackProgress(v3).skills.http, 3);
});
