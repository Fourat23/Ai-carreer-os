// V52 — vocabulaire produit : pur, dérivé de la vérité du moteur, ton + explication.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { skillStatusToken, allSkillStatusTokens, statusRank } from '../lib/skill-vocabulary.mjs';
import { SKILL_STATES, SKILL_STATE_LABEL } from '../lib/skill-state.mjs';

test('chaque état a un label (vérité moteur) + ton + exigence d\'explication', () => {
  for (const s of SKILL_STATES) {
    const t = skillStatusToken(s);
    assert.equal(t.label, SKILL_STATE_LABEL[s], `label dérivé de la vérité pour ${s}`);
    assert.ok(['neutral', 'info', 'positive', 'attention', 'blocking'].includes(t.tone), `ton valide pour ${s}`);
    assert.equal(t.requiresExplanation, true, `explication requise pour ${s}`);
  }
});

test('état inconnu → not-started (pas de crash, jamais de couleur seule)', () => {
  const t = skillStatusToken('bogus');
  assert.equal(t.state, 'not-started');
  assert.ok(t.label && t.tone);
});

test('PUR : mêmes entrées → mêmes sorties', () => {
  assert.deepEqual(skillStatusToken('demonstrated'), skillStatusToken('demonstrated'));
  assert.equal(allSkillStatusTokens().length, SKILL_STATES.length);
});

test('ordre d\'affichage : ce qui appelle une action d\'abord', () => {
  assert.ok(statusRank('to-consolidate') < statusRank('demonstrated'));
});
