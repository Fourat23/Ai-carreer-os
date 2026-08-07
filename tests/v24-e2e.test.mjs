// CP9 (V24) — E2E déterministe du parcours cybersécurité, de bout en bout, avec
// les VRAIES données et le moteur RÉEL (fonctions pures, sans serveur) :
// Security Lab (analyse → diagnostics → remédiation → incident → playbook) →
// exercice sécurité (preuve) → mission (livrable + validation structurale) →
// bascule sur AppSec & Cloud Security → isolation → recherche → sauvegarde/import →
// restauration. Aucune fuite de donnée privée ; progression isolée par parcours.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { analyzeScenario } from '../lib/security-analysis.mjs';
import { simulateIncident, secretResponseOrder } from '../lib/security-incident.mjs';
import { publicScenarioView } from '../lib/security.mjs';
import { buildCatalogue, resolveTrackDays, APPSEC_CLOUD_TRACK_ID, DEFAULT_TRACK_ID } from '../lib/catalogue.mjs';
import { buildIndex, search } from '../lib/search.mjs';
import { migrateToV7, enrollTrack, setActiveTrack, writeActiveTrack, activeTrackProgress } from '../lib/progress-store.mjs';
import { recordExerciseSuccess } from '../lib/lab-progress.mjs';
import { startMission, submitDeliverable, computeMissionStatus, readMissionState } from '../lib/mission-state.mjs';
import { serializeBackupV3, parseBackupV3 } from '../lib/backup.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const cat = buildCatalogue(program);
const cveDb = JSON.parse(readFileSync(R('data/security/cve-db.json'), 'utf8'));
const scnLeak = JSON.parse(readFileSync(R('data/security/leaked-secret-config.json'), 'utf8'));
const playbooks = readdirSync(R('data/playbooks')).map((f) => JSON.parse(readFileSync(R(`data/playbooks/${f}`), 'utf8')));
const mission = JSON.parse(readFileSync(R('data/missions/sec-secret-leak.json'), 'utf8'));
const glossary = JSON.parse(readFileSync(R('curriculum/glossary/glossary.json'), 'utf8'));

test('E2E-1 : le Security Lab analyse le scénario vulnérable et produit des diagnostics', () => {
  const res = analyzeScenario(scnLeak, cveDb);
  assert.ok(res.diagnostics.length > 0, 'le scénario vulnérable produit au moins un diagnostic');
  assert.ok(res.summary.total === res.diagnostics.length);
  // Chaque diagnostic est honnête : confiance + réel/simulé + limites globales.
  for (const d of res.diagnostics) {
    assert.ok(['high', 'medium', 'low'].includes(d.confidence), 'confiance explicite');
    assert.equal(typeof d.real, 'boolean');
  }
  assert.ok(Array.isArray(res.summary.limits) && res.summary.limits.length > 0, 'limites déclarées');
});

test('E2E-2 : la remédiation (état corrigé) élimine les diagnostics — comparaison vulnérable↔corrigé', () => {
  const fixed = { ...scnLeak, artifacts: scnLeak.fixedArtifacts };
  const res = analyzeScenario(fixed, cveDb);
  assert.equal(res.diagnostics.length, 0, 'l’état corrigé ne produit aucun diagnostic');
});

test('E2E-3 : la vue publique du scénario ne fuite aucun secret réaliste', () => {
  const pub = JSON.stringify(publicScenarioView(scnLeak));
  assert.ok(!/sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{12,}/.test(pub), 'aucun secret réaliste exposé');
});

test('E2E-4 : la simulation d’incident suit les phases et l’ordre de réponse au secret', () => {
  const sim = simulateIncident(scnLeak, 'secret-leak');
  assert.ok(Array.isArray(sim.phases) && sim.phases.length >= 5, 'phases d’incident présentes');
  assert.deepEqual(secretResponseOrder(), ['revocation', 'rotation', 'redeploy', 'audit']);
});

test('E2E-5 : le scénario pointe vers un playbook « Que faire dans ce cas ? » réel', () => {
  const pb = playbooks.find((p) => p.id === scnLeak.playbookRef);
  assert.ok(pb, `playbookRef « ${scnLeak.playbookRef} » résolu`);
  assert.ok(Array.isArray(pb.containment) && pb.containment.length > 0, 'le playbook a des actions immédiates');
  assert.ok(Array.isArray(pb.recommendedOrder) && pb.recommendedOrder.length > 0, 'le playbook a un ordre recommandé');
});

test('E2E-6 : exercice sécurité réussi → preuve enregistrée ; mission avancée (livrable auto + structural)', () => {
  let v3 = migrateToV7({ startDate: '2026-01-01', days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
  let flat = activeTrackProgress(v3);
  // Réussite de l’exercice auto de la mission (sec-secret-response-order) → preuve (evidence du jour 68).
  flat = recordExerciseSuccess(flat, { exerciseId: 'sec-secret-response-order', title: 'Ordre de réponse au secret', skills: ['secu'], dayRefs: [68], at: '2026-02-02' });
  const proof = (flat.days?.['68']?.evidence ?? []).some((e) => e.id === 'lab-sec-secret-response-order');
  assert.ok(proof, 'preuve d’exercice enregistrée (evidence du jour 68)');
  // Démarrage de la mission + livrables (auto validé via l’exercice, structural pour le runbook).
  flat = startMission(flat, mission.id);
  flat = submitDeliverable(flat, mission, 'exo', { status: 'passed' });
  flat = submitDeliverable(flat, mission, 'runbook', { status: 'structure-valid', content: 'runbook de réponse à la fuite : révocation → rotation → redéploiement → audit' });
  const st = computeMissionStatus(mission, readMissionState(flat, mission.id));
  assert.ok(st, 'statut de mission calculable');
  const state = readMissionState(flat, mission.id);
  assert.equal(state.deliverables['runbook'].status, 'structure-valid', 'livrable structural validé');
});

test('E2E-7 : bascule Foundations → AppSec & Cloud Security, progression ISOLÉE', () => {
  let v3 = migrateToV7({ startDate: '2026-01-01', days: { '1': { status: 'done' } }, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
  v3 = enrollTrack(v3, APPSEC_CLOUD_TRACK_ID, '1');
  v3 = setActiveTrack(v3, APPSEC_CLOUD_TRACK_ID);
  let flat = activeTrackProgress(v3);
  flat.days = { ...(flat.days ?? {}), '68': { status: 'done' } };
  flat = recordExerciseSuccess(flat, { exerciseId: 'sec-mask-secrets', title: 'Masquer les secrets', skills: ['secu'], dayRefs: [68], at: '2026-03-03' });
  v3 = writeActiveTrack(v3, flat);
  // Isolation stricte entre parcours.
  assert.equal(v3.tracks[APPSEC_CLOUD_TRACK_ID].days['68'].status, 'done');
  assert.equal(v3.tracks[DEFAULT_TRACK_ID].days['68'], undefined, 'aucune fuite AppSec → Foundations');
  assert.equal(v3.tracks[DEFAULT_TRACK_ID].days['1'].status, 'done', 'Foundations intact');
  // Le jour 68 fait bien partie du parcours AppSec (atteignabilité réelle).
  assert.ok(resolveTrackDays(cat, APPSEC_CLOUD_TRACK_ID).includes(68));
});

test('E2E-8 : la recherche globale retrouve concept, glossaire, playbook, scénario et parcours', () => {
  const scenarios = [{ id: scnLeak.id, title: scnLeak.title, domain: scnLeak.domain, skills: scnLeak.skills ?? [] }];
  const pbSum = playbooks.map((p) => ({ id: p.id, title: p.title, situation: p.situation, domain: p.domain }));
  const glossSum = glossary.map((g) => ({ id: g.id, term: g.term, fullForm: g.fullForm ?? null, frenchMeaning: g.frenchMeaning, aliases: g.aliases ?? [] }));
  const idx = buildIndex(program, cat, [], [], [], [], [], scenarios, pbSum, glossSum);
  const types = (q) => new Set(search(idx, q, 40).map((r) => r.type));
  assert.ok(types('rotation').has('glossary'), 'glossaire trouvé (rotation)');
  assert.ok(search(idx, 'secret', 40).some((r) => r.type === 'scenario' || r.type === 'playbook'), 'scénario/playbook trouvé (secret)');
  assert.ok(search(idx, 'AppSec', 40).some((r) => r.type === 'track'), 'parcours AppSec trouvé');
});

test('E2E-9 : export → mutation locale → import → restauration exacte de la progression multi-parcours', () => {
  let v3 = migrateToV7({ startDate: '2026-01-01', days: { '1': { status: 'done' } }, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
  v3 = enrollTrack(v3, APPSEC_CLOUD_TRACK_ID, '1');
  v3 = setActiveTrack(v3, APPSEC_CLOUD_TRACK_ID);
  let flat = activeTrackProgress(v3);
  flat.days = { '68': { status: 'done', answer: 'A68' } };
  flat = recordExerciseSuccess(flat, { exerciseId: 'sec-mask-secrets', title: 'Masquer les secrets', skills: ['secu'], dayRefs: [68], at: '2026-03-03' });
  v3 = writeActiveTrack(v3, flat);
  const exported = JSON.stringify(serializeBackupV3(v3, {}));
  // Mutation locale : on repart d’un état vide.
  let muted = migrateToV7({ startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
  assert.notEqual(JSON.stringify(muted.tracks), JSON.stringify(v3.tracks));
  // Import → restauration exacte.
  const parsed = parseBackupV3(exported);
  assert.ok(parsed.ok);
  assert.equal(parsed.v3.activeTrackId, APPSEC_CLOUD_TRACK_ID, 'parcours actif restauré');
  assert.equal(parsed.v3.tracks[APPSEC_CLOUD_TRACK_ID].days['68'].answer, 'A68', 'progression restaurée');
  const restoredProof = (parsed.v3.tracks[APPSEC_CLOUD_TRACK_ID].days['68'].evidence ?? []).some((e) => e.id === 'lab-sec-mask-secrets');
  assert.ok(restoredProof, 'preuve d’exercice restaurée');
  // Anti-fuite : la sauvegarde ne contient que de la progression (pas de diagnostics/solutions).
  assert.ok(!/"reference"|solution\.mjs|diagnostics"/.test(exported), 'aucune donnée interne dans la sauvegarde');
});
