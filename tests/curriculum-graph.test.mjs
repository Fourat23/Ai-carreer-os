// CP8 (V31) — Curriculum Graph : modèle de lecture DÉRIVÉ, pur.
// Deux niveaux : (a) tests unitaires sur fixtures synthétiques (détection de
// cycle, prérequis mort, practiceRef mort, concept non pratiqué, orphelin) ;
// (b) test d'INTÉGRATION sur les vraies données — le graphe agrégé du curriculum
// réel ne doit contenir AUCUNE anomalie bloquante (la chaîne n'est pas cassée).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildCurriculumGraph, auditCurriculumGraph, findPrereqCycles } from '../lib/curriculum-graph.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const readJson = (p) => JSON.parse(readFileSync(R(p), 'utf8'));

// ── (a) Fixtures synthétiques ────────────────────────────────────────────────

test('build : agrège leçons, prérequis (union), pratiques et compétences', () => {
  const g = buildCurriculumGraph({
    lessons: [
      { slug: 'a', skills: ['x'], practiceRefs: [{ kind: 'exercise', id: 'ex-a' }] },
      { slug: 'b', skills: ['x', 'y'] },
    ],
    prereqPlans: [{ b: ['a'] }, { b: ['a'], a: [] }],
    known: { exercises: ['ex-a'] },
  });
  assert.deepEqual([...g.lessons].sort(), ['a', 'b']);
  assert.deepEqual([...g.requires.get('b')], ['a']);
  assert.equal(g.practices.length, 1);
  assert.equal(g.practices[0].resolved, true);
  assert.deepEqual([...g.skills].sort(), ['x', 'y']);
});

test('audit : graphe sain → aucune anomalie bloquante', () => {
  const g = buildCurriculumGraph({
    lessons: [
      { slug: 'a', skills: ['x'], practiceRefs: [{ kind: 'exercise', id: 'ex-a' }] },
      { slug: 'b', skills: ['x'], practiceRefs: [{ kind: 'exercise', id: 'ex-b' }] },
    ],
    prereqPlans: [{ b: ['a'] }],
    known: { exercises: ['ex-a', 'ex-b'] },
  });
  const rep = auditCurriculumGraph(g);
  assert.equal(rep.ok, true);
  assert.equal(rep.blocking.length, 0);
});

test('audit : détecte un cycle de prérequis (bloquant)', () => {
  const g = buildCurriculumGraph({
    lessons: [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }],
    prereqPlans: [{ a: ['b'], b: ['c'], c: ['a'] }],
  });
  assert.ok(findPrereqCycles(g.requires).length >= 1);
  const rep = auditCurriculumGraph(g);
  assert.equal(rep.ok, false);
  assert.ok(rep.anomalies.some((x) => x.type === 'prereq-cycle' && x.severity === 'blocking'));
});

test('audit : détecte un prérequis mort (leçon cible inexistante)', () => {
  const g = buildCurriculumGraph({
    lessons: [{ slug: 'a' }],
    prereqPlans: [{ a: ['fantome'] }],
  });
  const rep = auditCurriculumGraph(g);
  assert.ok(rep.anomalies.some((x) => x.type === 'dead-prereq' && x.detail.includes('fantome')));
  assert.equal(rep.ok, false);
});

test('audit : détecte un practiceRef mort (artefact absent)', () => {
  const g = buildCurriculumGraph({
    lessons: [{ slug: 'a', practiceRefs: [{ kind: 'exercise', id: 'ex-absent' }] }],
    known: { exercises: [] },
  });
  const rep = auditCurriculumGraph(g);
  assert.ok(rep.anomalies.some((x) => x.type === 'dead-practiceref' && x.severity === 'blocking'));
  assert.equal(rep.ok, false);
});

test('audit : signale une compétence enseignée mais jamais pratiquée (warning)', () => {
  const g = buildCurriculumGraph({
    lessons: [{ slug: 'a', skills: ['solo'] }], // aucune pratique
    prereqPlans: [],
  });
  const rep = auditCurriculumGraph(g);
  assert.ok(rep.anomalies.some((x) => x.type === 'concept-not-practiced' && x.severity === 'warning'));
  assert.equal(rep.ok, true); // warning ne bloque pas
});

test('audit : signale une leçon orpheline (info)', () => {
  const g = buildCurriculumGraph({ lessons: [{ slug: 'seule' }], prereqPlans: [] });
  const rep = auditCurriculumGraph(g);
  assert.ok(rep.anomalies.some((x) => x.type === 'orphan-lesson' && x.severity === 'info'));
  assert.equal(rep.ok, true);
});

// ── (b) Intégration sur les vraies données ───────────────────────────────────

function realGraph() {
  const program = readJson('data/program.json');
  const plans = ['v27', 'v28', 'v29', 'v30', 'v31']
    .map((v) => readJson(`docs/architecture/${v}-lessons-plan.json`).prereq)
    .filter(Boolean);
  const idsOf = (dir) => new Set(readdirSync(R(dir)).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));
  const known = {
    exercises: idsOf('data/exercises'),
    missions: idsOf('data/missions'),
    playbooks: idsOf('data/playbooks'),
    labs: new Set(['terminal', 'pipeline', 'cloud-topology', 'kubernetes', 'security', 'cloud-architecture']),
  };
  return buildCurriculumGraph({ lessons: program.lessons, prereqPlans: plans, known });
}

test('intégration : le curriculum réel ne contient AUCUNE anomalie bloquante', () => {
  const rep = auditCurriculumGraph(realGraph());
  const detail = rep.blocking.map((b) => `${b.type}:${b.subject} (${b.detail})`).join(' | ');
  assert.equal(rep.blocking.length, 0, `anomalies bloquantes : ${detail}`);
});

test('intégration : la chaîne RAG est reliée (prérequis + pratique)', () => {
  const g = realGraph();
  // chaque leçon RAG critique du plan V31 a au moins un practiceRef résolu
  const critical = readJson('docs/architecture/v31-lessons-plan.json').critical;
  for (const slug of critical) {
    const refs = g.practices.filter((p) => p.lesson === slug);
    assert.ok(refs.length > 0, `${slug} : la leçon critique doit porter une pratique`);
    assert.ok(refs.every((p) => p.resolved), `${slug} : toutes ses pratiques doivent être résolues`);
  }
  // le graphe de prérequis reste acyclique
  assert.equal(findPrereqCycles(g.requires).length, 0);
});
