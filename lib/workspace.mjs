// Runner d'exercices — partie PURE et testable (aucun I/O, aucun spawn).
// Résolution de chemin cloisonnée, génération du harnais d'exécution, analyse de
// sa sortie et notation via le modèle pur. L'exécution réelle (écriture disque +
// child_process) vit dans workspace-server.ts et s'appuie sur ces fonctions.
import { resolve, sep } from 'node:path';
import { isSafeRelPath, checkTest, buildAttemptResult } from './exercise.mjs';

export const LAB_RESULT_MARKER = '__LAB_RESULT__';
export const HARNESS_FILE = '__lab_harness__.mjs';

/**
 * Résout `rel` À L'INTÉRIEUR de `root` (défense en profondeur par-dessus
 * isSafeRelPath) : renvoie le chemin absolu, ou null s'il s'échapperait de la
 * racine. Aucun symlink n'est suivi ici — le serveur écrit dans un répertoire
 * qu'il a lui-même créé.
 */
export function resolveWithinRoot(root, rel) {
  if (typeof root !== 'string' || !root) return null;
  if (!isSafeRelPath(rel)) return null;
  const base = resolve(root);
  const full = resolve(base, rel);
  if (full !== base && !full.startsWith(base + sep)) return null;
  return full;
}

/**
 * Génère le harnais d'exécution (code que NOUS contrôlons, jamais l'utilisateur).
 * Il importe le fichier d'entrée, capture la sortie standard produite à l'import,
 * exécute chaque test (appel de fonction exportée ou observation de la sortie) et
 * imprime UNE ligne JSON préfixée par LAB_RESULT_MARKER. Neutralise la sortie de
 * l'utilisateur pour ne pas polluer le canal de résultat.
 */
export function buildHarness(exercise) {
  const entry = './' + exercise.workspace.entry;
  const tests = exercise.tests.map((t) => ({ id: t.id, kind: t.kind, export: t.export ?? null, args: t.args ?? [] }));
  return `// Harnais généré — ne pas modifier.
const __chunks = [];
const __origWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (c, e, cb) => { __chunks.push(String(c)); if (typeof e === 'function') e(); else if (typeof cb === 'function') cb(); return true; };
process.stderr.write = (c, e, cb) => { if (typeof e === 'function') e(); else if (typeof cb === 'function') cb(); return true; };
const TESTS = ${JSON.stringify(tests)};
(async () => {
  let mod = null, importError = null;
  try { mod = await import(${JSON.stringify(entry)}); }
  catch (e) { importError = String((e && e.stack) || e).slice(0, 2000); }
  const stdout = __chunks.join('');
  const observed = {};
  for (const t of TESTS) {
    if (t.kind === 'call-equals') {
      if (importError) { observed[t.id] = { error: importError }; continue; }
      try {
        const fn = mod[t.export];
        if (typeof fn !== 'function') { observed[t.id] = { error: "export « " + t.export + " » introuvable ou non-fonction" }; continue; }
        const value = await fn(...(t.args || []));
        observed[t.id] = { value };
      } catch (e) { observed[t.id] = { error: String((e && e.message) || e).slice(0, 500) }; }
    } else {
      observed[t.id] = importError ? { error: importError, stdout } : { stdout };
    }
  }
  process.stdout.write = __origWrite;
  let payload;
  try { payload = JSON.stringify({ observed }); }
  catch { payload = JSON.stringify({ observed: {}, fatal: "résultat non sérialisable" }); }
  __origWrite(${JSON.stringify(LAB_RESULT_MARKER)} + payload + "\\n");
})();
`;
}

/** Extrait la charge JSON produite par le harnais (dernière ligne marquée). Null si absente. */
export function parseHarnessOutput(stdout) {
  if (typeof stdout !== 'string') return null;
  const idx = stdout.lastIndexOf(LAB_RESULT_MARKER);
  if (idx < 0) return null;
  const line = stdout.slice(idx + LAB_RESULT_MARKER.length).split('\n')[0];
  try { return JSON.parse(line); } catch { return null; }
}

/**
 * Note une exécution : combine l'exercice, la sortie brute du harnais et une
 * éventuelle erreur d'exécution (timeout, crash) → AttemptResult PUR.
 * @param {object} exercise
 * @param {string} rawStdout  sortie standard complète du processus
 * @param {{error?:string|null, durationMs?:number, at?:string|null}} [ctx]
 */
export function gradeRun(exercise, rawStdout, { error = null, durationMs = 0, at = null } = {}) {
  const tests = exercise?.tests ?? [];
  const parsed = parseHarnessOutput(rawStdout);
  const results = tests.map((t) => {
    if (error && !parsed) return checkTest(t, {}, error);          // process tué / crash avant résultat
    const obs = (parsed && parsed.observed && parsed.observed[t.id]) || {};
    return checkTest(t, obs, obs.error ?? (parsed?.fatal ?? null));
  });
  return buildAttemptResult(exercise?.id ?? '', results, { at, durationMs });
}
