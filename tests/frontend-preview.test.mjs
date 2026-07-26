// CP3 — construction pure du srcDoc de preview. Invariants structurels & sécurité.
// (Les comportements runtime navigateur — capture d'erreurs, plafonnement des
// logs, blocage réseau/navigation — sont validés dans un vrai navigateur en CP4/CP10.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPreviewDoc, PREVIEW_CSP, makeChannel } from '../lib/frontend-preview.mjs';

const CH = 'ch_test_fixed';
const build = (files, entry) => buildPreviewDoc(files, { channel: CH, entry });

test('HTML minimal (sans <html>) → enveloppé + CSP + bootstrap', () => {
  const { srcDoc } = build([{ path: 'index.html', content: '<h1>Salut</h1>' }]);
  assert.match(srcDoc, /<html[\s>]/i);
  assert.match(srcDoc, /Content-Security-Policy/);
  assert.match(srcDoc, /<h1>Salut<\/h1>/);
  assert.match(srcDoc, /ch_test_fixed/); // canal injecté
});

test('CSP : default-src none, connect-src none, pas de allow-same-origin', () => {
  assert.match(PREVIEW_CSP, /default-src 'none'/);
  assert.match(PREVIEW_CSP, /connect-src 'none'/);
  assert.match(PREVIEW_CSP, /form-action 'none'/);
  assert.match(PREVIEW_CSP, /base-uri 'none'/);
});

test('plusieurs CSS injectés dans le <head>, ordre déclaré', () => {
  const { srcDoc, cssOrder } = build([
    { path: 'index.html', content: '<html><head></head><body></body></html>' },
    { path: 'a.css', content: 'h1{color:red}' },
    { path: 'b.css', content: 'p{margin:0}' },
  ]);
  assert.deepEqual(cssOrder, ['a.css', 'b.css']);
  const head = srcDoc.slice(0, srcDoc.toLowerCase().indexOf('</head>'));
  assert.ok(head.includes('color:red') && head.includes('margin:0'));
  assert.ok(srcDoc.indexOf('color:red') < srcDoc.indexOf('margin:0')); // ordre stable
});

test('plusieurs JS injectés en fin de <body>, ordre déclaré déterministe', () => {
  const { srcDoc, jsOrder } = build([
    { path: 'index.html', content: '<html><head></head><body><div id="x"></div></body></html>' },
    { path: '1-first.js', content: 'window.__a=1' },
    { path: '2-second.js', content: 'window.__b=2' },
  ]);
  assert.deepEqual(jsOrder, ['1-first.js', '2-second.js']);
  assert.ok(srcDoc.indexOf('__a=1') < srcDoc.indexOf('__b=2'));
  // scripts après le contenu du body
  assert.ok(srcDoc.indexOf('id="x"') < srcDoc.indexOf('__a=1'));
});

test('séquence </script> dans le JS neutralisée', () => {
  const { srcDoc } = build([
    { path: 'index.html', content: '<html><head></head><body></body></html>' },
    { path: 'app.js', content: 'var s = "</script><script>alert(1)</script>";' },
  ]);
  // la séquence de fermeture littérale ne doit pas casser hors du script injecté
  assert.equal(srcDoc.includes('</script><script>alert(1)'), false);
  assert.match(srcDoc, /<\\\/script/); // neutralisée en <\/script
});

test('séquence </style> dans le CSS neutralisée', () => {
  const { srcDoc } = build([
    { path: 'index.html', content: '<html><head></head><body></body></html>' },
    { path: 'x.css', content: 'a{}</style><script>alert(1)</script>' },
  ]);
  assert.equal(srcDoc.includes('</style><script>alert(1)'), false);
});

test('HTML sans <body> → scripts tout de même injectés', () => {
  const { srcDoc } = build([
    { path: 'index.html', content: '<html><head></head></html>' },
    { path: 'app.js', content: 'console.log(1)' },
  ]);
  assert.match(srcDoc, /console\.log\(1\)/);
});

test('HTML sans <head> → head (CSP+bootstrap) injecté', () => {
  const { srcDoc } = build([
    { path: 'index.html', content: '<html><body><p>hi</p></body></html>' },
  ]);
  assert.match(srcDoc, /Content-Security-Policy/);
  assert.match(srcDoc, /<head>/i);
});

test('entrée : index.html par défaut ; entrée explicite respectée', () => {
  const files = [
    { path: 'index.html', content: '<html><body>A</body></html>' },
    { path: 'other.html', content: '<html><body>B</body></html>' },
  ];
  assert.equal(build(files).entry, 'index.html');
  assert.equal(build(files, 'other.html').entry, 'other.html');
  assert.match(build(files, 'other.html').srcDoc, />B</);
});

test('déterminisme : même entrée + canal → même srcDoc', () => {
  const files = [{ path: 'index.html', content: '<html><body>X</body></html>' }, { path: 'a.css', content: 'b{}' }];
  assert.equal(build(files).srcDoc, build(files).srcDoc);
});

test('canal aléatoire non devinable (makeChannel)', () => {
  const a = makeChannel(), b = makeChannel();
  assert.notEqual(a, b);
  assert.match(a, /^ch_/);
  assert.ok(a.length >= 12);
});

test('aucune donnée hors des fichiers fournis n’apparaît', () => {
  const { srcDoc } = build([{ path: 'index.html', content: '<html><body>ok</body></html>' }]);
  // pas de fuite d'un secret hypothétique : le builder ne reçoit que le public
  assert.equal(srcDoc.includes('REPONSE_SECRETE'), false);
  assert.equal(srcDoc.includes('expected'), false);
});

test('bootstrap : instrumente console + capture error + unhandledrejection', () => {
  const { srcDoc } = build([{ path: 'index.html', content: '<html><body></body></html>' }]);
  assert.match(srcDoc, /addEventListener\('error'/);
  assert.match(srcDoc, /addEventListener\('unhandledrejection'/);
  assert.match(srcDoc, /console\[m\]/);
  assert.match(srcDoc, /type:'ready'/);
});
