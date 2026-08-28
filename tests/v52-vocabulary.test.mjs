// V52 — vocabulaire produit : pur, dérivé de la vérité du moteur, ton + explication.
//
// V65.1 · CP2 : réécrit sur le modèle canonique. `lib/skill-vocabulary.mjs` et
// `lib/skill-state.mjs` ont été supprimés — ils portaient un SECOND modèle à
// cinq états dont les libellés français chevauchaient ceux du modèle canonique
// en désignant autre chose. Le vocabulaire vit désormais dans `competency.mjs`,
// à côté de l'état qu'il nomme : un seul fichier peut mentir, deux se
// contredisent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  competencyStatusToken, allCompetencyStatusTokens,
  COMPETENCY_STATES, COMPETENCY_STATE_LABEL, COMPETENCY_DISPLAY_ORDER,
} from '../lib/competency.mjs';

test('chaque état a un label (vérité moteur) + ton + exigence d\'explication', () => {
  for (const s of COMPETENCY_STATES) {
    const t = competencyStatusToken(s);
    assert.equal(t.label, COMPETENCY_STATE_LABEL[s], `label dérivé de la vérité pour ${s}`);
    assert.ok(['neutral', 'accent', 'positive', 'attention', 'blocking'].includes(t.tone), `ton valide pour ${s}`);
    assert.equal(t.requiresExplanation, true, `explication requise pour ${s}`);
  }
});

test('état inconnu → non évaluée (pas de crash, jamais de couleur seule)', () => {
  const t = competencyStatusToken('bogus');
  assert.equal(t.state, 'unassessed');
  assert.ok(t.label && t.tone);
});

test('PUR : mêmes entrées → mêmes sorties', () => {
  assert.deepEqual(competencyStatusToken('demonstrated'), competencyStatusToken('demonstrated'));
  assert.equal(allCompetencyStatusTokens().length, COMPETENCY_STATES.length);
});

test('ordre d\'affichage : ce qui est acquis d\'abord, le non évalué en dernier', () => {
  assert.equal(COMPETENCY_DISPLAY_ORDER[COMPETENCY_DISPLAY_ORDER.length - 1], 'unassessed');
  assert.equal(COMPETENCY_DISPLAY_ORDER.length, COMPETENCY_STATES.length);
});

test('aucun libellé de l\'ancien modèle ne subsiste', () => {
  // « Non abordée » et « Découverte » disaient « aucune journée travaillée » ;
  // le modèle canonique dit « aucune preuve ». Confondre les deux est
  // exactement ce que le CP0 a mesuré : ds/se/sql/archi annoncées « Non
  // abordée » alors qu'elles étaient démontrées.
  const labels = Object.values(COMPETENCY_STATE_LABEL);
  for (const banned of ['Non abordée', 'Découverte', 'À consolider']) {
    assert.ok(!labels.includes(banned), `« ${banned} » appartient au modèle supprimé`);
  }
});
