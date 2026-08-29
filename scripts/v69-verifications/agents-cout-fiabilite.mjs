// Tarifs illustratifs : 3 EUR / M tokens en entree, 15 EUR / M en sortie.
const cout = (e, s) => e/1e6*3 + s/1e6*15;
const eur = (n) => n.toFixed(3).replace('.', ',');

// Tache : verifier la coherence de 40 documents.
const N = 40;

// WORKFLOW : 1 appel d'extraction par document, puis 1 appel de comparaison par paire voisine.
const wAppels = N + (N - 1);
const wCout = N*cout(1500, 400) + (N-1)*cout(900, 200);

// AGENT : boucle exploratoire. Chaque iteration renvoie tout l'historique accumule.
function agent(iterations) {
  let total = 0, contexte = 800;
  for (let i = 0; i < iterations; i++) { total += cout(contexte, 300); contexte += 1200; }
  return total;
}

console.log(`Tache : verifier la coherence de ${N} documents.\n`);
console.log('WORKFLOW (chemin connu d avance)');
console.log(`   appels : ${wAppels} (nombre FIXE, connu avant de lancer)`);
console.log(`   cout   : ${eur(wCout)} EUR — identique a chaque execution`);
console.log(`   testable : oui, chaque etape isolement`);

console.log('\nAGENT (le modele decide de son chemin)');
for (const it of [12, 25, 40, 60]) {
  console.log(`   ${String(it).padStart(2)} iterations -> ${eur(agent(it)).padStart(7)} EUR`);
}
console.log(`   le nombre d iterations n est PAS connu avant de lancer.`);
console.log(`\n   Rapport entre la meilleure et la pire execution de l agent : ${(agent(60)/agent(12)).toFixed(1)} x`);
console.log(`   L agent a 60 iterations coute ${(agent(60)/wCout).toFixed(1)} x le workflow.`);

console.log('\nFiabilite : si chaque etape reussit 95 % du temps,');
for (const n of [5, 10, 20, 40]) console.log(`   ${String(n).padStart(2)} etapes enchainees -> ${(0.95**n*100).toFixed(1)} % de reussite bout en bout`);
