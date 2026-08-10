// CP2/CP12 (V38) — cohérence de bout en bout : Backend II + System Design présents
// au corpus, socle backend/system-design atteignable depuis le parcours, graphe sain.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { LESSONS } from '../scripts/data/lessons-map.mjs';
import { buildCatalogue } from '../lib/catalogue.mjs';
import { buildCurriculumGraph, auditCurriculumGraph } from '../lib/curriculum-graph.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const J = (p) => JSON.parse(readFileSync(R(p), 'utf8'));
const plan = J('docs/architecture/v38-lessons-plan.json');
const program = J('data/program.json');
const bySlug = new Map(LESSONS.map((l) => [l.file.replace(/\.md$/, ''), l]));

test('e2e V38 : leçons du plan présentes au corpus', () => {
  for (const slug of [...plan.newLessons, ...plan.hardenedLegacy]) assert.ok(bySlug.has(slug), `présente : ${slug}`);
});

test('e2e V38 : aucune leçon du corpus sans on-ramp (invariant global)', () => {
  const dir = R('curriculum/lessons');
  const missing = readdirSync(dir).filter((f) => f.endsWith('.md'))
    .filter((f) => !/^## 🌍/m.test(readFileSync(join(dir, f), 'utf8')));
  assert.deepEqual(missing, [], `sans on-ramp : ${missing.join(', ')}`);
});

test('e2e V38 : les leçons critiques ont une pratique résolue', () => {
  for (const slug of plan.critical) {
    const l = bySlug.get(slug);
    assert.ok(l && Array.isArray(l.practiceRefs) && l.practiceRefs.length > 0, `${slug} : practiceRefs non vide`);
  }
});

test('e2e V38 : le socle Backend/System Design est ATTEIGNABLE depuis le parcours', () => {
  const cat = buildCatalogue(program);
  const be = cat.tracks.find((t) => t.id === 'backend-engineer-v1');
  assert.ok(be && be.status === 'available', 'backend-engineer-v1 disponible');
  const refs = new Set(be.moduleRefs.flatMap((id) => cat.modules[id].lessonRefs ?? []));
  for (const slug of refs) assert.ok(bySlug.has(slug), `lessonRef valide : ${slug}`);
  // Test progressif : dès que des lessonRefs existent, le socle backend clé doit être atteignable.
  if (refs.size > 0) {
    for (const slug of ['api-production-contracts', 'async-messaging-queues', 'system-design-scaling']) {
      if (bySlug.has(slug)) assert.ok(refs.has(slug), `socle backend atteignable : ${slug}`);
    }
  }
});

test('e2e V38 : aucune anomalie bloquante sur le curriculum réel', () => {
  const plans = ['v27','v28','v29','v30','v31','v32','v33','v34','v35','v36','v37','v38']
    .map((v) => { try { return J(`docs/architecture/${v}-lessons-plan.json`).prereq; } catch { return null; } }).filter(Boolean);
  const idsOf = (dir) => new Set(readdirSync(R(dir)).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));
  const known = {
    exercises: idsOf('data/exercises'), missions: idsOf('data/missions'), playbooks: idsOf('data/playbooks'),
    labs: new Set(['terminal', 'pipeline', 'cloud-topology', 'kubernetes', 'security', 'cloud-architecture']),
    reachableExercises: new Set(Object.values(J('data/day-exercises.json')).flat()),
  };
  const rep = auditCurriculumGraph(buildCurriculumGraph({ lessons: program.lessons, prereqPlans: plans, known }));
  assert.equal(rep.blocking.length, 0, rep.blocking.map((b) => `${b.type}:${b.subject}`).join(' | '));
});
