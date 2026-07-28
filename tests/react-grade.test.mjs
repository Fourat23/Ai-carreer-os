// CP6 (V12) — assertions React (pures, sur HTML rendu) + intégration (grading réel).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { parseHTML, evalReactTest } from '../lib/frontend-dom.mjs';
import { runExercise } from '../lib/workspace-fs.mjs';
import { splitAttempt } from '../lib/lab-feedback.mjs';

// ── Assertions pures (sur un HTML « rendu ») ─────────────────────────────────
const html = '<main><h1>Bonjour Ada</h1><ul><li class="item">a</li><li class="item">b</li></ul><button aria-label="Envoyer">OK</button><nav></nav></main>';
const doc = parseHTML(html);
const R = (o) => evalReactTest({ id: 'x', name: 'x', ...o }, doc);

test('component-renders : vrai si sortie non vide', () => {
  assert.equal(R({ kind: 'component-renders' }).passed, true);
  assert.equal(evalReactTest({ id: 'y', name: 'y', kind: 'component-renders' }, parseHTML('')).passed, false);
});
test('element-count', () => {
  assert.equal(R({ kind: 'element-count', selector: '.item', expected: 2 }).passed, true);
  assert.equal(R({ kind: 'element-count', selector: '.item', expected: 3 }).passed, false);
});
test('accessible-role-exists (implicite + explicite)', () => {
  assert.equal(R({ kind: 'accessible-role-exists', role: 'button' }).passed, true);
  assert.equal(R({ kind: 'accessible-role-exists', role: 'navigation' }).passed, true);
  assert.equal(R({ kind: 'accessible-role-exists', role: 'heading' }).passed, true);
  assert.equal(R({ kind: 'accessible-role-exists', role: 'checkbox' }).passed, false);
});
test('accessible-name-equals (aria-label / texte)', () => {
  assert.equal(R({ kind: 'accessible-name-equals', selector: 'button', expected: 'Envoyer' }).passed, true);
  assert.equal(R({ kind: 'accessible-name-equals', selector: 'h1', expected: 'Bonjour Ada' }).passed, true);
});
test('list-content (ordre)', () => {
  assert.equal(R({ kind: 'list-content', selector: '.item', expected: ['a', 'b'] }).passed, true);
  assert.equal(R({ kind: 'list-content', selector: '.item', expected: ['b', 'a'] }).passed, false);
});
test('conditional-visible (booléen)', () => {
  assert.equal(R({ kind: 'conditional-visible', selector: 'ul', expected: true }).passed, true);
  assert.equal(R({ kind: 'conditional-visible', selector: '.alert', expected: false }).passed, true);
  assert.equal(R({ kind: 'conditional-visible', selector: '.alert', expected: true }).passed, false);
});
test('familles partagées déléguées (selector-exists / text-contains)', () => {
  assert.equal(R({ kind: 'selector-exists', selector: 'nav' }).passed, true);
  assert.equal(R({ kind: 'text-contains', selector: 'h1', expected: 'Ada' }).passed, true);
});

// ── Intégration : grading réel (compile TSX → render → assertions) ───────────
let ROOT;
before(() => { mkdirSync(join(process.cwd(), 'data', 'lab-workspaces'), { recursive: true }); ROOT = mkdtempSync(join(process.cwd(), 'data', 'lab-workspaces', 'reacttest-')); });
after(() => { rmSync(join(process.cwd(), 'data', 'lab-workspaces'), { recursive: true, force: true }); });

const ex = (over) => ({ id: 'react-t', title: 'r', runtime: 'react-tsx', language: 'tsx', workspace: { entry: 'App.tsx', files: [] }, tests: [], ...over });

test('react : rendu + props', async () => {
  const e = ex({ workspace: { entry: 'App.tsx', files: [
    { path: 'App.tsx', content: "export default function App({ name = 'x' }: { name?: string }) { return <h1>Bonjour, {name} !</h1>; }" },
  ] }, tests: [
    { id: 't1', name: 'h1', kind: 'selector-exists', selector: 'h1' },
    { id: 't2', name: 'props', kind: 'text-contains', selector: 'h1', expected: 'Bonjour, Ada !', props: { name: 'Ada' } },
    { id: 't3', name: 'renders', kind: 'component-renders' },
  ] });
  const { attempt, phase } = await runExercise(ROOT, e, {});
  assert.equal(phase, 'test');
  assert.equal(attempt.allPassed, true, JSON.stringify(attempt.results));
});

test('react : erreur de compilation → aucun spawn, diagnostics', async () => {
  const e = ex({ workspace: { entry: 'App.tsx', files: [
    { path: 'App.tsx', content: 'export default function App(){ const n: number = "oops"; return <b>{n}</b>; }' },
  ] }, tests: [{ id: 't1', name: 'x', kind: 'component-renders' }] });
  const { attempt, phase, diagnostics } = await runExercise(ROOT, e, {});
  assert.equal(phase, 'compile');
  assert.equal(attempt.allPassed, false);
  assert.ok(diagnostics.length >= 1);
  assert.equal(diagnostics[0].file, 'App.tsx');
});

test('react : erreur de rendu (throw) → tests échoués proprement', async () => {
  const e = ex({ workspace: { entry: 'App.tsx', files: [
    { path: 'App.tsx', content: 'export default function App(){ throw new Error("boom-render"); }' },
  ] }, tests: [{ id: 't1', name: 'renders', kind: 'component-renders' }] });
  const { attempt } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, false);
  assert.match(attempt.results[0].message, /boom-render/);
});

test('react : redaction des tests privés (agrégat)', async () => {
  const e = ex({ workspace: { entry: 'App.tsx', files: [
    { path: 'App.tsx', content: 'export default function App(){ return <h1>Secret rendu</h1>; }' },
  ] }, tests: [
    { id: 'pub', name: 'pub', kind: 'selector-exists', selector: 'h1' },
    { id: 'sec', name: 'SECRET privé', kind: 'text-contains', selector: 'h1', expected: 'Secret rendu', private: true },
  ] });
  const { attempt } = await runExercise(ROOT, e, {});
  const { publicResults, privateSummary } = splitAttempt(attempt, new Set(['sec']));
  assert.equal(publicResults.length, 1);
  assert.deepEqual(privateSummary, { total: 1, passed: 1 });
  const blob = JSON.stringify({ publicResults, privateSummary });
  assert.equal(blob.includes('SECRET privé'), false);
  assert.equal(blob.includes('Secret rendu'), false);
});
