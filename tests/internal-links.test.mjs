// Tests de normalisation des liens internes du contenu → routes réelles de l'app.
// Zéro dépendance : node:test natif. Lance : npm test
// La logique testée est celle réellement utilisée par le rendu (lib/internal-links.mjs).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeInternalHref, rewriteHtmlLinks } from '../lib/internal-links.mjs';

test('semaine : chemin relatif ../week-35.md → /week/35', () => {
  assert.equal(normalizeInternalHref('../week-35.md'), '/week/35');
  assert.equal(normalizeInternalHref('week-35.md'), '/week/35');
  assert.equal(normalizeInternalHref('./week-35.md'), '/week/35');
});

test('semaine : zéros de tête retirés (week-05.md → /week/5)', () => {
  assert.equal(normalizeInternalHref('../week-05.md'), '/week/5');
});

test('mois : chemin relatif ../month-09.md → /month/9', () => {
  assert.equal(normalizeInternalHref('../month-09.md'), '/month/9');
  assert.equal(normalizeInternalHref('month-9.md'), '/month/9');
  assert.equal(normalizeInternalHref('./month-12.md'), '/month/12');
});

test('jour : day-241.md et ../days/day-241.md → /day/241', () => {
  assert.equal(normalizeInternalHref('../days/day-241.md'), '/day/241');
  assert.equal(normalizeInternalHref('days/day-241.md'), '/day/241');
  assert.equal(normalizeInternalHref('day-1.md'), '/day/1');
});

test('correction : ../solutions/day-241-solution.md → /day/241 (correction sur la page du jour)', () => {
  assert.equal(normalizeInternalHref('../solutions/day-241-solution.md'), '/day/241');
  assert.equal(normalizeInternalHref('solutions/day-007-solution.md'), '/day/7');
});

test('projet : project-01.md → /projects?p=01 ; project-final.md → /projects?p=final', () => {
  assert.equal(normalizeInternalHref('projects/project-01.md'), '/projects?p=01');
  assert.equal(normalizeInternalHref('../projects/project-final.md'), '/projects?p=final');
});

test('lien externe : inchangé', () => {
  assert.equal(normalizeInternalHref('https://example.com/week-35.md'), 'https://example.com/week-35.md');
  assert.equal(normalizeInternalHref('http://x.test/a'), 'http://x.test/a');
  assert.equal(normalizeInternalHref('mailto:me@example.com'), 'mailto:me@example.com');
});

test('ancre locale : inchangée', () => {
  assert.equal(normalizeInternalHref('#objectif'), '#objectif');
});

test('route déjà absolue : inchangée', () => {
  assert.equal(normalizeInternalHref('/week/35'), '/week/35');
  assert.equal(normalizeInternalHref('/day/241'), '/day/241');
});

test('chemin Markdown non reconnu : inchangé (pas de mauvaise redirection)', () => {
  assert.equal(normalizeInternalHref('../year-overview.md'), '../year-overview.md');
  assert.equal(normalizeInternalHref('year-overview.md'), 'year-overview.md');
  assert.equal(normalizeInternalHref('../../'), '../../');
  assert.equal(normalizeInternalHref('some/other-doc.md'), 'some/other-doc.md');
});

test('suffixe : ancre conservée sur une route réécrite', () => {
  assert.equal(normalizeInternalHref('../week-35.md#bilan'), '/week/35#bilan');
  assert.equal(normalizeInternalHref('../days/day-3.md#objectif'), '/day/3#objectif');
});

test('cas limites : vide / non-string → inchangé', () => {
  assert.equal(normalizeInternalHref(''), '');
  assert.equal(normalizeInternalHref(null), null);
  assert.equal(normalizeInternalHref(undefined), undefined);
});

test('rewriteHtmlLinks : réécrit les href des <a> réels', () => {
  const html = '<p>Voir <a href="../week-35.md">Semaine 35</a> et <a href="../month-09.md">Mois 9</a>.</p>';
  const out = rewriteHtmlLinks(html);
  assert.match(out, /href="\/week\/35"/);
  assert.match(out, /href="\/month\/9"/);
});

test('rewriteHtmlLinks : ne touche pas le texte des blocs de code (pas de href)', () => {
  const html = '<pre><code>ouvre week-35.md à la main</code></pre> <a href="../week-35.md">lien</a>';
  const out = rewriteHtmlLinks(html);
  // le texte du code reste littéral
  assert.match(out, /week-35\.md à la main/);
  // seul le vrai lien est réécrit
  assert.match(out, /href="\/week\/35"/);
});

test('rewriteHtmlLinks : lien externe dans un <a> reste inchangé', () => {
  const html = '<a href="https://anthropic.com">ext</a>';
  assert.equal(rewriteHtmlLinks(html), '<a href="https://anthropic.com">ext</a>');
});
