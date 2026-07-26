// Harnais de NOTATION des exercices web — exécuté dans l'exécuteur Node EXISTANT
// (processus enfant cloisonné : shell:false, timeout+SIGKILL, sortie plafonnée,
// env minimal). Le JS de l'apprenant s'exécute contre le modèle DOM minimal
// (frontend-dom), puis les assertions (publiques ET privées) sont évaluées côté
// serveur. Rien de tout cela n'entre dans le srcDoc de preview.
import { LAB_RESULT_MARKER } from './runtime.mjs';

const DOM_MODULE = '__frontend_dom__.mjs';

/**
 * Construit le fichier harnais (.mjs) pour un exercice web.
 * @param {object} exercise  { workspace:{entry}, tests:[...] }
 * @param {string[]} jsPaths chemins des fichiers .js à exécuter, dans l'ordre
 */
export function buildWebHarness(exercise, jsPaths) {
  const entry = exercise.workspace.entry;
  const tests = exercise.tests.map((t) => ({
    id: t.id, name: t.name, kind: t.kind, selector: t.selector ?? null,
    attribute: t.attribute ?? null, property: t.property ?? null,
    expected: t.expected ?? null, action: t.action ?? null,
  }));
  return `// Harnais web généré — ne pas modifier.
import { readFileSync } from 'node:fs';
import { parseHTML, evalWebTest } from './${DOM_MODULE}';

const MARKER = ${JSON.stringify(LAB_RESULT_MARKER)};
const ENTRY = ${JSON.stringify(entry)};
const JS_PATHS = ${JSON.stringify(jsPaths)};
const TESTS = ${JSON.stringify(tests)};

const html = readFileSync(ENTRY, 'utf8');
const jsSource = JS_PATHS.map((p) => { try { return readFileSync(p, 'utf8'); } catch { return ''; } }).join('\\n;\\n');

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
  return { doc, consoleText: logs.join('\\n'), error };
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
process.stdout.write(MARKER + payload + '\\n');
`;
}

export { DOM_MODULE };
