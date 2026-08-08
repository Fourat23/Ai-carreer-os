// CP9 (V31) — cohérence de bout en bout de la chaîne RAG / IA appliquée.
// Vérifie qu'un apprenant peut la suivre SANS trou : prérequis acycliques,
// chaque leçon avancée remonte jusqu'à un fondement commun, ordre topologique
// valide, chaque nouvelle pratique reliée à une leçon, chaîne réel/simulé
// cohérente. Déterministe, pur (lecture des vraies données uniquement).
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
  const plans = ['v27', 'v28', 'v29', 'v30', 'v31']
    .map((v) => J(`docs/architecture/${v}-lessons-plan.json`).prereq)
    .filter(Boolean);
  const known = {
    exercises: idsOf('data/exercises'),
    missions: idsOf('data/missions'),
    playbooks: idsOf('data/playbooks'),
    labs: new Set(['terminal', 'pipeline', 'cloud-topology', 'kubernetes', 'security', 'cloud-architecture']),
  };
  return buildCurriculumGraph({ lessons: program.lessons, prereqPlans: plans, known });
}

// Remonte transitivement les prérequis (REQUIRES : leçon → prérequis).
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

// Tri topologique (Kahn) ; renvoie null si cycle.
function topoOrder(requires) {
  const nodes = new Set(requires.keys());
  for (const deps of requires.values()) for (const d of deps) nodes.add(d);
  const indeg = new Map([...nodes].map((n) => [n, 0]));
  // arête prérequis → leçon (le prérequis vient d'abord)
  const out = new Map([...nodes].map((n) => [n, []]));
  for (const [slug, deps] of requires) for (const d of deps) { out.get(d).push(slug); indeg.set(slug, indeg.get(slug) + 1); }
  const q = [...nodes].filter((n) => indeg.get(n) === 0).sort();
  const order = [];
  while (q.length) {
    const u = q.shift();
    order.push(u);
    for (const v of out.get(u)) { indeg.set(v, indeg.get(v) - 1); if (indeg.get(v) === 0) { q.push(v); q.sort(); } }
  }
  return order.length === nodes.size ? order : null;
}

test('e2e : le graphe de prérequis global est acyclique', () => {
  const g = realGraph();
  assert.equal(findPrereqCycles(g.requires).length, 0);
});

test('e2e : un ordre topologique valide existe (parcours sans blocage)', () => {
  const g = realGraph();
  const order = topoOrder(g.requires);
  assert.ok(order, 'ordre topologique impossible (cycle)');
  const pos = new Map(order.map((s, i) => [s, i]));
  for (const [slug, deps] of g.requires) {
    for (const d of deps) {
      assert.ok(pos.get(d) < pos.get(slug), `prérequis « ${d} » doit précéder « ${slug} » dans l'ordre`);
    }
  }
});

test('e2e : chaque leçon RAG avancée remonte jusqu\'à llm-fundamentals', () => {
  const g = realGraph();
  const advanced = ['rag-evaluation', 'retrieval-reranking', 'chunking-strategies', 'vector-databases', 'ai-evaluation', 'agent-workflows-orchestration', 'prompt-injection-defense'];
  for (const a of advanced) {
    assert.ok(reaches(g.requires, a, 'llm-fundamentals'), `${a} doit dépendre (transitivement) de llm-fundamentals`);
  }
});

test('e2e : chaque exercice RAG est relié à au moins une leçon (aucun orphelin)', () => {
  const g = realGraph();
  const exIds = ['rag-chunking-overlap', 'rag-cosine-rank', 'rag-rrf-fusion', 'rag-failure-locate', 'rag-structured-validate'];
  for (const e of exIds) {
    const refs = g.practices.filter((p) => p.id === e);
    assert.ok(refs.length > 0, `${e} : doit être référencé par une leçon`);
    assert.ok(refs.every((p) => p.resolved), `${e} : références résolues`);
  }
});

test('e2e : aucune anomalie bloquante sur le curriculum réel', () => {
  const rep = auditCurriculumGraph(realGraph());
  assert.equal(rep.blocking.length, 0, rep.blocking.map((b) => `${b.type}:${b.subject}`).join(' | '));
});

test('e2e : frontière réel/simulé — les exercices RAG sont étiquetés SIMULATION', () => {
  const exIds = ['rag-chunking-overlap', 'rag-cosine-rank', 'rag-rrf-fusion', 'rag-failure-locate', 'rag-structured-validate'];
  for (const id of exIds) {
    const ex = J(`data/exercises/${id}.json`);
    assert.match(ex.summary, /SIMULATION/, `${id} : le résumé doit expliciter la frontière réel/simulé`);
  }
});
