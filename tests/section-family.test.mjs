// Tests de la sémantique pédagogique (lib/section-family.mjs) — pur, sans DOM.
// Vérifie la classification des vrais intitulés du programme, la robustesse aux
// variantes (emoji, accents, casse) et l'annotation HTML (ids, familles, eyebrow).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FAMILIES, classifyHeading, normalizeHeading, cleanHeadingText,
  familyMeta, annotateDayHtml,
} from '../lib/section-family.mjs';

test('8 familles définies avec label/icône/couleur', () => {
  const keys = Object.keys(FAMILIES);
  assert.equal(keys.length, 8);
  for (const k of keys) {
    assert.ok(FAMILIES[k].label && FAMILIES[k].icon && FAMILIES[k].color.startsWith('--fam-'));
  }
});

test('classifyHeading : intitulés réels du programme', () => {
  assert.equal(classifyHeading('🎯 Objectif du jour'), 'objective');
  assert.equal(classifyHeading('📖 Cours approfondi'), 'learn');
  assert.equal(classifyHeading('Modèle mental'), 'learn');
  assert.equal(classifyHeading('🧭 Exemple guidé'), 'observe');
  assert.equal(classifyHeading('✍️ Pratique autonome'), 'practice');
  assert.equal(classifyHeading('Mini-quiz'), 'practice');
  assert.equal(classifyHeading('🧩 Cas métier'), 'apply');
  assert.equal(classifyHeading('Livrable attendu'), 'apply');
  assert.equal(classifyHeading("💼 Question d'entretien"), 'prepare');
  assert.equal(classifyHeading('Critères de validation'), 'verify');
  assert.equal(classifyHeading('Correction'), 'verify');
  assert.equal(classifyHeading('Erreurs fréquentes'), 'verify');
  assert.equal(classifyHeading('📌 À retenir'), 'retain');
  assert.equal(classifyHeading('Questions de réflexion (à faire seul)'), 'retain');
});

test('classifyHeading : robuste à la casse, aux accents et aux emoji', () => {
  assert.equal(classifyHeading('COURS APPROFONDI'), 'learn');
  assert.equal(classifyHeading('exercice guidé'), 'practice');
  assert.equal(classifyHeading('   🎯   Objectif   '), 'objective');
});

test('classifyHeading : intitulés hors familles → null (section neutre)', () => {
  assert.equal(classifyHeading('Ressources'), null);
  assert.equal(classifyHeading('Pourquoi ça comptera plus tard'), null);
  assert.equal(classifyHeading("Consigne d'utilisation de l'IA"), null);
  assert.equal(classifyHeading(''), null);
});

test('normalizeHeading / cleanHeadingText', () => {
  assert.equal(normalizeHeading('<em>🎯 Objectif</em>'), 'objectif');
  assert.equal(cleanHeadingText('🎯 Objectif du jour'), 'Objectif du jour');
  assert.equal(cleanHeadingText('Cours approfondi'), 'Cours approfondi');
});

test('familyMeta : clé valide / invalide', () => {
  assert.equal(familyMeta('learn').label, 'Apprendre');
  assert.equal(familyMeta(null), null);
  assert.equal(familyMeta('nope'), null);
});

test('annotateDayHtml : ajoute id, data-family, numéro et eyebrow', () => {
  const html = '<h2>🎯 Objectif du jour</h2><p>x</p><h2>📖 Cours approfondi</h2><p>y</p>';
  const out = annotateDayHtml(html);
  assert.match(out, /<h2 id="objectif-du-jour" class="fam-h2" data-family="objective" data-sec="1">/);
  assert.match(out, /<span class="h2-eyebrow">01 · Cadrer<\/span>/);
  assert.match(out, /<h2 id="cours-approfondi" class="fam-h2" data-family="learn" data-sec="2">/);
  assert.match(out, /<span class="h2-eyebrow">02 · Apprendre<\/span>/);
  assert.match(out, /<span class="h2-text">Objectif du jour<\/span>/);
  assert.ok(!out.includes('🎯'), "l'emoji de tête est retiré de l'affichage");
});

test('annotateDayHtml : section neutre garde un numéro sans famille', () => {
  const out = annotateDayHtml('<h2>Ressources</h2>');
  assert.match(out, /<h2 id="ressources" class="fam-h2" data-sec="1">/);
  assert.match(out, /<span class="h2-eyebrow neutral">01<\/span>/);
  assert.ok(!out.includes('data-family'));
});

test('annotateDayHtml : ids uniques même titres répétés, non-chaîne pass-through', () => {
  const out = annotateDayHtml('<h2>Cours</h2><h2>Cours</h2>');
  const ids = [...out.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, 2);
  assert.equal(annotateDayHtml(null), null);
});
