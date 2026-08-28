// Auto-liaison du glossaire (V66 · CP13).
//
// Ce que ces tests protègent : un cours ne doit pas devenir un champ de mines
// bleu, et le code d'un exemple ne doit jamais être transformé en lien.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLinkIndex, autolinkGlossary } from '../lib/glossary-autolink.mjs';

const IDX = buildLinkIndex([
  { id: 'ai-recall-at-k', term: 'rappel@k', aliases: ['recall@k'] },
  { id: 'ai-golden-set', term: 'golden set' },
  { id: 'ai-vector-db', term: 'base vectorielle' },
  { id: 'x-base', term: 'base' },
  { id: 'trop-court', term: 'CI' },
]);

test('lie la première occurrence, et elle seule', () => {
  const out = autolinkGlossary('<p>Le golden set. Encore le golden set.</p>', IDX);
  assert.equal((out.match(/gloss-link/g) ?? []).length, 1);
});

test('ne touche jamais au code', () => {
  const out = autolinkGlossary('<p><code>golden set</code> puis golden set</p>', IDX);
  assert.ok(out.includes('<code>golden set</code>'), 'le code est intact');
  assert.equal((out.match(/gloss-link/g) ?? []).length, 1, 'seule la prose est liée');
});

test('ne touche jamais aux titres ni à un lien existant', () => {
  assert.equal(autolinkGlossary('<h2>golden set</h2>', IDX).match(/gloss-link/), null);
  const deja = '<p><a href="/x">golden set</a></p>';
  assert.equal(autolinkGlossary(deja, IDX), deja);
});

test('le terme le plus long gagne', () => {
  // Sans le tri par longueur, « base » mangerait « base vectorielle ».
  const out = autolinkGlossary('<p>une base vectorielle</p>', IDX);
  assert.ok(out.includes('ai-vector-db'), out);
  assert.ok(!out.includes('x-base'), 'le terme court ne doit pas fragmenter le long');
});

test('les termes de moins de 4 caractères ne sont pas liés', () => {
  // « CI » lié à chaque page n'apprend rien ; c'est le terme opaque qu'on cherche.
  assert.equal(autolinkGlossary('<p>La CI tourne</p>', IDX).match(/gloss-link/), null);
});

test('les bornes ne cassent pas sur les accents ni sur les arobases', () => {
  // La leçon du faux positif FP-1 du CP0 : `\b` découpe ÉTAT en TAT.
  assert.equal(autolinkGlossary('<p>rappel@k5</p>', IDX).match(/gloss-link/), null,
    'un terme collé à autre chose n’est pas le terme');
  assert.ok(autolinkGlossary('<p>le rappel@k, mesuré</p>', IDX).includes('gloss-link'));
});

test('la pose est bornée : une page ne devient pas un champ de liens', () => {
  const long = '<p>' + Array.from({ length: 50 }, (_, i) => `golden set ${i} rappel@k base vectorielle`).join(' ') + '</p>';
  const out = autolinkGlossary(long, IDX, { max: 2 });
  assert.equal((out.match(/gloss-link/g) ?? []).length, 2);
});

test('un HTML sans terme connu ressort strictement identique', () => {
  const html = '<p>Rien à lier ici.</p>';
  assert.equal(autolinkGlossary(html, IDX), html);
});
