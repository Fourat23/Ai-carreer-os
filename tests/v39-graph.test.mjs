// CP9 (V39) — extension du Curriculum Graph par les évaluations : arêtes
// ASSESSES/REMEDIATES construites, anomalie bloquante dead-assessment-ref détectée
// sur données fabriquées, et le graphe RÉEL enrichi des évaluations reste SANS
// anomalie bloquante (0 bloquant) et sans avertissement nouveau.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildCurriculumGraph, auditCurriculumGraph, NODE_KINDS, EDGE_KINDS } from '../lib/curriculum-graph.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const readJson = (p) => JSON.parse(readFileSync(R(p), 'utf8'));
const program = readJson('data/program.json');
const idsOf = (dir) => new Set(readdirSync(R(dir)).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));

function realInputs() {
  const plans = readdirSync(R('docs/architecture'))
    .filter((f) => /lessons-plan\.json$/.test(f))
    .map((f) => readJson(`docs/architecture/${f}`).prereq)
    .filter(Boolean);
  const dayLinked = new Set(Object.values(readJson('data/day-exercises.json')).flat());
  const assessments = [...idsOf('data/assessments')].map((id) => readJson(`data/assessments/${id}.json`));
  const known = {
    exercises: idsOf('data/exercises'), missions: idsOf('data/missions'),
    playbooks: idsOf('data/playbooks'),
    labs: new Set(['terminal', 'pipeline', 'cloud-topology', 'kubernetes', 'security', 'cloud-architecture']),
    reachableExercises: dayLinked, skills: new Set(program.skills.map((s) => s.id)),
  };
  return { plans, known, assessments };
}

test('types de nœuds/arêtes étendus (assessment, ASSESSES, REMEDIATES)', () => {
  assert.ok(NODE_KINDS.includes('assessment'));
  assert.ok(EDGE_KINDS.includes('ASSESSES'));
  assert.ok(EDGE_KINDS.includes('REMEDIATES'));
});

test('arêtes ASSESSES/REMEDIATES construites depuis les évaluations', () => {
  const g = buildCurriculumGraph({
    lessons: [{ slug: 'l1' }],
    known: { skills: new Set(['archi']) },
    assessments: [{ id: 'a1', skills: ['archi'], lessonRefs: ['l1'], remediation: ['l1'] }],
  });
  assert.ok(g.nodes.some((n) => n.id === 'assessment:a1' && n.kind === 'assessment'));
  assert.ok(g.edges.some((e) => e.kind === 'ASSESSES' && e.from === 'assessment:a1' && e.to === 'skill:archi'));
  assert.ok(g.edges.some((e) => e.kind === 'REMEDIATES' && e.from === 'assessment:a1' && e.to === 'l1'));
});

test('dead-assessment-ref bloquant sur skill/leçon inconnus', () => {
  const g = buildCurriculumGraph({
    lessons: [{ slug: 'l1' }],
    known: { skills: new Set(['archi']) },
    assessments: [{ id: 'bad', skills: ['fantome'], lessonRefs: ['l1'], remediation: ['leçon-inexistante'] }],
  });
  const rep = auditCurriculumGraph(g);
  const dead = rep.blocking.filter((b) => b.type === 'dead-assessment-ref');
  assert.equal(dead.length, 2, JSON.stringify(rep.blocking));
});

test('graphe RÉEL enrichi des évaluations : 0 anomalie bloquante', () => {
  const { plans, known, assessments } = realInputs();
  const g = buildCurriculumGraph({ lessons: program.lessons, prereqPlans: plans, known, assessments });
  const rep = auditCurriculumGraph(g);
  const detail = rep.blocking.map((b) => `${b.type}:${b.subject}`).join(' | ');
  assert.equal(rep.blocking.length, 0, `bloquantes : ${detail}`);
});

test('les évaluations n\'ajoutent aucun avertissement au graphe réel', () => {
  const { plans, known, assessments } = realInputs();
  const withA = auditCurriculumGraph(buildCurriculumGraph({ lessons: program.lessons, prereqPlans: plans, known, assessments }));
  const without = auditCurriculumGraph(buildCurriculumGraph({ lessons: program.lessons, prereqPlans: plans, known }));
  assert.equal(withA.counts.warning ?? 0, without.counts.warning ?? 0, 'les évaluations ne doivent pas créer de nouveaux warnings');
});
