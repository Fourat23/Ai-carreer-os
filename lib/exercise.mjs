// Modèle GÉNÉRIQUE d'exercice exécutable — PUR (aucun I/O, aucune exécution).
// Décrit un exercice (fichiers de départ, tests, runtime), valide sa structure,
// et calcule un résultat de tentative à partir de sorties de tests déjà
// produites. L'exécution réelle et le bac à sable vivent ailleurs (gestionnaire
// d'espace de travail + exécuteur), qui S'APPUIENT sur ce modèle. Ce module ne
// touche jamais au disque ni au réseau : il reste testable en isolation.

const DANGEROUS = new Set(['__proto__', 'prototype', 'constructor']);
const MAX_FILES = 40;
const MAX_FILE_BYTES = 200_000;      // 200 Ko / fichier de template
const MAX_TESTS = 100;
const MAX_PATH_LEN = 200;
const MAX_ARGS_BYTES = 20_000;

// ── Runtimes supportés (allowlist) ──────────────────────────────────────────
// La source unique est le registre d'adaptateurs (lib/runtime.mjs). On réexporte
// RUNTIMES/getRuntime pour compatibilité avec les consommateurs existants ; la
// liste reste fermée (aucun exercice ne peut introduire un binaire arbitraire).
import { RUNTIMES, getRuntime, getRuntimeAdapter, isKnownRuntime, DEFAULT_RUNTIME_ID } from './runtime.mjs';
export { RUNTIMES, getRuntime, getRuntimeAdapter, isKnownRuntime, DEFAULT_RUNTIME_ID };

// ── Familles de tests (allowlist) ───────────────────────────────────────────
// Chaque test compare le résultat d'un appel de fonction exportée, ou la sortie
// standard. Pas de code de test arbitraire fourni par l'exercice : uniquement
// des données (nom d'export, arguments, valeur/texte attendus).
export const TEST_KINDS = ['call-equals', 'stdout-equals', 'stdout-contains'];

// ── Helpers purs ─────────────────────────────────────────────────────────────
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const isStr = (v) => typeof v === 'string';
const byteLen = (s) => Buffer.byteLength(String(s), 'utf8');

/**
 * Vrai si `p` est un chemin relatif sûr : pas de racine absolue, pas de segment
 * « .. », pas de caractère nul, pas de backslash Windows, longueur bornée. Cette
 * règle protège les TEMPLATES ; le gestionnaire d'espace de travail applique en
 * plus une résolution réelle contre la racine (défense en profondeur).
 */
export function isSafeRelPath(p) {
  if (!isStr(p) || !p || p.length > MAX_PATH_LEN) return false;
  if (p.includes('\0') || p.includes('\\')) return false;
  if (p.startsWith('/') || /^[a-zA-Z]:/.test(p)) return false;   // absolu
  const segs = p.split('/');
  for (const seg of segs) {
    if (seg === '' || seg === '.' || seg === '..') return false;
    if (DANGEROUS.has(seg)) return false;
  }
  return true;
}

/** Deep-equal structurel pur (JSON-comparables : primitifs, tableaux, objets simples). */
export function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((x, i) => deepEqual(x, b[i]));
  }
  if (typeof a === 'object') {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k]));
  }
  if (typeof a === 'number') return a === b || (Number.isNaN(a) && Number.isNaN(b));
  return false;
}

/**
 * Valide STRICTEMENT une définition d'exercice. Ne lance jamais : renvoie
 * { ok, errors[] }. Vérifie runtime connu, fichiers sûrs et bornés, fichier
 * d'entrée présent, tests bien formés et ids uniques.
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateExercise(ex) {
  const errors = [];
  const fail = (m) => { errors.push(m); };

  if (!isObj(ex)) return { ok: false, errors: ['Exercice : objet attendu.'] };
  if (!isStr(ex.id) || !ex.id) fail('Exercice : id manquant.');
  if (!isStr(ex.title) || !ex.title) fail('Exercice : titre manquant.');
  // runtime absent → défaut Node (compat V7/V8) ; présent mais hors registre → rejet.
  if (ex.runtime !== undefined && !isKnownRuntime(ex.runtime)) fail(`Exercice : runtime inconnu « ${ex.runtime} ».`);

  const ws = ex.workspace;
  if (!isObj(ws) || !Array.isArray(ws.files)) {
    fail('Exercice : workspace.files attendu (tableau).');
  } else {
    if (ws.files.length === 0) fail('Exercice : au moins un fichier requis.');
    if (ws.files.length > MAX_FILES) fail(`Exercice : trop de fichiers (${ws.files.length}).`);
    const paths = new Set();
    for (const f of ws.files) {
      if (!isObj(f) || !isSafeRelPath(f.path)) { fail(`Exercice : chemin de fichier non sûr « ${f?.path} ».`); continue; }
      if (paths.has(f.path)) fail(`Exercice : chemin de fichier dupliqué « ${f.path} ».`);
      paths.add(f.path);
      if (!isStr(f.content)) fail(`Exercice : contenu non textuel pour « ${f.path} ».`);
      else if (byteLen(f.content) > MAX_FILE_BYTES) fail(`Exercice : fichier « ${f.path} » trop volumineux.`);
    }
    if (!isSafeRelPath(ws.entry)) fail('Exercice : fichier d’entrée (entry) non sûr ou manquant.');
    else if (!paths.has(ws.entry)) fail(`Exercice : fichier d’entrée « ${ws.entry} » absent des fichiers.`);
    else {
      // Cohérence runtime ↔ extension du fichier d'entrée.
      const adapter = getRuntimeAdapter(ex.runtime ?? DEFAULT_RUNTIME_ID);
      if (adapter && !adapter.extensions.some((x) => ws.entry.endsWith(x))) {
        fail(`Exercice : extension du fichier d’entrée « ${ws.entry} » incohérente avec le runtime ${adapter.id} (attendu ${adapter.extensions.join(' / ')}).`);
      }
    }
  }

  // Limites par exercice (facultatives) : entières, positives, bornées au runtime.
  if (ex.limits !== undefined) {
    if (!isObj(ex.limits)) fail('Exercice : limits doit être un objet.');
    else {
      const { timeoutMs, maxOutputBytes } = ex.limits;
      if (timeoutMs !== undefined && (!Number.isInteger(timeoutMs) || timeoutMs <= 0)) fail('Exercice : limits.timeoutMs invalide.');
      if (maxOutputBytes !== undefined && (!Number.isInteger(maxOutputBytes) || maxOutputBytes <= 0)) fail('Exercice : limits.maxOutputBytes invalide.');
    }
  }

  // Compétences : tableau de chaînes non vides (dégradation douce sinon).
  if (ex.skills !== undefined && !Array.isArray(ex.skills)) fail('Exercice : skills doit être un tableau.');

  if (!Array.isArray(ex.tests) || ex.tests.length === 0) {
    fail('Exercice : au moins un test requis.');
  } else {
    if (ex.tests.length > MAX_TESTS) fail(`Exercice : trop de tests (${ex.tests.length}).`);
    const ids = new Set();
    for (const t of ex.tests) {
      const e = validateTest(t);
      if (e) fail(e);
      else {
        if (ids.has(t.id)) fail(`Exercice : id de test dupliqué « ${t.id} ».`);
        ids.add(t.id);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

/** Valide un test. Renvoie un message d'erreur (string) ou null si OK. */
export function validateTest(t) {
  if (!isObj(t)) return 'Test : objet attendu.';
  if (!isStr(t.id) || !t.id) return 'Test : id manquant.';
  if (!isStr(t.name) || !t.name) return `Test « ${t.id} » : nom manquant.`;
  if (!TEST_KINDS.includes(t.kind)) return `Test « ${t.id} » : type inconnu « ${t.kind} ».`;
  if (t.kind === 'call-equals') {
    if (!isStr(t.export) || !t.export) return `Test « ${t.id} » : nom d'export attendu.`;
    if (t.args !== undefined) {
      if (!Array.isArray(t.args)) return `Test « ${t.id} » : args doit être un tableau.`;
      if (byteLen(JSON.stringify(t.args)) > MAX_ARGS_BYTES) return `Test « ${t.id} » : args trop volumineux.`;
    }
    if (!('expected' in t)) return `Test « ${t.id} » : valeur attendue manquante.`;
  } else { // stdout-equals / stdout-contains
    if (!isStr(t.expected)) return `Test « ${t.id} » : sortie attendue (texte) manquante.`;
  }
  return null;
}

/**
 * Compare une sortie observée à l'attendu d'un test → ValidationResult PUR.
 * `observed` = { value } pour call-equals, ou { stdout } pour les tests stdout.
 * `error` (facultatif) = message d'erreur d'exécution → test échoué.
 * @returns {{ testId, name, passed, expected, actual, message }}
 */
export function checkTest(test, observed = {}, error = null) {
  const durationMs = Number.isFinite(observed?.durationMs) ? observed.durationMs : null;
  const base = { testId: test.id, name: test.name, expected: test.expected, durationMs };
  if (error) return { ...base, passed: false, actual: null, message: String(error).slice(0, 500) };

  if (test.kind === 'call-equals') {
    const actual = observed.value;
    const passed = deepEqual(actual, test.expected);
    return { ...base, passed, actual, message: passed ? 'OK' : `attendu ${jsonPreview(test.expected)}, obtenu ${jsonPreview(actual)}` };
  }
  const out = isStr(observed.stdout) ? observed.stdout : '';
  if (test.kind === 'stdout-equals') {
    const passed = out.trim() === String(test.expected).trim();
    return { ...base, passed, actual: out, message: passed ? 'OK' : 'sortie standard différente' };
  }
  // stdout-contains
  const passed = out.includes(test.expected);
  return { ...base, passed, actual: out, message: passed ? 'OK' : `« ${test.expected} » absent de la sortie` };
}

function jsonPreview(v) {
  try { return JSON.stringify(v)?.slice(0, 200) ?? String(v); } catch { return String(v); }
}

/**
 * Agrège des ValidationResult en AttemptResult PUR (compteurs + statut global).
 * @returns {{ exerciseId, at, durationMs, total, passed, allPassed, results }}
 */
export function buildAttemptResult(exerciseId, results, { at = null, durationMs = 0 } = {}) {
  const list = Array.isArray(results) ? results : [];
  const passed = list.filter((r) => r && r.passed).length;
  return {
    exerciseId: isStr(exerciseId) ? exerciseId : '',
    at: isStr(at) ? at : null,
    durationMs: Number.isFinite(durationMs) ? Math.max(0, Math.trunc(durationMs)) : 0,
    total: list.length,
    passed,
    allPassed: list.length > 0 && passed === list.length,
    results: list,
  };
}

/**
 * Limites EFFECTIVES d'un exercice : les limites déclarées par l'exercice sont
 * bornées par le plafond du runtime (jamais au-dessus). Défaut = plafond runtime.
 * @returns {{ timeoutMs: number, maxOutputBytes: number }}
 */
export function effectiveLimits(exercise) {
  const adapter = getRuntimeAdapter(exercise?.runtime ?? DEFAULT_RUNTIME_ID) ?? getRuntimeAdapter(DEFAULT_RUNTIME_ID);
  const L = (exercise && typeof exercise.limits === 'object' && exercise.limits) || {};
  const clamp = (v, max) => (Number.isInteger(v) && v > 0 ? Math.min(v, max) : max);
  return {
    timeoutMs: clamp(L.timeoutMs, adapter.timeoutMs),
    maxOutputBytes: clamp(L.maxOutputBytes, adapter.maxOutputBytes),
  };
}
