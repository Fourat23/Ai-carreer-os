// CP9 (V39) — le catalogue RÉEL d'évaluations (data/assessments/*.json) est
// valide, cohérent et honnête : structure valide, id == nom de fichier, ids uniques,
// compétences ∈ taxonomie skill du programme, lessonRefs/remediation résolus,
// auto-cohérence (les réponses déclarées corrigent à 100 %), couverture de taxonomie.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateAssessment, gradeAssessment, assessmentTaxonomySummary } from '../lib/assessment.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const knownSkills = new Set(program.skills.map((s) => s.id));
const knownLessons = new Set(program.lessons.map((l) => l.slug));
const DIR = R('data/assessments');
const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
const load = (f) => JSON.parse(readFileSync(join(DIR, f), 'utf8'));

test('catalogue non vide (≥ 12 évaluations)', () => {
  assert.ok(files.length >= 12, `seulement ${files.length} évaluations`);
});

test('chaque fichier est une évaluation valide', () => {
  for (const f of files) {
    const v = validateAssessment(load(f));
    assert.ok(v.ok, `${f} invalide : ${v.errors.join(' ; ')}`);
  }
});

test('id == nom de fichier et ids uniques', () => {
  const seen = new Set();
  for (const f of files) {
    const a = load(f);
    assert.equal(a.id, f.replace(/\.json$/, ''), `${f} : id interne ≠ nom de fichier`);
    assert.ok(!seen.has(a.id), `id dupliqué ${a.id}`);
    seen.add(a.id);
  }
});

test('compétences ∈ taxonomie skill du programme', () => {
  for (const f of files) {
    for (const s of load(f).skills) assert.ok(knownSkills.has(s), `${f} : skill inconnu « ${s} »`);
  }
});

test('lessonRefs et remediation pointent des leçons existantes', () => {
  for (const f of files) {
    const a = load(f);
    for (const key of ['lessonRefs', 'remediation']) {
      for (const l of a[key] ?? []) assert.ok(knownLessons.has(l), `${f} : ${key} « ${l} » introuvable`);
    }
  }
});

test('auto-cohérence : les réponses déclarées corrigent à 100 %', () => {
  for (const f of files) {
    const a = load(f);
    const resp = Object.fromEntries(a.questions.map((q) => [q.id, q.answer]));
    const r = gradeAssessment(a, resp);
    assert.equal(r.passed, r.total, `${f} : ${r.passed}/${r.total}`);
    assert.equal(r.passedOverall, true, `${f} : devrait passer avec ses propres réponses`);
  }
});

test('couverture de taxonomie : au moins un DIAGNOSIS et un TRANSFER', () => {
  const s = assessmentTaxonomySummary(files.map(load));
  assert.ok(s.DIAGNOSIS >= 1, 'aucune question DIAGNOSIS');
  assert.ok(s.TRANSFER >= 1, 'aucune question TRANSFER');
});
