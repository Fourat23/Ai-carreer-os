// Tests du runner & gestionnaire d'espace de travail sécurisé.
// Partie PURE (workspace.mjs) + I/O réelle et exécution cloisonnée
// (workspace-fs.mjs), toujours contre un répertoire TEMPORAIRE (jamais data/).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  resolveWithinRoot, parseHarnessOutput, gradeRun, HARNESS_FILE, LAB_RESULT_MARKER,
} from '../lib/workspace.mjs';
import {
  MAX_FILE_BYTES, templateFileMap, materializeWorkspace, workspaceExists,
  readWorkspaceTree, readWorkspaceFile, writeWorkspaceFile, resetWorkspace,
  clearWorkspace, runExercise,
} from '../lib/workspace-fs.mjs';

const fizz = JSON.parse(readFileSync(new URL('../data/exercises/fizzbuzz.json', import.meta.url), 'utf8'));
const greet = JSON.parse(readFileSync(new URL('../data/exercises/greeting.json', import.meta.url), 'utf8'));

let ROOT;
before(() => { ROOT = mkdtempSync(join(tmpdir(), 'lab-root-')); });
after(() => { rmSync(ROOT, { recursive: true, force: true }); });

// ── Helpers PURS ─────────────────────────────────────────────────────────────
test('resolveWithinRoot : reste dans la racine, rejette les évasions', () => {
  const root = '/lab/ex1';
  assert.equal(resolveWithinRoot(root, 'solution.mjs'), '/lab/ex1/solution.mjs');
  assert.equal(resolveWithinRoot(root, 'a/b.mjs'), '/lab/ex1/a/b.mjs');
  assert.equal(resolveWithinRoot(root, '../ex2/x'), null);
  assert.equal(resolveWithinRoot(root, '/etc/passwd'), null);
  assert.equal(resolveWithinRoot(root, 'a/../../b'), null);
  assert.equal(resolveWithinRoot('', 'x'), null);
});

test('parseHarnessOutput : extrait la charge marquée, tolère le bruit', () => {
  const s = `bruit avant\n${LAB_RESULT_MARKER}${JSON.stringify({ observed: { t1: { value: 3 } } })}\n`;
  assert.deepEqual(parseHarnessOutput(s).observed.t1, { value: 3 });
  assert.equal(parseHarnessOutput('rien ici'), null);
  assert.equal(parseHarnessOutput(`${LAB_RESULT_MARKER}{cassé`), null);
});

test('gradeRun : erreur d’exécution sans résultat → tous les tests échouent', () => {
  const r = gradeRun(fizz, '', { error: 'Timeout', durationMs: 10 });
  assert.equal(r.allPassed, false);
  assert.equal(r.passed, 0);
  assert.equal(r.total, fizz.tests.length);
  assert.match(r.results[0].message, /Timeout/);
});

test('templateFileMap : allowlist depuis le template', () => {
  const m = templateFileMap(fizz);
  assert.ok(m.has('solution.mjs'));
  assert.equal(m.has('secret.mjs'), false);
});

// ── Cycle de vie de l'espace de travail (I/O réelle) ─────────────────────────
test('materialize + readWorkspaceTree : crée depuis le template, expose les fichiers autorisés (pas le harnais)', () => {
  materializeWorkspace(ROOT, fizz);
  assert.equal(workspaceExists(ROOT, fizz), true);
  const tree = readWorkspaceTree(ROOT, fizz);
  assert.deepEqual(tree.map((f) => f.path), ['solution.mjs']);
  assert.match(tree[0].content, /fizzbuzz/);
  // le harnais existe sur disque mais n'est jamais exposé dans l'arborescence
  assert.equal(existsSync(join(ROOT, fizz.id, HARNESS_FILE)), true);
  assert.equal(tree.some((f) => f.path === HARNESS_FILE), false);
});

test('write + read : persistance locale des seuls fichiers autorisés', () => {
  writeWorkspaceFile(ROOT, fizz, 'solution.mjs', 'export const fizzbuzz = () => "x";');
  assert.match(readWorkspaceFile(ROOT, fizz, 'solution.mjs'), /=> "x"/);
  // relu via l'arborescence
  const tree = readWorkspaceTree(ROOT, fizz);
  assert.match(tree.find((f) => f.path === 'solution.mjs').content, /=> "x"/);
});

test('fichier interdit : écriture/lecture hors allowlist refusée', () => {
  assert.throws(() => writeWorkspaceFile(ROOT, fizz, 'autre.mjs', 'x'), /non autorisé/);
  assert.throws(() => readWorkspaceFile(ROOT, fizz, 'package.json'), /non autorisé/);
});

test('path traversal : écriture avec « .. » ou chemin absolu refusée', () => {
  assert.throws(() => writeWorkspaceFile(ROOT, fizz, '../evil.mjs', 'x'), /non autorisé|non sûr/);
  assert.throws(() => writeWorkspaceFile(ROOT, fizz, '/etc/passwd', 'x'), /non autorisé|non sûr/);
});

test('accès à un autre workspace : impossible via chemin relatif', () => {
  materializeWorkspace(ROOT, fizz);
  materializeWorkspace(ROOT, greet);
  // tenter d'atteindre greet depuis l'allowlist de fizz → rejeté (hors allowlist)
  assert.throws(() => writeWorkspaceFile(ROOT, fizz, '../greeting/main.mjs', 'HACK'), /non autorisé|non sûr/);
  // les deux espaces restent indépendants
  assert.match(readWorkspaceFile(ROOT, greet, 'main.mjs'), /console\.log/);
});

test('isolation : deux exercices ont des répertoires distincts', () => {
  materializeWorkspace(ROOT, fizz);
  materializeWorkspace(ROOT, greet);
  writeWorkspaceFile(ROOT, fizz, 'solution.mjs', '// FIZZ ONLY');
  assert.match(readWorkspaceFile(ROOT, fizz, 'solution.mjs'), /FIZZ ONLY/);
  assert.doesNotMatch(readWorkspaceFile(ROOT, greet, 'main.mjs'), /FIZZ ONLY/);
});

test('dépassement de taille : fichier trop volumineux refusé', () => {
  const huge = 'a'.repeat(MAX_FILE_BYTES + 1);
  assert.throws(() => writeWorkspaceFile(ROOT, fizz, 'solution.mjs', huge), /trop volumineux/);
});

test('reset : restaure le template', () => {
  writeWorkspaceFile(ROOT, fizz, 'solution.mjs', '// modifié');
  resetWorkspace(ROOT, fizz);
  assert.match(readWorkspaceFile(ROOT, fizz, 'solution.mjs'), /fizzbuzz/);
  assert.doesNotMatch(readWorkspaceFile(ROOT, fizz, 'solution.mjs'), /modifié/);
});

test('nettoyage : clearWorkspace supprime le répertoire', () => {
  materializeWorkspace(ROOT, fizz);
  assert.equal(workspaceExists(ROOT, fizz), true);
  clearWorkspace(ROOT, fizz.id);
  assert.equal(workspaceExists(ROOT, fizz), false);
});

// ── Exécution cloisonnée réelle ──────────────────────────────────────────────
test('exécution réussie : FizzBuzz correct → tous les tests passent', async () => {
  const solution = `export function fizzbuzz(n){ if(n%15===0)return 'FizzBuzz'; if(n%3===0)return 'Fizz'; if(n%5===0)return 'Buzz'; return String(n); }`;
  const { attempt } = await runExercise(ROOT, fizz, { 'solution.mjs': solution });
  assert.equal(attempt.allPassed, true, JSON.stringify(attempt.results));
  assert.equal(attempt.passed, fizz.tests.length);
});

test('exécution échouée : FizzBuzz faux → au moins un test échoue avec message', async () => {
  const { attempt } = await runExercise(ROOT, fizz, { 'solution.mjs': `export function fizzbuzz(n){ return String(n); }` });
  assert.equal(attempt.allPassed, false);
  assert.ok(attempt.passed < attempt.total);
  assert.match(attempt.results.find((x) => !x.passed).message, /attendu/);
});

test('exécution : erreur d’import (syntaxe) → tests échoués proprement', async () => {
  const { attempt } = await runExercise(ROOT, fizz, { 'solution.mjs': `export function fizzbuzz(n) { return ` });
  assert.equal(attempt.allPassed, false);
  assert.ok(attempt.results.every((x) => !x.passed));
});

test('exécution : sortie standard (greeting) exacte et contains', async () => {
  const ok = await runExercise(ROOT, greet, { 'main.mjs': `console.log('Bonjour, monde');` });
  assert.equal(ok.attempt.allPassed, true, JSON.stringify(ok.attempt.results));
  const ko = await runExercise(ROOT, greet, { 'main.mjs': `console.log('Salut');` });
  assert.equal(ko.attempt.allPassed, false);
});

test('timeout : boucle infinie interrompue', async () => {
  const inf = {
    id: 'inf-timeout', title: 'inf', runtime: 'node-js',
    workspace: { entry: 'main.mjs', files: [{ path: 'main.mjs', content: 'while(true){}' }] },
    tests: [{ id: 't', name: 'ne finit jamais', kind: 'stdout-equals', expected: 'x' }],
  };
  const t0 = Date.now();
  const { attempt, timedOut } = await runExercise(ROOT, inf, {});
  assert.ok(Date.now() - t0 < 15000, 'processus tué dans un délai raisonnable');
  assert.equal(timedOut, true);
  assert.equal(attempt.allPassed, false);
});

test('dépassement de sortie : trop de stdout → interrompu, tests non réussis', async () => {
  const flood = {
    id: 'flood-out', title: 'flood', runtime: 'node-js',
    workspace: { entry: 'main.mjs', files: [{ path: 'main.mjs', content: `for(let i=0;i<400000;i++)process.stdout.write('x');` }] },
    tests: [{ id: 't', name: 'sortie', kind: 'stdout-contains', expected: 'zzz' }],
  };
  const { attempt, timedOut } = await runExercise(ROOT, flood, {});
  assert.equal(attempt.allPassed, false);
  assert.equal(timedOut, true); // maxBuffer dépassé → interrompu
});

test('commande / argument interdits : runtime hors allowlist refusé ; binaire & args figés', async () => {
  const bad = { ...fizz, id: 'bad-rt', runtime: 'python' };
  await assert.rejects(() => runExercise(ROOT, bad, {}), /Runtime non exécutable/);
  const bad2 = { ...fizz, id: 'bad-rt2', runtime: '__proto__' };
  await assert.rejects(() => runExercise(ROOT, bad2, {}), /Runtime non exécutable/);
});

test('aucun secret transmis : les variables d’environnement de l’appli sont invisibles', async () => {
  process.env.LAB_SECRET_TOKEN = 'ne-doit-pas-fuiter';
  const ex = {
    id: 'env-leak', title: 'env', runtime: 'node-js',
    workspace: { entry: 'solution.mjs', files: [{ path: 'solution.mjs', content: `export const readSecret = () => process.env.LAB_SECRET_TOKEN ?? 'none';` }] },
    tests: [{ id: 't', name: 'pas de secret', kind: 'call-equals', export: 'readSecret', args: [], expected: 'none' }],
  };
  const { attempt, stdout } = await runExercise(ROOT, ex, {});
  assert.equal(attempt.allPassed, true, 'le code utilisateur ne voit pas le secret');
  assert.equal(stdout.includes('ne-doit-pas-fuiter'), false);
  delete process.env.LAB_SECRET_TOKEN;
});

test('aucun résidu : le répertoire racine de test ne contient que des exercices connus', () => {
  clearWorkspace(ROOT, fizz.id);
  clearWorkspace(ROOT, greet.id);
  const remaining = existsSync(ROOT) ? readdirSync(ROOT) : [];
  for (const d of remaining) assert.ok(!d.includes('..'), 'aucun chemin suspect');
});
