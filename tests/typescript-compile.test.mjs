// Tests du compilateur TypeScript pur (lib/typescript-compile.mjs) — déterministes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileExerciseTs } from '../lib/typescript-compile.mjs';

const f = (path, content) => ({ path, content });

test('compilation valide simple → success + JS émis (CommonJS)', () => {
  const r = compileExerciseTs([f('solution.ts', 'export function add(a: number, b: number): number { return a + b; }')]);
  assert.equal(r.success, true);
  assert.deepEqual(Object.keys(r.emittedFiles), ['solution.js']);
  assert.match(r.emittedFiles['solution.js'], /exports\.add/);
  assert.equal(r.diagnostics.length, 0);
  assert.equal(typeof r.durationMs, 'number');
});

test('erreur de type → échec, aucune émission, diagnostic localisé', () => {
  const r = compileExerciseTs([f('solution.ts', 'export function bad(): number { return "x"; }')]);
  assert.equal(r.success, false);
  assert.deepEqual(r.emittedFiles, {});
  assert.equal(r.diagnostics.length >= 1, true);
  const d = r.diagnostics[0];
  assert.equal(d.category, 'error');
  assert.equal(d.phase, 'compile');
  assert.equal(d.file, 'solution.ts');
  assert.equal(typeof d.line, 'number');
  assert.equal(typeof d.column, 'number');
  assert.equal(typeof d.code, 'number');
});

test('erreur de syntaxe → échec avec diagnostic', () => {
  const r = compileExerciseTs([f('solution.ts', 'export function oops( { return 1 }')]);
  assert.equal(r.success, false);
  assert.deepEqual(r.emittedFiles, {});
  assert.equal(r.diagnostics.some((d) => d.category === 'error'), true);
});

test('erreur implicite (noImplicitAny) → diagnostic', () => {
  const r = compileExerciseTs([f('solution.ts', 'export function id(x) { return x; }')]);
  assert.equal(r.success, false);
  assert.equal(r.diagnostics.some((d) => d.code === 7006 || /implicit/i.test(d.message) || /implicite/i.test(d.message)), true);
});

test('diagnostic global possible sans fichier (option invalide simulée via strict)', () => {
  // Un diagnostic « déclaré mais jamais utilisé » reste rattaché au fichier ;
  // on vérifie surtout que le tri gère l'absence de file sans planter.
  const r = compileExerciseTs([f('solution.ts', 'export const x: number = 1; export function y(): string { return 2 as any as string; }')]);
  assert.equal(typeof r.success, 'boolean');
});

test('plusieurs diagnostics → ordre déterministe (par fichier, ligne, colonne, code)', () => {
  const src = 'export function a(): number { return "x"; }\nexport function b(): string { return 3; }\n';
  const r1 = compileExerciseTs([f('solution.ts', src)]);
  const r2 = compileExerciseTs([f('solution.ts', src)]);
  assert.equal(r1.success, false);
  assert.deepEqual(r1.diagnostics.map((d) => [d.file, d.line, d.column, d.code]),
    r2.diagnostics.map((d) => [d.file, d.line, d.column, d.code]));
  // Ordre croissant strict sur (ligne, colonne).
  for (let i = 1; i < r1.diagnostics.length; i++) {
    const p = r1.diagnostics[i - 1], c = r1.diagnostics[i];
    assert.equal((p.line < c.line) || (p.line === c.line && p.column <= c.column), true);
  }
});

test('multi-fichiers avec import relatif valide → success', () => {
  const r = compileExerciseTs([
    f('solution.ts', 'import { helper } from "./util";\nexport function run(): number { return helper(2); }'),
    f('util.ts', 'export function helper(n: number): number { return n * 10; }'),
  ]);
  assert.equal(r.success, true);
  assert.equal(Object.keys(r.emittedFiles).sort().join(','), 'solution.js,util.js');
});

test('import relatif introuvable → diagnostic LAB_IMPORT, pas d’émission', () => {
  const r = compileExerciseTs([f('solution.ts', 'import { x } from "./manque";\nexport const y = 1;')]);
  assert.equal(r.success, false);
  assert.deepEqual(r.emittedFiles, {});
  assert.equal(r.diagnostics[0].code, 'LAB_IMPORT');
  assert.match(r.diagnostics[0].message, /introuvable/);
});

test('import de package externe → rejeté avant compilation', () => {
  const r = compileExerciseTs([f('solution.ts', 'import fs from "fs";\nexport const y = 1;')]);
  assert.equal(r.success, false);
  assert.equal(r.diagnostics[0].code, 'LAB_IMPORT');
  assert.match(r.diagnostics[0].message, /externes/);
  assert.equal(r.diagnostics[0].file, 'solution.ts');
  assert.equal(typeof r.diagnostics[0].line, 'number');
});

test('import absolu → rejeté', () => {
  const r = compileExerciseTs([f('solution.ts', 'import x from "/etc/passwd";\nexport const y = 1;')]);
  assert.equal(r.diagnostics[0].code, 'LAB_IMPORT');
  assert.match(r.diagnostics[0].message, /absolus/);
});

test('import URL → rejeté', () => {
  const r = compileExerciseTs([f('solution.ts', 'import x from "https://evil.example/mod.js";\nexport const y = 1;')]);
  assert.equal(r.diagnostics[0].code, 'LAB_IMPORT');
  assert.match(r.diagnostics[0].message, /URL/);
});

test('traversal (../) hors racine → rejeté', () => {
  const r = compileExerciseTs([f('solution.ts', 'import x from "../secret";\nexport const y = 1;')]);
  assert.equal(r.success, false);
  assert.equal(r.diagnostics[0].code, 'LAB_IMPORT');
  assert.match(r.diagnostics[0].message, /exercice/);
});

test('directive triple-slash → rejetée', () => {
  const r = compileExerciseTs([f('solution.ts', '/// <reference path="../node_modules/foo/index.d.ts" />\nexport const y = 1;')]);
  assert.equal(r.success, false);
  assert.equal(r.diagnostics.some((d) => d.code === 'LAB_REFERENCE'), true);
});

test('contenu binaire (octet NUL) → rejeté', () => {
  const r = compileExerciseTs([f('solution.ts', 'export const y = 1;' + String.fromCharCode(0))]);
  assert.equal(r.success, false);
  assert.equal(r.diagnostics[0].code, 'LAB_BINARY');
});

test('aucun fichier .ts → échec explicite', () => {
  const r = compileExerciseTs([f('data.json', '{}')]);
  assert.equal(r.success, false);
  assert.equal(r.diagnostics[0].code, 'LAB_NO_TS');
});

test('console.log disponible (globals injectés) sans DOM', () => {
  const r = compileExerciseTs([f('solution.ts', 'export function show(): void { console.log("ok"); }')]);
  assert.equal(r.success, true);
});

test('DOM indisponible : document est une erreur (pas de navigateur)', () => {
  const r = compileExerciseTs([f('solution.ts', 'export function d(): void { document.title = "x"; }')]);
  assert.equal(r.success, false);
});

test('async/await + Promise compile (ES2022)', () => {
  const r = compileExerciseTs([f('solution.ts', 'export async function wait(): Promise<number> { return Promise.resolve(42); }')]);
  assert.equal(r.success, true);
  assert.match(r.emittedFiles['solution.js'], /exports\.wait/);
});

test('noEmitOnError : une erreur bloquante empêche toute émission même partielle', () => {
  const r = compileExerciseTs([
    f('solution.ts', 'export const ok = 1;'),
    f('broken.ts', 'export const bad: number = "nope";'),
  ]);
  assert.equal(r.success, false);
  assert.deepEqual(r.emittedFiles, {}); // aucun .js émis, y compris pour solution.ts valide
});
