// Registre des runtimes du Laboratoire — PUR (aucune I/O, aucun spawn).
// Chaque runtime est un ADAPTATEUR : métadonnées + génération du harnais + args
// de commande. Le binaire réel et la disponibilité sont résolus côté serveur
// (runtime-detect.mjs). La notation (parseHarnessOutput/gradeRun/checkTest) est
// COMMUNE à tous les runtimes : le protocole de sortie est identique.

export const LAB_RESULT_MARKER = '__LAB_RESULT__';

const DEFAULT_CAPS = {
  execution: true, publicTests: true, privateTests: true, multiFile: true,
  stdin: false, cancellation: true, timeout: true, syntaxHighlighting: true,
};

// ── Adaptateur Node.js ───────────────────────────────────────────────────────
// Harnais : importe l'entrée (.mjs), capture stdout, exécute les tests
// (call-equals sur exports, ou observation stdout), émet une ligne JSON marquée.
function buildNodeHarness(exercise) {
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
      const __t0 = Date.now();
      let entry;
      if (importError) entry = { error: importError };
      else {
        try {
          const fn = mod[t.export];
          if (typeof fn !== 'function') entry = { error: "export « " + t.export + " » introuvable ou non-fonction" };
          else { const value = await fn(...(t.args || [])); entry = { value }; }
        } catch (e) { entry = { error: String((e && e.message) || e).slice(0, 500) }; }
      }
      entry.durationMs = Date.now() - __t0;
      observed[t.id] = entry;
    } else {
      observed[t.id] = importError ? { error: importError, stdout } : { stdout };
    }
  }
  const userStdout = __chunks.join('');
  process.stdout.write = __origWrite;
  let payload;
  try { payload = JSON.stringify({ observed, stdout: userStdout.slice(0, 100000) }); }
  catch { payload = JSON.stringify({ observed: {}, fatal: "résultat non sérialisable" }); }
  __origWrite(${JSON.stringify(LAB_RESULT_MARKER)} + payload + "\\n");
})();
`;
}

const nodeAdapter = {
  id: 'node-js',
  kind: 'node',
  label: 'JavaScript (Node.js)',
  language: 'javascript',
  extensions: ['.mjs', '.js', '.cjs', '.json'],
  entryDefault: 'solution.mjs',
  binary: 'node',                 // indicatif ; le chemin réel = process.execPath (serveur)
  harnessFile: '__lab_harness__.mjs',
  fileExtension: '.mjs',          // compat V8
  timeoutMs: 5000,
  maxOutputBytes: 100_000,
  capabilities: { ...DEFAULT_CAPS },
  buildHarness: buildNodeHarness,
  buildArgs(harnessFile) { return [harnessFile]; },
  env() { return { PATH: '/usr/bin:/bin', NODE_ENV: 'production' }; },
};

// ── Adaptateur Python 3 ──────────────────────────────────────────────────────
// Harnais : charge l'entrée (.py) via importlib, capture stdout, exécute les
// tests, sérialise les retours en JSON, émet la ligne marquée. Même protocole.
function pyLiteral(v) { return JSON.stringify(v); } // JSON est un sous-ensemble valide de littéraux Python via json.loads

function buildPythonHarness(exercise) {
  const entry = exercise.workspace.entry;
  const tests = exercise.tests.map((t) => ({ id: t.id, kind: t.kind, export: t.export ?? null, args: t.args ?? [] }));
  return `# Harnais genere - ne pas modifier.
import sys, json, io, importlib.util, traceback
TESTS = json.loads(${pyLiteral(JSON.stringify(tests))})
ENTRY = ${pyLiteral(entry)}
MARKER = ${pyLiteral(LAB_RESULT_MARKER)}
_buf = io.StringIO()
_real = sys.stdout
sys.stdout = _buf
sys.stderr = io.StringIO()
mod = None
import_error = None
try:
    spec = importlib.util.spec_from_file_location("user_entry", ENTRY)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
except Exception:
    import_error = traceback.format_exc()[:2000]
observed = {}
import time as _time
for t in TESTS:
    tid = t["id"]
    if t["kind"] == "call-equals":
        _t0 = _time.time()
        if import_error:
            entry = {"error": import_error}
        else:
            fn = getattr(mod, t["export"], None)
            if not callable(fn):
                entry = {"error": "export '%s' introuvable ou non-callable" % t["export"]}
            else:
                try:
                    entry = {"value": fn(*t.get("args", []))}
                except Exception as e:
                    entry = {"error": (repr(e))[:500]}
        entry["durationMs"] = int((_time.time() - _t0) * 1000)
        observed[tid] = entry
    else:
        observed[tid] = {"error": import_error, "stdout": _buf.getvalue()} if import_error else {"stdout": _buf.getvalue()}
user_stdout = _buf.getvalue()[:100000]
sys.stdout = _real
try:
    payload = json.dumps({"observed": observed, "stdout": user_stdout})
except Exception:
    payload = json.dumps({"observed": {}, "fatal": "resultat non serialisable"})
sys.stdout.write(MARKER + payload + "\\n")
`;
}

const pythonAdapter = {
  id: 'python3',
  kind: 'python',
  label: 'Python 3',
  language: 'python',
  extensions: ['.py'],
  entryDefault: 'solution.py',
  binary: 'python3',
  harnessFile: '__lab_harness__.py',
  fileExtension: '.py',
  timeoutMs: 5000,
  maxOutputBytes: 100_000,
  capabilities: { ...DEFAULT_CAPS },
  buildHarness: buildPythonHarness,
  buildArgs(harnessFile) { return [harnessFile]; },
  env() { return { PATH: '/usr/local/bin:/usr/bin:/bin', PYTHONDONTWRITEBYTECODE: '1', PYTHONUNBUFFERED: '1' }; },
};

// ── Adaptateur TypeScript ────────────────────────────────────────────────────
// PAS de second exécuteur : le pipeline compile `.ts` → `.js` (CommonJS) dans le
// workspace (lib/typescript-compile.mjs, côté serveur), puis RÉUTILISE Node pour
// exécuter le JS émis. Le harnais est en CommonJS (`require`) car le JS émis est
// du CJS : accès fiable aux exports nommés via `mod[export]`. Binaire = ce Node.
function tsEntryToJs(entry) {
  return './' + String(entry).replace(/\.tsx?$/, '.js');
}

function buildTsHarness(exercise) {
  const entryJs = tsEntryToJs(exercise.workspace.entry);
  const tests = exercise.tests.map((t) => ({ id: t.id, kind: t.kind, export: t.export ?? null, args: t.args ?? [] }));
  return `// Harnais généré — ne pas modifier.
const __chunks = [];
const __origWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (c, e, cb) => { __chunks.push(String(c)); if (typeof e === 'function') e(); else if (typeof cb === 'function') cb(); return true; };
process.stderr.write = (c, e, cb) => { if (typeof e === 'function') e(); else if (typeof cb === 'function') cb(); return true; };
const TESTS = ${JSON.stringify(tests)};
(async () => {
  let mod = null, importError = null;
  try { mod = require(${JSON.stringify(entryJs)}); }
  catch (e) { importError = String((e && e.stack) || e).slice(0, 2000); }
  if (mod && mod.default && typeof mod === 'object') { /* interop léger : exports nommés préférés */ }
  const observed = {};
  for (const t of TESTS) {
    if (t.kind === 'call-equals') {
      const __t0 = Date.now();
      let entry;
      if (importError) entry = { error: importError };
      else {
        try {
          let fn = mod[t.export];
          if (typeof fn !== 'function' && mod.default && typeof mod.default[t.export] === 'function') fn = mod.default[t.export];
          if (typeof fn !== 'function') entry = { error: "export « " + t.export + " » introuvable ou non-fonction" };
          else { const value = await fn(...(t.args || [])); entry = { value }; }
        } catch (e) { entry = { error: String((e && e.message) || e).slice(0, 500) }; }
      }
      entry.durationMs = Date.now() - __t0;
      observed[t.id] = entry;
    } else {
      observed[t.id] = importError ? { error: importError, stdout: __chunks.join('') } : { stdout: __chunks.join('') };
    }
  }
  const userStdout = __chunks.join('');
  process.stdout.write = __origWrite;
  let payload;
  try { payload = JSON.stringify({ observed, stdout: userStdout.slice(0, 100000) }); }
  catch { payload = JSON.stringify({ observed: {}, fatal: "résultat non sérialisable" }); }
  __origWrite(${JSON.stringify(LAB_RESULT_MARKER)} + payload + "\\n");
})();
`;
}

const typescriptAdapter = {
  id: 'typescript',
  kind: 'typescript',
  label: 'TypeScript',
  language: 'typescript',
  extensions: ['.ts'],            // V10 : .ts uniquement (pas de TSX/React)
  entryDefault: 'solution.ts',
  binary: 'node',                 // exécute le JS compilé (chemin réel = process.execPath)
  harnessFile: '__lab_harness__.cjs',
  fileExtension: '.ts',
  timeoutMs: 5000,
  maxOutputBytes: 100_000,
  compile: true,                  // marqueur : nécessite une phase de compilation
  capabilities: { ...DEFAULT_CAPS },
  buildHarness: buildTsHarness,
  buildArgs(harnessFile) { return [harnessFile]; },
  env() { return { PATH: '/usr/bin:/bin', NODE_ENV: 'production' }; },
};

// ── Adaptateur Web (preview HTML/CSS/JS) ─────────────────────────────────────
// Runtime de PREVIEW, PAS d'exécution serveur : le code s'affiche dans une iframe
// sandboxée (srcDoc) côté navigateur. Aucun binaire, aucun harnais serveur.
// La notation des tests web est faite côté serveur par un modèle DOM minimal
// (lib/frontend-dom.mjs) + l'exécuteur Node existant pour le JS (voir ADR-011).
const webAdapter = {
  id: 'web',
  kind: 'web',
  label: 'HTML / CSS / JavaScript',
  language: 'html',
  extensions: ['.html', '.htm', '.css', '.js', '.json'],
  entryDefault: 'index.html',
  fileExtension: '.html',
  preview: true,                  // marqueur : runtime de preview (pas de spawn)
  executable: false,
  timeoutMs: 5000,
  maxOutputBytes: 100_000,
  capabilities: {
    execution: false, preview: true, publicTests: true, privateTests: true,
    multiFile: true, stdin: false, cancellation: true, timeout: true, syntaxHighlighting: true,
  },
  // Pas de binary / buildHarness / buildArgs : non exécutable via execFile.
  env() { return {}; },
};

// ── Adaptateur React/TSX (preview React + notation serveur) ──────────────────
// Runtime de PREVIEW comme `web` : compile TSX/JSX → JS ; la preview monte un vrai
// React 19 dans l'iframe sandboxée V11 (React fourni localement, sans CDN) ; la
// notation se fait CÔTÉ SERVEUR par rendu react-dom/server + modèle DOM V11.
// Voir docs/ADR-012. Comme `web` : aucun binaire, aucun harnais serveur ici.
const reactAdapter = {
  id: 'react-tsx',
  kind: 'react',
  label: 'React (TSX/JSX)',
  language: 'tsx',
  extensions: ['.tsx', '.ts', '.jsx', '.js', '.css', '.json'],
  entryDefault: 'App.tsx',
  fileExtension: '.tsx',
  preview: true,
  executable: false,
  compile: true,                  // nécessite une compilation TSX/JSX
  timeoutMs: 8000,
  maxOutputBytes: 100_000,
  capabilities: {
    execution: false, preview: true, publicTests: true, privateTests: true,
    multiFile: true, stdin: false, cancellation: true, timeout: true, syntaxHighlighting: true,
  },
  env() { return {}; },
};

// ── Adaptateur Python + Data (numpy/pandas/scikit-learn) — track OPT-IN ───────
// Réutilise le harnais Python EXISTANT et la notation commune (PAS un second
// moteur, cf. ADR-047). Le binaire est celui d'un venv de projet provisionné
// (.venv-ds), résolu côté serveur (runtime-detect). Disponible SEULEMENT si le
// venv existe et numpy est importable ; sinon les exercices sont sautés
// proprement (TOOLING_ENVIRONMENT_REQUIRED).
const pythonDsAdapter = {
  id: 'python-ds',
  kind: 'python',
  label: 'Python + Data (numpy / pandas / scikit-learn)',
  language: 'python',
  extensions: ['.py'],
  entryDefault: 'solution.py',
  binary: 'python3',              // indicatif ; le vrai chemin = venv (serveur)
  harnessFile: '__lab_harness__.py',
  fileExtension: '.py',
  timeoutMs: 8000,               // tooling plus lourd (import pandas/sklearn)
  maxOutputBytes: 100_000,
  capabilities: { ...DEFAULT_CAPS },
  buildHarness: buildPythonHarness,
  buildArgs(harnessFile) { return [harnessFile]; },
  // Le python du venv résout seul son site-packages : pas de PYTHONPATH requis.
  env() { return { PATH: '/usr/local/bin:/usr/bin:/bin', PYTHONDONTWRITEBYTECODE: '1', PYTHONUNBUFFERED: '1' }; },
};

const ADAPTERS = { 'node-js': nodeAdapter, 'python3': pythonAdapter, 'python-ds': pythonDsAdapter, typescript: typescriptAdapter, web: webAdapter, 'react-tsx': reactAdapter };
export const DEFAULT_RUNTIME_ID = 'node-js';

export function getRuntimeAdapter(id) {
  return Object.hasOwn(ADAPTERS, id) ? ADAPTERS[id] : null;
}
export function isKnownRuntime(id) {
  return Object.hasOwn(ADAPTERS, id);
}
export function listRuntimeAdapters() {
  return Object.values(ADAPTERS);
}
// Vue compat V8 : map + accès unitaire (utilisée par exercise.mjs).
export const RUNTIMES = ADAPTERS;
export function getRuntime(id) {
  return getRuntimeAdapter(id);
}
