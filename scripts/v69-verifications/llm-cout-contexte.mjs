// Tarifs ILLUSTRATIFS, a revérifier chez le fournisseur : ils changent souvent.
const PRIX_ENTREE = 3.0, PRIX_SORTIE = 15.0;  // € par million de tokens
const eur = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const scenarios = [
  ['A. tout le manuel dans le prompt', 80_000, 300],
  ['B. les 6 passages pertinents',        3_000, 300],
  ['C. les 6 passages + historique',      5_000, 300],
];
console.log('Assistant interne, 5 000 questions par jour.\n');
console.log('scenario'.padEnd(36), 'tokens/appel'.padEnd(14), 'cout/appel'.padEnd(13), 'cout/mois');
for (const [nom, e, s] of scenarios) {
  const c = e/1e6*PRIX_ENTREE + s/1e6*PRIX_SORTIE;
  console.log(nom.padEnd(36), String(e+s).padEnd(14), (eur(c)+' EUR').padEnd(13), eur(c*5000*30) + ' EUR');
}
const a = 80_000/1e6*PRIX_ENTREE + 300/1e6*PRIX_SORTIE;
const b = 3_000/1e6*PRIX_ENTREE + 300/1e6*PRIX_SORTIE;
console.log(`\nRapport A/B : ${(a/b).toFixed(1)} fois plus cher, pour la meme question.`);
console.log(`Economie mensuelle en passant de A a B : ${eur((a-b)*5000*30)} EUR`);
