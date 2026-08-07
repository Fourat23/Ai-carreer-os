// CP9 (V25) — E2E déterministe du parcours cloud, de bout en bout, avec les VRAIES
// données et le moteur RÉEL (fonctions pures, sans serveur, sans appel cloud) :
// Cloud Architecture Lab (analyse → diagnostics → remédiation → coût factice →
// playbook) → exercice cloud (preuve) → mission (livrable structural) → isolation
// entre parcours → recherche (architecture/playbook/glossaire/parcours) →
// sauvegarde/import. Aucune credential, aucune donnée privée exposée.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { analyzeCloud } from '../lib/cloud-analysis.mjs';
import { validateCloudArchitecture, publicCloudView } from '../lib/cloud-architecture.mjs';
import { estimateMonthlyCost } from '../lib/cloud-cost.mjs';
import { buildCatalogue, resolveTrackDays, SYSTEMS_CLOUD_TRACK_ID, DEFAULT_TRACK_ID, APPSEC_CLOUD_TRACK_ID, isTrackAvailable } from '../lib/catalogue.mjs';
import { buildIndex, search } from '../lib/search.mjs';
import { migrateToV7, enrollTrack, setActiveTrack, writeActiveTrack, activeTrackProgress } from '../lib/progress-store.mjs';
import { recordExerciseSuccess } from '../lib/lab-progress.mjs';
import { serializeBackupV3, parseBackupV3 } from '../lib/backup.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const cat = buildCatalogue(program);
const priceBook = JSON.parse(readFileSync(R('data/cloud/price-book.json'), 'utf8'));
const providerMap = JSON.parse(readFileSync(R('data/cloud/provider-map.json'), 'utf8'));
const scn = JSON.parse(readFileSync(R('data/cloud/aws-insecure.json'), 'utf8'));
const playbooks = readdirSync(R('data/playbooks')).map((f) => JSON.parse(readFileSync(R(`data/playbooks/${f}`), 'utf8')));
const glossary = JSON.parse(readFileSync(R('curriculum/glossary/glossary.json'), 'utf8'));

test('E2E-1 : le Cloud Lab valide et analyse une architecture problématique', () => {
  const ctx = { skillIds: { has: (s) => isKnownSkill(s) }, validDays: new Set(program.days.map((d) => d.day)), trackIds: new Set(cat.tracks.map((t) => t.id)) };
  assert.ok(validateCloudArchitecture(scn, ctx).ok);
  const res = analyzeCloud(scn, priceBook);
  assert.ok(res.diagnostics.length > 0, 'l\'architecture problématique produit des diagnostics');
  assert.ok(res.diagnostics.some((d) => d.id === 'iam-wildcard' || d.id === 'storage-public' || d.id === 'db-public'));
  for (const d of res.diagnostics) { assert.equal(typeof d.real, 'boolean'); assert.equal(d.provider, 'aws'); }
  assert.ok(res.summary.limits.length >= 2, 'limites honnêtes déclarées');
});

test('E2E-2 : la remédiation (état corrigé) élimine les diagnostics bloquants/risque', () => {
  const fixed = { ...scn, resources: scn.fixedResources ?? scn.resources, identities: scn.fixedIdentities ?? scn.identities, network: scn.fixedNetwork ?? scn.network, observability: scn.fixedObservability ?? scn.observability };
  const res = analyzeCloud(fixed, priceBook);
  const bad = res.diagnostics.filter((d) => d.severity === 'blocking' || d.severity === 'risk');
  assert.equal(bad.length, 0, `état corrigé encore fautif : ${bad.map((d) => d.id).join(', ')}`);
});

test('E2E-3 : le coût est FACTICE, déterministe et étiqueté ; la vue publique ne fuit rien', () => {
  const c1 = estimateMonthlyCost(scn, priceBook);
  const c2 = estimateMonthlyCost(scn, priceBook);
  assert.deepEqual(c1, c2);
  assert.equal(c1.simulated, true);
  assert.match(c1.disclaimer, /FACTICE|PÉDAGOGIQUE/i);
  const pub = JSON.stringify(publicCloudView(scn));
  assert.ok(!/AKIA[0-9A-Z]{16}|-----BEGIN/.test(pub), 'aucune credential réaliste exposée');
  assert.ok(!/"actions"/.test(pub), 'les actions de policy ne sont pas exposées');
});

test('E2E-4 : le scénario pointe vers un playbook cloud réel + mapping AWS↔Azure raisonné', () => {
  const pb = playbooks.find((p) => p.id === scn.playbookRef);
  assert.ok(pb, `playbook ${scn.playbookRef} résolu`);
  assert.ok(pb.recommendedOrder.length > 0);
  assert.ok(providerMap.mappings.every((m) => m.when && m.why && m.difference), 'chaque mapping est raisonné');
});

test('E2E-5 : exercice cloud réussi → preuve enregistrée (evidence du jour)', () => {
  let v3 = migrateToV7({ startDate: '2026-01-01', days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
  let flat = activeTrackProgress(v3);
  flat = recordExerciseSuccess(flat, { exerciseId: 'cloud-iam-wildcard', title: 'IAM wildcard', skills: ['arrays'], dayRefs: [78], at: '2026-04-04' });
  const proof = (flat.days?.['78']?.evidence ?? []).some((e) => e.id === 'lab-cloud-iam-wildcard');
  assert.ok(proof, 'preuve d\'exercice cloud enregistrée');
});

test('E2E-6 : parcours Systems & Cloud intègre les jours enrichis ; isolation entre parcours', () => {
  const scfDays = new Set(resolveTrackDays(cat, SYSTEMS_CLOUD_TRACK_ID));
  for (const d of [78, 79, 80, 81]) assert.ok(scfDays.has(d), `jour ${d} dans Systems & Cloud`);
  // Isolation : progression sur Systems & Cloud ne fuit pas dans Foundations ni AppSec.
  let v3 = migrateToV7({ startDate: '2026-01-01', days: { '1': { status: 'done' } }, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
  v3 = enrollTrack(v3, SYSTEMS_CLOUD_TRACK_ID, '1');
  v3 = setActiveTrack(v3, SYSTEMS_CLOUD_TRACK_ID);
  let flat = activeTrackProgress(v3);
  flat.days = { ...(flat.days ?? {}), '78': { status: 'done' } };
  flat = recordExerciseSuccess(flat, { exerciseId: 'cloud-cidr-overlap', title: 'CIDR', skills: ['algo'], dayRefs: [78], at: '2026-04-04' });
  v3 = writeActiveTrack(v3, flat);
  assert.equal(v3.tracks[SYSTEMS_CLOUD_TRACK_ID].days['78'].status, 'done');
  assert.equal(v3.tracks[DEFAULT_TRACK_ID].days['78'], undefined, 'aucune fuite S&C → Foundations');
  assert.equal((v3.tracks[APPSEC_CLOUD_TRACK_ID]?.days ?? {})['78'], undefined, 'aucune fuite S&C → AppSec');
  assert.equal(v3.tracks[DEFAULT_TRACK_ID].days['1'].status, 'done', 'Foundations intact');
});

test('E2E-7 : recherche trouve architecture cloud, playbook cloud, glossaire cloud et parcours', () => {
  const cloud = readdirSync(R('data/cloud')).filter((f) => f.endsWith('.json') && !['price-book.json', 'provider-map.json'].includes(f)).map((f) => { const a = JSON.parse(readFileSync(R(`data/cloud/${f}`), 'utf8')); return { id: a.id, title: a.title, provider: a.provider, region: a.region, skills: a.skills }; });
  const pb = playbooks.map((p) => ({ id: p.id, situation: p.situation, domain: p.domain }));
  const g = glossary.map((e) => ({ id: e.id, term: e.term, fullForm: e.fullForm ?? null, frenchMeaning: e.frenchMeaning, aliases: e.aliases ?? [] }));
  const idx = buildIndex(program, cat, [], [], [], [], [], [], pb, g, cloud);
  assert.ok(search(idx, 'aws ha', 20).some((r) => r.type === 'cloud-arch'), 'architecture cloud trouvée');
  assert.ok(search(idx, 'facture cloud', 20).some((r) => r.type === 'playbook' && r.href.includes('cloud-foundations')), 'playbook cloud trouvé');
  assert.ok(search(idx, 'finops', 20).some((r) => r.type === 'glossary'), 'terme cloud trouvé');
  assert.ok(search(idx, 'systems cloud', 20).some((r) => r.type === 'track'), 'parcours trouvé');
  // Anti-fuite : aucune donnée interne d'architecture indexée.
  const blob = JSON.stringify(idx.filter((i) => i.type === 'cloud-arch'));
  assert.ok(!/"actions"|"policies"|AKIA/.test(blob), 'aucune donnée interne cloud indexée');
});

test('E2E-8 : export → mutation → import → restauration exacte (multi-parcours + preuve cloud)', () => {
  let v3 = migrateToV7({ startDate: '2026-01-01', days: { '1': { status: 'done' } }, skills: {}, weeklyReviews: {}, monthlyReviews: {} });
  v3 = enrollTrack(v3, SYSTEMS_CLOUD_TRACK_ID, '1');
  v3 = setActiveTrack(v3, SYSTEMS_CLOUD_TRACK_ID);
  let flat = activeTrackProgress(v3);
  flat.days = { '78': { status: 'done', answer: 'A78' } };
  flat = recordExerciseSuccess(flat, { exerciseId: 'cloud-monthly-cost', title: 'Coût', skills: ['arrays'], dayRefs: [78], at: '2026-04-05' });
  v3 = writeActiveTrack(v3, flat);
  const exported = JSON.stringify(serializeBackupV3(v3, {}));
  const parsed = parseBackupV3(exported);
  assert.ok(parsed.ok);
  assert.equal(parsed.v3.activeTrackId, SYSTEMS_CLOUD_TRACK_ID);
  assert.equal(parsed.v3.tracks[SYSTEMS_CLOUD_TRACK_ID].days['78'].answer, 'A78');
  assert.ok((parsed.v3.tracks[SYSTEMS_CLOUD_TRACK_ID].days['78'].evidence ?? []).some((e) => e.id === 'lab-cloud-monthly-cost'), 'preuve cloud restaurée');
  assert.ok(!/"reference"|diagnostics"|AKIA/.test(exported), 'aucune donnée interne dans la sauvegarde');
});

test('E2E-9 : les 5 parcours restent disponibles et isolés (data-driven)', () => {
  const available = cat.tracks.filter(isTrackAvailable).map((t) => t.id);
  assert.equal(available.length, 5, 'toujours 5 parcours (aucun nouveau en V25)');
  assert.ok(available.includes(SYSTEMS_CLOUD_TRACK_ID) && available.includes(APPSEC_CLOUD_TRACK_ID));
});
