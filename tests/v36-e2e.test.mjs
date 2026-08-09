// CP2/CP10 (V36) — cohérence de bout en bout du socle Frontend « Web Platform » +
// décision d'activation du parcours frontend-engineer-v1. Déterministe, pur.
// À CP2 le plan est vide : les tests vérifient des invariants qui tiennent déjà
// (corpus, graphe, catégorie) et se renforcent à mesure que les leçons arrivent.
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
const plan = J('docs/architecture/v36-lessons-plan.json');
const program = J('data/program.json');
const bySlug = new Map(LESSONS.map((l) => [l.file.replace(/\.md$/, ''), l]));

test('e2e V36 : les leçons du plan existent au corpus et ont une catégorie', () => {
  for (const slug of [...plan.newLessons, ...plan.hardenedLegacy]) {
    const l = bySlug.get(slug);
    assert.ok(l, `leçon au corpus : ${slug}`);
    assert.ok(typeof l.cat === 'string' && l.cat.length > 0, `${slug} : catégorie non vide`);
  }
});

test('e2e V36 : les nouvelles leçons du périmètre ont toutes un on-ramp', () => {
  const dir = R('curriculum/lessons');
  const missing = [...plan.newLessons, ...plan.hardenedLegacy]
    .filter((slug) => !/^## 🌍/m.test(readFileSync(join(dir, `${slug}.md`), 'utf8')));
  assert.deepEqual(missing, [], `leçons du périmètre sans on-ramp : ${missing.join(', ')}`);
});

test('e2e V36 : aucune leçon du corpus sans on-ramp (invariant global maintenu)', () => {
  const dir = R('curriculum/lessons');
  const missing = readdirSync(dir).filter((f) => f.endsWith('.md'))
    .filter((f) => !/^## 🌍/m.test(readFileSync(join(dir, f), 'utf8')));
  assert.deepEqual(missing, [], `leçons sans on-ramp : ${missing.join(', ')}`);
});

test('e2e V36 : les leçons critiques ont une pratique résolue', () => {
  for (const slug of plan.critical) {
    const l = bySlug.get(slug);
    assert.ok(l && Array.isArray(l.practiceRefs) && l.practiceRefs.length > 0, `${slug} : practiceRefs non vide`);
  }
});

test('e2e V36 : aucune anomalie bloquante sur le curriculum réel', () => {
  const plans = ['v27', 'v28', 'v29', 'v30', 'v31', 'v32', 'v33', 'v34', 'v35', 'v36']
    .map((v) => { try { return J(`docs/architecture/${v}-lessons-plan.json`).prereq; } catch { return null; } })
    .filter(Boolean);
  const idsOf = (dir) => new Set(readdirSync(R(dir)).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));
  const known = {
    exercises: idsOf('data/exercises'), missions: idsOf('data/missions'), playbooks: idsOf('data/playbooks'),
    labs: new Set(['terminal', 'pipeline', 'cloud-topology', 'kubernetes', 'security', 'cloud-architecture']),
    reachableExercises: new Set(Object.values(J('data/day-exercises.json')).flat()),
  };
  const rep = auditCurriculumGraph(buildCurriculumGraph({ lessons: program.lessons, prereqPlans: plans, known }));
  assert.equal(rep.blocking.length, 0, rep.blocking.map((b) => `${b.type}:${b.subject}`).join(' | '));
});

test('e2e V36 : le parcours frontend-engineer-v1 existe au catalogue', () => {
  const cat = buildCatalogue(program);
  const fe = cat.tracks.find((t) => t.id === 'frontend-engineer-v1');
  assert.ok(fe, 'frontend-engineer-v1 présent au catalogue');
  assert.ok(['available', 'announced'].includes(fe.status), 'statut valide');
});
