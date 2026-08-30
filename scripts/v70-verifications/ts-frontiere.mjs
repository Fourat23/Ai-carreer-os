/**
 * V70 — vérification exécutée des messages du compilateur publiés dans
 * curriculum/lessons/typescript-frontend.md (exemple guidé).
 *
 * Compile scripts/v70-verifications/ts/frontiere.ts en mode strict et
 * imprime la sortie brute de tsc. Les cas 1 et 5 ne produisent AUCUNE
 * erreur : c'est précisément ce que la leçon démontre.
 *
 * Exécution : node scripts/v70-verifications/ts-frontiere.mjs
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// La source est stockée en .ts.txt : elle contient des erreurs VOLONTAIRES et
// ne doit pas être ramassée par le « npx tsc --noEmit » du projet. On la copie
// dans un dossier temporaire avant de la compiler.
const SOURCE = 'scripts/v70-verifications/ts/frontiere.ts.txt';
const DOSSIER = mkdtempSync(path.join(tmpdir(), 'v70-ts-'));
const FICHIER = path.join(DOSSIER, 'frontiere.ts');
copyFileSync(SOURCE, FICHIER);
const ARGS = [
  'tsc', '--noEmit', '--strict',
  '--target', 'es2022', '--lib', 'es2022,dom',
  '--module', 'esnext', '--moduleResolution', 'bundler',
  FICHIER,
];

let sortie;
try {
  sortie = execFileSync('npx', ARGS, { encoding: 'utf8' });
} catch (e) {
  sortie = (e.stdout || '') + (e.stderr || '');
}

console.log('=== npx tsc --noEmit --strict … ' + SOURCE + '\n');
console.log((sortie.replace(/^\S*frontiere\.ts/gm, 'frontiere.ts').trim() || '(aucune erreur)'));

const lignes = sortie.split('\n').filter((l) => /error TS/.test(l));
console.log(`\n${lignes.length} erreur(s) sur 5 cas.`);
console.log('Cas sans erreur : 1 (le cast est accepté) et 5 (le cast ment).');
