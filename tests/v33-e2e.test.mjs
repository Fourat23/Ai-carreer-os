// CP10 (V33) — cohérence de bout en bout de la chaîne ML → DL → Transformers → LLMOps.
// Vérifie qu'un apprenant peut la suivre sans trou : prérequis acycliques, chaque
// leçon avancée remonte à un fondement, ordre topologique valide, chaque leçon
// critique reliée à une pratique résolue, exercices étiquetés SIMULATION.
// Déterministe, pur (lecture des vraies données uniquement).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildCurriculumGraph, auditCurriculumGraph, findPrereqCycles } from '../lib/curriculum-graph.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const J = (p) => JSON.parse(readFileSync(R(p), 'utf8'));
const idsOf = (dir) => new Set(readdirSync(R(dir)).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));

function realGraph() {
  const program = J('data/program.json');
  const plans = ['v27', 'v28', 'v29', 'v30', 'v31', 'v32', 'v33'].map((v) => J(`docs/architecture/${v}-lessons-plan.json`).prereq).filter(Boolean);
  const dayLinked = new Set(Object.values(J('data/day-exercises.json')).flat());
  const known = {
    exercises: idsOf('data/exercises'), missions: idsOf('data/missions'), playbooks: idsOf('data/playbooks'),
    labs: new Set(['terminal', 'pipeline', 'cloud-topology', 'kubernetes', 'security', 'cloud-architecture']),
    reachableExercises: dayLinked,
  };
  return buildCurriculumGraph({ lessons: program.lessons, prereqPlans: plans, known });
}

function reaches(requires, from, target) {
  const seen = new Set();
  const stack = [from];
  while (stack.length) {
    const u = stack.pop();
    for (const d of requires.get(u) ?? []) {
      if (d === target) return true;
      if (!seen.has(d)) { seen.add(d); stack.push(d); }
    }
  }
  return false;
}

test('e2e V33 : graphe global acyclique (chaîne ML incluse)', () => {
  assert.equal(findPrereqCycles(realGraph().requires).length, 0);
});

test('e2e V33 : transformers remonte à neural-networks puis aux fondations ML', () => {
  const g = realGraph();
  assert.ok(reaches(g.requires, 'transformers', 'neural-networks'), 'transformers dépend de neural-networks');
  assert.ok(reaches(g.requires, 'transformers', 'machine-learning-basics'), 'transformers remonte aux bases ML');
  assert.ok(reaches(g.requires, 'neural-networks', 'machine-learning-basics'), 'neural-networks remonte aux bases ML');
  assert.ok(reaches(g.requires, 'llm-observability', 'llm-fundamentals'), 'llm-observability dépend de llm-fundamentals');
});

test('e2e V33 : les 6 leçons critiques V33 portent une pratique RÉSOLUE', () => {
  const g = realGraph();
  const critical = J('docs/architecture/v33-lessons-plan.json').critical;
  assert.ok(critical.length >= 6, 'au moins 6 leçons critiques');
  for (const slug of critical) {
    const refs = g.practices.filter((p) => p.lesson === slug);
    assert.ok(refs.length > 0, `${slug} : doit porter une pratique`);
    assert.ok(refs.every((p) => p.resolved), `${slug} : pratiques résolues`);
  }
});

test('e2e V33 : chaque exercice ML/DL/LLMOps est relié à au moins une leçon', () => {
  const g = realGraph();
  const exIds = ['ml-data-leakage', 'ml-split-choice', 'ml-feature-encoding', 'nn-forward-neuron', 'ml-overfit-diagnose', 'attention-argmax', 'llm-cost-estimate', 'ml-confusion-metric'];
  for (const e of exIds) {
    const refs = g.practices.filter((p) => p.id === e && p.resolved);
    assert.ok(refs.length > 0, `${e} : doit être référencé et résolu`);
  }
});

test('e2e V33 : aucune anomalie bloquante sur le curriculum réel', () => {
  const rep = auditCurriculumGraph(realGraph());
  assert.equal(rep.blocking.length, 0, rep.blocking.map((b) => `${b.type}:${b.subject}`).join(' | '));
});

test('e2e V33 : frontière réel/simulé — exercices ML étiquetés SIMULATION', () => {
  for (const id of ['ml-data-leakage', 'nn-forward-neuron', 'attention-argmax', 'llm-cost-estimate', 'ml-confusion-metric']) {
    const ex = J(`data/exercises/${id}.json`);
    assert.match(ex.summary, /SIMULATION/, `${id} : frontière réel/simulé explicite`);
  }
});
