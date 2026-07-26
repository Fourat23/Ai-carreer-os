// Tests du modele de fichiers multi-fichiers (lib/exercise-files.mjs) - purs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectLanguage, looksBinary, validateExercisePath, normalizeExerciseFiles,
  resolveEntryFile, resolveActiveFile, updateWorkspaceFile, resetWorkspaceFiles,
  migrateLegacySingleFileExercise, clientFiles,
} from '../lib/exercise-files.mjs';

// Exercice V7 mono-fichier (forme heritee).
const legacy = {
  id: 'x', title: 'X', runtime: 'node-js',
  workspace: { entry: 'solution.mjs', files: [{ path: 'solution.mjs', content: 'export const f=()=>1;' }] },
  tests: [{ id: 't', name: 'n', kind: 'call-equals', export: 'f', args: [], expected: 1 }],
};

// Exercice multi-fichiers avec fichier de test prive + lecture seule.
const multi = {
  id: 'm', title: 'M', runtime: 'node-js',
  activeFile: 'src/index.mjs',
  workspace: {
    entry: 'src/index.mjs',
    files: [
      { path: 'src/index.mjs', content: 'export * from "./util.mjs";' },
      { path: 'src/util.mjs', content: 'export const add=(a,b)=>a+b;' },
      { path: 'README.md', content: '# aide', readOnly: true },
    ],
  },
  testFiles: [{ path: 'tests/hidden.mjs', content: '// prive' }],
  tests: [{ id: 't', name: 'n', kind: 'call-equals', export: 'add', args: [1, 2], expected: 3 }],
};

test('detectLanguage', () => {
  assert.equal(detectLanguage('a.mjs'), 'javascript');
  assert.equal(detectLanguage('a.json'), 'json');
  assert.equal(detectLanguage('README.md'), 'markdown');
  assert.equal(detectLanguage('solution.ts'), 'typescript');
  assert.equal(detectLanguage('main.py'), 'python');
  assert.equal(detectLanguage('noext'), 'javascript');
});

test('looksBinary : NUL rejete, texte accepte', () => {
  assert.equal(looksBinary('hello world'), false);
  assert.equal(looksBinary('a' + String.fromCharCode(0) + 'b'), true);
});

test('validateExercisePath : rejette absolu, .., vide, backslash', () => {
  assert.equal(validateExercisePath('src/a.mjs').ok, true);
  assert.equal(validateExercisePath('/etc/passwd').ok, false);
  assert.equal(validateExercisePath('../x').ok, false);
  assert.equal(validateExercisePath('a\\b').ok, false);
  assert.equal(validateExercisePath('').ok, false);
  assert.equal(validateExercisePath('   ').ok, false);
});

test('normalizeExerciseFiles : legacy mono-fichier normalise + entry marque', () => {
  const files = normalizeExerciseFiles(legacy);
  assert.equal(files.length, 1);
  assert.equal(files[0].entry, true);
  assert.equal(files[0].editable, true);
  assert.equal(files[0].test, false);
  assert.equal(files[0].language, 'javascript');
});

test('normalizeExerciseFiles : multi-fichiers, testFiles prives non editables', () => {
  const files = normalizeExerciseFiles(multi);
  assert.equal(files.length, 4);
  const readme = files.find((f) => f.path === 'README.md');
  assert.equal(readme.editable, false); // readOnly honore
  const priv = files.find((f) => f.path === 'tests/hidden.mjs');
  assert.equal(priv.test, true);
  assert.equal(priv.editable, false);
  assert.equal(resolveEntryFile(files), 'src/index.mjs');
});

test('normalizeExerciseFiles : rejette doublon, chemin non sur, binaire', () => {
  assert.throws(() => normalizeExerciseFiles({ workspace: { files: [{ path: 'a.mjs', content: '' }, { path: 'a.mjs', content: '' }] } }), /duplique/);
  assert.throws(() => normalizeExerciseFiles({ workspace: { files: [{ path: '../evil', content: '' }] } }), /non sur/);
  assert.throws(() => normalizeExerciseFiles({ workspace: { files: [{ path: 'b.mjs', content: 'x' + String.fromCharCode(0) }] } }), /binaire/);
  assert.throws(() => normalizeExerciseFiles({ workspace: { files: [] } }), /au moins un fichier/);
});

test('resolveActiveFile : preference visible, sinon 1er editable', () => {
  const files = normalizeExerciseFiles(multi);
  assert.equal(resolveActiveFile(files, 'src/index.mjs'), 'src/index.mjs');
  assert.equal(resolveActiveFile(files, 'tests/hidden.mjs'), 'src/index.mjs'); // prive refuse -> fallback
  assert.equal(resolveActiveFile(files, 'inconnu'), 'src/index.mjs');
});

test('updateWorkspaceFile : met a jour un fichier editable, refuse test/readonly', () => {
  const files = normalizeExerciseFiles(multi);
  const upd = updateWorkspaceFile(files, 'src/util.mjs', 'export const add=(a,b)=>a+b+0;');
  assert.match(upd.find((f) => f.path === 'src/util.mjs').content, /\+0/);
  assert.notEqual(upd, files); // nouvelle liste
  // readOnly et test : no-op (meme reference)
  assert.equal(updateWorkspaceFile(files, 'README.md', 'hack'), files);
  assert.equal(updateWorkspaceFile(files, 'tests/hidden.mjs', 'hack'), files);
  assert.equal(updateWorkspaceFile(files, 'inconnu.mjs', 'x'), files);
});

test('updateWorkspaceFile : refuse contenu binaire ou trop volumineux', () => {
  const files = normalizeExerciseFiles(multi);
  assert.equal(updateWorkspaceFile(files, 'src/util.mjs', 'a' + String.fromCharCode(0)), files);
  assert.equal(updateWorkspaceFile(files, 'src/util.mjs', 'a'.repeat(200_001)), files);
});

test('resetWorkspaceFiles : retourne le contenu de depart', () => {
  const files = normalizeExerciseFiles(multi);
  const edited = updateWorkspaceFile(files, 'src/util.mjs', '// modifie');
  const reset = resetWorkspaceFiles(multi);
  assert.match(reset.find((f) => f.path === 'src/util.mjs').content, /add/);
  assert.doesNotMatch(reset.find((f) => f.path === 'src/util.mjs').content, /modifie/);
  assert.match(edited.find((f) => f.path === 'src/util.mjs').content, /modifie/); // l'edit reste isole
});

test('migrateLegacySingleFileExercise : idempotent, expose entry + activeFile', () => {
  const a = migrateLegacySingleFileExercise(legacy);
  assert.equal(a.entry, 'solution.mjs');
  assert.equal(a.activeFile, 'solution.mjs');
  const b = migrateLegacySingleFileExercise(multi);
  assert.equal(b.entry, 'src/index.mjs');
  assert.equal(b.activeFile, 'src/index.mjs');
});

test('clientFiles : n expose jamais les fichiers de test prives', () => {
  const files = normalizeExerciseFiles(multi);
  const cf = clientFiles(files);
  assert.equal(cf.some((f) => f.path === 'tests/hidden.mjs'), false);
  assert.equal(cf.length, 3);
  assert.equal(Object.hasOwn(cf[0], 'test'), false); // pas de fuite du flag interne
});
