// CP9 (V11) — sauvegarde/restauration des workspaces web (schéma v3 générique).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serializeBackupV3, parseBackupV3, sanitizeWorkspaces } from '../lib/backup.mjs';
import { migrateToV7 } from '../lib/progress-store.mjs';

const NOW = '2026-07-26T00:00:00.000Z';
// Allowlist réaliste : seuls les fichiers ÉDITABLES non-test (pas les .html/.css
// en lecture seule, pas les fichiers de test privés).
const allow = new Map([['web-counter', new Set(['app.js', 'style.css'])], ['web-card', new Set(['index.html', 'style.css'])]]);
const v3 = migrateToV7({ startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} });

test('round-trip : workspace web (html/css/js éditables) préservé', () => {
  const ws = {
    'web-counter': { files: { 'app.js': "btn.addEventListener('click', ()=>{});", 'style.css': 'button{color:red}' } },
    'web-card': { files: { 'index.html': '<html><body>MINE</body></html>' } },
  };
  const r = parseBackupV3(JSON.stringify(serializeBackupV3(v3, ws, new Date(NOW))), allow);
  assert.equal(r.ok, true);
  assert.match(r.workspaces['web-counter'].files['app.js'], /addEventListener/);
  assert.match(r.workspaces['web-card'].files['index.html'], /MINE/);
});

test('sécurité : fichier web en lecture seule et hors-allowlist filtrés', () => {
  const raw = {
    'web-counter': { files: {
      'app.js': 'ok',
      'index.html': '<html>lecture seule</html>',   // hors allowlist (readOnly)
      '../evil.js': 'traversal',
      'secret.test.js': 'LEAK',
    } },
  };
  const { workspaces, warnings } = sanitizeWorkspaces(raw, allow);
  assert.deepEqual(Object.keys(workspaces['web-counter'].files), ['app.js']);
  assert.ok(warnings.length >= 2);
});

test('sécurité : contenu binaire (NUL) dans un .js ignoré', () => {
  const raw = { 'web-counter': { files: { 'app.js': 'x' + String.fromCharCode(0) } } };
  const { workspaces } = sanitizeWorkspaces(raw, allow);
  assert.equal(workspaces['web-counter'], undefined);
});
