// V71 — CP12. Probabilité qu'un pipeline soit vert du premier coup quand il contient
// des tests instables. Sert la leçon ci-cd, partie C de la pratique.
//
// POURQUOI CE SCRIPT EXISTE. Le critère de réussite écrit au CP10 publiait deux
// pourcentages sans les avoir calculés. Le CP12 les a recalculés : le premier était
// faux (99 % au lieu de 95 %) et le second arrondi dans le mauvais sens (78 au lieu
// de 77). Les chiffres de la leçon viennent désormais d'ici.
//
// LE MODÈLE, ET SA LIMITE. Chaque test instable échoue indépendamment avec une
// probabilité p. Le pipeline est vert si AUCUN ne tombe : (1 − p)^k. L'indépendance
// est une hypothèse — en pratique les instabilités se corrèlent (une base partagée,
// une horloge, un port occupé), ce qui rend la réalité PIRE que ce calcul, jamais
// meilleure. Le nombre total de tests n'intervient pas : seuls comptent les instables.

const pct = (x) => `${(x * 100).toFixed(1)} %`;

console.log('Pipeline vert du premier coup = (1 - p)^k');
console.log('  p = probabilite qu un test instable echoue sur une execution donnee');
console.log('  k = nombre de tests instables (les tests stables n interviennent pas)\n');

const ps = [0.01, 0.05, 0.10];
const ks = [1, 2, 3, 5, 10, 20];
console.log('p \\ k'.padEnd(8) + ks.map((k) => String(k).padStart(9)).join(''));
for (const p of ps) {
  const cells = ks.map((k) => pct((1 - p) ** k).padStart(9)).join('');
  console.log(`p=${p.toFixed(2)}`.padEnd(8) + cells);
}

const p = 0.05;
console.log(`\nA p = 1/20, le chiffre publie par la lecon :`);
console.log(`  1 test instable  -> ${pct((1 - p) ** 1)}  (et NON 99 % : un seul test suffit a couter 5 points)`);
console.log(`  5 tests instables-> ${pct((1 - p) ** 5)}  soit environ un pipeline sur quatre a relancer`);

// Combien de tests instables avant qu'un pipeline sur deux echoue ?
let k = 0;
while ((1 - p) ** k > 0.5) k += 1;
console.log(`\n  il suffit de ${k} tests instables a 1/20 pour qu un pipeline sur deux echoue sans raison.`);
console.log('  C est le seuil ou une equipe cesse de lire les echecs et relance par reflexe.');
