// CP9 (V32) — cohérence de bout en bout de la chaîne AGENTS / TOOL USE / SÛRETÉ.
// Vérifie qu'un apprenant peut la suivre sans trou : prérequis acycliques, chaque
// leçon avancée remonte à un fondement commun, ordre topologique valide, chaque
// leçon critique reliée à une pratique résolue, exercices agent étiquetés
// SIMULATION. Déterministe, pur (lecture des vraies données uniquement).
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
  const plans = ['v27', 'v28', 'v29', 'v30', 'v31', 'v32'].map((v) => J(`docs/architecture/${v}-lessons-plan.json`).prereq).filter(Boolean);
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

test('e2e V32 : graphe global acyclique (agents inclus)', () => {
  assert.equal(findPrereqCycles(realGraph().requires).length, 0);
});

test('e2e V32 : chaque leçon agent/sûreté avancée remonte à llm-fundamentals', () => {
  const g = realGraph();
  for (const a of ['agent-workflows-orchestration', 'prompt-injection-defense']) {
    assert.ok(reaches(g.requires, a, 'llm-fundamentals'), `${a} doit dépendre (transitivement) de llm-fundamentals`);
  }
});

test('e2e V32 : les 4 leçons critiques V32 portent une pratique RÉSOLUE', () => {
  const g = realGraph();
  const critical = J('docs/architecture/v32-lessons-plan.json').critical;
  assert.ok(critical.length >= 4, 'au moins 4 leçons critiques');
  for (const slug of critical) {
    const refs = g.practices.filter((p) => p.lesson === slug);
    assert.ok(refs.length > 0, `${slug} : doit porter une pratique`);
    assert.ok(refs.every((p) => p.resolved), `${slug} : pratiques résolues`);
  }
});

test('e2e V32 : chaque exercice d\'agent est relié à au moins une leçon', () => {
  const g = realGraph();
  const exIds = ['agent-tool-select', 'agent-state-transition', 'agent-loop-detect', 'agent-tool-validate', 'agent-hitl-decision', 'agent-retry-policy'];
  for (const e of exIds) {
    const refs = g.practices.filter((p) => p.id === e && p.resolved);
    assert.ok(refs.length > 0, `${e} : doit être référencé et résolu`);
  }
});

test('e2e V32 : aucune anomalie bloquante sur le curriculum réel', () => {
  const rep = auditCurriculumGraph(realGraph());
  assert.equal(rep.blocking.length, 0, rep.blocking.map((b) => `${b.type}:${b.subject}`).join(' | '));
});

test('e2e V32 : frontière réel/simulé — exercices agent étiquetés SIMULATION', () => {
  for (const id of ['agent-tool-select', 'agent-state-transition', 'agent-loop-detect', 'agent-tool-validate', 'agent-hitl-decision', 'agent-retry-policy']) {
    const ex = J(`data/exercises/${id}.json`);
    assert.match(ex.summary, /SIMULATION/, `${id} : frontière réel/simulé explicite`);
  }
});

test('e2e V32 : playbooks IA présents et exploitables (agents, sûreté, coûts)', () => {
  for (const id of ['agent-runaway-loop', 'agent-dangerous-tool-call', 'rag-indirect-injection', 'llm-structured-output-break', 'llm-cost-spike']) {
    const pb = J(`data/playbooks/${id}.json`);
    assert.ok(pb.situation && pb.domain, `${id} : situation + domaine`);
    assert.ok(Array.isArray(pb.symptoms) && pb.symptoms.length > 0, `${id} : symptômes`);
    assert.ok(Array.isArray(pb.exitCriteria) && pb.exitCriteria.length > 0, `${id} : critères de sortie`);
  }
});
