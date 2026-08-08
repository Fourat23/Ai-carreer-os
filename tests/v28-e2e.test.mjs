// CP9 (V28) — E2E déterministe de la fondation Observabilité/SRE : les 8 leçons
// existent, sont reliées à la pratique (practiceRefs résolus), le graphe est cohérent,
// et les parcours restent cohérents (durée dérivée). PUR, sans serveur.
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
const plan = JSON.parse(readFileSync(R('docs/architecture/v28-lessons-plan.json'), 'utf8'));
const KNOWN_LABS = new Set(['terminal', 'pipeline', 'cloud-topology', 'kubernetes', 'security', 'cloud-architecture']);

const OBS_SRE = [
  'observability-fundamentals', 'logging-structured', 'distributed-tracing',
  'metrics-percentiles', 'slo-error-budget', 'incident-response',
  'postmortem-rca', 'resilience-patterns',
];

test('E2E-1 : les 8 leçons Observabilité/SRE existent (fichier + program.json)', () => {
  const bySlug = new Map(program.lessons.map((l) => [l.slug, l]));
  for (const slug of OBS_SRE) {
    assert.ok(existsSync(R(`curriculum/lessons/${slug}.md`)), `fichier ${slug}`);
    assert.ok(bySlug.has(slug), `program.json contient ${slug}`);
  }
});

test('E2E-2 : chaque leçon critique V28 est reliée à la pratique', () => {
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

test('E2E-4 : les 6 parcours disponibles restent cohérents (durée dérivée)', () => {
  const avail = cat.tracks.filter(isTrackAvailable);
  assert.ok(avail.length >= 6, 'au moins 6 parcours disponibles');
  for (const t of avail) {
    const days = resolveTrackDays(cat, t);
    if (typeof t.totalDays === 'number') assert.equal(t.totalDays, days.length, `${t.id} durée dérivée`);
    assert.equal(new Set(days).size, days.length, `${t.id} aucun jour dupliqué`);
  }
});
