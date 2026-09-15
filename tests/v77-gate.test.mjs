// V77 · CP14 — LA PORTE V77 PEUT-ELLE ÉCHOUER ?
//
// ── LA LEÇON DE V76, APPLIQUÉE D'AVANCE ────────────────────────────────
//
// Au CP14 de V76, deux mutations de règles ont SURVÉCU. Il n'y avait rien
// d'étonnant à cela : je les vérifiais en lançant `npm run v76:check`,
// c'est-à-dire en demandant à la porte si elle allait bien.
//
//   > Une porte ne peut pas détecter sa propre neutralisation en se lançant
//   > elle-même.
//
// Ce fichier est le JUGE EXTERNE de `v77:check`. Il ne vérifie pas qu'elle est
// verte — n'importe quel `exit 0` y suffirait. Il vérifie qu'elle **sait
// rougir**, qu'elle dit **pourquoi**, et qu'elle n'a pas été vidée.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const GATE = join(ROOT, 'scripts', 'v77-check.mjs');

/** Lance la porte et rend `{ code, sortie }`. Ne jette jamais. */
function lancer(env = {}) {
  try {
    const sortie = execFileSync('node', [GATE], {
      cwd: ROOT, encoding: 'utf8', env: { ...process.env, ...env }, timeout: 180000,
    });
    return { code: 0, sortie };
  } catch (e) {
    return { code: e.status ?? 1, sortie: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

test('V77 · CP14 — la porte passe sur le dépôt tel qu’il est', () => {
  const { code, sortie } = lancer();
  assert.equal(code, 0, `la porte échoue :\n${sortie}`);
  assert.match(sortie, /vérifications passées/);
});

test('V77 · CP14 — la porte SAIT ÉCHOUER, et nomme la règle qui a cédé', () => {
  // Le test qui compte. Sans lui, `if (false && violations.length)` passerait
  // inaperçu : la porte serait verte, le gantelet vert, et la porte
  // parfaitement décorative.
  const { code, sortie } = lancer({ V77_SELFTEST: '1' });
  assert.notEqual(code, 0, 'la porte reste verte alors qu’une violation lui est imposée');
  assert.match(sortie, /\[A13\] AUTOTEST/, 'la porte échoue sans dire laquelle de ses règles a cédé');
  assert.match(sortie, /régression\(s\)/, 'la porte ne compte pas ses violations');
});

test('V77 · CP14 — la porte compte un nombre PLAUSIBLE de vérifications', () => {
  // Une porte réduite à trois vérifications passerait aussi, et ne garderait
  // plus rien. Le seuil n'est pas une qualité : c'est un garde-fou contre le
  // vidage progressif.
  const { sortie } = lancer();
  const m = sortie.match(/— (\d+) vérifications passées/);
  assert.ok(m, 'la porte ne dit pas combien de vérifications elle a faites');
  assert.ok(Number(m[1]) >= 100, `seulement ${m?.[1]} vérifications : la porte a été vidée`);
});

test('V77 · CP14 — la porte EXÉCUTE le produit, elle ne se contente pas de lire du texte', () => {
  // V76 a payé deux fois pour l'avoir oublié : une assertion de texte tient une
  // convention, jamais un comportement. Les règles décisives de v77:check
  // importent les modules et les font tourner.
  const src = readFileSync(GATE, 'utf8');
  assert.ok(src.includes("await import('../lib/progress-store.mjs')"), 'A2 doit exécuter le store');
  assert.ok(src.includes("await import('../lib/evidence-matrix.mjs')"), 'A5 doit exécuter la matrice');
  assert.ok(src.includes("await import('../lib/artifact-analysis.mjs')"), 'A4 doit exécuter le module');
  assert.ok(src.includes('writeActiveTrack'), 'A2 doit traverser la persistance');
  assert.ok(src.includes('parseBackupV3'), 'A2 doit traverser la 4ᵉ liste blanche');
});

test('V77 · CP14 — la porte est déclarée dans `gates:active`', () => {
  // Une porte qui n'est pas dans le gantelet ne garde rien : elle attend d'être
  // lancée par quelqu'un qui y pense.
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  assert.ok(pkg.scripts['v77:check'], 'le script `v77:check` doit exister');
  assert.match(pkg.scripts['gates:active'], /v77:check/, '`gates:active` doit lancer la porte V77');
});

test('V77 · CP14 — `v73:check` n’a pas été inventé', () => {
  // Le brief le suppose ; il n'a jamais existé dans ce dépôt. Le CP0 l'a mesuré,
  // et en fabriquer un pour faire correspondre la réalité au document serait la
  // pire façon de « corriger » un écart.
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  assert.equal('v73:check' in pkg.scripts, false, '`v73:check` ne doit pas être inventé');
});
