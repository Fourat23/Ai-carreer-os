// Modele de fichiers d'exercice MULTI-FICHIERS - PUR, retrocompatible V7.
// Un exercice V7 (workspace.entry + files:[{path,content,readOnly?}]) est un cas
// particulier : `migrateLegacySingleFileExercise` le normalise sans edition
// manuelle. Toutes les fonctions sont pures et testables (aucune I/O).
//
// Fichier normalise : { path, content, language, editable, hidden, entry, test }
//  - test  : fichier de test PRIVE - jamais expose au client, jamais modifiable ;
//  - editable : defaut = !readOnly && !test ;
//  - entry : fichier d'entree execute par le harnais.
import { isSafeRelPath } from './exercise.mjs';

const MAX_FILE_BYTES = 200_000;
const MAX_FILES = 40;
const NUL = String.fromCharCode(0);

const LANG_BY_EXT = {
  mjs: 'javascript', js: 'javascript', cjs: 'javascript',
  ts: 'typescript', tsx: 'typescript',
  py: 'python',
  json: 'json', md: 'markdown', txt: 'text',
};

/** Deduit le langage d'un chemin (defaut : javascript pour compat Node). */
export function detectLanguage(path) {
  const s = String(path);
  const dot = s.lastIndexOf('.');
  const ext = dot >= 0 ? s.slice(dot + 1).toLowerCase() : '';
  return LANG_BY_EXT[ext] ?? (ext ? 'text' : 'javascript');
}

/** true si le contenu ressemble a du binaire (octet NUL present) -> interdit. */
export function looksBinary(content) {
  return typeof content === 'string' && content.indexOf(NUL) !== -1;
}

/**
 * Valide un chemin de fichier d'exercice. Renvoie { ok, error }.
 * Rejette : absolu, "..", backslash, segment vide/dangereux, nom vide,
 * longueur excessive (via isSafeRelPath).
 */
export function validateExercisePath(path) {
  if (typeof path !== 'string' || path.trim() === '') return { ok: false, error: 'Nom de fichier vide.' };
  if (!isSafeRelPath(path)) return { ok: false, error: `Chemin de fichier non sur : "${path}".` };
  return { ok: true };
}

function normOne(raw, { forceTest = false } = {}) {
  const path = String(raw?.path ?? '');
  const v = validateExercisePath(path);
  if (!v.ok) throw new Error(v.error);
  const content = typeof raw?.content === 'string' ? raw.content : '';
  if (Buffer.byteLength(content, 'utf8') > MAX_FILE_BYTES) throw new Error(`Fichier "${path}" trop volumineux.`);
  if (looksBinary(content)) throw new Error(`Fichier "${path}" binaire non autorise.`);
  const test = forceTest || raw?.test === true;
  const readOnly = raw?.readOnly === true;
  const editable = test ? false : (raw?.editable !== undefined ? !!raw.editable : !readOnly);
  return {
    path,
    content,
    language: typeof raw?.language === 'string' && raw.language ? raw.language : detectLanguage(path),
    editable,
    hidden: !!raw?.hidden,
    entry: !!raw?.entry,
    test,
  };
}

/**
 * Normalise l'ensemble des fichiers d'un exercice (workspace.files + testFiles)
 * en une liste unifiee validee. Lance sur chemin invalide, doublon, depassement,
 * binaire, ou trop de fichiers.
 * @returns {Array<{path,content,language,editable,hidden,entry,test}>}
 */
export function normalizeExerciseFiles(exercise) {
  const wsFiles = Array.isArray(exercise?.workspace?.files) ? exercise.workspace.files : [];
  const testFiles = Array.isArray(exercise?.testFiles) ? exercise.testFiles : [];
  const out = [];
  const seen = new Set();
  const push = (raw, opts) => {
    const f = normOne(raw, opts);
    if (seen.has(f.path)) throw new Error(`Chemin de fichier duplique : "${f.path}".`);
    seen.add(f.path);
    out.push(f);
  };
  for (const f of wsFiles) push(f, {});
  for (const f of testFiles) push(f, { forceTest: true });
  if (out.length === 0) throw new Error('Exercice : au moins un fichier requis.');
  if (out.length > MAX_FILES) throw new Error(`Exercice : trop de fichiers (${out.length}).`);

  // Marque l'entree : entry explicite, sinon workspace.entry herite (V7).
  const legacyEntry = typeof exercise?.workspace?.entry === 'string' ? exercise.workspace.entry : null;
  if (!out.some((f) => f.entry) && legacyEntry) {
    const e = out.find((f) => f.path === legacyEntry);
    if (e) e.entry = true;
  }
  return out;
}

/** Chemin du fichier d'entree : entry marque, sinon 1er fichier non-test executable. */
export function resolveEntryFile(files) {
  const list = Array.isArray(files) ? files : [];
  return (list.find((f) => f.entry && !f.test)
    ?? list.find((f) => !f.test))?.path ?? null;
}

/** Fichier actif initial : preference valide (editable, visible, non-test), sinon 1er editable, sinon entree. */
export function resolveActiveFile(files, preferred = null) {
  const list = Array.isArray(files) ? files : [];
  const visible = (f) => f && !f.test && !f.hidden;
  if (preferred) {
    const p = list.find((f) => f.path === preferred);
    if (p && visible(p)) return p.path;
  }
  return (list.find((f) => visible(f) && f.editable)
    ?? list.find((f) => visible(f))
    ?? list.find((f) => !f.test))?.path ?? null;
}

/**
 * Met a jour le contenu d'un fichier - UNIQUEMENT si editable et non-test.
 * Renvoie une NOUVELLE liste (immutable). No-op si interdit/inexistant.
 */
export function updateWorkspaceFile(files, path, content) {
  const list = Array.isArray(files) ? files : [];
  const target = list.find((f) => f.path === path);
  if (!target || target.test || !target.editable) return list;
  if (typeof content !== 'string') return list;
  if (Buffer.byteLength(content, 'utf8') > MAX_FILE_BYTES || looksBinary(content)) return list;
  return list.map((f) => (f.path === path ? { ...f, content } : f));
}

/** Reinitialise au contenu de depart du template (liste normalisee fraiche). */
export function resetWorkspaceFiles(exercise) {
  return normalizeExerciseFiles(exercise);
}

/**
 * Migre un exercice V7 mono-fichier vers le modele multi-fichiers etendu.
 * Idempotent (un exercice deja etendu ressort normalise). Ne mute pas l'entree.
 * @returns {{ files, activeFile, entry }}
 */
export function migrateLegacySingleFileExercise(exercise) {
  const files = normalizeExerciseFiles(exercise);
  const entry = resolveEntryFile(files);
  const activeFile = resolveActiveFile(files, exercise?.activeFile ?? null);
  return { files, entry, activeFile };
}

/** Vue CLIENT : jamais les fichiers de test prives ; contenu inclus pour l'editeur. */
export function clientFiles(files) {
  return (Array.isArray(files) ? files : [])
    .filter((f) => !f.test)
    .map((f) => ({ path: f.path, content: f.content, language: f.language, editable: f.editable, hidden: f.hidden, entry: f.entry }));
}
