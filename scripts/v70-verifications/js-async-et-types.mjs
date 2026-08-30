// V70 — vérification exécutée pour async-javascript, javascript-basics,
// typescript-basics et testing-foundations.
// On n explique pas la boucle d événements : on la mesure.
import { performance } from 'node:perf_hooks';

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

console.log('== 1. Séquentiel contre parallèle : le coût de « await » en boucle ==');
const appel = (ms) => attendre(ms).then(() => ms);
const durees = [120, 90, 150, 110, 80];

let t0 = performance.now();
const seq = [];
for (const d of durees) seq.push(await appel(d));           // ❌ un par un
const tSeq = performance.now() - t0;

t0 = performance.now();
const par = await Promise.all(durees.map(appel));           // ✅ tous ensemble
const tPar = performance.now() - t0;

console.log(`   somme des durées      : ${durees.reduce((a, b) => a + b)} ms`);
console.log(`   plus longue durée     : ${Math.max(...durees)} ms`);
console.log(`   boucle avec await     : ${tSeq.toFixed(1)} ms`);
console.log(`   Promise.all           : ${tPar.toFixed(1)} ms`);
console.log(`   rapport               : ×${(tSeq / tPar).toFixed(2)}`);
console.log('   -> une boucle avec await attend la SOMME ; Promise.all attend le');
console.log('      PLUS LONG. Sur cinq appels réseau, c est le facteur qui sépare');
console.log('      une page lente d une page normale, sans changer une requête.');

console.log('\n== 2. Ce que Promise.all fait des erreurs ==');
const ok = () => Promise.resolve('ok');
const ko = () => Promise.reject(new Error('service indisponible'));
try {
  await Promise.all([ok(), ko(), ok()]);
} catch (e) {
  console.log(`   Promise.all       : REJETÉ dès le premier échec — « ${e.message} »`);
  console.log('                       les deux résultats réussis sont PERDUS.');
}
const r = await Promise.allSettled([ok(), ko(), ok()]);
console.log(`   Promise.allSettled : ${r.map((x) => x.status).join(', ')}`);
console.log('   -> allSettled attend tout le monde et rend l état de chacun.');
console.log('      Le choix entre les deux est une décision : « tout ou rien »');
console.log('      contre « ce qu on a pu obtenir ». all convient à une');
console.log('      transaction, allSettled à un tableau de bord.');

console.log('\n== 3. L ordre d exécution, mesuré et non supposé ==');
const trace = [];
trace.push('1 synchrone');
setTimeout(() => trace.push('5 setTimeout 0'), 0);
queueMicrotask(() => trace.push('3 microtâche'));
Promise.resolve().then(() => trace.push('4 promesse résolue'));
trace.push('2 synchrone (fin)');
await attendre(20);
console.log('   ' + trace.join('\n   '));
console.log('   -> tout le code synchrone s exécute d abord. Puis TOUTES les');
console.log('      microtâches (promesses). Puis seulement les macrotâches');
console.log('      (setTimeout), même avec un délai de 0. Un setTimeout(f, 0)');
console.log('      n exécute pas f « tout de suite » : il l exécute après tout');
console.log('      ce qui est déjà en attente.');

console.log('\n== 4. La microtâche qui affame la boucle ==');
let compteurMacro = 0;
const finMacro = new Promise((res) => setTimeout(() => { compteurMacro++; res(); }, 0));
let n = 0;
await new Promise((res) => {
  const boucler = () => {
    if (++n < 20000) queueMicrotask(boucler);       // chaîne de microtâches
    else res();
  };
  queueMicrotask(boucler);
});
console.log(`   ${n} microtâches enchaînées avant que la boucle reprenne la main`);
console.log(`   le setTimeout(0) posé AVANT a-t-il pu s exécuter ? `
  + `${compteurMacro > 0 ? 'oui' : 'NON'}`);
await finMacro;
console.log('   -> une chaîne de microtâches bloque entièrement les macrotâches.');
console.log('      C est ainsi qu une page « ne répond plus » alors qu aucune');
console.log('      fonction ne dure longtemps : ce n est pas UNE tâche lente,');
console.log('      c est une file qui ne se vide jamais.');

console.log('\n== 5. Les pièges de JavaScript, exécutés ==');
const cas = [
  ['0.1 + 0.2 === 0.3', () => 0.1 + 0.2 === 0.3],
  ['0.1 + 0.2', () => 0.1 + 0.2],
  ['[10, 9, 100].sort()', () => JSON.stringify([10, 9, 100].sort())],
  ['[10, 9, 100].sort((a,b) => a-b)', () => JSON.stringify([10, 9, 100].sort((a, b) => a - b))],
  ['[] == false', () => [] == false],
  ['[] === false', () => [] === false],
  ['typeof null', () => typeof null],
  ['NaN === NaN', () => NaN === NaN],
  ['Object.is(NaN, NaN)', () => Object.is(NaN, NaN)],
  ['["1","2","3"].map(parseInt)', () => String(['1', '2', '3'].map(parseInt))],
];
for (const [expr, f] of cas)
  console.log(`   ${expr.padEnd(34)} -> ${JSON.stringify(f())}`);
console.log('   (la derniere ligne est affichee avec String et non JSON :');
console.log('    JSON.stringify convertit NaN en null, ce qui masquerait le');
console.log('    resultat reel. Le tableau vaut [1, NaN, NaN].)');
console.log('   -> aucun de ces résultats n est un bug : chacun découle d une');
console.log('      règle précise. sort() convertit en chaînes et trie');
console.log('      lexicographiquement ; map passe (valeur, index) et parseInt');
console.log('      lit un second argument qui est la BASE de numération.');

console.log('\n== 6. La référence partagée, qui n est pas un piège de JavaScript ==');
const modele = () => ({ nom: 'defaut', options: { verbeux: false } });

const d1 = modele();
const copie = { ...d1 };                 // copie d UN seul niveau
copie.nom = 'copie';                     // niveau 1 : indépendant
copie.options.verbeux = true;            // niveau 2 : PARTAGÉ
console.log(`   apres { ...d1 } puis modification de la copie :`);
console.log(`     d1.nom             = ${JSON.stringify(d1.nom)}      <- inchangé`);
console.log(`     d1.options.verbeux = ${d1.options.verbeux}          <- MODIFIÉ`);

const d2 = modele();
const clone = structuredClone(d2);       // copie profonde
clone.nom = 'clone';
clone.options.verbeux = true;
console.log(`   apres structuredClone(d2) puis modification du clone :`);
console.log(`     d2.nom             = ${JSON.stringify(d2.nom)}      <- inchangé`);
console.log(`     d2.options.verbeux = ${d2.options.verbeux}          <- inchangé`);
console.log('   -> l opérateur de décomposition copie UN niveau. Les objets');
console.log('      imbriqués restent PARTAGÉS, et une modification traverse.');
console.log('      Ce n est pas propre à JavaScript : c est la distinction');
console.log('      valeur/référence, présente dans presque tous les langages.');
console.log('   -> le cas le plus coûteux en pratique : un objet de');
console.log('      configuration par défaut, copié superficiellement pour');
console.log('      chaque utilisateur. La première modification contamine tout');
console.log('      le monde, et le défaut ne se voit qu au deuxième utilisateur.');

console.log('\n== 7. Ce que TypeScript vérifie, et quand il s arrête ==');
console.log('   TypeScript est effacé à la compilation : AUCUNE vérification');
console.log('   n existe à l exécution. La frontière est donc la même que celle');
console.log('   d une API : tout ce qui ENTRE dans le programme est non typé.');
const depuisJson = JSON.parse('{"age":"trente"}');   // déclaré any par TS
console.log(`   JSON.parse rend : ${JSON.stringify(depuisJson)}`);
console.log(`   typeof depuisJson.age = ${typeof depuisJson.age}`);
console.log(`   depuisJson.age * 2 = ${depuisJson.age * 2}`);
console.log('   -> un « age: number » déclaré dans une interface ne vérifie RIEN');
console.log('      sur cette valeur. TypeScript a cru la déclaration ; personne');
console.log('      ne l a contrôlée. D où la règle : valider à la frontière avec');
console.log('      du code qui s exécute, pas avec un type qui disparaît.');
