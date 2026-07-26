// CP5 — bornage pur des logs de console de la preview web.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boundLogEntry, appendPreviewLog, MAX_LOGS, MAX_TEXT } from '../lib/console-format.mjs';

test('boundLogEntry : normalise type/level/défauts', () => {
  const e = boundLogEntry({ type: 'console', level: 'warn', text: 'hi', line: 3 });
  assert.equal(e.type, 'console');
  assert.equal(e.level, 'warn');
  assert.equal(e.text, 'hi');
  assert.equal(e.line, 3);
  assert.equal(typeof e.at, 'number');
});

test('boundLogEntry : niveau inconnu → log ; erreur → level error', () => {
  assert.equal(boundLogEntry({ type: 'console', level: 'zzz', text: 'x' }).level, 'log');
  assert.equal(boundLogEntry({ type: 'error', text: 'boom' }).level, 'error');
  assert.equal(boundLogEntry({ type: 'error', text: 'boom' }).type, 'error');
});

test('boundLogEntry : texte borné à MAX_TEXT', () => {
  const big = 'a'.repeat(MAX_TEXT + 500);
  const e = boundLogEntry({ type: 'console', text: big });
  assert.equal(e.text.length, MAX_TEXT + 1); // + le caractère « … »
  assert.ok(e.text.endsWith('…'));
});

test('boundLogEntry : HTML conservé TEL QUEL (rendu en texte, jamais interprété)', () => {
  const e = boundLogEntry({ type: 'console', text: '<img src=x onerror=alert(1)>' });
  assert.equal(e.text, '<img src=x onerror=alert(1)>'); // pas d'échappement destructif, pas d'exécution
});

test('boundLogEntry : entrée non-objet → valeurs par défaut sûres', () => {
  const e = boundLogEntry(null);
  assert.equal(e.type, 'console');
  assert.equal(e.text, '');
  assert.equal(e.line, null);
});

test('appendPreviewLog : plafonne à MAX_LOGS entrées', () => {
  let list = [];
  for (let i = 0; i < MAX_LOGS + 50; i++) list = appendPreviewLog(list, { type: 'console', text: 'm' + i });
  assert.equal(list.length, MAX_LOGS);
  // conserve les plus récents
  assert.equal(list[list.length - 1].text, 'm' + (MAX_LOGS + 49));
  assert.equal(list[0].text, 'm50');
});

test('appendPreviewLog : liste initiale non-tableau tolérée', () => {
  const list = appendPreviewLog(undefined, { type: 'console', text: 'x' });
  assert.equal(list.length, 1);
});
