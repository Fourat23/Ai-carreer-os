// Tests d'exécution RÉELLE du runtime TypeScript (compilation → Node) contre un
// répertoire temporaire. Vérifie le pipeline complet : compile `.ts` → JS →
// exécuteur Node existant → protocole partagé → notation. Sautés proprement si
// le package `typescript` est indisponible.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { runExercise } from '../lib/workspace-fs.mjs';
import { detectRuntime } from '../lib/runtime-detect.mjs';

const TS = detectRuntime('typescript').available;
const opts = TS ? {} : { skip: 'TypeScript indisponible sur cette machine' };

let ROOT;
before(() => { ROOT = mkdtempSync(join(tmpdir(), 'lab-ts-')); });
after(() => { rmSync(ROOT, { recursive: true, force: true }); });

const ex = (id, files, tests, entry = 'solution.ts', extra = {}) => ({
  id, title: id, runtime: 'typescript', workspace: { entry, files }, tests, ...extra,
});

test('typescript : succès simple (call-equals) après compilation', opts, async () => {
  const e = ex('ts-ok', [{ path: 'solution.ts', content: 'export function add(a: number, b: number): number { return a + b; }' }],
    [{ id: 't', name: 'add', kind: 'call-equals', export: 'add', args: [2, 3], expected: 5 }]);
  const { attempt, phase } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, true, JSON.stringify(attempt.results));
  assert.equal(phase, 'test');
});

test('typescript : assertion échouée (mauvais retour)', opts, async () => {
  const e = ex('ts-wrong', [{ path: 'solution.ts', content: 'export function add(a: number, b: number): number { return a - b; }' }],
    [{ id: 't', name: 'add', kind: 'call-equals', export: 'add', args: [2, 3], expected: 5 }]);
  const { attempt } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, false);
  assert.match(attempt.results[0].message, /attendu/);
});

test('typescript : erreur de compilation → aucun spawn, tests échoués + diagnostics', opts, async () => {
  const e = ex('ts-typeerror', [{ path: 'solution.ts', content: 'export function add(a: number, b: number): number { return "nope"; }' }],
    [{ id: 't', name: 'add', kind: 'call-equals', export: 'add', args: [2, 3], expected: 5 }]);
  const { attempt, phase, diagnostics } = await runExercise(ROOT, e, {});
  assert.equal(phase, 'compile');
  assert.equal(attempt.allPassed, false);
  assert.ok(attempt.results.every((r) => !r.passed));
  assert.ok(Array.isArray(diagnostics) && diagnostics.length >= 1);
  assert.equal(diagnostics[0].phase, 'compile');
  assert.equal(diagnostics[0].file, 'solution.ts');
  assert.equal(typeof diagnostics[0].line, 'number');
});

test('typescript : erreur de syntaxe → échec de compilation avec diagnostic', opts, async () => {
  const e = ex('ts-syntax', [{ path: 'solution.ts', content: 'export function add(a: number { return a; }' }],
    [{ id: 't', name: 'add', kind: 'call-equals', export: 'add', args: [1], expected: 1 }]);
  const { phase, diagnostics } = await runExercise(ROOT, e, {});
  assert.equal(phase, 'compile');
  assert.ok(diagnostics.length >= 1);
});

test('typescript : exception runtime capturée (chemin interne neutralisé)', opts, async () => {
  const e = ex('ts-exc', [{ path: 'solution.ts', content: 'export function boom(): number { throw new Error("boum"); }' }],
    [{ id: 't', name: 'boom', kind: 'call-equals', export: 'boom', args: [], expected: 1 }]);
  const { attempt, phase } = await runExercise(ROOT, e, {});
  assert.equal(phase, 'test'); // compilation OK, l'erreur survient à l'exécution
  assert.equal(attempt.allPassed, false);
  assert.match(attempt.results[0].message, /boum/);
  assert.equal(attempt.results[0].message.includes(ROOT), false); // aucun chemin interne
});

test('typescript : sortie standard (console.log)', opts, async () => {
  const e = ex('ts-out', [{ path: 'main.ts', content: 'console.log("Bonjour, TS");' }],
    [{ id: 't', name: 'sortie', kind: 'stdout-contains', expected: 'Bonjour' }], 'main.ts');
  const { attempt, stdout } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, true, JSON.stringify(attempt.results));
  assert.match(stdout, /Bonjour, TS/);
  assert.equal(stdout.includes('__LAB_RESULT__'), false); // marqueur jamais exposé
});

test('typescript : multi-fichiers avec import relatif', opts, async () => {
  const e = ex('ts-multi', [
    { path: 'solution.ts', content: 'import { triple } from "./helper";\nexport function run(n: number): number { return triple(n); }' },
    { path: 'helper.ts', content: 'export function triple(n: number): number { return n * 3; }' },
  ], [{ id: 't', name: 'run', kind: 'call-equals', export: 'run', args: [4], expected: 12 }]);
  const { attempt } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, true, JSON.stringify(attempt.results));
});

test('typescript : import externe rejeté avant compilation (pas de spawn)', opts, async () => {
  const e = ex('ts-ext', [{ path: 'solution.ts', content: 'import fs from "fs";\nexport function run(): number { return 1; }' }],
    [{ id: 't', name: 'run', kind: 'call-equals', export: 'run', args: [], expected: 1 }]);
  const { phase, diagnostics } = await runExercise(ROOT, e, {});
  assert.equal(phase, 'compile');
  assert.equal(diagnostics[0].code, 'LAB_IMPORT');
});

test('typescript : async/await (Promise) résolu', opts, async () => {
  const e = ex('ts-async', [{ path: 'solution.ts', content: 'export async function later(): Promise<number> { return Promise.resolve(7); }' }],
    [{ id: 't', name: 'later', kind: 'call-equals', export: 'later', args: [], expected: 7 }]);
  const { attempt } = await runExercise(ROOT, e, {});
  assert.equal(attempt.allPassed, true, JSON.stringify(attempt.results));
});

test('typescript : override utilisateur recompilé', opts, async () => {
  const e = ex('ts-override', [{ path: 'solution.ts', content: 'export function add(a: number, b: number): number { return 0; }' }],
    [{ id: 't', name: 'add', kind: 'call-equals', export: 'add', args: [2, 3], expected: 5 }]);
  const bad = await runExercise(ROOT, e, {});
  assert.equal(bad.attempt.allPassed, false);
  const good = await runExercise(ROOT, e, { 'solution.ts': 'export function add(a: number, b: number): number { return a + b; }' });
  assert.equal(good.attempt.allPassed, true, JSON.stringify(good.attempt.results));
});

test('typescript : le JS compilé et le harnais restent côté serveur (workspace)', opts, async () => {
  const e = ex('ts-artifacts', [{ path: 'solution.ts', content: 'export const x: number = 1;' }],
    [{ id: 't', name: 'x', kind: 'stdout-contains', expected: '' }]);
  await runExercise(ROOT, e, {});
  const files = readdirSync(join(ROOT, 'ts-artifacts'));
  assert.ok(files.includes('solution.js'));           // JS compilé présent sur disque serveur
  assert.ok(files.includes('__lab_harness__.cjs'));   // harnais CommonJS
});

test('typescript : timeout (boucle infinie interrompue)', opts, async () => {
  const e = ex('ts-timeout', [{ path: 'main.ts', content: 'while (true) {}' }],
    [{ id: 't', name: 'x', kind: 'stdout-equals', expected: 'x' }], 'main.ts');
  const t0 = Date.now();
  const { attempt, timedOut } = await runExercise(ROOT, e, {});
  assert.ok(Date.now() - t0 < 15000);
  assert.equal(timedOut, true);
  assert.equal(attempt.allPassed, false);
});
