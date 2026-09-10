// Harnais web généré — ne pas modifier.
import { readFileSync } from 'node:fs';
import { parseHTML, evalWebTest } from './__frontend_dom__.mjs';

const MARKER = "__LAB_RESULT__";
const ENTRY = "index.html";
const JS_PATHS = ["app.js"];
const TESTS = [{"id":"t1","name":"clic → Ouvert","kind":"event-changes-text","selector":"#msg","attribute":null,"property":null,"expected":"Ouvert","action":{"type":"click","selector":"#go"}}];

const html = readFileSync(ENTRY, 'utf8');
const jsSource = JS_PATHS.map((p) => { try { return readFileSync(p, 'utf8'); } catch { return ''; } }).join('\n;\n');

// Construit un document neuf, exécute le JS de l'apprenant, capture la console.
function buildDoc() {
  const doc = parseHTML(html);
  const logs = [];
  const push = (lvl) => (...a) => { logs.push(a.map(String).join(' ')); };
  const consoleShim = { log: push('log'), info: push('info'), warn: push('warn'), error: push('error'), debug: push('debug') };
  const win = { document: doc, addEventListener: (t, f) => doc.addEventListener(t, f), console: consoleShim };
  win.window = win;
  let error = null;
  try {
    // Portée globale partagée entre fichiers (comme des <script> classiques).
    const fn = new Function('document', 'window', 'console', 'setTimeout', 'clearTimeout', jsSource);
    fn(doc, win, consoleShim, (cb) => { try { cb(); } catch { /* borné */ } return 0; }, () => {});
  } catch (e) { error = String((e && e.message) || e).slice(0, 500); logs.push('Erreur : ' + error); }
  return { doc, consoleText: logs.join('\n'), error };
}

function dispatch(doc, action) {
  if (!action) return;
  const el = doc.querySelector(action.selector);
  if (!el) return;
  const times = Number.isInteger(action.times) && action.times > 0 ? action.times : 1;
  for (let i = 0; i < times; i++) {
    if (action.type === 'input') { el.value = action.value ?? ''; el.dispatchEvent({ type: 'input' }); }
    else { el.dispatchEvent({ type: 'click' }); }
  }
}

const base = buildDoc();
const observed = {};
for (const t of TESTS) {
  try {
    if (t.kind === 'event-changes-text') {
      const d = buildDoc();          // isolation : DOM neuf par test événementiel
      dispatch(d.doc, t.action);
      observed[t.id] = evalWebTest(t, d.doc, d.consoleText);
    } else {
      observed[t.id] = evalWebTest(t, base.doc, base.consoleText);
    }
  } catch (e) {
    observed[t.id] = { testId: t.id, name: t.name, passed: false, expected: t.expected ?? null, actual: null, message: String((e && e.message) || e).slice(0, 300) };
  }
}
let payload;
try { payload = JSON.stringify({ observed, stdout: base.consoleText.slice(0, 100000) }); }
catch { payload = JSON.stringify({ observed: {}, fatal: 'résultat non sérialisable' }); }
process.stdout.write(MARKER + payload + '\n');
