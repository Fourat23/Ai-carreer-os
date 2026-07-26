// Sauvegarde / restauration des workspaces TypeScript (schéma v3, générique).
// Vérifie que les fichiers `.ts` éditables sont persistés et restaurés, que les
// fichiers en lecture seule et les tests privés .ts ne fuient jamais, que les
// limites s'appliquent, et que la progression contenant des compétences/preuves
// TypeScript migre proprement depuis un format plat (V4/V5/V6 → V10).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serializeBackupV3, parseBackupV3, sanitizeWorkspaces, BACKUP_SCHEMA_V3 } from '../lib/backup.mjs';
import { migrateToV7, enrollTrack } from '../lib/progress-store.mjs';
import { DEFAULT_TRACK_ID } from '../lib/catalogue.mjs';

const NOW = '2026-07-26T00:00:00.000Z';

// Allowlist réaliste : seuls les fichiers ÉDITABLES non-test sont autorisés.
// (catalog.ts est en lecture seule → absent ; les tests .ts privés → absents.)
const allow = new Map([
  ['ts-typed-average', new Set(['solution.ts'])],
  ['ts-inventory', new Set(['solution.ts'])],
  ['fizzbuzz', new Set(['solution.mjs'])],
  ['py-word-count', new Set(['main.py'])],
]);

function baseV3() {
  const v6 = {
    startDate: '2026-06-15',
    days: { '1': { status: 'done', skills: {}, evidence: [{ id: 'e1', type: 'exercise', title: 'TS', url: '/lab/ts-typed-average', skills: ['typescript'], createdAt: NOW }] } },
    skills: { typescript: 3, javascript: 4 }, weeklyReviews: {}, monthlyReviews: {},
  };
  let v3 = migrateToV7(v6, NOW);
  v3 = enrollTrack(v3, 'backend-engineer-v1', '1', NOW);
  return v3;
}

test('round-trip : workspace TypeScript (.ts éditable) préservé', () => {
  const v3 = baseV3();
  const workspaces = {
    'ts-typed-average': { files: { 'solution.ts': 'export function average(n: number[]): number { return 0; }' } },
    'ts-inventory': { files: { 'solution.ts': 'import { CATALOG } from "./catalog";\nexport const x = CATALOG.length;' } },
  };
  const backup = serializeBackupV3(v3, workspaces, new Date(NOW));
  assert.equal(backup.schemaVersion, BACKUP_SCHEMA_V3);
  const r = parseBackupV3(JSON.stringify(backup), allow);
  assert.equal(r.ok, true);
  assert.match(r.workspaces['ts-typed-average'].files['solution.ts'], /average/);
  assert.match(r.workspaces['ts-inventory'].files['solution.ts'], /CATALOG/);
});

test('mixte : workspaces Node + Python + TypeScript restaurés ensemble', () => {
  const v3 = baseV3();
  const workspaces = {
    fizzbuzz: { files: { 'solution.mjs': 'export const fizzbuzz = () => 1;' } },
    'py-word-count': { files: { 'main.py': 'x = 1' } },
    'ts-typed-average': { files: { 'solution.ts': 'export const y: number = 2;' } },
  };
  const r = parseBackupV3(JSON.stringify(serializeBackupV3(v3, workspaces, new Date(NOW))), allow);
  assert.equal(r.ok, true);
  assert.deepEqual(Object.keys(r.workspaces).sort(), ['fizzbuzz', 'py-word-count', 'ts-typed-average']);
});

test('sécurité : fichier .ts en lecture seule et test .ts privé filtrés', () => {
  const raw = {
    'ts-inventory': { files: {
      'solution.ts': 'ok',
      'catalog.ts': 'HACK lecture seule',        // hors allowlist (read-only)
      'tests/hidden.test.ts': 'LEAK test privé', // hors allowlist (test privé)
      '../evil.ts': 'traversal',                 // chemin dangereux
    } },
  };
  const { workspaces, warnings } = sanitizeWorkspaces(raw, allow);
  assert.deepEqual(Object.keys(workspaces['ts-inventory'].files), ['solution.ts']);
  assert.ok(warnings.length >= 2);
});

test('sécurité : contenu .ts binaire (octet NUL) ignoré', () => {
  const raw = { 'ts-typed-average': { files: { 'solution.ts': 'const a = 1;' + String.fromCharCode(0) } } };
  const { workspaces } = sanitizeWorkspaces(raw, allow);
  assert.equal(workspaces['ts-typed-average'], undefined); // seul fichier invalide → workspace vide, non conservé
});

test('limites : fichier .ts trop volumineux ignoré (borne par fichier)', () => {
  const big = 'const x = "' + 'a'.repeat(250_000) + '";';
  const raw = { 'ts-typed-average': { files: { 'solution.ts': big } } };
  const { workspaces, warnings } = sanitizeWorkspaces(raw, allow);
  assert.equal(workspaces['ts-typed-average'], undefined);
  assert.ok(warnings.some((w) => /volumineux/.test(w)));
});

test('migration : progression plate V6 avec compétences/preuves TypeScript → v3', () => {
  const v6 = {
    startDate: '2026-06-15',
    days: { '1': { status: 'done', evidence: [{ id: 'e', type: 'exercise', title: 'TS', url: '/lab/ts-inventory', skills: ['typescript'], createdAt: NOW }] } },
    skills: { typescript: 3 }, weeklyReviews: {}, monthlyReviews: {},
  };
  const r = parseBackupV3({ app: 'ai-career-os', schemaVersion: 2, progress: v6 }, allow);
  assert.equal(r.ok, true);
  assert.equal(r.v3.activeTrackId, DEFAULT_TRACK_ID);
  assert.equal(r.v3.tracks[DEFAULT_TRACK_ID].skills.typescript, 3);
  assert.equal(r.v3.tracks[DEFAULT_TRACK_ID].days['1'].evidence[0].url, '/lab/ts-inventory');
});

test('inconnu : workspace pour un exercice TS absent de l’allowlist ignoré', () => {
  const raw = { 'ts-fantome': { files: { 'solution.ts': 'x' } } };
  const { workspaces, warnings } = sanitizeWorkspaces(raw, allow);
  assert.deepEqual(Object.keys(workspaces), []);
  assert.ok(warnings.some((w) => /inconnu/.test(w)));
});
