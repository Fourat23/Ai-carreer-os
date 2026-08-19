// V50 — read-model temporel (pur) + invariants d'intégration du parcours.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildTimeline, temporalAudit, orphanExercises, monthlyDistribution, temporalAnomalies, activityRole } from '../lib/curriculum-timeline.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const de = JSON.parse(readFileSync(R('data/day-exercises.json'), 'utf8'));
const exercises = readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(R('data/exercises'), f), 'utf8')));
const tl = buildTimeline({ days: program.days, dayExercises: de, exercises });

test('read-model PUR : mêmes entrées → mêmes sorties', () => {
  const a = buildTimeline({ days: program.days, dayExercises: de, exercises });
  const b = buildTimeline({ days: program.days, dayExercises: de, exercises });
  assert.deepEqual(a.exposure, b.exposure);
  assert.equal(a.timeline.length, program.days.length);
});

test('rôles pédagogiques dérivés cohérents', () => {
  assert.equal(activityRole({ isReview: true, difficulty: 2 }), 'REVIEW');
  assert.equal(activityRole({ difficulty: 4 }), 'DIAGNOSTIC');
  assert.equal(activityRole({ difficulty: 2 }), 'PRACTICE');
  assert.equal(activityRole({ kind: 'transfer' }), 'TRANSFER');
});

test('intégration : aucune référence morte dans day-exercises', () => {
  const ids = new Set(exercises.map((e) => e.id));
  for (const [day, refs] of Object.entries(de)) for (const r of refs) assert.ok(ids.has(r), `jour ${day} → « ${r} » doit exister`);
});

test('intégration : aucun exercice professionnel V46-V49 orphelin', () => {
  const orphans = new Set(orphanExercises(tl, exercises));
  const pro = exercises.filter((e) => ['v46', 'v47', 'v48', 'v49'].includes(e.sprint) && orphans.has(e.id));
  assert.equal(pro.length, 0, `orphelins pro : ${pro.map((e) => e.id).join(', ')}`);
});

test('intégration : V50 ne crée pas de pratique-avant-introduction (≤ ligne de base)', () => {
  const pbi = temporalAnomalies(tl, exercises).filter((a) => a.kind === 'practice-before-intro');
  assert.ok(pbi.length <= 10, `pratique-avant-intro ${pbi.length} > 10 (V50 en aurait introduit)`);
});

test('distribution : les mois 7-11 ont de la pratique de code (comblés par V50)', () => {
  const md = monthlyDistribution(tl);
  for (const m of [7, 8, 9, 10, 11]) assert.ok((md[m]?.daysWithPractice ?? 0) >= 1, `mois ${m} doit avoir de la pratique`);
});

test('audit temporel : chaque compétence enseignée a une première/dernière exposition', () => {
  const rows = temporalAudit(tl);
  assert.ok(rows.length >= 15);
  for (const r of rows) assert.ok(r.firstExposure >= 1 && r.lastExposure <= 365 && r.firstExposure <= r.lastExposure);
});
