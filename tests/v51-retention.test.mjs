// V51 — rétention & progression cognitive (read-model pur + invariants).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildTimeline, retentionAnomalies, difficultyAnomalies, skillProgression, dailyLoad, loadHistogram } from '../lib/curriculum-timeline.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const de = JSON.parse(readFileSync(R('data/day-exercises.json'), 'utf8'));
const exercises = readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(R('data/exercises'), f), 'utf8')));
const tl = buildTimeline({ days: program.days, dayExercises: de, exercises });
const LATE = { rag: true, evalia: true, agents: true, llm: true };

test('rétention : 0 écart de pratique > 90 j pour les compétences de code (post-V51)', () => {
  const ret = retentionAnomalies(tl, { justifiedLateSkills: LATE });
  assert.equal(ret.length, 0, ret.map((a) => a.reason).join(' | '));
});

test('charge : modèle transparent (none/light/normal/heavy/excessive)', () => {
  const d1 = dailyLoad({ day: 1, month: 1, isReview: false }, tl);
  assert.ok(['none', 'light', 'normal', 'heavy', 'excessive'].includes(d1.level));
  const hist = loadHistogram(program.days, tl);
  assert.equal(Object.values(hist).reduce((a, b) => a + b, 0), 365);
});

test('progression : aucun D5 isolé (D5 exige D3/D4 en pratique)', () => {
  const iso = difficultyAnomalies(tl).filter((a) => a.kind === 'isolated-d5');
  assert.equal(iso.length, 0, iso.map((a) => a.reason).join(' | '));
});

test('progression : chaque compétence pratiquée expose sa timeline de difficulté', () => {
  const rows = skillProgression(tl);
  assert.ok(rows.length >= 15);
  for (const r of rows) if (r.firstD5) assert.ok(r.firstD3 || r.firstD4, `${r.skill} : D5 sans D3/D4`);
});

test('read-model PUR : recompute identique', () => {
  const a = retentionAnomalies(tl, { justifiedLateSkills: LATE });
  const b = retentionAnomalies(buildTimeline({ days: program.days, dayExercises: de, exercises }), { justifiedLateSkills: LATE });
  assert.deepEqual(a, b);
});
