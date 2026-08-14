// CP4 (V40) — modèle capstone PUR : validation structurelle (phases, artefacts,
// diagnosis obligatoire, bruit obligatoire, debrief), scoring par phases réutilisant
// gradeQuestion, pont evidence, remédiation. Aucun I/O, aucun réseau.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCapstone, gradeCapstonePhase, gradeCapstone, capstoneToEvidence,
  capstoneRemediation, capstoneDomainSummary, capstoneTaxonomySummary,
  PHASE_KINDS, ARTIFACT_KINDS,
} from '../lib/capstone.mjs';

const q = (id, tax, kind, extra) => ({ id, taxonomy: tax, kind, prompt: 'p', explanation: 'e', ...extra });
const valid = {
  id: 'demo', title: 'Démo', domain: 'Backend', difficulty: 3, estimatedMinutes: 20,
  skills: ['sql', 'se'], lessonRefs: ['sql-performance-indexing'], exerciseRefs: [], playbookRefs: [],
  context: 'Contexte suffisamment long pour être compréhensible.',
  signal: 'Ticket : lenteur depuis la release.',
  artifacts: [
    { id: 'a1', kind: 'metrics', title: 'p95', content: 'p95 en hausse', useful: true },
    { id: 'a2', kind: 'sql', title: 'requêtes', content: '1 → 51 requêtes/page', useful: true },
    { id: 'a3', kind: 'config', title: 'cache CDN', content: 'TTL inchangé', useful: false },
  ],
  phases: [
    { id: 'hyp', kind: 'hypotheses', title: 'Hypothèses', prompt: '?', questions: [q('h1', 'APPLICATION', 'multi', { options: ['a', 'b', 'c'], answer: [0, 1] })] },
    { id: 'dia', kind: 'diagnosis', title: 'Diagnostic', prompt: '?', questions: [q('d1', 'DIAGNOSIS', 'mcq', { options: ['N+1', 'CPU'], answer: 0 })] },
    { id: 'val', kind: 'validation', title: 'Validation', prompt: '?', questions: [q('v1', 'APPLICATION', 'predict', { answer: 'metrique' })] },
  ],
  debrief: { expectedReasoning: 'p95 + explosion SQL → N+1' },
};

test('allowlists exposées', () => {
  assert.ok(PHASE_KINDS.includes('diagnosis'));
  assert.ok(ARTIFACT_KINDS.includes('sql'));
});

test('validateCapstone accepte un capstone bien formé', () => {
  const v = validateCapstone(valid);
  assert.ok(v.ok, v.errors.join(' ; '));
});

test('validateCapstone : refuse < 3 phases', () => {
  const c = { ...valid, phases: valid.phases.slice(0, 2) };
  assert.equal(validateCapstone(c).ok, false);
});

test('validateCapstone : exige au moins une phase diagnosis', () => {
  const c = { ...valid, phases: valid.phases.map((p) => (p.kind === 'diagnosis' ? { ...p, kind: 'investigation' } : p)) };
  const v = validateCapstone(c);
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => /diagnosis/.test(e)));
});

test('validateCapstone : exige au moins un artefact bruit (useful:false)', () => {
  const c = { ...valid, artifacts: valid.artifacts.map((a) => ({ ...a, useful: true })) };
  const v = validateCapstone(c);
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => /bruit/.test(e)));
});

test('validateCapstone : exige debrief.expectedReasoning', () => {
  const c = { ...valid, debrief: {} };
  assert.equal(validateCapstone(c).ok, false);
});

test('validateCapstone : signal et contexte obligatoires', () => {
  assert.equal(validateCapstone({ ...valid, signal: '' }).ok, false);
  assert.equal(validateCapstone({ ...valid, context: '' }).ok, false);
});

test('gradeCapstonePhase corrige via gradeQuestion', () => {
  const r = gradeCapstonePhase(valid.phases[0], { h1: [1, 0] });
  assert.equal(r.total, 1);
  assert.equal(r.passed, 1);
  assert.equal(r.kind, 'hypotheses');
});

test('gradeCapstone agrège les phases et calcule passedOverall', () => {
  const r = gradeCapstone(valid, { h1: [0, 1], d1: 0, v1: 'metrique' });
  assert.equal(r.total, 3);
  assert.equal(r.passed, 3);
  assert.equal(r.passedOverall, true);
  assert.equal(r.byPhase.length, 3);
  assert.deepEqual(r.mobilizedSkills, ['sql', 'se']);
  assert.deepEqual(r.weakSkills, []);
});

test('gradeCapstone : échec → weakSkills = compétences mobilisées (indice)', () => {
  const r = gradeCapstone(valid, { h1: [2], d1: 1, v1: 'faux' });
  assert.equal(r.passedOverall, false);
  assert.deepEqual(r.weakSkills, ['sql', 'se']);
});

test('capstoneToEvidence : réussite → evidence capstone ; échec → null', () => {
  const pass = gradeCapstone(valid, { h1: [0, 1], d1: 0, v1: 'metrique' });
  const ev = capstoneToEvidence(valid, pass, new Date('2026-08-14T00:00:00Z'));
  assert.equal(ev.type, 'capstone');
  assert.equal(ev.url, '/capstones/demo');
  assert.deepEqual(ev.skills, ['sql', 'se']);
  const fail = gradeCapstone(valid, { h1: [2], d1: 1, v1: 'x' });
  assert.equal(capstoneToEvidence(valid, fail), null);
});

test('capstoneRemediation : réussite → vide ; échec → leçons/exos/playbooks', () => {
  const pass = gradeCapstone(valid, { h1: [0, 1], d1: 0, v1: 'metrique' });
  assert.deepEqual(capstoneRemediation(valid, pass).lessons, []);
  const fail = gradeCapstone(valid, { h1: [2], d1: 1, v1: 'x' });
  const rem = capstoneRemediation(valid, fail);
  assert.deepEqual(rem.weakSkills, ['sql', 'se']);
  assert.deepEqual(rem.lessons, ['sql-performance-indexing']);
});

test('résumés domaine et taxonomie', () => {
  assert.deepEqual(capstoneDomainSummary([valid]), { Backend: 1 });
  const t = capstoneTaxonomySummary(valid);
  assert.equal(t.DIAGNOSIS, 1);
  assert.equal(t.APPLICATION, 2);
});
