// Construction PURE du document de preview REACT (srcDoc) — réutilise la CSP, le
// bootstrap console/erreurs et le canal de V11. React 19 est fourni LOCALEMENT
// (aucun CDN, aucun réseau) : les sources de PRODUCTION de react / scheduler /
// react-dom / react-dom/client / react/jsx-runtime sont lues côté serveur et
// injectées dans un MICRO-SYSTÈME CommonJS à l'intérieur de l'iframe → une seule
// instance React (pas d'« invalid hook call »). Voir docs/ADR-012.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { PREVIEW_CSP, previewBootstrap, makeChannel } from './frontend-preview.mjs';

export { makeChannel };

const requireHere = createRequire(import.meta.url);

// Résout le dossier `cjs` d'un package installé.
function pkgCjs(pkg) { return join(dirname(requireHere.resolve(pkg + '/package.json')), 'cjs'); }

// Lecture PARESSEUSE et mise en cache des sources React de production.
let _reactSrc = null;
function reactSources() {
  if (_reactSrc) return _reactSrc;
  const reactCjs = pkgCjs('react');
  const domCjs = pkgCjs('react-dom');
  const schedCjs = pkgCjs('scheduler');
  _reactSrc = {
    react: readFileSync(join(reactCjs, 'react.production.js'), 'utf8'),
    'react/jsx-runtime': readFileSync(join(reactCjs, 'react-jsx-runtime.production.js'), 'utf8'),
    'react/jsx-dev-runtime': readFileSync(join(reactCjs, 'react-jsx-runtime.production.js'), 'utf8'),
    scheduler: readFileSync(join(schedCjs, 'scheduler.production.js'), 'utf8'),
    'react-dom': readFileSync(join(domCjs, 'react-dom.production.js'), 'utf8'),
    'react-dom/client': readFileSync(join(domCjs, 'react-dom-client.production.js'), 'utf8'),
  };
  return _reactSrc;
}

function neutralize(code) { return String(code).replace(/<\/(script)/gi, '<\\/$1'); }
function jstr(s) { return JSON.stringify(String(s)); }

// Micro-loader CommonJS (exécuté DANS l'iframe). Résout les modules React (par
// nom) et les modules utilisateur (par chemin relatif) ; les .css/.json → {}.
const LOADER = `
var __mods = {};
function __def(name, fn){ __mods[name] = { fn: fn, mod: { exports: {} }, loaded: false }; }
function __dir(p){ var i = p.lastIndexOf('/'); return i < 0 ? '' : p.slice(0, i); }
function __norm(p){ var out = []; p.split('/').forEach(function(s){ if(s==''||s=='.') return; if(s=='..'){ if(out.length && out[out.length-1]!='..') out.pop(); else out.push('..'); } else out.push(s); }); return out.join('/'); }
function __resolve(from, spec){
  if (__mods[spec]) return spec;
  if (spec.charAt(0) !== '.') return spec;                    // nom de package (React)
  var base = __norm(__dir(from) + '/' + spec);
  var cands = [base, base + '.js', base + '/index.js'];
  for (var i=0;i<cands.length;i++){ if(__mods[cands[i]]) return cands[i]; }
  return base + '.js';
}
function __makeRequire(from){
  return function(spec){
    if (/\\.(css|json)$/.test(spec)) return {};
    var key = __resolve(from, spec);
    var m = __mods[key];
    if (!m) throw new Error('Module introuvable : ' + spec);
    if (!m.loaded){ m.loaded = true; m.fn(m.mod.exports, __makeRequire(key), m.mod); }
    return m.mod.exports;
  };
}
`;

/**
 * Construit le srcDoc de preview React.
 * @param {object} opts
 * @param {Record<string,string>} opts.modules  JS compilé { 'App.js': source, ... }
 * @param {string} opts.entryJs   module d'entrée (ex. 'App.js')
 * @param {string} [opts.css]     CSS concaténé à injecter
 * @param {string} [opts.channel]
 * @returns {{ srcDoc:string, channel:string }}
 */
export function buildReactPreviewDoc({ modules = {}, entryJs = 'App.js', css = '', channel } = {}) {
  const ch = String(channel || makeChannel());
  const src = reactSources();

  // Définition d'un module (wrapper CJS : fn(exports, require, module)).
  const def = (name, code) => `__def(${jstr(name)}, function(exports, require, module){\n${neutralize(code)}\n});`;

  const reactDefs = Object.entries(src).map(([name, code]) => def(name, code)).join('\n');
  const userDefs = Object.entries(modules).map(([path, code]) => def(path, code)).join('\n');

  const meta = `<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP.replace(/"/g, '&quot;')}">`;
  const style = css ? `<style>${String(css).replace(/<\/(style)/gi, '<\\/$1')}</style>` : '';

  const mount = `
try {
  var __req = __makeRequire('');
  var React = __req('react');
  var ReactDOMClient = __req('react-dom/client');
  var __entry = __req(${jstr(entryJs)});
  var App = __entry && (__entry.default || __entry);
  if (typeof App !== 'function') throw new Error("L'entrée doit exporter un composant React par défaut.");
  var __root = ReactDOMClient.createRoot(document.getElementById('root'));
  __root.render(React.createElement(App));
} catch (e) {
  try { parent.postMessage({ channel: ${jstr(ch)}, type: 'error', level: 'error', text: 'Erreur de rendu : ' + ((e && e.message) || e) }, '*'); } catch (_e) {}
  var r = document.getElementById('root'); if (r) r.textContent = 'Erreur de rendu (voir Console).';
}
`;

  const srcDoc = `<!doctype html>
<html lang="fr">
<head>
${meta}
<script>window.process = { env: { NODE_ENV: 'production' } };</script>
${previewBootstrap(ch)}
${style}
</head>
<body>
<div id="root"></div>
<script>
${LOADER}
${reactDefs}
${userDefs}
${mount}
</script>
</body>
</html>`;
  return { srcDoc, channel: ch };
}
