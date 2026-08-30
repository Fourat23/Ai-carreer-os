// V70 — vérification exécutée pour ci-cd-quality-gates-artifacts.
// Question : « on a mis une porte à 90 % de couverture, on est protégés. »
// On écrit deux suites de tests sur le MÊME code, on mesure leur couverture,
// et on regarde laquelle attrape un bug.
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const D = mkdtempSync(join(tmpdir(), 'v70-cov-'));

// Le code à tester : une remise avec un défaut volontaire et connu.
writeFileSync(join(D, 'remise.mjs'), `
export function prixApresRemise(prix, pourcentage) {
  if (pourcentage < 0) throw new RangeError('pourcentage negatif');
  if (pourcentage > 100) return 0;
  // DÉFAUT VOLONTAIRE : l arrondi est appliqué AVANT la division, donc il ne
  // sert a rien. Le resultat est un nombre de centimes fractionnaire.
  return Math.floor(prix * (100 - pourcentage)) / 100;
}
export function estEligible(client) {
  return client.anciennete >= 12 && !client.suspendu;
}
`);

// Suite A : appelle tout, n'affirme presque rien. C'est la suite qu'on écrit
// quand l'objectif est le pourcentage.
writeFileSync(join(D, 'a.test.mjs'), `
import test from 'node:test';
import assert from 'node:assert';
import { prixApresRemise, estEligible } from './remise.mjs';
test('couvre prixApresRemise', () => {
  prixApresRemise(1999, 10);
  prixApresRemise(1999, 150);
  assert.throws(() => prixApresRemise(1999, -1));
  assert.ok(true);
});
test('couvre estEligible', () => {
  estEligible({ anciennete: 24, suspendu: false });
  estEligible({ anciennete: 3, suspendu: false });
  assert.ok(true);
});
`);

// Suite B : moins de lignes exécutées, mais chaque appel est vérifié sur une
// valeur attendue calculée à la main.
writeFileSync(join(D, 'b.test.mjs'), `
import test from 'node:test';
import assert from 'node:assert';
import { prixApresRemise } from './remise.mjs';
test('19,99 EUR moins 10 % font 17,99 EUR', () => {
  assert.equal(prixApresRemise(1999, 10), 1799);
});
`);

function couverture(fichier) {
  const r = spawnSync(process.execPath,
    ['--test', '--experimental-test-coverage', join(D, fichier)],
    { encoding: 'utf8', cwd: D });
  const l = (r.stdout.match(/^# all files\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/m) || [])
        || [];
  const ligne = r.stdout.split('\n').find((x) => /all files/.test(x)) || '';
  const nombres = ligne.match(/[\d.]+/g) || [];
  return {
    vert: /^# fail 0$/m.test(r.stdout),
    lignes: nombres[0], branches: nombres[1], fonctions: nombres[2],
  };
}

const a = couverture('a.test.mjs');
const b = couverture('b.test.mjs');
console.log('== couverture mesurée par node --experimental-test-coverage ==');
console.log(`  suite A (appelle tout, n affirme rien) : lignes ${a.lignes} % `
  + `· branches ${a.branches} % · fonctions ${a.fonctions} %  -> ${a.vert ? 'VERTE' : 'ROUGE'}`);
console.log(`  suite B (une seule assertion vraie)     : lignes ${b.lignes} % `
  + `· branches ${b.branches} % · fonctions ${b.fonctions} %  -> ${b.vert ? 'VERTE' : 'ROUGE'}`);

console.log('\n== laquelle attrape le défaut ? ==');
console.log('  le code applique Math.floor AVANT la division, donc il n arrondit');
console.log('  rien : Math.floor(1999 * 90) = 179910, puis / 100 = 1799,1.');
console.log('  La fonction rend 1799,1 centimes — un centime fractionnaire, qui');
console.log('  se propagera en base et dans les totaux.');
console.log('  suite A : ' + (a.vert ? 'verte' : 'rouge')
  + ' — elle exécute la ligne fautive sans jamais comparer son résultat.');
console.log('  suite B : ' + (b.vert ? 'verte' : 'rouge')
  + ' — elle compare, donc elle constate.');

// On introduit maintenant une VRAIE régression et on regarde qui rougit.
console.log('\n== on introduit une régression et on recommence ==');
writeFileSync(join(D, 'remise.mjs'), `
export function prixApresRemise(prix, pourcentage) {
  if (pourcentage < 0) throw new RangeError('pourcentage negatif');
  if (pourcentage > 100) return 0;
  return Math.floor(prix * (100 + pourcentage)) / 100;   // RÉGRESSION : + au lieu de -
}
export function estEligible(client) {
  return client.anciennete >= 12 && !client.suspendu;
}
`);
const a2 = couverture('a.test.mjs');
const b2 = couverture('b.test.mjs');
console.log(`  suite A : couverture lignes ${a2.lignes} % -> ${a2.vert ? 'VERTE' : 'ROUGE'}`);
console.log(`  suite B : couverture lignes ${b2.lignes} % -> ${b2.vert ? 'VERTE' : 'ROUGE'}`);
console.log('\n  -> une remise qui AUGMENTE le prix passe la porte de couverture');
console.log('     de la suite A sans la faire bouger d un point. La couverture');
console.log('     mesure ce qui est EXÉCUTÉ, pas ce qui est VÉRIFIÉ.');
