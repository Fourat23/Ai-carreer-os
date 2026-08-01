// CP2 (V17) — modèle de couverture éditoriale : pur, testable, ne stocke aucun
// contenu rédactionnel. Valide qu'un plan d'enrichissement est cohérent avec les
// données réelles et détecte les incohérences ciblées par le sprint.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEPTH_LEVELS,
  depthRank,
  V17_TOPICS,
  V17_DOMAINS,
  topicById,
  extractDayRefs,
  extractExerciseRefs,
  validateCoveragePlan,
  topicsForDay,
  daysForTopic,
  coverageByDomain,
} from '../lib/v17-coverage.mjs';

const ctx = () => ({
  validDays: new Set(Array.from({ length: 365 }, (_, i) => i + 1)),
  trackIds: new Set(['ai-engineer-foundations-v1', 'fullstack-typescript', 'backend-engineer-v1']),
  skillIds: new Set(['se', 'archi', 'http', 'patterns']),
  exerciseIds: new Set(['ds-stack', 'api-router']),
  glossaryTerms: new Set(['adr', 'refactoring']),
});

test('taxonomie : 12 sujets, ids uniques, domaines connus', () => {
  assert.equal(V17_TOPICS.length, 12);
  assert.equal(new Set(V17_TOPICS.map((t) => t.id)).size, 12);
  for (const t of V17_TOPICS) assert.ok(V17_DOMAINS.includes(t.domain), `domaine ${t.domain}`);
  assert.equal(topicById('tech-debt').domain, 'quality');
  assert.equal(topicById('inconnu'), null);
});

test('échelle de profondeur ordonnée', () => {
  assert.deepEqual(DEPTH_LEVELS, ['absent', 'mentioned', 'explained', 'practiced', 'evaluated']);
  assert.ok(depthRank('evaluated') > depthRank('mentioned'));
  assert.equal(depthRank('inconnu'), -1);
});

test('extractDayRefs reconnaît jour/jours/day-0NN, borne 1..365', () => {
  assert.deepEqual(extractDayRefs('voir jour 49 et jours 66, cf day-092'), [49, 66, 92]);
  assert.deepEqual(extractDayRefs('jour 0 et jour 999'), []); // hors bornes
  assert.deepEqual(extractDayRefs(''), []);
});

test('extractExerciseRefs ne matche que des ids connus, avec limites de mot', () => {
  const known = ['ds-stack', 'api-router'];
  assert.deepEqual(extractExerciseRefs("fais l'exercice ds-stack maintenant", known), ['ds-stack']);
  assert.deepEqual(extractExerciseRefs('ds-stack-v2 est différent', known), []); // pas de match partiel
  assert.deepEqual(extractExerciseRefs('rien ici', known), []);
});

test('plan valide → aucune erreur', () => {
  const plan = {
    days: [
      { day: 49, topics: ['refactoring'], tracks: ['ai-engineer-foundations-v1'], objective: 'Refactorer sans changer le comportement', exercises: ['ds-stack'] },
    ],
    exercisesAdded: [{ id: 'debt-audit', skills: ['se'], day: 50 }],
    glossaryTermsAdded: [{ term: 'code smell', shortDefinition: 'x', detailedDefinition: 'y' }],
  };
  const { errors } = validateCoveragePlan(plan, ctx());
  assert.deepEqual(errors, []);
});

test('détecte : jour inexistant', () => {
  const { errors } = validateCoveragePlan({ days: [{ day: 999, topics: ['tech-debt'], tracks: ['backend-engineer-v1'], objective: 'objectif suffisant ici' }] }, ctx());
  assert.ok(errors.some((e) => /jour inexistant/.test(e)));
});

test('détecte : doublon de journée', () => {
  const d = { day: 49, topics: ['refactoring'], tracks: ['ai-engineer-foundations-v1'], objective: 'objectif suffisant ici' };
  const { errors } = validateCoveragePlan({ days: [d, { ...d }] }, ctx());
  assert.ok(errors.some((e) => /doublon/.test(e)));
});

test('détecte : objectif manquant / trop court', () => {
  const { errors } = validateCoveragePlan({ days: [{ day: 49, topics: ['refactoring'], tracks: ['ai-engineer-foundations-v1'], objective: 'court' }] }, ctx());
  assert.ok(errors.some((e) => /sans objectif clair/.test(e)));
});

test('détecte : sujet inconnu et parcours inconnu', () => {
  const { errors } = validateCoveragePlan({ days: [{ day: 49, topics: ['bidon'], tracks: ['pas-un-parcours'], objective: 'objectif suffisant ici' }] }, ctx());
  assert.ok(errors.some((e) => /sujet inconnu/.test(e)));
  assert.ok(errors.some((e) => /parcours inconnu/.test(e)));
});

test('détecte : exercice lié inexistant, sauf s’il est déclaré ajouté', () => {
  const base = { day: 49, topics: ['refactoring'], tracks: ['ai-engineer-foundations-v1'], objective: 'objectif suffisant ici' };
  const bad = validateCoveragePlan({ days: [{ ...base, exercises: ['fantome'] }] }, ctx());
  assert.ok(bad.errors.some((e) => /exercice lié inexistant/.test(e)));
  const ok = validateCoveragePlan({ days: [{ ...base, exercises: ['fantome'] }], exercisesAdded: [{ id: 'fantome', skills: ['se'] }] }, ctx());
  assert.ok(!ok.errors.some((e) => /exercice lié inexistant/.test(e)));
});

test('détecte : exercice ajouté avec compétence absente', () => {
  const { errors } = validateCoveragePlan({ exercisesAdded: [{ id: 'x', skills: ['skill-fantome'] }] }, ctx());
  assert.ok(errors.some((e) => /compétence absente/.test(e)));
});

test('détecte : entrée de glossaire sans définition et doublon existant', () => {
  const noDef = validateCoveragePlan({ glossaryTermsAdded: [{ term: 'foo', shortDefinition: '' }] }, ctx());
  assert.ok(noDef.errors.some((e) => /définition manquante/.test(e)));
  const dup = validateCoveragePlan({ glossaryTermsAdded: [{ term: 'ADR', shortDefinition: 'x', detailedDefinition: 'y' }] }, ctx());
  assert.ok(dup.errors.some((e) => /déjà présent/.test(e)));
});

test('helpers de couverture : topicsForDay, daysForTopic, coverageByDomain', () => {
  const plan = {
    days: [
      { day: 49, topics: ['refactoring', 'tech-debt'], tracks: ['ai-engineer-foundations-v1'], objective: 'objectif suffisant ici' },
      { day: 200, topics: ['perf-measure'], tracks: ['backend-engineer-v1'], objective: 'objectif suffisant ici' },
    ],
  };
  assert.deepEqual(topicsForDay(plan, 49).sort(), ['refactoring', 'tech-debt']);
  assert.deepEqual(daysForTopic(plan, 'perf-measure'), [200]);
  const cov = coverageByDomain(plan);
  assert.equal(cov.quality, 1); // jour 49 touche le domaine quality (une fois)
  assert.equal(cov.performance, 1);
  assert.equal(cov.documentation, 0);
});
