// CP9 (V34) — cohérence de bout en bout des fondations Data + theory→practice.
// Vérifie : chaîne data acyclique et reliée à la pratique, docker/llm-fundamentals
// désormais pratiqués, data-ml-v1 reste ANNONCÉ (décision honnête), exercices
// étiquetés SIMULATION, 0 anomalie bloquante. Déterministe, pur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildCurriculumGraph, auditCurriculumGraph, findPrereqCycles } from '../lib/curriculum-graph.mjs';
import { buildCatalogue } from '../lib/catalogue.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const J = (p) => JSON.parse(readFileSync(R(p), 'utf8'));
const idsOf = (dir) => new Set(readdirSync(R(dir)).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));

function realGraph() {
  const program = J('data/program.json');
  const plans = ['v27', 'v28', 'v29', 'v30', 'v31', 'v32', 'v33', 'v34'].map((v) => J(`docs/architecture/${v}-lessons-plan.json`).prereq).filter(Boolean);
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

test('e2e V34 : graphe global acyclique (fondations data incluses)', () => {
  assert.equal(findPrereqCycles(realGraph().requires).length, 0);
});

test('e2e V34 : la chaîne data remonte aux fondations Python', () => {
  const g = realGraph();
  assert.ok(reaches(g.requires, 'etl-pipelines', 'pandas-data-wrangling'), 'etl dépend de pandas');
  assert.ok(reaches(g.requires, 'etl-pipelines', 'python-foundations'), 'etl remonte à python-foundations');
  assert.ok(reaches(g.requires, 'data-cleaning-quality', 'pandas-data-wrangling'), 'cleaning dépend de pandas');
});

test('e2e V34 : leçons critiques V34 reliées à une pratique résolue', () => {
  const g = realGraph();
  const critical = J('docs/architecture/v34-lessons-plan.json').critical;
  for (const slug of critical) {
    const refs = g.practices.filter((p) => p.lesson === slug);
    assert.ok(refs.length > 0 && refs.every((p) => p.resolved), `${slug} : pratique résolue`);
  }
});

test('e2e V34 : theory→practice — docker et llm-fundamentals désormais pratiqués', () => {
  const g = realGraph();
  for (const slug of ['docker-containers', 'llm-fundamentals']) {
    const refs = g.practices.filter((p) => p.lesson === slug && p.resolved);
    assert.ok(refs.length > 0, `${slug} : doit avoir une pratique résolue`);
  }
  // plus aucun foundation-without-practice
  const rep = auditCurriculumGraph(g);
  assert.ok(!rep.anomalies.some((a) => a.type === 'foundation-without-practice'), 'aucun foundation-without-practice');
});

test('e2e V34 : nouveaux exercices data/ml étiquetés SIMULATION', () => {
  for (const id of ['data-quality-detect', 'data-missing-strategy', 'etl-pipeline-order', 'table-groupby', 'llm-context-budget', 'ml-drift-detect']) {
    const ex = J(`data/exercises/${id}.json`);
    assert.match(ex.summary, /SIMULATION/, `${id} : frontière réel/simulé`);
  }
});

test('e2e V34 : data-ml-v1 reste ANNONCÉ (décision honnête, pas de greenwashing)', () => {
  const cat = buildCatalogue(J('data/program.json'));
  const dataMl = cat.tracks.find((t) => t.id === 'data-ml-v1');
  assert.ok(dataMl, 'le parcours data-ml-v1 existe au catalogue');
  assert.equal(dataMl.status, 'announced', 'data-ml-v1 reste annoncé tant que le packaging n\'est pas distinct et cohérent');
});

test('e2e V34 : aucune anomalie bloquante sur le curriculum réel', () => {
  const rep = auditCurriculumGraph(realGraph());
  assert.equal(rep.blocking.length, 0, rep.blocking.map((b) => `${b.type}:${b.subject}`).join(' | '));
});
