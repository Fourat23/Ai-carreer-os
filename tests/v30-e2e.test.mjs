// CP9 (V30) — E2E déterministe du socle + Frontend/React + Data/SQL + SE : les leçons
// du périmètre existent, sont reliées à la pratique (practiceRefs résolus), le graphe est
// cohérent, les parcours disponibles restent cohérents (durée dérivée), et les parcours
// Frontend/Data restent ANNONCÉS (pas de greenwashing). PUR, sans serveur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildCatalogue, resolveTrackDays, isTrackAvailable } from '../lib/catalogue.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const cat = buildCatalogue(program);
const plan = JSON.parse(readFileSync(R('docs/architecture/v30-lessons-plan.json'), 'utf8'));
const KNOWN_LABS = new Set(['terminal', 'pipeline', 'cloud-topology', 'kubernetes', 'security', 'cloud-architecture']);

const V30_CORE = [
  'api-design-basics', 'express-backend', 'authentication',
  'statistics-for-ml', 'machine-learning-basics', 'llm-fundamentals',
  'agents-fundamentals', 'ai-security', 'technical-documentation',
];

test('E2E-1 : le socle Backend/API + AI/ML corrigé existe (fichier + program.json)', () => {
  const bySlug = new Map(program.lessons.map((l) => [l.slug, l]));
  for (const slug of V30_CORE) {
    assert.ok(existsSync(R(`curriculum/lessons/${slug}.md`)), `fichier ${slug}`);
    assert.ok(bySlug.has(slug), `program.json contient ${slug}`);
  }
});

test('E2E-2 : chaque leçon critique V30 est reliée à la pratique', () => {
  const bySlug = new Map(program.lessons.map((l) => [l.slug, l]));
  for (const slug of plan.critical) {
    const l = bySlug.get(slug);
    assert.ok(l, `leçon critique présente : ${slug}`);
    assert.ok((l.practiceRefs ?? []).length > 0, `leçon critique reliée : ${slug}`);
  }
});

test('E2E-3 : tous les practiceRefs du corpus résolvent', () => {
  for (const l of program.lessons) {
    for (const r of (l.practiceRefs ?? [])) {
      if (r.kind === 'exercise') assert.ok(existsSync(R(`data/exercises/${r.id}.json`)), `${l.slug}→exo ${r.id}`);
      else if (r.kind === 'mission') assert.ok(existsSync(R(`data/missions/${r.id}.json`)), `${l.slug}→mission ${r.id}`);
      else if (r.kind === 'playbook') assert.ok(existsSync(R(`data/playbooks/${r.id}.json`)), `${l.slug}→pb ${r.id}`);
      else if (r.kind === 'lab') assert.ok(KNOWN_LABS.has(r.id), `${l.slug}→lab ${r.id}`);
      else assert.fail(`${l.slug} : kind inconnu ${r.kind}`);
    }
  }
});

test('E2E-4 : les parcours disponibles restent cohérents (durée dérivée)', () => {
  const avail = cat.tracks.filter(isTrackAvailable);
  assert.ok(avail.length >= 6, 'au moins 6 parcours disponibles');
  for (const t of avail) {
    const days = resolveTrackDays(cat, t);
    if (typeof t.totalDays === 'number') assert.equal(t.totalDays, days.length, `${t.id} durée dérivée`);
    assert.equal(new Set(days).size, days.length, `${t.id} aucun jour dupliqué`);
  }
});

test('E2E-5 : les parcours Frontend/Data restent ANNONCÉS (pas de greenwashing)', () => {
  const byId = new Map(cat.tracks.map((t) => [t.id, t]));
  for (const id of ['frontend-engineer-v1', 'ai-fullstack-v1']) {
    const t = byId.get(id);
    assert.ok(t, `parcours annoncé présent : ${id}`);
    assert.equal(t.status, 'announced', `${id} reste annoncé (non promu sans curation de journées)`);
  }
});
