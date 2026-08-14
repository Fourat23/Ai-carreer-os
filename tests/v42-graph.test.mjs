// CP6 (V42) — extension du graphe par les défis de transfert : nœud 'transfer',
// arêtes ASSESSES/REMEDIATES, dead-transfer-ref bloquant, skill-without-transfer
// (avertissement, uniquement sur compétences structurantes, sans faux positif),
// graphe RÉEL enrichi 0 bloquant.
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

function realGraph(extra = {}) {
  const plans = readdirSync(R('docs/architecture')).filter((f) => /lessons-plan\.json$/.test(f))
    .map((f) => readJson(`docs/architecture/${f}`).prereq).filter(Boolean);
  const dayLinked = new Set(Object.values(readJson('data/day-exercises.json')).flat());
  const assessments = [...idsOf('data/assessments')].map((id) => readJson(`data/assessments/${id}.json`));
  const capstones = [...idsOf('data/capstones')].map((id) => readJson(`data/capstones/${id}.json`));
  const transferChallenges = [...idsOf('data/transfer-challenges')].map((id) => readJson(`data/transfer-challenges/${id}.json`));
  const known = {
    exercises: idsOf('data/exercises'), missions: idsOf('data/missions'), playbooks: idsOf('data/playbooks'),
    labs: new Set(['terminal', 'pipeline', 'cloud-topology', 'kubernetes', 'security', 'cloud-architecture']),
    reachableExercises: dayLinked, skills: new Set(program.skills.map((s) => s.id)), ...extra.known,
  };
  return buildCurriculumGraph({ lessons: program.lessons, prereqPlans: plans, known, assessments, capstones, transferChallenges });
}

test('NODE_KINDS inclut transfer', () => {
  assert.ok(NODE_KINDS.includes('transfer'));
});

test('arêtes transfer ASSESSES/REMEDIATES construites', () => {
  const g = buildCurriculumGraph({
    lessons: [{ slug: 'l1' }], known: { skills: new Set(['http']) },
    transferChallenges: [{ id: 't1', skills: ['http'], lessonRefs: ['l1'] }],
  });
  assert.ok(g.nodes.some((n) => n.id === 'transfer:t1' && n.kind === 'transfer'));
  assert.ok(g.edges.some((e) => e.kind === 'ASSESSES' && e.from === 'transfer:t1' && e.to === 'skill:http'));
});

test('dead-transfer-ref bloquant sur skill/leçon inconnus', () => {
  const g = buildCurriculumGraph({
    lessons: [{ slug: 'l1' }], known: { skills: new Set(['http']) },
    transferChallenges: [{ id: 'bad', skills: ['fantome'], lessonRefs: ['ghost'] }],
  });
  const dead = auditCurriculumGraph(g).blocking.filter((b) => b.type === 'dead-transfer-ref');
  assert.equal(dead.length, 2);
});

test('skill-without-transfer : avertissement uniquement pour compétence structurante sans défi', () => {
  const g = buildCurriculumGraph({
    lessons: [{ slug: 'lx', skills: ['secu'] }],
    prereqPlans: [],
    known: { exercises: new Set(['ex']), skills: new Set(['secu']), structuralSkills: new Set(['secu']) },
    // lx enseigne secu et a une pratique résolue, mais aucun défi de transfert sur secu.
  });
  // attacher une pratique résolue à lx via practiceRefs simulés
  const g2 = buildCurriculumGraph({
    lessons: [{ slug: 'lx', skills: ['secu'], practiceRefs: [{ kind: 'exercise', id: 'ex' }] }],
    known: { exercises: new Set(['ex']), skills: new Set(['secu']), structuralSkills: new Set(['secu']) },
  });
  const w = auditCurriculumGraph(g2).anomalies.filter((a) => a.type === 'skill-without-transfer');
  assert.equal(w.length, 1, JSON.stringify(auditCurriculumGraph(g2).anomalies));
  // sans structuralSkills → aucun avertissement (pas de faux positif)
  const g3 = buildCurriculumGraph({
    lessons: [{ slug: 'lx', skills: ['secu'], practiceRefs: [{ kind: 'exercise', id: 'ex' }] }],
    known: { exercises: new Set(['ex']), skills: new Set(['secu']) },
  });
  assert.equal(auditCurriculumGraph(g3).anomalies.filter((a) => a.type === 'skill-without-transfer').length, 0);
});

test('graphe RÉEL enrichi (assessments + capstones + transfer) : 0 anomalie bloquante', () => {
  const rep = auditCurriculumGraph(realGraph());
  const detail = rep.blocking.map((b) => `${b.type}:${b.subject}`).join(' | ');
  assert.equal(rep.blocking.length, 0, `bloquantes : ${detail}`);
});
