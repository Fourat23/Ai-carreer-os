// CP6 — modèle DOM minimal + assertions web (pur, déterministe).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML, evalWebTest, querySelectorAll } from '../lib/frontend-dom.mjs';

const doc = parseHTML(`<!doctype html><html lang="fr"><head><title>T</title><style>.x{color:red}</style></head>
<body>
  <nav><ul><li class="item">A</li><li class="item">B</li></ul></nav>
  <article class="card" data-id="7">
    <img src="d" alt="Alt text">
    <h2>Bonjour</h2>
    <input id="name" value="Ada">
    <button class="buy" type="button" style="color: green; padding: 4px">Acheter</button>
  </article>
  <script>var secret=1;</script>
</body></html>`);
const T = (o) => evalWebTest({ id: 'x', name: 'x', ...o }, doc);

test('parseHTML : structure de base (body, head)', () => {
  assert.equal(doc.body.tagName, 'BODY');
  assert.equal(doc.querySelectorAll('li').length, 2);
});

test('selector-exists / selector-count', () => {
  assert.equal(T({ kind: 'selector-exists', selector: 'article.card' }).passed, true);
  assert.equal(T({ kind: 'selector-exists', selector: '.missing' }).passed, false);
  assert.equal(T({ kind: 'selector-count', selector: '.item', expected: 2 }).passed, true);
  assert.equal(T({ kind: 'selector-count', selector: '.item', expected: 3 }).passed, false);
});

test('sélecteur descendant + compound', () => {
  assert.equal(querySelectorAll(doc, 'nav ul li.item').length, 2);
  assert.equal(querySelectorAll(doc, 'article .buy').length, 1);
});

test('attribut avec/sans valeur, data-*', () => {
  assert.equal(T({ kind: 'attribute-equals', selector: 'img', attribute: 'alt', expected: 'Alt text' }).passed, true);
  assert.equal(T({ kind: 'attribute-equals', selector: '.card', attribute: 'data-id', expected: '7' }).passed, true);
  assert.equal(querySelectorAll(doc, '[data-id]').length, 1);
  assert.equal(querySelectorAll(doc, '[data-id="7"]').length, 1);
});

test('text-contains (scopé et global) exclut script/style', () => {
  assert.equal(T({ kind: 'text-contains', selector: 'h2', expected: 'Bonjour' }).passed, true);
  assert.equal(T({ kind: 'text-contains', expected: 'Bonjour' }).passed, true);
  assert.equal(doc.body.textContent.includes('secret'), false);   // <script> exclu
  assert.equal(doc.body.textContent.includes('color:red'), false); // <style> exclu
});

test('class-present / input-value', () => {
  assert.equal(T({ kind: 'class-present', selector: 'button', expected: 'buy' }).passed, true);
  assert.equal(T({ kind: 'class-present', selector: 'button', expected: 'sell' }).passed, false);
  assert.equal(T({ kind: 'input-value', selector: '#name', expected: 'Ada' }).passed, true);
});

test('computed-style-equals : style inline (sous-ensemble documenté)', () => {
  assert.equal(T({ kind: 'computed-style-equals', selector: 'button', property: 'color', expected: 'green' }).passed, true);
  assert.equal(T({ kind: 'computed-style-equals', selector: 'button', property: 'color', expected: 'red' }).passed, false);
});

test('classList add/remove/contains (modèle vivant)', () => {
  const d = parseHTML('<body><div id="a" class="one"></div></body>');
  const el = d.getElementById('a');
  assert.equal(el.classList.contains('one'), true);
  el.classList.add('two'); assert.equal(el.classList.contains('two'), true);
  el.classList.remove('one'); assert.equal(el.classList.contains('one'), false);
});

test('événement : addEventListener + dispatchEvent + textContent setter', () => {
  const d = parseHTML('<body><button id="b">go</button><span id="s">0</span></body>');
  const b = d.getElementById('b'); const s = d.getElementById('s');
  b.addEventListener('click', () => { s.textContent = String(Number(s.textContent) + 1); });
  b.dispatchEvent({ type: 'click' });
  b.dispatchEvent({ type: 'click' });
  assert.equal(s.textContent, '2');
  assert.equal(evalWebTest({ id: 'e', name: 'e', kind: 'event-changes-text', selector: '#s', expected: '2' }, d).passed, true);
});

test('événement : bubbling vers les ancêtres', () => {
  const d = parseHTML('<body><div id="wrap"><button id="b">x</button></div></body>');
  let seen = false;
  d.getElementById('wrap').addEventListener('click', () => { seen = true; });
  d.getElementById('b').dispatchEvent({ type: 'click' });
  assert.equal(seen, true);
});

test('parser tolérant : HTML sans body, attributs non quotés, self-closing', () => {
  const d = parseHTML('<div class=box><img src=x><p>hi</p></div>');
  assert.equal(d.querySelectorAll('.box').length, 1);
  assert.equal(d.querySelectorAll('img').length, 1);
  assert.equal(d.querySelector('p').textContent, 'hi');
});

test('console-contains évalué depuis le buffer fourni', () => {
  assert.equal(evalWebTest({ id: 'c', name: 'c', kind: 'console-contains', expected: 'salut' }, doc, 'log: salut monde').passed, true);
  assert.equal(evalWebTest({ id: 'c', name: 'c', kind: 'console-contains', expected: 'absent' }, doc, 'rien').passed, false);
});
