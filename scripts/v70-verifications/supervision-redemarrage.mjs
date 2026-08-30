// V70 — vérification exécutée pour linux-services-systemd.
// LIMITE DÉCLARÉE : systemd ne tourne pas dans cet environnement
// (/run/systemd/system est absent, PID 1 n est pas systemd). AUCUNE commande
// systemctl n a été exécutée. Ce qui suit mesure le MÉCANISME qu un
// superviseur implémente — surveiller un processus, lire son code de sortie,
// le redémarrer — avec un superviseur minimal écrit ici. Les valeurs sont
// mesurées ; la syntaxe des fichiers d unité, elle, est présentée sans
// exécution.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const D = mkdtempSync(join(tmpdir(), 'v70-sup-'));
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

// Un service qui échoue au démarrage : une variable de configuration manque.
writeFileSync(join(D, 'service.mjs'), `
if (!process.env.BASE_URL) {
  console.error('BASE_URL manquante');
  process.exit(78);              // EX_CONFIG : erreur de configuration
}
console.log('demarre');
setInterval(() => {}, 1000);
`);

function lancer() {
  return new Promise((res) => {
    const t0 = performance.now();
    const p = spawn(process.execPath, [join(D, 'service.mjs')], { stdio: 'pipe' });
    let err = '';
    p.stderr.on('data', (d) => { err += d; });
    p.on('exit', (code, sig) =>
      res({ code, sig, ms: performance.now() - t0, err: err.trim() }));
  });
}

console.log('== 1. Redémarrage inconditionnel : ce que fait Restart=always ==');
let n = 0, debut = performance.now();
const journal = [];
while (performance.now() - debut < 3000) {
  const r = await lancer();
  n++;
  if (n <= 3) journal.push(`   tentative ${n} : code ${r.code} apres ${r.ms.toFixed(0)} ms — « ${r.err} »`);
}
console.log(journal.join('\n'));
console.log(`   ...`);
console.log(`   ${n} redémarrages en 3 secondes, soit ${(n / 3).toFixed(1)} par seconde.`);
console.log('   -> le service ne redémarrera JAMAIS avec succès : la cause est');
console.log('      une configuration absente, et redémarrer ne la fait pas');
console.log('      apparaître. La boucle consomme du processeur, remplit les');
console.log('      journaux, et masque la panne derrière du bruit.');
console.log(`   -> extrapolation : ${Math.round(n / 3 * 3600).toLocaleString('fr-FR')} `
  + 'lignes d erreur par heure si rien ne limite.');

console.log('\n== 2. Ce que change un délai croissant entre les tentatives ==');
// Le mécanisme réel d un superviseur : attendre de plus en plus longtemps, et
// abandonner apres N tentatives dans une fenetre donnee.
for (const [nom, delai] of [
  ['délai fixe de 100 ms   ', (i) => 100],
  ['délai doublant (100 ms)', (i) => 100 * Math.pow(2, i)],
]) {
  const t0 = performance.now();
  let essais = 0;
  while (performance.now() - t0 < 10000) {
    await lancer(); essais++;
    const d = delai(essais - 1);
    if (performance.now() - t0 + d > 10000) break;
    await attendre(d);
  }
  console.log(`   ${nom} : ${String(essais).padStart(3)} tentatives en 10 s`);
}
console.log('   -> le délai doublant divise le nombre de tentatives par un ordre');
console.log('      de grandeur, et surtout il croît : au bout de 10 tentatives le');
console.log('      superviseur attend 100 x 2^9 = 51,2 s, ce qui laisse le temps');
console.log('      de voir la panne au lieu de la noyer.');
console.log('   -> et une limite (N tentatives dans une fenêtre) fait passer le');
console.log('      service en état « échoué », visible par une commande d état.');
console.log('      Un état échoué vaut mieux qu une boucle invisible.');

console.log('\n== 3. Le code de sortie porte de l information ==');
const r = await lancer();
console.log(`   code de sortie : ${r.code}`);
console.log('   conventions utiles à connaître :');
console.log('     0        : arrêt normal');
console.log('     1        : erreur générique');
console.log('     78       : erreur de configuration (EX_CONFIG)');
console.log('     128 + N  : tué par le signal N — 137 = 128+9 (KILL, souvent');
console.log('                le tueur de mémoire), 143 = 128+15 (TERM, arrêt');
console.log('                demandé, donc normal)');
console.log('   -> un superviseur qui redémarre sur TOUS les codes redémarre');
console.log('      aussi après un arrêt volontaire (143). Distinguer les codes');
console.log('      est ce qui sépare « redémarrer en cas de panne » de');
console.log('      « redémarrer tout le temps ».');

console.log('\n== 4. Le service part avant sa dépendance =='
);
// On mesure la différence entre « le processus a démarré » et « le service
// est prêt » — la confusion la plus coûteuse en supervision.
writeFileSync(join(D, 'lent.mjs'), `
import { writeFileSync } from 'node:fs';
setTimeout(() => {
  writeFileSync(process.argv[2], 'pret');   // le service signale sa disponibilite
}, 800);                          // 800 ms de chargement avant d etre utilisable
setInterval(() => {}, 1000);
`);
const drapeau = join(D, 'pret.flag');
const p = spawn(process.execPath, [join(D, 'lent.mjs'), drapeau]);
await attendre(50);
console.log(`   50 ms après le lancement  : processus vivant = ${p.exitCode === null}`
  + ` · service prêt = ${existsSync(drapeau)}`);
await attendre(900);
console.log(`   950 ms après le lancement : processus vivant = ${p.exitCode === null}`
  + ` · service prêt = ${existsSync(drapeau)}`);
p.kill();
console.log('   -> « le processus tourne » et « le service répond » sont deux');
console.log('      états distincts, séparés ici par 800 ms. Un superviseur qui');
console.log('      ne surveille que le processus déclare « actif » un service');
console.log('      qui refuse encore les requêtes — et tout ce qui dépend de lui');
console.log('      démarre trop tôt. D où la nécessité d un signal de');
console.log('      disponibilité émis par le service lui-même.');
