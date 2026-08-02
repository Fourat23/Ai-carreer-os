// V18 — verrouillage des missions d'ingénierie (grandit par checkpoint).
// Prouve que chaque mission livrée est valide, reliée aux bonnes journées/parcours,
// que ses exercices sont exécutables et anti-fuite, et que ses livrables couvrent
// réellement les notions ciblées.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { validateMission, publicMissionView } from '../lib/mission.mjs';
import { validateExercise } from '../lib/exercise.mjs';
import { DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID } from '../lib/catalogue.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';

const mission = (id) => JSON.parse(readFileSync(new URL(`../data/missions/${id}.json`, import.meta.url), 'utf8'));
const exercise = (id) => JSON.parse(readFileSync(new URL(`../data/exercises/${id}.json`, import.meta.url), 'utf8'));
const program = JSON.parse(readFileSync(new URL('../data/program.json', import.meta.url), 'utf8'));
const dayExercises = () => JSON.parse(readFileSync(new URL('../data/day-exercises.json', import.meta.url), 'utf8'));

const ctx = () => ({
  validDays: new Set(program.days.map((d) => d.day)),
  trackIds: new Set([DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID]),
  skillIds: { has: (s) => isKnownSkill(s) },
  exerciseIds: new Set(readdirSync(new URL('../data/exercises', import.meta.url)).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''))),
});

// ── CP3 : mission dette technique & maintenance ──────────────────────────────

test('CP3 — mission legacy-pricing-maintenance valide et reliée aux 3 parcours', () => {
  const m = mission('legacy-pricing-maintenance');
  assert.deepEqual(validateMission(m, ctx()), { ok: true, errors: [] });
  assert.equal(m.category, 'debt-maintenance');
  assert.deepEqual(m.trackRefs.sort(), [DEFAULT_TRACK_ID, FULLSTACK_TRACK_ID, BACKEND_TRACK_ID].sort());
  assert.ok(m.dayRefs.includes(69), 'reliée au jour 69 (refactoring)');
});

test('CP3 — les livrables couvrent code auto + registre de dette + plan de maintenance', () => {
  const m = mission('legacy-pricing-maintenance');
  const byId = Object.fromEntries(m.deliverables.map((d) => [d.id, d]));
  assert.equal(byId.refactor.validation, 'auto');
  assert.equal(byId.refactor.exerciseRef, 'debt-legacy-refactor');
  assert.deepEqual(byId['debt-register'].docSpec.requiredSections.slice(0, 2), ['Registre de dette', 'Classification']);
  const plan = byId['maintenance-plan'].docSpec.requiredSections;
  for (const t of ['Corrective', 'Adaptative', 'Préventive', 'Évolutive', 'Dépréciation', 'Compatibilité', 'Changelog']) {
    assert.ok(plan.includes(t), `plan de maintenance doit exiger « ${t} »`);
  }
});

test('CP3 — exercice lié : valide, régression subtile, tests privés masqués', () => {
  const ex = exercise('debt-legacy-refactor');
  assert.deepEqual(validateExercise(ex), { ok: true, errors: [] });
  assert.ok(ex.tests.some((t) => t.private), 'garde des tests privés');
  assert.ok(/régression|arrondi/i.test(JSON.stringify(ex.tests.filter((t) => t.private))), 'les privés ciblent les régressions subtiles');
  // relié au jour 69 pour la preuve de compétence
  assert.ok(dayExercises()['69'].includes('debt-legacy-refactor'));
});

test('CP3 — vue publique de la mission : aucun attendu caché exposé', () => {
  const pub = JSON.stringify(publicMissionView(mission('legacy-pricing-maintenance')));
  assert.ok(!pub.includes('docSpec') && !pub.includes('requireMentions'), 'pas de spec interne');
  assert.ok(pub.includes('Registre de dette'), 'les sections attendues restent des critères publics');
});

// ── CP4 : mission performance, profiling & optimisation ──────────────────────

test('CP4 — mission slow-endpoint-optimization valide, catégorie performance', () => {
  const m = mission('slow-endpoint-optimization');
  assert.deepEqual(validateMission(m, ctx()), { ok: true, errors: [] });
  assert.equal(m.category, 'performance');
  assert.ok(m.dayRefs.includes(80));
});

test('CP4 — rapport de perf exige baseline/mesure avant-après/bottleneck/compromis', () => {
  const m = mission('slow-endpoint-optimization');
  const report = m.deliverables.find((d) => d.id === 'perf-report');
  for (const s of ['Baseline', 'Hypothèse', 'Mesure avant', 'Bottleneck', 'Mesure après', 'Compromis']) {
    assert.ok(report.docSpec.requiredSections.includes(s), `exige « ${s} »`);
  }
  const guard = m.deliverables.find((d) => d.id === 'regression-guard');
  assert.ok(guard.docSpec.requiredSections.includes('Budget de performance'));
  assert.ok(guard.docSpec.requiredSections.includes('Test de régression'));
});

test('CP4 — exercice perf-pair-count : optimisation vérifiée par une mesure déterministe', () => {
  const ex = exercise('perf-pair-count');
  assert.deepEqual(validateExercise(ex), { ok: true, errors: [] });
  // La mesure (lookups) est déterministe, pas un chrono fragile.
  assert.ok(ex.tests.every((t) => 'lookups' in (t.expected ?? {})), 'chaque test mesure lookups');
  assert.ok(ex.tests.some((t) => t.private), 'garde des tests privés (budget de lookups)');
  assert.ok(dayExercises()['80'].includes('perf-pair-count'));
});

test('CP4 — la mission interdit les fausses optimisations (erreurs fréquentes)', () => {
  const m = mission('slow-endpoint-optimization');
  const blob = m.commonMistakes.join(' ').toLowerCase();
  assert.ok(/seuil du test|hardcode|masquer une erreur|cache/.test(blob), 'liste les fausses optimisations');
});

// ── CP5 : mission documentation technique ────────────────────────────────────
import { validateDocumentStructure } from '../lib/mission.mjs';

test('CP5 — mission feature-design-docs valide, catégorie documentation', () => {
  const m = mission('feature-design-docs');
  assert.deepEqual(validateMission(m, ctx()), { ok: true, errors: [] });
  assert.equal(m.category, 'documentation');
  assert.ok(m.dayRefs.includes(66));
});

test('CP5 — HSD/TSD/ops exigent les sections professionnelles complètes', () => {
  const m = mission('feature-design-docs');
  const d = (id) => m.deliverables.find((x) => x.id === id).docSpec.requiredSections;
  for (const s of ['Non-objectifs', 'Sécurité', 'Observabilité', 'Disponibilité', 'Déploiement']) assert.ok(d('hsd').includes(s), `HSD exige ${s}`);
  for (const s of ['Migrations', 'Rollback', 'Tests', 'LLD']) assert.ok(d('tsd').includes(s), `TSD exige ${s}`);
  for (const s of ['Runbook', 'Rollback', 'Migration', 'Changelog']) assert.ok(d('ops').includes(s), `ops exige ${s}`);
});

test('CP5 — validation structurelle HONNÊTE : rejette incomplet, accepte complet', () => {
  const spec = mission('feature-design-docs').deliverables.find((d) => d.id === 'adr').docSpec;
  const incomplet = 'Contexte : on veut exporter. Décision : format JSON.'; // sections manquantes
  const rI = validateDocumentStructure(incomplet, spec);
  assert.equal(rI.ok, false);
  assert.ok(rI.missingSections.includes('Alternatives') && rI.tooShort);
  const complet = ['Contexte : gros export, contrat public, plusieurs consommateurs et contraintes de base.',
    'Décision : export en streaming au format JSON et CSV via un endpoint versionné.',
    'Alternatives : tout-en-mémoire (écartée : coût mémoire), export asynchrone par job (écartée : complexité).',
    'Conséquences : positives (scalable), négatives (streaming plus complexe à tester).',
    'Risques : pression base sur gros volume, mitigation par pagination et budget.',
    'Statut : accepté.'].join('\n\n');
  assert.equal(validateDocumentStructure(complet, spec).ok, true);
});

test('CP5 — modèles détaillés présents dans la référence (HSD/TSD/LLD/runbook)', () => {
  const doc = readFileSync(new URL('../curriculum/methodology/documentation-technique.md', import.meta.url), 'utf8');
  assert.ok(doc.includes('Modèles détaillés pour les missions'), 'section modèles détaillés V18');
  for (const needle of ['## Non-objectifs', 'Observabilité', '## Rollback', '## LLD', 'Post-mortem sans blâme détaillé']) {
    assert.ok(doc.includes(needle), `modèle détaillé doit couvrir « ${needle} »`);
  }
});

// ── CP6 : mission incident, observabilité & post-mortem ──────────────────────

test('CP6 — mission health-incident-postmortem valide, catégorie incident', () => {
  const m = mission('health-incident-postmortem');
  assert.deepEqual(validateMission(m, ctx()), { ok: true, errors: [] });
  assert.equal(m.category, 'incident');
  assert.ok(m.dayRefs.includes(85));
  // le faux indice fait partie du scénario
  assert.ok(/faux indice/i.test(m.context));
});

test('CP6 — post-mortem exige RCA, prévention, backlog et cadrage sans blâme', () => {
  const pm = mission('health-incident-postmortem').deliverables.find((d) => d.id === 'postmortem');
  for (const s of ['Cause racine', 'Actions correctives', 'Prévention', 'Backlog']) assert.ok(pm.docSpec.requiredSections.includes(s));
  assert.ok(pm.docSpec.requireMentions.includes('sans blâme') && pm.docSpec.requireMentions.includes('MTTR'));
});

test('CP6 — exercice de diagnostic : starter reproduit le symptôme, privés neutres', () => {
  const ex = exercise('incident-health-rollup');
  assert.deepEqual(validateExercise(ex), { ok: true, errors: [] });
  // les noms des tests privés ne révèlent pas la cause racine (degraded avalé)
  const priv = ex.tests.filter((t) => t.private);
  assert.ok(priv.length > 0);
  assert.ok(!priv.some((t) => /dégrad|degraded|cause|ignor/i.test(t.name)), 'les privés ne révèlent pas la cause');
  assert.ok(dayExercises()['85'].includes('incident-health-rollup'));
});

test('CP6 — les 4 domaines V18 sont couverts par des missions publiées', () => {
  const ids = ['legacy-pricing-maintenance', 'slow-endpoint-optimization', 'feature-design-docs', 'health-incident-postmortem'];
  const cats = new Set(ids.map((id) => mission(id).category));
  assert.deepEqual([...cats].sort(), ['debt-maintenance', 'documentation', 'incident', 'performance']);
});
