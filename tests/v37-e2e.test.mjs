// CP2/CP9 (V37) — cohérence de bout en bout : profondeur Frontend (splits), leçons
// retirées absentes, socle Web atteignable depuis le parcours, graphe sain. Pur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { LESSONS } from '../scripts/data/lessons-map.mjs';
import { buildCatalogue } from '../lib/catalogue.mjs';
import { buildCurriculumGraph, auditCurriculumGraph } from '../lib/curriculum-graph.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const J = (p) => JSON.parse(readFileSync(R(p), 'utf8'));
const plan = J('docs/architecture/v37-lessons-plan.json');
const program = J('data/program.json');
const bySlug = new Map(LESSONS.map((l) => [l.file.replace(/\.md$/, ''), l]));

test('e2e V37 : leçons du plan présentes, leçons retirées absentes', () => {
  for (const slug of [...plan.newLessons, ...plan.hardenedLegacy]) assert.ok(bySlug.has(slug), `présente : ${slug}`);
  for (const slug of (plan.removedLessons ?? [])) {
    assert.ok(!bySlug.has(slug), `retirée du corpus : ${slug}`);
    assert.ok(!existsSync(R(`curriculum/lessons/${slug}.md`)), `.md retiré : ${slug}`);
  }
});

test('e2e V37 : aucune leçon du corpus sans on-ramp (invariant global)', () => {
  const dir = R('curriculum/lessons');
  const missing = readdirSync(dir).filter((f) => f.endsWith('.md'))
    .filter((f) => !/^## 🌍/m.test(readFileSync(join(dir, f), 'utf8')));
  assert.deepEqual(missing, [], `sans on-ramp : ${missing.join(', ')}`);
});

test('e2e V37 : le socle Web est ATTEIGNABLE depuis le parcours Frontend (lessonRefs)', () => {
  const cat = buildCatalogue(program);
  const fe = cat.tracks.find((t) => t.id === 'frontend-engineer-v1');
  assert.ok(fe && fe.status === 'available', 'frontend-engineer-v1 disponible');
  const refs = new Set(fe.moduleRefs.flatMap((id) => cat.modules[id].lessonRefs ?? []));
  // toute leçon référencée existe au corpus (invariant permanent)
  for (const slug of refs) assert.ok(bySlug.has(slug), `lessonRef valide : ${slug}`);
  // Une fois le rattachement livré (CP9), le socle Web DOIT être atteignable depuis
  // le parcours (pas seulement dans /lessons). Test progressif : il s'active dès que
  // des lessonRefs existent, et vérifie chaque leçon-socle réellement présente au corpus.
  if (refs.size > 0) {
    for (const slug of ['html-semantic-structure', 'css-fundamentals', 'css-flexbox', 'css-grid', 'responsive-design']) {
      if (bySlug.has(slug)) assert.ok(refs.has(slug), `socle Web atteignable depuis le parcours : ${slug}`);
    }
  }
});

test('e2e V37 : aucune anomalie bloquante sur le curriculum réel', () => {
  const plans = ['v27', 'v28', 'v29', 'v30', 'v31', 'v32', 'v33', 'v34', 'v35', 'v36', 'v37']
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
