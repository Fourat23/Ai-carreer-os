// V77 · CP5 — UNE MISSION NE DIT PLUS `passed`.
//
// ── CE QUE LE CP0 A MESURÉ ──────────────────────────────────────────────
//
//   · **42 missions sur 42** terminent sur un livrable de revue que
//     l'apprenant valide lui-même, d'un clic ;
//   · un document décrivant une conception délibérément mauvaise obtient
//     `structure ok: true` (sonde `A9`, sur le validateur réel).
//
// Et le produit écrivait pourtant `status: 'passed'` — une preuve QUALIFIANTE,
// au même rang qu'un exercice dont les tests ont tourné en bac à sable.
//
// ── CE QUE CE CHECKPOINT A TROUVÉ EN CHEMIN ─────────────────────────────
//
// En retirant `passed`, **une seule assertion a rougi dans tout le dépôt**, et
// c'était la forme de `emptyFlat`. Aucun des 2 047 tests ne gardait
// l'affirmation la plus forte du produit : *« une mission terminée démontre une
// compétence ».* Les tests de mission vérifiaient qu'une preuve EXISTE et
// qu'elle porte une compétence — jamais qu'elle qualifie.
//
// Les tests ci-dessous existent d'abord pour que cela ne se reproduise pas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  MODES_DE_LIVRABLE, NIVEAU_PAR_MODE, normalizeMissionSubmission, normalizeMissionSubmissions,
  missionSubmissionKey, maillonFaibleDeLaMission, niveauDeLaMission,
  historiqueDeLaMission, lectureDeLaMission,
} from '../lib/mission-submission.mjs';
import {
  isQualifying, niveauDePreuve, makeEvidence, NIVEAU_MAX_PAR_SOURCE, normalizeLedger,
} from '../lib/evidence.mjs';
import { projectCompetency } from '../lib/competency.mjs';
import { startMission, submitDeliverable, recordMissionCompletion, computeMissionStatus, readMissionState } from '../lib/mission-state.mjs';
import { applyCommand, COMMANDS } from '../lib/learning-engine.mjs';
import { migrateToV7, writeActiveTrack, activeTrackProgress, emptyFlat, FAITS_DU_PRODUIT } from '../lib/progress-store.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const NOW = '2026-09-15T12:00:00.000Z';
const base = { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} };

/** Une mission de la forme la plus répandue : auto + structural + review (41/42). */
const missionDef = () => ({
  id: 'demo-mission', title: 'Mission de démonstration', skills: ['algo'], dayRefs: [69],
  deliverables: [
    { id: 'code', kind: 'code', title: 'code', required: true, validation: 'auto', exerciseRef: 'debt-audit' },
    { id: 'doc', kind: 'report', title: 'runbook', required: true, validation: 'structural', docSpec: { requiredSections: ['contexte'] } },
    { id: 'rev', kind: 'report', title: 'revue', required: true, validation: 'review' },
  ],
});

function missionTerminee(def) {
  let f = startMission({ ...base, missions: {} }, def.id);
  f = submitDeliverable(f, def, 'code', { status: 'validated' }, NOW);
  f = submitDeliverable(f, def, 'doc', { status: 'structure-valid', content: 'contexte…' }, NOW);
  f = submitDeliverable(f, def, 'rev', { status: 'validated' }, NOW);
  return f;
}

// ── 1 · LA DÉCISION CENTRALE ───────────────────────────────────────────

test('V77 · CP5 — une mission terminée ne produit PLUS de preuve qualifiante', () => {
  const def = missionDef();
  const f = missionTerminee(def);
  assert.equal(computeMissionStatus(def, readMissionState(f, def.id)), 'done', 'la mission doit bien être terminée');

  const apres = recordMissionCompletion(f, def, NOW);
  const preuve = (apres.evidence ?? []).find((e) => e.sourceType === 'mission');
  assert.ok(preuve, 'la preuve doit toujours EXISTER — on ne supprime rien');
  assert.equal(preuve.validation.status, 'manual');
  assert.equal(preuve.validation.kind, 'mission-deliverables');
  assert.equal(isQualifying(preuve), false);
  assert.equal(preuve.evidenceLevel, 'OBSERVED');
});

test('V77 · CP5 — L’AVANCEMENT EST INTACT : « terminée » reste « terminée »', () => {
  // Le CP5 ne dévalue aucun travail. Il change ce que la mission PRÉTEND
  // démontrer, pas ce que l'apprenant a fait.
  const def = missionDef();
  const f = missionTerminee(def);
  assert.equal(computeMissionStatus(def, readMissionState(f, def.id)), 'done');
  const apres = recordMissionCompletion(f, def, NOW);
  assert.ok((apres.days['69']?.evidence ?? []).some((e) => e.url === '/missions/demo-mission'),
    'la trace visible dans la journée est conservée');
});

test('V77 · CP5 — LA CONSÉQUENCE MESURÉE : `demonstrated` → `practiced`', () => {
  // Ce que le changement fait à un apprenant dont les missions seraient la
  // seule pratique. `practiced` et non `unassessed` : le travail compte
  // toujours comme pratique — il cesse seulement de valoir démonstration.
  const def = missionDef();
  const avant = makeEvidence({
    sourceType: 'mission', sourceId: def.id, competencyIds: def.skills,
    validation: { status: 'passed', kind: 'mission-deliverables', checkedAt: NOW, detail: '' },
    title: def.title, provenance: { producer: 'mission-engine', method: 'mission-deliverables' },
  }, { now: NOW });
  const apres = (recordMissionCompletion(missionTerminee(def), def, NOW).evidence ?? [])
    .find((e) => e.sourceType === 'mission');

  assert.equal(projectCompetency('algo', [avant.evidence]).state, 'demonstrated');
  assert.equal(projectCompetency('algo', [apres]).state, 'practiced');
});

// ── 2 · LE MAILLON FAIBLE ──────────────────────────────────────────────

test('V77 · CP5 — le maillon faible d’une mission est sa REVUE auto-signée', () => {
  assert.equal(maillonFaibleDeLaMission(missionDef()), 'DECLARED');
  assert.deepEqual([...MODES_DE_LIVRABLE], ['auto', 'structural', 'review']);
  assert.equal(NIVEAU_PAR_MODE.review, 'DECLARED');
  assert.equal(NIVEAU_PAR_MODE.structural, 'OBSERVED', 'la conformité de FORME ne vaut pas justesse');
});

test('V77 · CP5 — le plafond ne dépend pas de la performance : il précède la première soumission', () => {
  const def = missionDef();
  assert.equal(niveauDeLaMission(def), 'DECLARED');
  // Une mission SANS revue plafonne plus haut — parce que sa composante la plus
  // faible est meilleure, pas parce que l'apprenant l'a mieux faite.
  const sansRevue = { ...def, deliverables: def.deliverables.filter((d) => d.validation !== 'review') };
  assert.equal(niveauDeLaMission(sansRevue), 'OBSERVED');
});

test('V77 · CP5 — un livrable OPTIONNEL non rendu n’abaisse pas ce qu’on dit du reste', () => {
  const def = { ...missionDef() };
  def.deliverables = [
    { id: 'code', validation: 'auto', required: true },
    { id: 'bonus', validation: 'review', required: false },
  ];
  assert.equal(maillonFaibleDeLaMission(def), 'OBSERVED');
});

test('V77 · CP5 — une mission sans livrable requis n’a pas de maillon faible', () => {
  // Inventer `DECLARED` serait déjà un jugement sur un cas qu'on n'observe pas.
  assert.equal(maillonFaibleDeLaMission({ deliverables: [] }), null);
});

// ── 3 · LE NIVEAU D'UNE PREUVE EST DÉRIVÉ, ET PLAFONNÉ ─────────────────

test('V77 · CP5 — le niveau est DÉRIVÉ : un appelant ne peut pas se le décerner', () => {
  const v = makeEvidence({
    sourceType: 'mission', sourceId: 'x', competencyIds: ['algo'],
    validation: { status: 'manual', kind: 'mission-deliverables', checkedAt: NOW, detail: '' },
    title: 'x', provenance: { producer: 'p', method: 'm' },
    evidenceLevel: 'VALIDATED', // tentative d'auto-promotion
  }, { now: NOW });
  assert.equal(v.evidence.evidenceLevel, 'OBSERVED');
});

test('V77 · CP5 — le plafond par source tient même contre un `passed`', () => {
  assert.equal(NIVEAU_MAX_PAR_SOURCE.mission, 'OBSERVED');
  assert.equal(niveauDePreuve('mission', { status: 'passed', kind: 'mission-deliverables' }), 'OBSERVED');
  assert.equal(niveauDePreuve('exercise', { status: 'passed', kind: 'exercise-tests' }), 'VALIDATED');
});

test('V77 · CP5 — une auto-déclaration réussie reste DECLARED', () => {
  assert.equal(niveauDePreuve('exercise', { status: 'passed', kind: 'self' }), 'DECLARED');
  assert.equal(niveauDePreuve('declared', { status: 'manual', kind: 'self' }), 'DECLARED');
});

test('V77 · CP5 — le niveau est une PROJECTION : les preuves anciennes ne sont pas réécrites', () => {
  // Aucune migration destructive. Une preuve de mission d'avant le CP5 garde
  // son `status: 'passed'` sur le disque — c'est ce qu'on en DIT qui change.
  const ancienne = {
    id: 'ev-mission-vieille', sourceType: 'mission', sourceId: 'vieille', competencyIds: ['algo'],
    createdAt: '2026-01-01T00:00:00.000Z',
    validation: { status: 'passed', kind: 'mission-deliverables', checkedAt: '2026-01-01T00:00:00.000Z', detail: '', score: null },
    provenance: { producer: 'mission-engine', method: 'mission-deliverables', note: '' },
  };
  const [relue] = normalizeLedger([ancienne]);
  assert.equal(relue.validation.status, 'passed', 'le disque n’est pas réécrit');
  assert.equal(relue.evidenceLevel, 'OBSERVED', 'mais le niveau reste plafonné');
  assert.equal(isQualifying(relue), true, 'et l’ancienne preuve garde son statut historique');
});

// ── 4 · LE FAIT `MissionSubmission` ────────────────────────────────────

test('V77 · CP5 — le niveau d’un livrable vient du MODE, jamais du résultat', () => {
  const rev = normalizeMissionSubmission({ missionId: 'm', deliverableId: 'rev', mode: 'review', statut: 'validated', provenance: { producer: 'p' } }, { now: NOW });
  assert.equal(rev.niveau, 'DECLARED', 'une revue signée avec conviction reste une déclaration');
  const doc = normalizeMissionSubmission({ missionId: 'm', deliverableId: 'doc', mode: 'structural', statut: 'structure-valid', structureOk: true, provenance: { producer: 'p' } }, { now: NOW });
  assert.equal(doc.niveau, 'OBSERVED');
  assert.equal(doc.structureOk, true);
});

test('V77 · CP5 — `structureOk` vaut `null` hors du mode structural : non mesuré ≠ faux', () => {
  const rev = normalizeMissionSubmission({ missionId: 'm', deliverableId: 'rev', mode: 'review', statut: 'validated', structureOk: true, provenance: { producer: 'p' } }, { now: NOW });
  assert.equal(rev.structureOk, null);
});

test('V77 · CP5 — vocabulaire fermé : mode et statut inconnus sont REFUSÉS, pas réparés', () => {
  assert.equal(normalizeMissionSubmission({ missionId: 'm', deliverableId: 'd', mode: 'humaine', statut: 'validated', provenance: { producer: 'p' } }, { now: NOW }), null);
  assert.equal(normalizeMissionSubmission({ missionId: 'm', deliverableId: 'd', mode: 'review', statut: 'excellent', provenance: { producer: 'p' } }, { now: NOW }), null);
  assert.equal(normalizeMissionSubmission({ missionId: 'm', deliverableId: 'd', mode: 'review', statut: 'validated' }, { now: NOW }), null);
});

test('V77 · CP5 — une reprise du même livrable est un fait NEUF, la précédente est gardée', () => {
  let p = { ...base };
  p = applyCommand(p, { type: 'RECORD_MISSION_SUBMISSION', missionId: 'm', deliverableId: 'doc', mode: 'structural', statut: 'submitted', structureOk: false, manques: ['contexte'], provenance: { producer: 'p' } }, { now: new Date(NOW) }).progress;
  p = applyCommand(p, { type: 'RECORD_MISSION_SUBMISSION', missionId: 'm', deliverableId: 'doc', mode: 'structural', statut: 'structure-valid', structureOk: true, provenance: { producer: 'p' } }, { now: new Date('2026-09-15T12:05:00.000Z') }).progress;
  const h = historiqueDeLaMission(p.missionSubmissions, 'm');
  assert.deepEqual(h.map((s) => s.statut), ['submitted', 'structure-valid']);
  assert.deepEqual(h[0].manques, ['contexte']);
});

test('V77 · CP5 — un rejeu réseau ne crée pas un second livrable', () => {
  const c = { type: 'RECORD_MISSION_SUBMISSION', missionId: 'm', deliverableId: 'rev', mode: 'review', statut: 'validated', provenance: { producer: 'p' } };
  const r1 = applyCommand({ ...base }, c, { now: new Date(NOW) });
  const r2 = applyCommand(r1.progress, c, { now: new Date(NOW) });
  assert.deepEqual(r2.effects, ['noop:mission-submission:duplicate']);
  assert.equal(r2.progress.missionSubmissions.length, 1);
  assert.notEqual(missionSubmissionKey(r1.progress.missionSubmissions[0]), '');
});

test('V77 · CP5 — la lecture NOMME l’auto-validation au lieu de la taire', () => {
  let p = { ...base };
  for (const [d, mode, statut] of [['code', 'auto', 'validated'], ['doc', 'structural', 'structure-valid'], ['rev', 'review', 'validated']]) {
    p = applyCommand(p, { type: 'RECORD_MISSION_SUBMISSION', missionId: 'demo-mission', deliverableId: d, mode, statut, provenance: { producer: 'p' } }, { now: new Date(`2026-09-15T12:0${d.length}:00.000Z`) }).progress;
  }
  const l = lectureDeLaMission(p.missionSubmissions, missionDef());
  assert.equal(l.soumissions, 3);
  assert.equal(l.livrables, 3);
  assert.equal(l.parNiveau.DECLARED, 1);
  assert.equal(l.parNiveau.OBSERVED, 2);
  assert.match(l.lecture, /validé par l’apprenant lui-même/);
  assert.match(l.lecture, /pas évalué/);
  assert.equal(l.lecture.includes('réussi'), false);
});

test('V77 · CP5 — DÉFAUT TROUVÉ PAR LA SONDE : compter des faits ≠ compter des livrables', () => {
  // Sur le produit réel, cliquer deux fois sur « valider la revue » produit deux
  // faits — deux actes, c'est correct. Mais la phrase annonçait alors
  // « 4 livrables rendus » pour une mission qui en a trois.
  let p = { ...base };
  for (const [i, statut] of ['self-assessed', 'validated', 'validated'].entries()) {
    p = applyCommand(p, { type: 'RECORD_MISSION_SUBMISSION', missionId: 'demo-mission', deliverableId: 'rev', mode: 'review', statut, provenance: { producer: 'p' } }, { now: new Date(`2026-09-15T12:0${i}:00.000Z`) }).progress;
  }
  const l = lectureDeLaMission(p.missionSubmissions, missionDef());
  assert.equal(l.soumissions, 3, 'les trois actes sont conservés');
  assert.equal(l.livrables, 1, 'mais ils portent sur UN livrable');
  assert.match(l.lecture, /^1 livrable rendu en 3 soumissions/);
});

test('V77 · CP5 — aucun livrable rendu est une DONNÉE, pas un trou', () => {
  const l = lectureDeLaMission([], missionDef());
  assert.equal(l.soumissions, 0);
  assert.match(l.lecture, /Aucun livrable rendu/);
});

// ── 5 · PERSISTANCE ET ROUTE ───────────────────────────────────────────

test('V77 · CP5 — le fait traverse le disque comme les six autres', () => {
  const r = applyCommand(activeTrackProgress(migrateToV7({})), { type: 'RECORD_MISSION_SUBMISSION', missionId: 'm', deliverableId: 'rev', mode: 'review', statut: 'validated', provenance: { producer: 'p' } }, { now: new Date(NOW) });
  const relu = activeTrackProgress(JSON.parse(JSON.stringify(writeActiveTrack(migrateToV7({}), r.progress))));
  assert.equal(relu.missionSubmissions.length, 1);
  assert.equal(FAITS_DU_PRODUIT.includes('missionSubmissions'), true);
  assert.ok(Array.isArray(emptyFlat().missionSubmissions));
});

test('V77 · CP5 — la route écrit le livrable pour les trois actions, jamais pour `start`', () => {
  const src = lire('app/api/missions/[id]/route.ts');
  assert.equal(src.includes('RECORD_MISSION_SUBMISSION'), true);
  assert.equal(src.includes("action !== 'start'"), true, '`start` n’est pas un livrable rendu');
  // Le mode vient de la DÉFINITION du livrable, pas de ce que le client raconte.
  assert.equal(src.includes('mode: deliv.validation'), true);
  assert.equal(COMMANDS.includes('RECORD_MISSION_SUBMISSION'), true);
});

test('V77 · CP5 — `recordMissionCompletion` n’écrit plus `passed` nulle part', () => {
  const src = lire('lib/mission-state.mjs').split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
  assert.equal(/status:\s*'passed'/.test(src), false, 'une mission ne doit plus se déclarer réussie');
});

test('V77 · CP5 — la liste est bornée, triée, et dédupliquée', () => {
  const brut = [];
  for (let i = 0; i < 50; i += 1) {
    brut.push({ at: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString(), missionId: 'm', deliverableId: 'd', mode: 'review', statut: 'validated', provenance: { producer: 'p' } });
  }
  brut.push({ ...brut[0] }); // rejeu exact
  const n = normalizeMissionSubmissions(brut);
  assert.equal(n.length, 50);
  const dates = n.map((s) => s.at);
  assert.deepEqual(dates, [...dates].sort());
});
