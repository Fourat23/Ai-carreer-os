// CP10/CP14 (V40) — extension du Curriculum Graph par les capstones : nœud
// 'capstone', arêtes ASSESSES/REMEDIATES, anomalie bloquante dead-capstone-ref
// sur données fabriquées, et graphe RÉEL enrichi (assessments + capstones) SANS
// anomalie bloquante ni warning ajouté.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildCurriculumGraph, auditCurriculumGraph, NODE_KINDS } from '../lib/curriculum-graph.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const readJson = (p) => JSON.parse(readFileSync(R(p), 'utf8'));
const program = readJson('data/program.json');
const idsOf = (dir) => new Set(readdirSync(R(dir)).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));

function realInputs() {
  const plans = readdirSync(R('docs/architecture')).filter((f) => /lessons-plan\.json$/.test(f))
    .map((f) => readJson(`docs/architecture/${f}`).prereq).filter(Boolean);
  const dayLinked = new Set(Object.values(readJson('data/day-exercises.json')).flat());
  const assessments = [...idsOf('data/assessments')].map((id) => readJson(`data/assessments/${id}.json`));
  const capstones = [...idsOf('data/capstones')].map((id) => readJson(`data/capstones/${id}.json`));
  const known = {
    exercises: idsOf('data/exercises'), missions: idsOf('data/missions'),
    playbooks: idsOf('data/playbooks'),
    labs: new Set(['terminal', 'pipeline', 'cloud-topology', 'kubernetes', 'security', 'cloud-architecture']),
    reachableExercises: dayLinked, skills: new Set(program.skills.map((s) => s.id)),
  };
  return { plans, known, assessments, capstones };
}

test('NODE_KINDS inclut capstone', () => {
  assert.ok(NODE_KINDS.includes('capstone'));
});

test('arêtes capstone ASSESSES/REMEDIATES construites', () => {
  const g = buildCurriculumGraph({
    lessons: [{ slug: 'l1' }],
    known: { skills: new Set(['sql']), exercises: new Set(['e1']), playbooks: new Set(['p1']) },
    capstones: [{ id: 'c1', skills: ['sql'], lessonRefs: ['l1'], exerciseRefs: ['e1'], playbookRefs: ['p1'] }],
  });
  assert.ok(g.nodes.some((n) => n.id === 'capstone:c1' && n.kind === 'capstone'));
  assert.ok(g.edges.some((e) => e.kind === 'ASSESSES' && e.from === 'capstone:c1' && e.to === 'skill:sql'));
  assert.ok(g.edges.some((e) => e.kind === 'REMEDIATES' && e.from === 'capstone:c1' && e.to === 'l1'));
});

test('dead-capstone-ref bloquant sur skill/leçon/exo/playbook inconnus', () => {
  const g = buildCurriculumGraph({
    lessons: [{ slug: 'l1' }],
    known: { skills: new Set(['sql']), exercises: new Set(['e1']), playbooks: new Set(['p1']) },
    capstones: [{ id: 'bad', skills: ['fantome'], lessonRefs: ['ghost'], exerciseRefs: ['nope'], playbookRefs: ['none'] }],
  });
  const rep = auditCurriculumGraph(g);
  const dead = rep.blocking.filter((b) => b.type === 'dead-capstone-ref');
  assert.equal(dead.length, 4, JSON.stringify(rep.blocking));
});

test('graphe RÉEL (assessments + capstones) : 0 anomalie bloquante', () => {
  const { plans, known, assessments, capstones } = realInputs();
  const g = buildCurriculumGraph({ lessons: program.lessons, prereqPlans: plans, known, assessments, capstones });
  const rep = auditCurriculumGraph(g);
  const detail = rep.blocking.map((b) => `${b.type}:${b.subject}`).join(' | ');
  assert.equal(rep.blocking.length, 0, `bloquantes : ${detail}`);
});

test('les capstones n\'ajoutent aucun avertissement au graphe réel', () => {
  const { plans, known, assessments, capstones } = realInputs();
  const withC = auditCurriculumGraph(buildCurriculumGraph({ lessons: program.lessons, prereqPlans: plans, known, assessments, capstones }));
  const without = auditCurriculumGraph(buildCurriculumGraph({ lessons: program.lessons, prereqPlans: plans, known, assessments }));
  assert.equal(withC.counts.warning ?? 0, without.counts.warning ?? 0, 'les capstones ne doivent pas créer de nouveaux warnings');
});
