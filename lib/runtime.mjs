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
for t in TESTS:
    tid = t["id"]
    if t["kind"] == "call-equals":
        if import_error:
            observed[tid] = {"error": import_error}
            continue
        fn = getattr(mod, t["export"], None)
        if not callable(fn):
            observed[tid] = {"error": "export '%s' introuvable ou non-callable" % t["export"]}
            continue
        try:
            val = fn(*t.get("args", []))
            observed[tid] = {"value": val}
        except Exception as e:
            observed[tid] = {"error": (repr(e))[:500]}
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

const ADAPTERS = { 'node-js': nodeAdapter, 'python3': pythonAdapter };
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
