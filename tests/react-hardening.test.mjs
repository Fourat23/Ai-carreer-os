// CP10 (V12) — durcissement de la PREVIEW React (srcDoc + iframe sandboxée).
// La preview React réutilise la CSP et la neutralisation de V11 mais injecte un
// vrai React 19 LOCAL. On prouve ici les propriétés de sécurité propres au
// document généré et au bac à sable, en complément de react-compile (imports)
// et react-grade (redaction des tests privés).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildReactPreviewDoc, makeChannel } from '../lib/react-preview.mjs';

const build = (over = {}) => buildReactPreviewDoc({
  modules: { 'App.js': "const React=require('react');module.exports.default=function App(){return React.createElement('h1',null,'Salut MINE');};" },
  entryJs: 'App.js', channel: 'chan-fixe', ...over,
});

test('CSP stricte : default-src none + connect-src none, jamais allow-same-origin', () => {
  const { srcDoc } = build();
  assert.match(srcDoc, /default-src 'none'/);
  assert.match(srcDoc, /connect-src 'none'/);
  assert.equal(/allow-same-origin/.test(srcDoc), false);
});

test('aucun CDN : aucune sous-ressource externe (script src / link href distant)', () => {
  const { srcDoc } = build();
  // React est INLINE (__def), jamais chargé via une balise distante. (Les chaînes
  // https:// internes à React — décodeur d'erreurs — ne sont pas des requêtes.)
  assert.equal(/<script[^>]+src\s*=/.test(srcDoc), false);
  assert.equal(/<link[^>]+href\s*=\s*["']https?:/.test(srcDoc), false);
  assert.equal(/src\s*=\s*["']https?:/.test(srcDoc), false);
});

test('React fourni localement : react + react-dom/client définis dans le document', () => {
  const { srcDoc } = build();
  assert.match(srcDoc, /__def\("react"/);
  assert.match(srcDoc, /__def\("react-dom\/client"/);
  assert.match(srcDoc, /createRoot/);
});

test('séquence </script> dans le code apprenant neutralisée', () => {
  const { srcDoc } = build({ modules: { 'App.js': "module.exports.default=function(){return null;};// </script><script>alert(1)" } });
  assert.equal(srcDoc.includes('</script><script>alert(1)'), false);
  assert.match(srcDoc, /<\\\/script>/); // échappée
});

test('déterminisme : mêmes modules + canal → même srcDoc', () => {
  assert.equal(build().srcDoc, build().srcDoc);
});

test('canal aléatoire non devinable (≥ 16 hex)', () => {
  const c = makeChannel();
  assert.match(c, /^ch_[0-9a-f]{16,}$/);
  assert.notEqual(makeChannel(), makeChannel());
});

test('anti-fuite : seuls les modules/css fournis apparaissent (rien d’autre)', () => {
  const SENTINEL = 'VALEUR_PRIVEE_ATTENDUE_XYZ';
  const { srcDoc } = build({ css: '.a{color:red}' });
  assert.equal(srcDoc.includes(SENTINEL), false);   // aucune donnée hors entrée
  assert.match(srcDoc, /Salut MINE/);               // le code fourni est bien là
  assert.match(srcDoc, /color:red/);                // le css fourni est bien là
});

test('bac à sable de l’iframe : allow-scripts SEUL (pas de same-origin/popups/top-nav/downloads)', () => {
  const src = readFileSync('app/lab/[exerciseId]/ReactPreview.tsx', 'latin1');
  const m = src.match(/sandbox="([^"]*)"/);
  assert.ok(m, 'attribut sandbox présent');
  assert.equal(m[1].trim(), 'allow-scripts');
  for (const tok of ['allow-same-origin', 'allow-popups', 'allow-top-navigation', 'allow-downloads', 'allow-modals']) {
    assert.equal(m[1].includes(tok), false, `sandbox ne doit pas contenir ${tok}`);
  }
});
