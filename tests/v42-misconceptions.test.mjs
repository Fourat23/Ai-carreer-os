// CP5 (V42) — registre de misconceptions : refs (skills/leçons/exos) résolues contre
// le corpus RÉEL, résolveur de remédiation, ids uniques. PUR, lecture seule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { MISCONCEPTIONS, listMisconceptions, remediateMisconception } from '../lib/misconceptions.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const knownSkills = new Set(program.skills.map((s) => s.id));
const knownLessons = new Set(program.lessons.map((l) => l.slug));
const knownEx = new Set(readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')));

test('registre non vide, ids uniques', () => {
  assert.ok(MISCONCEPTIONS.length >= 5);
  const ids = new Set();
  for (const m of MISCONCEPTIONS) { assert.ok(!ids.has(m.id), `dup ${m.id}`); ids.add(m.id); }
});

test('chaque misconception : skill ∈ programme, wrong/right non vides, refs résolues', () => {
  for (const m of MISCONCEPTIONS) {
    assert.ok(knownSkills.has(m.skill), `skill inconnu ${m.skill} (${m.id})`);
    assert.ok(m.wrong && m.right && m.wrong !== m.right, `${m.id} : wrong/right requis et distincts`);
    for (const l of m.lessonRefs) assert.ok(knownLessons.has(l), `${m.id} : leçon inconnue ${l}`);
    for (const e of m.exerciseRefs) assert.ok(knownEx.has(e), `${m.id} : exercice inconnu ${e}`);
    assert.ok(m.lessonRefs.length > 0, `${m.id} : au moins une leçon de remédiation`);
  }
});

test('listMisconceptions filtre par compétence', () => {
  const archi = listMisconceptions('archi');
  assert.ok(archi.every((m) => m.skill === 'archi'));
  assert.equal(listMisconceptions().length, MISCONCEPTIONS.length);
});

test('remediateMisconception : remédiation ciblée ou null', () => {
  const r = remediateMisconception('retry-equals-idempotence');
  assert.ok(r && r.lessonRefs.length > 0);
  assert.ok(r.right.length > 0);
  assert.equal(remediateMisconception('inconnu'), null);
});
