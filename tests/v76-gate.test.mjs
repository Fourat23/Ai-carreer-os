// V76 · CP14 — LA PORTE PEUT-ELLE ÉCHOUER ?
//
// ── CE QUE LE GANTELET A DÉCOUVERT ──────────────────────────────────────
//
// Le brief exige de tester la porte V76 elle-même par mutation. Deux mutations
// ont été appliquées :
//
//   · `M32` — `if (false && violations.length)` : la porte sort toujours en 0 ;
//   · `M33` — `check()` devient un no-op : plus rien n'est enregistré.
//
// **Les deux ont survécu**, et il n'y avait rien d'étonnant à cela : on les
// vérifiait en lançant `npm run v76:check`, c'est-à-dire en demandant à la
// porte si elle allait bien. *Une porte ne peut pas détecter sa propre
// neutralisation en se lançant elle-même.*
//
// Il faut un juge extérieur, et c'est ce fichier. Il ne vérifie pas que la
// porte est verte — n'importe quel `exit 0` y suffirait. Il vérifie qu'elle
// **sait rougir**, et qu'elle dit pourquoi.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const GATE = join(ROOT, 'scripts', 'v76-check.mjs');

/** Lance la porte et rend `{ code, sortie }`. Ne jette jamais. */
function lancer(env = {}) {
  try {
    const sortie = execFileSync('node', [GATE], {
      cwd: ROOT, encoding: 'utf8', env: { ...process.env, ...env }, timeout: 120000,
    });
    return { code: 0, sortie };
  } catch (e) {
    return { code: e.status ?? 1, sortie: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

test('V76 · CP14 — la porte passe sur le dépôt tel qu’il est', () => {
  const { code, sortie } = lancer();
  assert.equal(code, 0, `la porte échoue :\n${sortie}`);
  assert.match(sortie, /vérifications passées/);
});

test('V76 · CP14 — la porte SAIT ÉCHOUER, et nomme la règle', () => {
  // Le test qui compte. Sans lui, `if (false && violations.length)` passerait
  // inaperçu : la porte serait verte, le gantelet vert, et la porte
  // parfaitement décorative.
  const { code, sortie } = lancer({ V76_SELFTEST: '1' });
  assert.notEqual(code, 0, 'la porte reste verte alors qu’une violation lui est imposée');
  assert.match(sortie, /\[B16\] AUTOTEST/, 'la porte échoue sans dire laquelle de ses règles a cédé');
  assert.match(sortie, /régression\(s\)/, 'la porte ne compte pas ses violations');
});

test('V76 · CP14 — la porte compte un nombre PLAUSIBLE de vérifications', () => {
  // Une porte réduite à trois vérifications passerait aussi, et ne garderait
  // plus rien. Le seuil n'est pas une qualité, c'est un garde-fou contre le
  // vidage progressif.
  const { sortie } = lancer();
  const n = Number(sortie.match(/— (\d+) vérifications/)?.[1] ?? 0);
  assert.ok(n >= 60, `la porte ne fait plus que ${n} vérifications`);
});

test('V76 · CP14 — la porte est branchée dans `gates:active`', () => {
  // Une porte qu'aucune commande n'appelle est du code mort qui rassure —
  // c'est le critère B12 de V74, appliqué à la porte elle-même.
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts['v76:check'], 'node scripts/v76-check.mjs');
  assert.match(pkg.scripts['gates:active'], /npm run v76:check/,
    '`v76:check` n’est pas dans `gates:active` : la porte ne s’ouvre jamais');
});

test('V76 · CP14 — le crochet d’autotest n’allège AUCUNE règle', () => {
  // Un crochet qui, en passant, désactiverait une vérification serait pire que
  // pas de crochet du tout. Il ne fait qu'AJOUTER, et seulement sur demande.
  const src = readFileSync(GATE, 'utf8');
  const bloc = src.slice(src.indexOf("V76_SELFTEST === '1'"), src.indexOf("V76_SELFTEST === '1'") + 400);
  assert.match(bloc, /check\(false,/, 'l’autotest n’injecte pas de violation');
  assert.ok(!/return|process\.exit\(0\)|violations = \[\]/.test(bloc),
    'l’autotest modifie le déroulement de la porte au lieu d’y ajouter une règle');
  // Et il n'est actif que sur demande explicite : UNE seule condition dans le
  // code (les mentions en commentaire expliquent, elles n'activent rien).
  const sansCommentaires = src.split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l)).join('\n');
  assert.equal((sansCommentaires.match(/V76_SELFTEST/g) ?? []).length, 1,
    'le crochet d’autotest est activable depuis plusieurs endroits');
});

test('V76 · CP14 — le script négatif existe et couvre plusieurs règles', () => {
  // Le complément de ce fichier : `v76-negative.sh` casse une VRAIE règle à la
  // fois et vérifie que la porte la voit. Ce test garde son existence et son
  // ampleur ; son exécution est manuelle (`npm run v76:negative`), parce qu'il
  // modifie des fichiers du produit.
  const p = 'scripts/v76-negative.sh';
  assert.ok(existsSync(join(ROOT, p)), `${p} est absent`);
  const src = readFileSync(join(ROOT, p), 'utf8');
  const cas = (src.match(/^echo "N\d+/gm) ?? []).length;
  assert.ok(cas >= 6, `${cas} cas négatifs seulement`);
});
