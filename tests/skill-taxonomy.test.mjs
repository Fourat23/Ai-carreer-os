// CP2 (V13) — taxonomie canonique des compétences : pure, additive,
// rétrocompatible. On prouve : normalisation, résolution des synonymes,
// déduplication, libellés, ET surtout que TOUTE compétence déjà présente dans le
// corpus se résout sans perte (jamais vide, jamais renommée à tort).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import {
  normalizeSkillId, canonicalSkill, canonicalizeSkills, skillLabel, isKnownSkill,
} from '../lib/skill-taxonomy.mjs';

test('normalisation : trim, minuscule, espaces/underscores → tiret', () => {
  assert.equal(normalizeSkillId('  Higher_Order Functions '), 'higher-order-functions');
  assert.equal(normalizeSkillId('JavaScript'), 'javascript');
  assert.equal(normalizeSkillId(''), '');
  assert.equal(normalizeSkillId(null), '');
});

test('résolution des synonymes → canonique', () => {
  assert.equal(canonicalSkill('js'), 'javascript');
  assert.equal(canonicalSkill('TS'), 'typescript');
  assert.equal(canonicalSkill('callbacks'), 'hof');
  assert.equal(canonicalSkill('exceptions'), 'errors');
  assert.equal(canonicalSkill('REST'), 'http');
  assert.equal(canonicalSkill('lifting-state-up'), 'lifting-state');
  assert.equal(canonicalSkill('a11y'), 'accessibility');
});

test('id déjà canonique → lui-même', () => {
  for (const id of ['javascript', 'react', 'hooks', 'arrays', 'stack', 'recursion']) {
    assert.equal(canonicalSkill(id), id);
  }
});

test('canonicalizeSkills : résolution + déduplication ordonnée', () => {
  assert.deepEqual(canonicalizeSkills(['JS', 'javascript', 'callbacks', 'hof']), ['javascript', 'hof']);
  assert.deepEqual(canonicalizeSkills([]), []);
  assert.deepEqual(canonicalizeSkills(null), []);
});

test('libellés lisibles', () => {
  assert.equal(skillLabel('hof'), "Fonctions d'ordre supérieur");
  assert.equal(skillLabel('js'), 'JavaScript');            // via canonical
  assert.equal(skillLabel('lifting-state'), "Remontée d'état");
  assert.equal(skillLabel('inconnu-xyz'), 'inconnu-xyz');  // repli sur l'id
});

test('rétrocompatibilité : toutes les compétences du corpus se résolvent proprement', () => {
  const exs = readdirSync('data/exercises').filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync('data/exercises/' + f, 'utf8')));
  const seen = new Set();
  for (const e of exs) for (const s of e.skills || []) seen.add(s);
  for (const s of seen) {
    const c = canonicalSkill(s);
    assert.ok(c && typeof c === 'string', `« ${s} » doit se résoudre en un id non vide`);
    // idempotence : résoudre deux fois ne change plus rien.
    assert.equal(canonicalSkill(c), c, `« ${s} » → « ${c} » doit être stable`);
  }
});

test('toutes les compétences du corpus sont des ids canoniques connus', () => {
  const exs = readdirSync('data/exercises').filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync('data/exercises/' + f, 'utf8')));
  const unknown = new Set();
  for (const e of exs) for (const s of e.skills || []) if (!isKnownSkill(s)) unknown.add(s);
  assert.deepEqual([...unknown], [], `compétences sans libellé canonique : ${[...unknown].join(', ')}`);
});
