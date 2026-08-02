// CP2 (V18) — modèle de mission : validation pure, vue publique anti-fuite,
// validation structurelle honnête des documents, et machine à états sur la
// progression v3 (démarrage, soumission, transitions, preuve, isolation).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MISSION_CATEGORIES, DELIVERABLE_KINDS, VALIDATION_MODES,
  validateMission, validateMissionCatalogue, publicMissionView, validateDocumentStructure,
} from '../lib/mission.mjs';
import {
  MISSION_STATUSES, startMission, submitDeliverable, computeMissionStatus,
  recordMissionCompletion, readMissionState, missionProgress,
} from '../lib/mission-state.mjs';

const ctx = () => ({
  validDays: new Set([69, 80, 85]),
  trackIds: new Set(['ai-engineer-foundations-v1', 'fullstack-typescript', 'backend-engineer-v1']),
  skillIds: new Set(['functions', 'arrays', 'testing', 'se']),
  exerciseIds: new Set(['debt-audit', 'refactor-legacy']),
});

const valid = () => ({
  id: 'demo-mission', title: 'Mission démo', description: 'desc',
  category: 'debt-maintenance', difficulty: 3, estimatedHours: 4,
  context: 'Un contexte métier crédible et suffisamment détaillé.',
  skills: ['functions'], trackRefs: ['ai-engineer-foundations-v1'], dayRefs: [69],
  exerciseRefs: ['debt-audit'],
  deliverables: [
    { id: 'code', kind: 'code', title: 'Exercice', required: true, validation: 'auto', exerciseRef: 'debt-audit' },
    { id: 'adr', kind: 'document', title: 'ADR', required: true, validation: 'structural', docSpec: { requiredSections: ['Contexte', 'Décision'], minLength: 50 } },
    { id: 'notes', kind: 'report', title: 'Auto-éval', required: false, validation: 'review' },
  ],
  rubric: [{ label: 'Tests verts', blocking: true }],
  status: 'published', version: '1',
});

test('constantes', () => {
  assert.deepEqual(MISSION_CATEGORIES, ['debt-maintenance', 'performance', 'documentation', 'incident']);
  assert.ok(DELIVERABLE_KINDS.includes('document') && VALIDATION_MODES.includes('structural'));
  assert.equal(MISSION_STATUSES[MISSION_STATUSES.length - 1], 'done');
});

test('mission valide → aucune erreur', () => {
  assert.deepEqual(validateMission(valid(), ctx()), { ok: true, errors: [] });
});

test('détecte champ inconnu, id invalide, catégorie/difficulté hors bornes', () => {
  const bad = { ...valid(), id: 'Bad_Id', category: 'x', difficulty: 9, surprise: 1 };
  const r = validateMission(bad, ctx());
  assert.ok(r.errors.some((e) => /champ inconnu/.test(e)));
  assert.ok(r.errors.some((e) => /id invalide/.test(e)));
  assert.ok(r.errors.some((e) => /catégorie invalide/.test(e)));
  assert.ok(r.errors.some((e) => /difficulté hors bornes/.test(e)));
});

test('détecte journée/compétence/exercice inexistants', () => {
  const bad = { ...valid(), dayRefs: [999], skills: ['fantome'], exerciseRefs: ['nope'] };
  const r = validateMission(bad, ctx());
  assert.ok(r.errors.some((e) => /journée inexistante/.test(e)));
  assert.ok(r.errors.some((e) => /compétence inconnue/.test(e)));
  assert.ok(r.errors.some((e) => /exercice lié inexistant/.test(e)));
});

test('livrable auto sans exerciseRef, structural sans docSpec → erreurs', () => {
  const bad = { ...valid(), deliverables: [
    { id: 'a', kind: 'code', title: 'x', required: true, validation: 'auto' },
    { id: 'b', kind: 'document', title: 'y', required: false, validation: 'structural' },
  ] };
  const r = validateMission(bad, ctx());
  assert.ok(r.errors.some((e) => /auto sans exerciseRef/.test(e)));
  assert.ok(r.errors.some((e) => /sans docSpec/.test(e)));
});

test('refuse chemin de fichier de départ dangereux', () => {
  const bad = { ...valid(), starterFiles: [{ path: '../evil.mjs', content: '' }] };
  assert.ok(validateMission(bad, ctx()).errors.some((e) => /non sûr/.test(e)));
});

test('catalogue : détecte les doublons + dépendances inexistantes', () => {
  const m = valid();
  const r = validateMissionCatalogue([m, { ...m, dependsOn: ['fantome'] }], ctx());
  assert.ok(r.errors.some((e) => /doublon/.test(e)));
  assert.ok(r.errors.some((e) => /dépendance inexistante/.test(e)));
});

test('publicMissionView n’expose aucun attendu caché', () => {
  const pub = publicMissionView(valid());
  const blob = JSON.stringify(pub);
  assert.ok(!/docSpec/.test(blob), 'pas de docSpec brut');
  assert.ok(!/exerciseRef"/.test(blob), 'pas de exerciseRef interne des livrables');
  assert.equal(pub.deliverables[1].requiredSections.length, 2); // critères d’acceptation publics OK
});

test('validateDocumentStructure : sections, placeholders, taille, mentions', () => {
  const spec = { requiredSections: ['Contexte', 'Décision'], minLength: 20, requireMentions: ['risque'] };
  const good = 'Contexte : le système. Décision : on fait X à cause du risque connu.';
  assert.equal(validateDocumentStructure(good, spec).ok, true);
  const missing = validateDocumentStructure('Contexte seul, assez long pour passer le minimum.', spec);
  assert.ok(missing.missingSections.includes('Décision') && missing.missingMentions.includes('risque'));
  assert.equal(validateDocumentStructure('Contexte Décision risque TODO à compléter plus tard ici', spec).placeholders, true);
});

// ── Machine à états (progression v3 plate) ───────────────────────────────────

test('startMission : not-started → in-progress, idempotent', () => {
  const f0 = { days: {}, skills: {}, missions: {} };
  const f1 = startMission(f0, 'demo-mission');
  assert.equal(readMissionState(f1, 'demo-mission').status, 'in-progress');
  assert.equal(startMission(f1, 'demo-mission'), f1); // idempotent (même objet)
});

test('soumission progressive : in-progress → incomplete → ready-for-review → done', () => {
  // Livrable review REQUIS : la mission ne peut être « done » sans validation humaine.
  const def = { ...valid(), deliverables: [
    { id: 'code', kind: 'code', title: 'Exercice', required: true, validation: 'auto', exerciseRef: 'debt-audit' },
    { id: 'adr', kind: 'document', title: 'ADR', required: true, validation: 'structural', docSpec: { requiredSections: ['Contexte'], minLength: 10 } },
    { id: 'review', kind: 'report', title: 'Post-mortem', required: true, validation: 'review' },
  ] };
  let f = startMission({ days: {}, skills: {}, missions: {} }, def.id);
  assert.equal(readMissionState(f, def.id).status, 'in-progress'); // démarrée, rien soumis
  f = submitDeliverable(f, def, 'code', { status: 'validated' });
  assert.equal(computeMissionStatus(def, readMissionState(f, def.id)), 'deliverables-incomplete');
  f = submitDeliverable(f, def, 'adr', { status: 'structure-valid', content: 'Contexte...' });
  f = submitDeliverable(f, def, 'review', { status: 'self-assessed' });
  assert.equal(readMissionState(f, def.id).status, 'ready-for-review'); // attend la revue humaine
  f = submitDeliverable(f, def, 'review', { status: 'validated', reviewNote: 'OK revu' });
  assert.equal(readMissionState(f, def.id).status, 'done');
});

test('mission auto-only → done sans revue humaine ; preuve créée', () => {
  const def = { ...valid(), deliverables: [{ id: 'code', kind: 'code', title: 'x', required: true, validation: 'auto', exerciseRef: 'debt-audit' }] };
  let f = startMission({ days: {}, skills: {}, missions: {} }, def.id);
  f = submitDeliverable(f, def, 'code', { status: 'validated' });
  assert.equal(readMissionState(f, def.id).status, 'done');
  const f2 = recordMissionCompletion(f, def);
  const ev = (f2.days['69']?.evidence ?? []).filter((e) => e.url === '/missions/demo-mission');
  assert.equal(ev.length, 1);
  assert.equal(f2.skills.functions, 3);
});

test('anti-régression : un livrable validé ne redescend pas (sauf rejet)', () => {
  const def = valid();
  let f = submitDeliverable(startMission({ days: {}, skills: {}, missions: {} }, def.id), def, 'code', { status: 'validated' });
  const f2 = submitDeliverable(f, def, 'code', { status: 'submitted' }); // régression refusée
  assert.equal(readMissionState(f2, def.id).deliverables.code.status, 'validated');
  const f3 = submitDeliverable(f, def, 'code', { status: 'rejected' }); // rejet explicite autorisé
  assert.equal(readMissionState(f3, def.id).deliverables.code.status, 'rejected');
});

test('recordMissionCompletion ne fait rien si la mission n’est pas done', () => {
  const def = valid();
  const f = startMission({ days: {}, skills: {}, missions: {} }, def.id);
  assert.equal(recordMissionCompletion(f, def), f);
  assert.deepEqual(missionProgress(f, def), { status: 'in-progress', requiredTotal: 2, requiredDone: 0 });
});
