// CP2 (V27) — intégrité du dispositif d'audit pédagogique V27 : plan, ledger,
// practiceRefs et cohérence avec les leçons réelles. PUR, lecture seule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { LESSONS } from '../scripts/data/lessons-map.mjs';
import { validateAuditLedger, DIMENSION_IDS } from '../lib/pedagogy-audit.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const plan = JSON.parse(readFileSync(R('docs/architecture/v27-lessons-plan.json'), 'utf8'));
const ledger = JSON.parse(readFileSync(R('docs/architecture/v27-pedagogy-audit.json'), 'utf8'));
const bySlug = new Map(LESSONS.map((l) => [l.file.replace(/\.md$/, ''), l]));
const KNOWN_LABS = new Set(['terminal', 'pipeline', 'cloud-topology', 'kubernetes', 'security', 'cloud-architecture']);

test('plan V27 : structure et slugs valides', () => {
  assert.ok(Array.isArray(plan.hardened), 'hardened est un tableau');
  assert.ok(Array.isArray(plan.critical), 'critical est un tableau');
  for (const slug of plan.critical) assert.ok(bySlug.has(slug), `critique existe : ${slug}`);
  for (const slug of plan.hardened) assert.ok(bySlug.has(slug), `durcie existe : ${slug}`);
});

test('graphe de prérequis : slugs connus et acyclique', () => {
  const prereq = plan.prereq ?? {};
  for (const [s, deps] of Object.entries(prereq)) {
    assert.ok(bySlug.has(s), `source connue : ${s}`);
    for (const d of deps) assert.ok(bySlug.has(d), `dépendance connue : ${d}`);
  }
  // détection de cycle (DFS)
  const color = new Map();
  const visit = (n) => {
    color.set(n, 1);
    for (const d of (prereq[n] ?? [])) {
      if (color.get(d) === 1) return true;
      if ((color.get(d) ?? 0) === 0 && visit(d)) return true;
    }
    color.set(n, 2);
    return false;
  };
  for (const n of Object.keys(prereq)) if ((color.get(n) ?? 0) === 0) assert.ok(!visit(n), `pas de cycle depuis ${n}`);
});

test('practiceRefs : toute référence résout vers un artefact existant', () => {
  for (const l of LESSONS) {
    for (const r of (l.practiceRefs ?? [])) {
      assert.ok(r && typeof r === 'object', 'practiceRef est un objet');
      if (r.kind === 'exercise') assert.ok(existsSync(R(`data/exercises/${r.id}.json`)), `exercice ${r.id}`);
      else if (r.kind === 'mission') assert.ok(existsSync(R(`data/missions/${r.id}.json`)), `mission ${r.id}`);
      else if (r.kind === 'playbook') assert.ok(existsSync(R(`data/playbooks/${r.id}.json`)), `playbook ${r.id}`);
      else if (r.kind === 'lab') assert.ok(KNOWN_LABS.has(r.id), `lab connu ${r.id}`);
      else assert.fail(`kind inconnu ${r.kind}`);
    }
  }
});

test('ledger V27 : valide contre la rubrique partagée', () => {
  const res = validateAuditLedger(ledger);
  assert.ok(res.ok, `ledger valide : ${(res.errors ?? []).join(' ; ')}`);
  for (const it of ledger.items) {
    assert.equal(it.kind, 'content', 'kind content pour une leçon');
    assert.ok(bySlug.has(it.id), `item ledger correspond à une leçon : ${it.id}`);
    for (const k of Object.keys(it.scores ?? {})) assert.ok(DIMENSION_IDS.has(k), `dimension connue : ${k}`);
  }
});
