// Tests des helpers PURS de la Vue Jour (lib/day-view.mjs).
// Aucun DOM, aucun fs : on valide slugify, difficultyLabel et stripDayLeadHtml,
// utilisés à l'affichage de /day/[id] (ancres du sommaire, en-tête, nettoyage
// de l'en-tête redondant). Le contenu pédagogique n'est jamais modifié : ces
// helpers ne transforment que le HTML d'AFFICHAGE.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { difficultyLabel, slugify, stripDayLeadHtml } from '../lib/day-view.mjs';

test('difficultyLabel : 1-5 → libellés attendus', () => {
  assert.equal(difficultyLabel(1), 'Débutant');
  assert.equal(difficultyLabel(2), 'Facile');
  assert.equal(difficultyLabel(3), 'Intermédiaire');
  assert.equal(difficultyLabel(4), 'Avancé');
  assert.equal(difficultyLabel(5), 'Difficile');
});

test('difficultyLabel : index 0 = placeholder vide (convention 1-based du générateur)', () => {
  assert.equal(difficultyLabel(0), '');
});

test('difficultyLabel : au-delà de 5 → le nombre en texte', () => {
  assert.equal(difficultyLabel(6), '6');
  assert.equal(difficultyLabel(42), '42');
});

test('slugify : minuscules, accents retirés, espaces → tirets', () => {
  assert.equal(slugify('Objectif du jour'), 'objectif-du-jour');
  assert.equal(slugify('Critères de validation'), 'criteres-de-validation');
  assert.equal(slugify('Pourquoi ça comptera plus tard'), 'pourquoi-ca-comptera-plus-tard');
});

test('slugify : ponctuation et emojis retirés', () => {
  assert.equal(slugify('Cas métier : RAG'), 'cas-metier-rag');
  assert.equal(slugify('🎯 Objectif du jour'), 'objectif-du-jour');
  assert.equal(slugify("Question d'entretien"), 'question-dentretien');
});

test('slugify : tirets de bord et multiples normalisés', () => {
  assert.equal(slugify('  --A retenir--  '), 'a-retenir');
  assert.equal(slugify('A   B'), 'a-b');
});

test('slugify : entrée vide ou non textuelle → "section"', () => {
  assert.equal(slugify(''), 'section');
  assert.equal(slugify('🎯🎯'), 'section');
  assert.equal(slugify('   '), 'section');
});

test('stripDayLeadHtml : retire h1, blockquote de méta et rangée de liens', () => {
  const html = [
    '<h1>Jour 241 — Chunking : comparaison objective</h1>',
    '<blockquote><p>Mois 9 · Semaine 35 · Compétence : RAG · Difficulté : Intermédiaire/5 · Durée : 4.5 h</p></blockquote>',
    '<p>← Dashboard · Semaine 35 · Mois 9 · Correction</p>',
    '<h2>🎯 Objectif du jour</h2>',
    '<p>Mesurer les stratégies.</p>',
  ].join('\n');
  const out = stripDayLeadHtml(html);
  assert.ok(!out.includes('<h1>'), 'le h1 de tête doit être retiré');
  assert.ok(!out.includes('Compétence :'), 'le blockquote de métadonnées doit être retiré');
  assert.ok(!out.includes('← Dashboard'), 'la rangée de liens doit être retirée');
  assert.ok(out.includes('<h2>🎯 Objectif du jour</h2>'), 'le premier H2 de contenu est conservé');
  assert.ok(out.includes('Mesurer les stratégies.'), 'le corps est conservé');
});

test('stripDayLeadHtml : ne touche pas les h1/blockquote NON initiaux', () => {
  const html = '<h2>Section</h2>\n<h1>Titre interne</h1>\n<blockquote><p>Note</p></blockquote>';
  const out = stripDayLeadHtml(html);
  assert.ok(out.includes('<h1>Titre interne</h1>'), 'un h1 non initial est préservé');
  assert.ok(out.includes('<blockquote>'), 'un blockquote non initial est préservé');
});

test('stripDayLeadHtml : entrée non-chaîne renvoyée telle quelle', () => {
  assert.equal(stripDayLeadHtml(null), null);
  assert.equal(stripDayLeadHtml(undefined), undefined);
});
