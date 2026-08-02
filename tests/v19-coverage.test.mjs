// CP2 (V19) — modèle de couverture pur : taxonomie, validateurs de plan
// (jours/exercices/missions/glossaire), sans stocker de contenu rédactionnel.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEPTH_LEVELS, depthRank, V19_TOPICS, V19_DOMAINS, topicById,
  extractDayRefs, validateCoveragePlan, daysForTopic, coverageByDomain,
} from '../lib/v19-coverage.mjs';

const ctx = () => ({
  validDays: new Set(Array.from({ length: 365 }, (_, i) => i + 1)),
  trackIds: new Set(['ai-engineer-foundations-v1', 'systems-cloud-foundations-v1']),
  skillIds: new Set(['gitlinux', 'http', 'functions', 'conditions']),
  exerciseIds: new Set(['perms-octal', 'port-conflict']),
  missionIds: new Set(['port-in-use']),
  glossaryTerms: new Set(['ssh', 'inode']),
});

test('taxonomie : 11 sujets, ids uniques, domaines connus', () => {
  assert.equal(V19_TOPICS.length, 11);
  assert.equal(new Set(V19_TOPICS.map((t) => t.id)).size, 11);
  for (const t of V19_TOPICS) assert.ok(V19_DOMAINS.includes(t.domain), `domaine ${t.domain}`);
  assert.equal(topicById('ssh').domain, 'network');
  assert.equal(topicById('inconnu'), null);
});

test('échelle de profondeur ordonnée', () => {
  assert.deepEqual(DEPTH_LEVELS, ['absent', 'mentioned', 'explained', 'practiced', 'evaluated']);
  assert.ok(depthRank('evaluated') > depthRank('mentioned'));
});

test('extractDayRefs : jour/day-0NN, borné', () => {
  assert.deepEqual(extractDayRefs('voir jour 72 et day-071'), [71, 72]);
  assert.deepEqual(extractDayRefs('jour 999'), []);
});

test('plan valide → aucune erreur (jours + exercices + missions + glossaire)', () => {
  const plan = {
    days: [{ day: 72, topics: ['permissions', 'processes'], tracks: ['systems-cloud-foundations-v1'], objective: 'Permissions rwx/octal et processus', exercises: ['perms-octal'] }],
    exercisesAdded: [{ id: 'perms-octal', skills: ['gitlinux'], day: 72 }],
    missionsAdded: [{ id: 'port-in-use', days: [72], exercises: ['port-conflict'] }],
    glossaryTermsAdded: [{ term: 'umask', shortDefinition: 'x', detailedDefinition: 'y' }],
  };
  assert.deepEqual(validateCoveragePlan(plan, ctx()), { errors: [] });
});

test('détecte : jour inexistant, sujet/parcours inconnus, objectif court', () => {
  const r = validateCoveragePlan({ days: [{ day: 999, topics: ['bidon'], tracks: ['nope'], objective: 'court' }] }, ctx());
  assert.ok(r.errors.some((e) => /jour inexistant/.test(e)));
});

test('détecte : exercice compétence absente ; mission journée inexistante ; mission absente du disque', () => {
  const r = validateCoveragePlan({
    exercisesAdded: [{ id: 'x', skills: ['fantome'] }],
    missionsAdded: [{ id: 'port-in-use', days: [999] }, { id: 'inexistante', days: [72] }],
  }, ctx());
  assert.ok(r.errors.some((e) => /compétence absente/.test(e)));
  assert.ok(r.errors.some((e) => /journée liée inexistante/.test(e)));
  assert.ok(r.errors.some((e) => /absente de data\/missions/.test(e)));
});

test('détecte : glossaire déjà présent / sans définition', () => {
  const r = validateCoveragePlan({ glossaryTermsAdded: [{ term: 'ssh', shortDefinition: 'x', detailedDefinition: 'y' }, { term: 'foo', shortDefinition: '' }] }, ctx());
  assert.ok(r.errors.some((e) => /déjà présent/.test(e)));
  assert.ok(r.errors.some((e) => /définition manquante/.test(e)));
});

test('helpers : daysForTopic, coverageByDomain', () => {
  const plan = { days: [
    { day: 72, topics: ['permissions'], tracks: [], objective: 'objectif suffisant' },
    { day: 71, topics: ['networking', 'dns'], tracks: [], objective: 'objectif suffisant' },
  ] };
  assert.deepEqual(daysForTopic(plan, 'permissions'), [72]);
  const cov = coverageByDomain(plan);
  assert.equal(cov.system, 1);
  assert.equal(cov.network, 1);
});
