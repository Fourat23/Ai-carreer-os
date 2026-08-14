// CP3 (V42) — modèle + catalogue de défis de transfert : validation (réutilise
// validateQuestion), T5 ⇒ bridge + crossDomain, discrimination requise, catalogue
// réel valide, refs résolues, auto-cohérence, ≥ 1 T5. PUR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateTransferChallenge, gradeTransferChallenge, CHALLENGE_LEVELS } from '../lib/transfer-challenge.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const knownSkills = new Set(program.skills.map((s) => s.id));
const knownLessons = new Set(program.lessons.map((l) => l.slug));
const DIR = R('data/transfer-challenges');
const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
const load = (f) => JSON.parse(readFileSync(join(DIR, f), 'utf8'));

test('niveaux de défi = T4/T5', () => {
  assert.deepEqual([...CHALLENGE_LEVELS], ['T4', 'T5']);
});

test('validateTransferChallenge : T5 exige bridge + crossDomain', () => {
  const base = {
    id: 'x', title: 'X', sourceSkill: 'http', targetContext: 'ctx',
    transferLevel: 'T5', skills: ['http'],
    questions: [{ id: 'q', taxonomy: 'TRANSFER', kind: 'multi', prompt: 'p', explanation: 'e', options: ['a', 'b', 'c', 'd'], answer: [0, 1] }],
  };
  assert.equal(validateTransferChallenge(base).ok, false, 'T5 sans bridge/crossDomain rejeté');
  assert.equal(validateTransferChallenge({ ...base, bridge: 'un pont conceptuel détaillé', crossDomain: true }).ok, true);
});

test('validateTransferChallenge : exige une question discriminante', () => {
  const c = {
    id: 'x', title: 'X', sourceSkill: 'http', targetContext: 'ctx', transferLevel: 'T4', skills: ['http'],
    questions: [{ id: 'q', taxonomy: 'TRANSFER', kind: 'mcq', prompt: 'p', explanation: 'e', options: ['a', 'b'], answer: 0 }],
  };
  const v = validateTransferChallenge(c);
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => /discriminante/.test(e)));
});

test('catalogue réel : chaque défi valide, refs résolues, auto-cohérent', () => {
  assert.ok(files.length >= 3, `catalogue trop petit (${files.length})`);
  const seen = new Set();
  for (const f of files) {
    const c = load(f);
    const v = validateTransferChallenge(c);
    assert.ok(v.ok, `${f} invalide : ${v.errors.join(' ; ')}`);
    assert.equal(c.id, f.replace(/\.json$/, ''), `${f} id ≠ fichier`);
    assert.ok(!seen.has(c.id), `id dupliqué ${c.id}`); seen.add(c.id);
    for (const s of c.skills) assert.ok(knownSkills.has(s), `${f} skill inconnu ${s}`);
    for (const l of c.lessonRefs ?? []) assert.ok(knownLessons.has(l), `${f} lessonRef inconnu ${l}`);
    const resp = Object.fromEntries(c.questions.map((q) => [q.id, q.answer]));
    const r = gradeTransferChallenge(c, resp);
    assert.equal(r.passed, r.total, `${f} auto-cohérence ${r.passed}/${r.total}`);
    assert.equal(r.passedOverall, true);
  }
});

test('catalogue réel : au moins un défi T5', () => {
  assert.ok(files.map(load).some((c) => c.transferLevel === 'T5'), 'aucun défi T5');
});
