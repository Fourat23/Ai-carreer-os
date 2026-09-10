// Harnais React généré — ne pas modifier.
import { createRequire } from 'node:module';
import { parseHTML, evalReactTest } from './__frontend_dom__.mjs';

const require = createRequire(import.meta.url);
const MARKER = "__LAB_RESULT__";
const ENTRY = "./App.js";
const TESTS = [{"id":"t1","name":"message présent → alerte visible","kind":"conditional-visible","selector":".alert","attribute":null,"role":null,"expected":true,"props":{"message":"Erreur !"}},{"id":"t2","name":"message affiché","kind":"text-contains","selector":".alert","attribute":null,"role":null,"expected":"Erreur !","props":{"message":"Erreur !"}},{"id":"t3","name":"message vide → pas d’alerte","kind":"conditional-visible","selector":".alert","attribute":null,"role":null,"expected":false,"props":{}},{"id":"t4","name":"espaces seuls → pas d’alerte (privé)","kind":"element-count","selector":".alert","attribute":null,"role":null,"expected":0,"props":{"message":""}}];

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
    observed[t.id] = evalReactTest(t, doc, logs.join('\n'));
  } catch (e) {
    observed[t.id] = { testId: t.id, name: t.name, passed: false, expected: t.expected ?? null, actual: null, message: String((e && e.message) || e).slice(0, 300) };
  }
}

global.console = origConsole;
let payload;
try { payload = JSON.stringify({ observed, stdout: logs.join('\n').slice(0, 100000) }); }
catch { payload = JSON.stringify({ observed: {}, fatal: 'résultat non sérialisable' }); }
process.stdout.write(MARKER + payload + '\n');
