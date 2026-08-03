// CP9 (V20) — intégration : invariants DÉRIVÉS des sources (gates non figées),
// contenu Docker atteignable + indexé sans fuite, sauvegarde des états Docker,
// aucune donnée de terminal/PID/conteneur persistée.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateMissionCatalogue } from '../lib/mission.mjs';
import { buildCatalogue, resolveTrackDays, DEFAULT_TRACK_ID, SYSTEMS_CLOUD_TRACK_ID } from '../lib/catalogue.mjs';
import { buildDayExerciseIndex, daysForExercise } from '../lib/day-exercises.mjs';
import { buildIndex } from '../lib/search.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';
import { migrateToV7, enrollTrack, setActiveTrack, writeActiveTrack, activeTrackProgress } from '../lib/progress-store.mjs';
import { startMission, submitDeliverable } from '../lib/mission-state.mjs';
import { recordExerciseSuccess } from '../lib/lab-progress.mjs';
import { serializeBackupV3, parseBackupV3 } from '../lib/backup.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const cat = buildCatalogue(program);
const exerciseIds = new Set(readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));
const missions = readdirSync(R('data/missions')).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(R(`data/missions/${f}`), 'utf8')));
const DOCKER_EX = ['docker-instruction-order', 'docker-detect-secret', 'docker-detect-root', 'docker-image-size', 'docker-cmd-entrypoint', 'docker-port-mapping', 'docker-dockerignore', 'docker-layer-cache', 'docker-exit-diagnosis', 'docker-tag-vs-digest'];
const DOCKER_MIS = ['docker-containerize-api', 'docker-container-incident', 'docker-reduce-image-debt'];

test('invariant DÉRIVÉ : le catalogue de missions est valide contre les parcours RÉELS', () => {
  // trackIds dérivés du catalogue (jamais codés en dur) → survit à l'ajout d'un parcours.
  const trackIds = new Set(cat.tracks.map((t) => t.id));
  const validDays = new Set(program.days.map((d) => d.day));
  const { errors } = validateMissionCatalogue(missions, { validDays, trackIds, skillIds: { has: (s) => isKnownSkill(s) }, exerciseIds });
  assert.deepEqual(errors, [], `catalogue de missions invalide : ${errors.join(' ; ')}`);
});

test('parcours Systems & Cloud : jour Docker 320 présent, dérivé du catalogue', () => {
  const days = resolveTrackDays(cat, SYSTEMS_CLOUD_TRACK_ID);
  assert.ok(days.includes(320), 'jour Docker 320 dans le parcours Systems & Cloud');
  const t = cat.tracks.find((x) => x.id === SYSTEMS_CLOUD_TRACK_ID);
  assert.equal(t.totalDays, days.length); // durée dérivée, aucun nombre magique
});

test('10 exercices Docker présents, reliés au jour 320, atteignables depuis Foundations', () => {
  const raw = JSON.parse(readFileSync(R('data/day-exercises.json'), 'utf8'));
  const idx = buildDayExerciseIndex(raw, exerciseIds, new Set(program.days.map((d) => d.day)));
  const foundationDays = new Set(resolveTrackDays(cat, DEFAULT_TRACK_ID));
  for (const id of DOCKER_EX) {
    assert.ok(exerciseIds.has(id), `${id} présent`);
    const days = daysForExercise(idx, id);
    assert.ok(days.includes(320), `${id} relié au jour 320`);
    assert.ok(days.some((d) => foundationDays.has(d)), `${id} atteignable depuis Foundations`);
  }
});

test('3 missions Docker publiées, catégories valides, livrable auto + revue humaine', () => {
  for (const id of DOCKER_MIS) {
    const m = missions.find((x) => x.id === id);
    assert.ok(m, `${id} présente`);
    assert.equal(m.status, 'published');
    assert.ok(m.deliverables.some((d) => d.validation === 'auto' && exerciseIds.has(d.exerciseRef)), `${id} : auto relié à un exercice réel`);
    assert.ok(m.deliverables.some((d) => d.validation === 'review'), `${id} : revue humaine`);
  }
});

test('recherche : contenu Docker indexé (exercices, missions), AUCUNE fuite', () => {
  const exSummaries = readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => {
    const e = JSON.parse(readFileSync(R(`data/exercises/${f}`), 'utf8'));
    return { id: e.id, title: e.title, skills: e.skills ?? [], trackRefs: e.trackRefs ?? [] };
  });
  const misSummaries = missions.map((m) => ({ id: m.id, title: m.title, category: m.category, skills: m.skills ?? [] }));
  const idx = buildIndex(program, cat, exSummaries, misSummaries);
  const has = (href) => idx.some((i) => i.href === href);
  assert.ok(has('/lab/docker-detect-secret'), 'exercice Docker indexé');
  assert.ok(has('/missions/docker-containerize-api'), 'mission Docker indexée');
  // Anti-fuite : aucune référence/solution/test privé/docSpec dans l'index.
  const blob = JSON.stringify(idx);
  assert.ok(!/"reference"|solution\.mjs|docSpec|requireMentions|exerciseRef"|private/.test(blob), 'aucune donnée interne indexée');
});

test('sauvegarde : progression d’une mission Docker préservée ; aucune donnée terminal/PID/conteneur', () => {
  let v3 = migrateToV7({ startDate: '2026-01-01', days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
  v3 = enrollTrack(v3, SYSTEMS_CLOUD_TRACK_ID, '1');
  v3 = setActiveTrack(v3, SYSTEMS_CLOUD_TRACK_ID);
  const mission = missions.find((m) => m.id === 'docker-container-incident');
  let flat = activeTrackProgress(v3);
  flat.days = { ...(flat.days ?? {}), '320': { status: 'done' } };
  flat = recordExerciseSuccess(flat, 'docker-exit-diagnosis', { at: '2026-02-02' });
  flat = startMission(flat, mission.id);
  flat = submitDeliverable(flat, mission, 'postmortem', { status: 'structure-valid', content: 'post-mortem rédigé' });
  v3 = writeActiveTrack(v3, flat);

  const wrapped = serializeBackupV3(v3, {});
  const blob = JSON.stringify(wrapped);
  // Jamais de données volatiles de terminal/Docker dans la sauvegarde.
  for (const forbidden of ['runToken', 'containerId', 'pid', 'stdout', 'workspaceDir', 'runId']) {
    assert.ok(!blob.includes(forbidden), `la sauvegarde ne doit pas contenir ${forbidden}`);
  }
  const parsed = parseBackupV3(blob);
  assert.ok(parsed.ok);
  const sc = parsed.v3.tracks[SYSTEMS_CLOUD_TRACK_ID];
  assert.equal(sc.missions[mission.id].deliverables['postmortem'].status, 'structure-valid');
  assert.equal(sc.days['320'].status, 'done');
});
