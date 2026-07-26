// CP6 — notation RÉELLE des exercices web (harnais dans l'exécuteur Node) contre
// un répertoire temporaire. Vérifie le pipeline complet + l'isolation des tests.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { runExercise } from '../lib/workspace-fs.mjs';
import { splitAttempt } from '../lib/lab-feedback.mjs';

let ROOT;
before(() => { ROOT = mkdtempSync(join(tmpdir(), 'lab-web-')); });
after(() => { rmSync(ROOT, { recursive: true, force: true }); });

const ex = (over) => ({
  id: 'web-t', title: 'web', runtime: 'web', language: 'html',
  workspace: { entry: 'index.html', files: [] }, tests: [], ...over,
});

test('web : assertions statiques (HTML/CSS) sur le document', async () => {
  const e = ex({ workspace: { entry: 'index.html', files: [
    { path: 'index.html', content: '<body><h1 class="t">Salut</h1><button class="buy">A</button></body>' },
  ] } , tests: [
    { id: 't1', name: 'h1', kind: 'selector-exists', selector: 'h1.t' },
    { id: 't2', name: 'texte', kind: 'text-contains', selector: 'h1', expected: 'Salut' },
    { id: 't3', name: 'un bouton', kind: 'selector-count', selector: '.buy', expected: 1 },
  ] });
  const { attempt, phase } = await runExercise(ROOT, e, {});
  assert.equal(phase, 'test');
  assert.equal(attempt.allPassed, true, JSON.stringify(attempt.results));
});

test('web : JS DOM — event-changes-text (clic incrémente)', async () => {
  const e = ex({ workspace: { entry: 'index.html', files: [
    { path: 'index.html', content: '<body><span id="c">0</span><button id="b">+</button></body>' },
    { path: 'app.js', content: "document.getElementById('b').addEventListener('click',()=>{const c=document.getElementById('c');c.textContent=String(Number(c.textContent)+1);});" },
  ] }, tests: [
    { id: 't1', name: '1 clic', kind: 'event-changes-text', selector: '#c', action: { type: 'click', selector: '#b' }, expected: '1' },
    { id: 't2', name: '3 clics', kind: 'event-changes-text', selector: '#c', action: { type: 'click', selector: '#b', times: 3 }, expected: '3' },
  ] });
  const { attempt } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, true, JSON.stringify(attempt.results));
});

test('web : isolation entre tests événementiels (DOM neuf par test)', async () => {
  // t1 = 1 clic → 1 ; t2 = 1 clic → 1 (et NON 2 si l'état fuyait entre tests)
  const e = ex({ workspace: { entry: 'index.html', files: [
    { path: 'index.html', content: '<body><span id="c">0</span><button id="b">+</button></body>' },
    { path: 'app.js', content: "document.getElementById('b').addEventListener('click',()=>{const c=document.getElementById('c');c.textContent=String(Number(c.textContent)+1);});" },
  ] }, tests: [
    { id: 't1', name: 'a', kind: 'event-changes-text', selector: '#c', action: { type: 'click', selector: '#b' }, expected: '1' },
    { id: 't2', name: 'b', kind: 'event-changes-text', selector: '#c', action: { type: 'click', selector: '#b' }, expected: '1' },
  ] });
  const { attempt } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, true, JSON.stringify(attempt.results));
});

test('web : input value + event input', async () => {
  const e = ex({ workspace: { entry: 'index.html', files: [
    { path: 'index.html', content: '<body><input id="i"><span id="o"></span></body>' },
    { path: 'app.js', content: "const i=document.getElementById('i');i.addEventListener('input',()=>{document.getElementById('o').textContent=i.value;});" },
  ] }, tests: [
    { id: 't1', name: 'saisie', kind: 'event-changes-text', selector: '#o', action: { type: 'input', selector: '#i', value: 'coucou' }, expected: 'coucou' },
  ] });
  const { attempt } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, true, JSON.stringify(attempt.results));
});

test('web : console-contains (capture console.log)', async () => {
  const e = ex({ workspace: { entry: 'index.html', files: [
    { path: 'index.html', content: '<body></body>' },
    { path: 'app.js', content: "console.log('bonjour console');" },
  ] }, tests: [{ id: 't1', name: 'log', kind: 'console-contains', expected: 'bonjour console' }] });
  const { attempt, stdout } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, true, JSON.stringify(attempt.results));
  assert.match(stdout, /bonjour console/);
});

test('web : erreur JS runtime → tests échoués proprement (pas de crash)', async () => {
  const e = ex({ workspace: { entry: 'index.html', files: [
    { path: 'index.html', content: '<body><span id="c">0</span></body>' },
    { path: 'app.js', content: "boom.doesNotExist();" },
  ] }, tests: [{ id: 't1', name: 'clic', kind: 'event-changes-text', selector: '#c', action: { type: 'click', selector: '#c' }, expected: '1' }] });
  const { attempt } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, false);
});

test('web : redaction des tests privés (agrégat uniquement)', async () => {
  const e = ex({ workspace: { entry: 'index.html', files: [
    { path: 'index.html', content: '<body><h1>Secret visible</h1></body>' },
  ] }, tests: [
    { id: 'pub', name: 'public', kind: 'selector-exists', selector: 'h1' },
    { id: 'sec', name: 'SECRET privé', kind: 'text-contains', selector: 'h1', expected: 'Secret visible', private: true },
  ] });
  const { attempt } = await runExercise(ROOT, e, {});
  const { publicResults, privateSummary } = splitAttempt(attempt, new Set(['sec']));
  assert.equal(publicResults.length, 1);
  assert.deepEqual(privateSummary, { total: 1, passed: 1 });
  const blob = JSON.stringify({ publicResults, privateSummary });
  assert.equal(blob.includes('SECRET privé'), false);
  assert.equal(blob.includes('Secret visible'), false);
});
