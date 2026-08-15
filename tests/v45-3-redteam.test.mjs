import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const RT = JSON.parse(readFileSync('docs/audits/V45-3-LESSON-REDTEAM.json', 'utf8'));
const lessons = RT.lessons;
const led = JSON.parse(readFileSync('docs/audits/V45-2-LESSON-LEDGER.json', 'utf8')).lessons;

const D = ['technical-accuracy','conceptual-completeness','beginner-accessibility','prerequisite-explicitness','mental-model-quality','concrete-to-abstract-progression','example-quality','counter-example-quality','misconception-resistance','cognitive-load','vocabulary-scaffolding','autonomous-practice','diagnostic-reasoning','transfer-potential','professional-relevance','limits-and-non-applicability','retention-support','curriculum-coherence'];

test('V45.3 : >=24 leçons uniques auditées', () => {
  const slugs = new Set(lessons.map(l => l.slug));
  assert.ok(slugs.size >= 24, `attendu >=24, obtenu ${slugs.size}`);
  assert.equal(slugs.size, lessons.length, 'doublons dans le sample');
});

test('V45.3 : 100% full-read attesté', () => {
  for (const l of lessons) assert.equal(l.fullRead, true, `${l.slug} non fullRead`);
});

test('V45.3 : aucune leçon évaluée sans preuves + 18 dimensions', () => {
  for (const l of lessons) {
    assert.ok(Array.isArray(l.evidence) && l.evidence.length >= 2, `${l.slug} <2 preuves`);
    for (const d of D) assert.equal(typeof l.scores[d], 'number', `${l.slug} dim manquante ${d}`);
    assert.ok(['A','B','C','D','E'].includes(l.gradeV453), `${l.slug} grade invalide`);
    assert.ok(/^T[0-5]$/.test(l.transferLevelV453), `${l.slug} transfert invalide`);
  }
});

test('V45.3 : portes bloquantes du grade A respectées', () => {
  const gate = ['technical-accuracy','beginner-accessibility','mental-model-quality'];
  for (const l of lessons) {
    if (l.gradeV453 === 'A') for (const g of gate) assert.ok(l.scores[g] >= 3, `${l.slug} porte ${g} violée pour A`);
  }
});

test('V45.3 : les 7 MINOR_FIX de V45.2 sont présents dans le sample', () => {
  const mf = led.filter(l => l.recommendedAction === 'MINOR_FIX').map(l => l.slug);
  assert.equal(mf.length, 7);
  const sampled = new Set(lessons.map(l => l.slug));
  for (const s of mf) assert.ok(sampled.has(s), `MINOR_FIX absent du sample : ${s}`);
});

test('V45.3 : grands domaines représentés', () => {
  const positions = lessons.map(l => l.curriculumPosition);
  // buckets par tranche curriculaire (fondations, web/front, data/sweng, python/ml, ia, sre, systemes/reseau, docker/ci/k8s/cloud, carriere)
  const buckets = [ [1,15],[16,34],[35,55],[56,63],[64,78],[79,86],[87,96],[97,123],[124,128] ];
  for (const [lo,hi] of buckets) {
    assert.ok(positions.some(p => p>=lo && p<=hi), `aucune leçon dans la tranche ${lo}-${hi}`);
  }
});

test('V45.3 : previousGrade renseigné (comparaison post-blind)', () => {
  for (const l of lessons) assert.ok(['A','B','C','D','E'].includes(l.previousGradeV452), `${l.slug} previousGrade manquant`);
});

test('V45.3 : le summary est cohérent avec les lessons', () => {
  const a = lessons.filter(l => l.gradeV453 === 'A').length;
  const b = lessons.filter(l => l.gradeV453 === 'B').length;
  assert.equal(RT.summary.gradeDistribution.A, a);
  assert.equal(RT.summary.gradeDistribution.B, b);
  assert.equal(RT.summary.sampleSize, lessons.length);
});
