// CP9 (V19) — E2E multi-parcours (4 parcours) : le nouveau parcours s'enrôle,
// progresse (jours, compétences, mission), se sauvegarde et se restaure sans
// perte NI contamination des 3 parcours existants ; migration additive = no-op.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  migrateToV7, enrollTrack, setActiveTrack, writeActiveTrack, activeTrackProgress,
} from '../lib/progress-store.mjs';
import { recordExerciseSuccess } from '../lib/lab-progress.mjs';
import { serializeBackupV3, parseBackupV3 } from '../lib/backup.mjs';
import { startMission, submitDeliverable } from '../lib/mission-state.mjs';
import { validateMission } from '../lib/mission.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';
import {
  buildCatalogue, resolveTrackDays,
  DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID, SYSTEMS_CLOUD_TRACK_ID,
} from '../lib/catalogue.mjs';

const program = JSON.parse(readFileSync(new URL('../data/program.json', import.meta.url), 'utf8'));
const cat = buildCatalogue(program);
const fs = await import('node:fs');
const exIds = new Set(fs.readdirSync(new URL('../data/exercises/', import.meta.url)).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));
const mission = JSON.parse(readFileSync(new URL('../data/missions/port-occupe-service-indisponible.json', import.meta.url), 'utf8'));

test('le 4ᵉ parcours est disponible et couvre les jours attendus', () => {
  const t = cat.tracks.find((x) => x.id === SYSTEMS_CLOUD_TRACK_ID);
  assert.ok(t && t.status === 'available');
  const days = resolveTrackDays(cat, t);
  assert.equal(days.length, t.totalDays);
  for (const d of [1, 2, 50, 71, 72]) assert.ok(days.includes(d), `jour ${d} dans le parcours`);
  assert.equal(days.includes(82), false, 'non contigu : saut du jour 82 (Python)');
});

test('la mission V19 est valide et ses livrables auto pointent des exercices réels', () => {
  const ctx = {
    validDays: new Set(program.days.map((d) => d.day)),
    trackIds: new Set([DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID, SYSTEMS_CLOUD_TRACK_ID]),
    skillIds: { has: (s) => isKnownSkill(s) },
    exerciseIds: exIds,
  };
  assert.deepEqual(validateMission(mission, ctx), { ok: true, errors: [] });
});

test('E2E : enrôlement, progression (jour + compétence + mission), sauvegarde/restauration sans perte ni contamination', () => {
  // Départ : Foundations avec un peu de progression.
  let v3 = migrateToV7({ startDate: '2026-01-01', days: { '1': { status: 'done' } }, skills: { linux: 2 }, weeklyReviews: {}, monthlyReviews: {} });
  assert.equal(Object.keys(v3.tracks).length, 1);

  // Enrôle le 4ᵉ parcours et l'active.
  v3 = enrollTrack(v3, SYSTEMS_CLOUD_TRACK_ID, '1');
  v3 = setActiveTrack(v3, SYSTEMS_CLOUD_TRACK_ID);
  assert.equal(v3.activeTrackId, SYSTEMS_CLOUD_TRACK_ID);

  // Progression sur le parcours actif : jour 72 fait, compétence, preuve d'exercice, mission.
  let flat = activeTrackProgress(v3);
  flat.days = { ...(flat.days ?? {}), '72': { status: 'done', answer: 'chmod 600' } };
  flat.skills = { ...(flat.skills ?? {}), linux: 3 };
  flat = recordExerciseSuccess(flat, 'sys-perms-to-octal', { at: '2026-02-02' });
  flat = startMission(flat, mission.id);
  flat = submitDeliverable(flat, mission, 'incident-log', { status: 'structure-valid', content: 'journal rédigé' });
  v3 = writeActiveTrack(v3, flat);

  // Sauvegarde + restauration.
  const wrapped = serializeBackupV3(v3, {});
  const parsed = parseBackupV3(JSON.stringify(wrapped));
  assert.ok(parsed.ok, 'restauration valide');
  const r = parsed.v3;

  // 4 parcours (Foundations + le nouveau enrôlé — les autres non enrôlés restent absents jusqu'à enrôlement).
  assert.equal(r.activeTrackId, SYSTEMS_CLOUD_TRACK_ID);
  const sc = r.tracks[SYSTEMS_CLOUD_TRACK_ID];
  assert.equal(sc.days['72'].answer, 'chmod 600');
  assert.equal(sc.skills.linux, 3);
  assert.equal(sc.missions[mission.id].deliverables['incident-log'].status, 'structure-valid');

  // Aucune contamination : Foundations garde SA progression, inchangée.
  const f = r.tracks[DEFAULT_TRACK_ID];
  assert.equal(f.days['1'].status, 'done');
  assert.equal(f.days['72'], undefined, 'la progression du nouveau parcours ne fuit pas dans Foundations');
  assert.equal(f.skills.linux, 2, 'la compétence de Foundations reste à sa valeur');

  // Aucune fuite de solution/test privé dans l'export.
  assert.ok(!/"reference"|referenceSolution|solution\.mjs/.test(JSON.stringify(wrapped)), 'aucune solution exportée');
});

test('migration additive : une progression v3 sans le 4ᵉ parcours reste valide (no-op)', () => {
  const v3 = migrateToV7({ startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
  // Le 4ᵉ parcours n'est pas enrôlé : la progression reste valide et se restaure.
  assert.equal(v3.tracks[SYSTEMS_CLOUD_TRACK_ID], undefined, 'aucun parcours fantôme injecté par la migration');
  const wrapped = serializeBackupV3(v3, {});
  assert.ok(parseBackupV3(JSON.stringify(wrapped)).ok);
  // On peut ensuite l'enrôler à la demande (additif).
  const after = enrollTrack(v3, SYSTEMS_CLOUD_TRACK_ID, '1');
  assert.ok(after.tracks[SYSTEMS_CLOUD_TRACK_ID], 'enrôlement possible après coup');
});
