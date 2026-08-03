// CP5 (V21) — intégrité des pipelines livrés (data/pipelines/*.json) : valides
// contre les données réelles, exécutables par l'orchestrateur, vue publique sans
// fuite (fixture « with » / secret), triggers/jours cohérents.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validatePipeline, publicPipelineView, TRIGGER_KINDS } from '../lib/pipeline.mjs';
import { runPipeline } from '../lib/pipeline-engine.mjs';
import { buildCatalogue } from '../lib/catalogue.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const cat = buildCatalogue(program);
const ctx = { skillIds: { has: (s) => isKnownSkill(s) }, validDays: new Set(program.days.map((d) => d.day)), trackIds: new Set(cat.tracks.map((t) => t.id)) };
const files = readdirSync(R('data/pipelines')).filter((f) => f.endsWith('.json'));
const load = (f) => JSON.parse(readFileSync(R(`data/pipelines/${f}`), 'utf8'));

test('au moins 3 pipelines livrés', () => assert.ok(files.length >= 3, `${files.length}`));

test('chaque pipeline est valide contre les données réelles, ids uniques', () => {
  const ids = new Set();
  for (const f of files) {
    const p = load(f);
    const v = validatePipeline(p, ctx);
    assert.ok(v.ok, `${f} invalide : ${v.errors.join(' ; ')}`);
    assert.equal(ids.has(p.id), false, `id dupliqué ${p.id}`);
    ids.add(p.id);
    for (const t of p.trigger) assert.ok(TRIGGER_KINDS.includes(t), `${f} trigger ${t}`);
    for (const d of p.dayRefs) assert.ok(ctx.validDays.has(d), `${f} jour ${d}`);
  }
});

test('chaque pipeline est exécutable par l’orchestrateur (déterministe)', () => {
  for (const f of files) {
    const p = load(f);
    const event = { kind: p.trigger[0], branch: p.branchFilters?.[0] ?? 'main' };
    const run = runPipeline(p, event, { approved: true }, { clock: () => 0 });
    assert.ok(['success', 'failed', 'blocked', 'skipped', 'cancelled'].includes(run.status), `${f} statut ${run.status}`);
    // déterminisme
    assert.deepEqual(run, runPipeline(p, event, { approved: true }, { clock: () => 0 }));
  }
});

test('vue publique : aucune fuite de fixture « with » ni de valeur de secret', () => {
  for (const f of files) {
    const p = load(f);
    const blob = JSON.stringify(publicPipelineView(p));
    assert.ok(!/"with"|lintErrors|buildOk|failed":|sk-|ghp_/.test(blob), `${f} : fuite de fixture/secret`);
  }
});

test('un pipeline « cassé » démontre un échec pédagogique reproductible', () => {
  const broken = files.map(load).find((p) => p.id === 'pr-broken');
  assert.ok(broken, 'pipeline pr-broken présent');
  const run = runPipeline(broken, { kind: 'pull_request', branch: 'main' }, {}, { clock: () => 0 });
  assert.equal(run.status, 'failed');
  assert.equal(run.jobs.build.status, 'blocked');
});
