// CP3 (V12) — compilateur TSX/JSX pur. Déterministe. Type-check réel.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileReactExercise, REACT_ALLOWLIST } from '../lib/react-compile.mjs';

const f = (path, content) => ({ path, content });

test('composant TSX simple → success + JS émis (jsx-runtime)', () => {
  const r = compileReactExercise([f('App.tsx', 'export default function App() { return <h1 className="t">Salut</h1>; }')]);
  assert.equal(r.success, true, JSON.stringify(r.diagnostics));
  assert.ok(r.emittedFiles['App.js']);
  assert.match(r.emittedFiles['App.js'], /jsx|createElement|jsxRuntime|_jsx/);
});

test('composant JSX simple (.jsx) → success', () => {
  const r = compileReactExercise([f('App.jsx', 'export default function App() { return <p>hi</p>; }')]);
  assert.equal(r.success, true, JSON.stringify(r.diagnostics));
});

test('props typées correctes → success', () => {
  const r = compileReactExercise([f('App.tsx', 'export default function App({ name }: { name: string }) { return <h1>Bonjour {name}</h1>; }')]);
  assert.equal(r.success, true, JSON.stringify(r.diagnostics));
});

test('erreur TypeScript (props) → échec + diagnostic localisé', () => {
  const r = compileReactExercise([f('App.tsx', 'export default function App() { const n: number = "x"; return <b>{n}</b>; }')]);
  assert.equal(r.success, false);
  assert.deepEqual(r.emittedFiles, {});
  const d = r.diagnostics[0];
  assert.equal(d.category, 'error');
  assert.equal(d.file, 'App.tsx');
  assert.equal(typeof d.line, 'number');
});

test('erreur JSX (balise non fermée) → échec', () => {
  const r = compileReactExercise([f('App.tsx', 'export default function App() { return <div><span>; }')]);
  assert.equal(r.success, false);
  assert.ok(r.diagnostics.length >= 1);
});

test('import relatif d’un composant → success + deux modules émis', () => {
  const r = compileReactExercise([
    f('App.tsx', 'import Button from "./Button";\nexport default function App() { return <Button label="Go" />; }'),
    f('Button.tsx', 'export default function Button({ label }: { label: string }) { return <button>{label}</button>; }'),
  ]);
  assert.equal(r.success, true, JSON.stringify(r.diagnostics));
  assert.ok(r.emittedFiles['App.js'] && r.emittedFiles['Button.js']);
});

test('import CSS relatif accepté (collecté, non compilé)', () => {
  const r = compileReactExercise([
    f('App.tsx', 'import "./styles.css";\nexport default function App() { return <i/>; }'),
    f('styles.css', 'i{color:red}'),
  ]);
  assert.equal(r.success, true, JSON.stringify(r.diagnostics));
  assert.deepEqual(r.cssFiles, ['styles.css']);
});

test('import relatif introuvable → diagnostic', () => {
  const r = compileReactExercise([f('App.tsx', 'import X from "./manque";\nexport default function App() { return <X/>; }')]);
  assert.equal(r.success, false);
  assert.equal(r.diagnostics[0].code, 'LAB_IMPORT');
  assert.match(r.diagnostics[0].message, /introuvable/);
});

test('import npm arbitraire → rejeté avant compilation', () => {
  const r = compileReactExercise([f('App.tsx', 'import _ from "lodash";\nexport default function App() { return <i/>; }')]);
  assert.equal(r.success, false);
  assert.equal(r.diagnostics[0].code, 'LAB_IMPORT');
  assert.match(r.diagnostics[0].message, /externe/);
});

test('imports React autorisés (react, react-dom/client, jsx-runtime)', () => {
  assert.ok(REACT_ALLOWLIST.has('react') && REACT_ALLOWLIST.has('react-dom/client') && REACT_ALLOWLIST.has('react/jsx-runtime'));
  const r = compileReactExercise([f('App.tsx', 'import { useState } from "react";\nexport default function App() { const [n] = useState(0); return <b>{n}</b>; }')]);
  assert.equal(r.success, true, JSON.stringify(r.diagnostics));
});

test('import absolu / URL → rejetés', () => {
  assert.equal(compileReactExercise([f('App.tsx', 'import x from "/etc/passwd";\nexport default ()=><i/>')]).diagnostics[0].message.match(/absolus/) ? true : false, true);
  assert.match(compileReactExercise([f('App.tsx', 'import x from "https://evil/mod.js";\nexport default ()=><i/>')]).diagnostics[0].message, /URL/);
});

test('contenu binaire (NUL) → rejeté', () => {
  const r = compileReactExercise([f('App.tsx', 'export default ()=><i/>' + String.fromCharCode(0))]);
  assert.equal(r.success, false);
  assert.equal(r.diagnostics[0].code, 'LAB_BINARY');
});

test('cycle de modules → compile (résolu au runtime par le loader CJS)', () => {
  const r = compileReactExercise([
    f('App.tsx', 'import { b } from "./b";\nexport const a = 1;\nexport default function App(){ return <b>{b}</b>; }'),
    f('b.tsx', 'import { a } from "./App";\nexport const b = 2;'),
  ]);
  assert.equal(r.success, true, JSON.stringify(r.diagnostics));
});

test('séquence </script> dans une chaîne → compile (neutralisation au srcDoc, pas ici)', () => {
  const r = compileReactExercise([f('App.tsx', 'export default function App(){ const s = "</script>"; return <b>{s}</b>; }')]);
  assert.equal(r.success, true, JSON.stringify(r.diagnostics));
});

test('déterminisme : même entrée → même sortie', () => {
  const files = [f('App.tsx', 'export default function App() { return <h1>X</h1>; }')];
  assert.equal(compileReactExercise(files).emittedFiles['App.js'], compileReactExercise(files).emittedFiles['App.js']);
});

test('noEmitOnError : une erreur bloque toute émission', () => {
  const r = compileReactExercise([
    f('App.tsx', 'export default function App(){ return <b>ok</b>; }'),
    f('Bad.tsx', 'export const x: number = "nope";'),
  ]);
  assert.equal(r.success, false);
  assert.deepEqual(r.emittedFiles, {});
});
