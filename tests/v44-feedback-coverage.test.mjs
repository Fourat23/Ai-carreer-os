// CP6 (V44) — couverture du feedback diagnostique FACTORÉ (misconceptions étendues).
// FLOOR D : ≥ 40 exercices reliés à une misconception RÉELLE (leçons + exercices
// existants), langage prudent (« compatible avec »), jamais la solution complète.
// Vérifie la cohérence des données et le read-model diagnosticFeedback. Aucun I/O réseau.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { MISCONCEPTIONS, listMisconceptions, remediateMisconception } from '../lib/misconceptions.mjs';
import { diagnosticFeedback } from '../lib/practice-coverage.mjs';

const program = JSON.parse(readFileSync(new URL('../data/program.json', import.meta.url), 'utf8'));
const programSkills = new Set(program.skills.map((s) => s.id));
const knownLessons = new Set(program.lessons.map((l) => l.slug));
const knownEx = new Set(readdirSync(new URL('../data/exercises/', import.meta.url)).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')));

test('FLOOR D : ≥ 40 exercices distincts reliés à une misconception', () => {
  const covered = new Set();
  for (const m of MISCONCEPTIONS) for (const e of m.exerciseRefs) covered.add(e);
  assert.ok(covered.size >= 40, `attendu ≥40 exercices couverts, obtenu ${covered.size}`);
});

test('intégrité : chaque misconception a skill de programme + leçons/exercices réels', () => {
  for (const m of MISCONCEPTIONS) {
    assert.ok(programSkills.has(m.skill), `skill « ${m.skill} » de ${m.id} hors programme`);
    assert.ok(m.lessonRefs.length >= 1, `${m.id} : aucune leçon de remédiation`);
    for (const l of m.lessonRefs) assert.ok(knownLessons.has(l), `${m.id} : leçon morte « ${l} »`);
    for (const e of m.exerciseRefs) assert.ok(knownEx.has(e), `${m.id} : exercice mort « ${e} »`);
    assert.ok(typeof m.wrong === 'string' && m.wrong.length > 10);
    assert.ok(typeof m.right === 'string' && m.right.length > 20);
  }
});

test('ids uniques ; aucun exercice partagé entre deux misconceptions', () => {
  const ids = MISCONCEPTIONS.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length, 'ids de misconception dupliqués');
  const seen = new Map();
  for (const m of MISCONCEPTIONS) for (const e of m.exerciseRefs) {
    assert.ok(!seen.has(e), `exercice « ${e} » partagé par ${seen.get(e)} et ${m.id}`);
    seen.set(e, m.id);
  }
});

test('langage prudent : pas de « tu ne comprends pas », pas de solution complète', () => {
  for (const m of MISCONCEPTIONS) {
    const txt = `${m.wrong} ${m.right}`.toLowerCase();
    assert.ok(!/tu ne comprends pas|t'es nul|incapable|stupide/.test(txt), `${m.id} : ton dévalorisant`);
    // La correction explique le CONCEPT, elle ne fournit pas de code de solution.
    assert.ok(!/```|function |=>|return /.test(m.right), `${m.id} : la correction ne doit pas contenir de code`);
  }
});

test('read-model diagnosticFeedback : par exercice et par compétence', () => {
  const byEx = diagnosticFeedback({ exerciseId: 'agent-loop-detect' }, MISCONCEPTIONS);
  assert.equal(byEx.candidates.length, 1);
  assert.equal(byEx.candidates[0].id, 'agent-loop-self-stops');
  assert.ok(byEx.candidates[0].lessonRefs.length >= 1);

  const bySkill = diagnosticFeedback({ skill: 'secu' }, MISCONCEPTIONS);
  assert.ok(bySkill.candidates.length >= 2, 'plusieurs misconceptions secu');

  const none = diagnosticFeedback({ exerciseId: 'inexistant-xyz' }, MISCONCEPTIONS);
  assert.deepEqual(none.candidates, []);
});

test('listMisconceptions / remediateMisconception', () => {
  assert.equal(listMisconceptions('cloud').length, listMisconceptions('cloud').filter((m) => m.skill === 'cloud').length);
  const r = remediateMisconception('wildcard-is-convenient');
  assert.equal(r.skill, 'secu');
  assert.ok(r.exerciseRefs.includes('sec-least-privilege'));
  assert.equal(remediateMisconception('inexistant'), null);
});
