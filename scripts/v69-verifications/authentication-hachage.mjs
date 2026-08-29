import { createHash, scryptSync, randomBytes } from 'node:crypto';
const mdp = 'motdepasse123', sel = randomBytes(16);

let n = 0, t0 = Date.now();
while (Date.now() - t0 < 1000) { createHash('sha256').update(mdp).digest(); n++; }
console.log('SHA-256      :', n.toLocaleString('fr-FR'), 'hachages / seconde (1 coeur)');

let m = 0; t0 = Date.now();
while (Date.now() - t0 < 2000) { scryptSync(mdp, sel, 64, { N: 16384, r: 8, p: 1 }); m++; }
const parSec = m / 2;
console.log('scrypt N=16384:', parSec.toFixed(0), 'hachages / seconde (1 coeur)');
console.log('rapport       :', Math.round(n / parSec).toLocaleString('fr-FR'), 'x plus lent');
const listeCourante = 10 ** 9; // ordre de grandeur d une liste de mots de passe compromis
console.log('\nParcourir un milliard de mots de passe voles :');
console.log('  avec SHA-256 :', (listeCourante / n / 3600).toFixed(1), 'heures');
console.log('  avec scrypt  :', (listeCourante / parSec / 3600 / 24 / 365).toFixed(0), 'annees');
