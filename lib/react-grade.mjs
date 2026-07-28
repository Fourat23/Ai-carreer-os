// Harnais de NOTATION des exercices React — exécuté dans l'exécuteur Node
// EXISTANT (processus cloisonné). Le composant compilé est rendu par
// react-dom/server (renderToStaticMarkup) avec les `props` du test, puis le HTML
// est analysé par le modèle DOM V11 et les assertions (publiques ET privées)
// sont évaluées CÔTÉ SERVEUR. Rien n'entre dans le srcDoc de preview.
// Voir ADR-012 : le rendu statique note structure / props / état initial /
// listes / accessibilité (les transitions par événement réel sont vues dans la
// preview, non notées ici).
import { LAB_RESULT_MARKER } from './runtime.mjs';

const DOM_MODULE = '__frontend_dom__.mjs';

export function buildReactHarness(exercise, entryJs) {
  const tests = exercise.tests.map((t) => ({
    id: t.id, name: t.name, kind: t.kind, selector: t.selector ?? null,
    attribute: t.attribute ?? null, role: t.role ?? null, expected: t.expected ?? null,
    props: t.props ?? {},
  }));
  return `// Harnais React généré — ne pas modifier.
import { createRequire } from 'node:module';
import { parseHTML, evalReactTest } from './${DOM_MODULE}';

const require = createRequire(import.meta.url);
const MARKER = ${JSON.stringify(LAB_RESULT_MARKER)};
const ENTRY = ${JSON.stringify('./' + entryJs)};
const TESTS = ${JSON.stringify(tests)};

const logs = [];
const push = () => (...a) => { logs.push(a.map(String).join(' ')); };
const origConsole = global.console;
global.console = { log: push(), info: push(), warn: push(), error: push(), debug: push() };

let React, renderToStaticMarkup, Entry, loadError = null;
try {
  React = require('react');
  ({ renderToStaticMarkup } = require('react-dom/server'));
  const mod = require(ENTRY);
  Entry = (mod && (mod.default || mod.App)) || mod;
} catch (e) { loadError = String((e && e.stack) || e).slice(0, 1000); }

const observed = {};
for (const t of TESTS) {
  try {
    if (typeof Entry !== 'function') { observed[t.id] = { testId: t.id, name: t.name, passed: false, expected: t.expected ?? null, actual: null, message: loadError ? ('Erreur de chargement : ' + loadError) : "L'entrée n'exporte pas un composant React." }; continue; }
    logs.length = 0;
    const html = renderToStaticMarkup(React.createElement(Entry, t.props || {}));
    const doc = parseHTML(html);
    observed[t.id] = evalReactTest(t, doc, logs.join('\\n'));
  } catch (e) {
    observed[t.id] = { testId: t.id, name: t.name, passed: false, expected: t.expected ?? null, actual: null, message: String((e && e.message) || e).slice(0, 300) };
  }
}

global.console = origConsole;
let payload;
try { payload = JSON.stringify({ observed, stdout: logs.join('\\n').slice(0, 100000) }); }
catch { payload = JSON.stringify({ observed: {}, fatal: 'résultat non sérialisable' }); }
process.stdout.write(MARKER + payload + '\\n');
`;
}

export { DOM_MODULE };
