// CP7 (V24) — parcours « AppSec & Cloud Security Foundations » (appsec-cloud-security-v1).
// Le 5ᵉ parcours réutilise des journées EXISTANTES (aucun curriculum dupliqué),
// est piloté par les données, disponible/sélectionnable, isolé des autres parcours,
// et couvre les enrichissements V24 (jours 68/85/298). Le moteur de progression
// (v3, missions, preuves, skills) est INCHANGÉ : ce test prouve l'intégration.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  buildCatalogue, resolveTrackDays, getTrackModules, isTrackAvailable, trackNeighbors,
  APPSEC_CLOUD_TRACK_ID, DEFAULT_TRACK_ID,
} from '../lib/catalogue.mjs';
import { trackDaySets, classifyExercise } from '../lib/exercise-context.mjs';
import { buildDayExerciseIndex, daysForExercise } from '../lib/day-exercises.mjs';
import { buildIndex } from '../lib/search.mjs';
import {
  migrateToV7, enrollTrack, setActiveTrack, writeActiveTrack, activeTrackProgress,
} from '../lib/progress-store.mjs';
import { recordExerciseSuccess } from '../lib/lab-progress.mjs';
import { serializeBackupV3, parseBackupV3 } from '../lib/backup.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const cat = buildCatalogue(program);

// Les journées d'ancrage enrichies par V24 (cf. docs/architecture/v24-enrichment-plan.json).
const V24_DAYS = [68, 85, 298];
// Les exercices déterministes de cybersécurité (CP5) reliés à ces journées.
const SEC_EX = [
  'sec-mask-secrets', 'sec-classify-sensitive', 'sec-secret-response-order', 'sec-remediation-order',
  'sec-rbac-wildcard', 'sec-least-privilege', 'sec-securitycontext', 'sec-networkpolicy-open', 'sec-image-digest',
  'sec-lockfile-diff', 'sec-typosquat', 'sec-sbom-added', 'sec-cve-affected', 'sec-blast-radius', 'sec-recovery-decision',
];

test('AppSec : parcours DISPONIBLE, dérivé des données, sans nombre magique', () => {
  const t = cat.tracks.find((x) => x.id === APPSEC_CLOUD_TRACK_ID);
  assert.ok(t, 'parcours AppSec présent dans le catalogue');
  assert.equal(isTrackAvailable(t), true, 'AppSec est disponible/sélectionnable');
  assert.equal(t.status, 'available');
  const days = resolveTrackDays(cat, t);
  assert.equal(t.totalDays, days.length, 'durée dérivée des journées réelles');
  assert.ok(days.length > 0, 'au moins une journée');
  // Aucune journée dupliquée, toutes existantes.
  assert.equal(new Set(days).size, days.length, 'aucune journée dupliquée');
  const validDays = new Set(program.days.map((d) => d.day));
  for (const d of days) assert.ok(validDays.has(d), `jour ${d} existe réellement`);
});

test('AppSec : modules non vides, ordre pédagogique du simple vers le complexe', () => {
  const t = cat.tracks.find((x) => x.id === APPSEC_CLOUD_TRACK_ID);
  const mods = getTrackModules(cat, t);
  assert.ok(mods.length >= 6, 'couverture large (≥ 6 modules)');
  for (const m of mods) assert.ok(m.dayRefs.length > 0, `module ${m.id} non vide`);
  // Le premier module pose la surface HTTP/API (fondation) ; le dernier la CI/CD (aval).
  assert.equal(mods[0].id, 'acs-01-http-api');
  assert.equal(mods[mods.length - 1].id, 'acs-07-cicd-secure');
});

test('AppSec : couvre les enrichissements V24 (jours 68, 85, 298)', () => {
  const days = new Set(resolveTrackDays(cat, APPSEC_CLOUD_TRACK_ID));
  for (const d of V24_DAYS) assert.ok(days.has(d), `enrichissement V24 du jour ${d} couvert par AppSec`);
});

test('AppSec : les 15 exercices sécurité sont ATTEIGNABLES depuis le parcours', () => {
  const raw = JSON.parse(readFileSync(R('data/day-exercises.json'), 'utf8'));
  const exerciseIds = new Set(readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));
  const idx = buildDayExerciseIndex(raw, exerciseIds, new Set(program.days.map((d) => d.day)));
  const appsecDays = new Set(resolveTrackDays(cat, APPSEC_CLOUD_TRACK_ID));
  for (const id of SEC_EX) {
    assert.ok(exerciseIds.has(id), `${id} présent`);
    const days = daysForExercise(idx, id);
    assert.ok(days.some((d) => appsecDays.has(d)), `${id} atteignable depuis AppSec`);
  }
});

test('AppSec : classification d’exercice — un exercice sécurité est actif quand AppSec est actif', () => {
  const sets = trackDaySets(cat);
  assert.ok(sets.has(APPSEC_CLOUD_TRACK_ID), 'AppSec présent dans les ensembles de jours');
  // sec-secret-response-order est relié au jour 68 (∈ AppSec).
  const ctx = classifyExercise([68], sets, APPSEC_CLOUD_TRACK_ID);
  assert.equal(ctx.inActive, true, 'jour 68 actif quand AppSec est le parcours actif');
  assert.ok(ctx.reachableTracks.includes(APPSEC_CLOUD_TRACK_ID));
});

test('AppSec : navigation BORNÉE au parcours (non contigu, jamais day±1 hors parcours)', () => {
  const days = resolveTrackDays(cat, APPSEC_CLOUD_TRACK_ID);
  // 54 → suivant = 67 (saut du reste du programme), pas 55.
  //
  // V54.2.1 — cette attente valait 71 jusqu'ici, et c'était l'empreinte d'un
  // défaut, pas un choix : `resolveTrackDays` rendait les jours dans l'ordre
  // des MODULES (… 54, 71, 79, 67, 68, 85 …). La navigation « suivant »
  // sautait donc par-dessus les jours 67 et 68 — pourtant dans le parcours —
  // pour y revenir plus tard. Les jours sont désormais chronologiques ;
  // l'intention testée (navigation BORNÉE au parcours, jamais day±1 hors
  // parcours) est inchangée et mieux servie : 54 → 67, pas 55.
  const n54 = trackNeighbors(days, 54);
  assert.equal(n54.next, 67, 'après 54, on saute à 67 (borné au parcours, et chronologique)');
  assert.ok(!days.includes(55), '55 n\'appartient pas au parcours');
  assert.equal(trackNeighbors(days, 67).next, 68, 'la suite reste chronologique');
  assert.equal(trackNeighbors(days, days[0]).prev, null, 'première journée sans précédent');
  assert.equal(trackNeighbors(days, days[days.length - 1]).next, null, 'dernière journée sans suivant');
});

test('AppSec : enrôlement, bascule aller/retour et ISOLATION de la progression', () => {
  let v3 = migrateToV7({ startDate: '2026-01-01', days: { '1': { status: 'done' } }, skills: { git: 2 }, weeklyReviews: {}, monthlyReviews: {} });
  // Foundations actif par défaut ; on enrôle et bascule sur AppSec.
  v3 = enrollTrack(v3, APPSEC_CLOUD_TRACK_ID, '1');
  v3 = setActiveTrack(v3, APPSEC_CLOUD_TRACK_ID);
  assert.equal(v3.activeTrackId, APPSEC_CLOUD_TRACK_ID);
  // Progression PROPRE à AppSec (jour 68 fait + preuve d'exercice sécurité → compétence secu).
  let flat = activeTrackProgress(v3);
  flat.days = { ...(flat.days ?? {}), '68': { status: 'done' } };
  flat = recordExerciseSuccess(flat, { exerciseId: 'sec-secret-response-order', title: 'Ordre de réponse au secret', skills: ['secu'], dayRefs: [68], at: '2026-02-02' });
  v3 = writeActiveTrack(v3, flat);

  // Isolation : la progression AppSec ne fuit PAS dans Foundations.
  assert.equal(v3.tracks[APPSEC_CLOUD_TRACK_ID].days['68'].status, 'done');
  assert.ok((v3.tracks[APPSEC_CLOUD_TRACK_ID].days['68'].evidence ?? []).some((e) => e.id === 'lab-sec-secret-response-order'), 'preuve d’exercice enregistrée');
  assert.equal(v3.tracks[APPSEC_CLOUD_TRACK_ID].skills.secu >= 1, true, 'compétence secu créditée par la preuve');
  assert.equal(v3.tracks[DEFAULT_TRACK_ID].days['68'], undefined, 'aucune fuite AppSec → Foundations');
  assert.equal(v3.tracks[DEFAULT_TRACK_ID].days['1'].status, 'done', 'Foundations conserve sa progression');
  assert.equal(v3.tracks[APPSEC_CLOUD_TRACK_ID].days['1'], undefined, 'aucune fuite Foundations → AppSec');

  // Bascule retour vers Foundations : l'état actif change, les deux progressions persistent.
  v3 = setActiveTrack(v3, DEFAULT_TRACK_ID);
  assert.equal(v3.activeTrackId, DEFAULT_TRACK_ID);
  assert.equal(activeTrackProgress(v3).days['1'].status, 'done');

  // Sauvegarde/restauration : la progression AppSec (jours, skills, preuve) survit à un roundtrip.
  const blob = JSON.stringify(serializeBackupV3(v3, {}));
  const parsed = parseBackupV3(blob);
  assert.ok(parsed.ok);
  const acs = parsed.v3.tracks[APPSEC_CLOUD_TRACK_ID];
  assert.equal(acs.days['68'].status, 'done');
  assert.ok(acs.skills.secu >= 1);
});

test('AppSec : indexé dans la recherche globale, sans fuite de données privées', () => {
  const idx = buildIndex(program, cat, [], []);
  const track = idx.find((i) => i.type === 'track' && i.href && i.href.includes(APPSEC_CLOUD_TRACK_ID));
  assert.ok(track, 'parcours AppSec trouvable via la recherche');
  const blob = JSON.stringify(idx);
  assert.ok(!/"reference"|solution\.mjs|docSpec|requireMentions|private/.test(blob), 'aucune donnée interne indexée');
});
