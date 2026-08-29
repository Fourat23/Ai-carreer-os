// V70 — arithmetique d'une facture cloud. Tarifs ILLUSTRATIFS, a revérifier.
// Sert la lecon cloud-finops. Aucune donnee inventee : tout est calcule ici.
const h = 730;                       // heures dans un mois moyen (365*24/12)
const eur = (n) => n.toLocaleString('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:0}) + ' EUR';

const postes = [
  // [nom, quantite, prix unitaire/h ou /mois, unite, note]
  ['4 VM de production (4 vCPU)',        4, 0.16*h, 'mois'],
  ['3 VM de recette, allumees 24/7',     3, 0.16*h, 'mois'],
  ['2 VM de dev, allumees 24/7',         2, 0.08*h, 'mois'],
  ['base managee production (multi-AZ)', 1, 0.34*h, 'mois'],
  ['base managee recette (multi-AZ)',    1, 0.34*h, 'mois'],
  ['12 disques non attaches (100 Go)',  12, 100*0.10, 'mois'],
  ['5 adresses IP reservees non utilisees', 5, 3.60, 'mois'],
  ['stockage objet 2 To',                1, 2000*0.023, 'mois'],
  ['transfert sortant 3 To',             1, 3000*0.09, 'mois'],
];
let total = 0;
console.log('POSTE'.padEnd(42), 'MONTANT'.padStart(10));
for (const [n, q, p] of postes) { const m = q*p; total += m; console.log(n.padEnd(42), eur(m).padStart(10)); }
console.log(''.padEnd(53,'-')); console.log('TOTAL'.padEnd(42), eur(total).padStart(10));

// Les trois gestes, dans l'ordre de rentabilite reelle
const orphelins = 12*100*0.10 + 5*3.60;
const extinction = (3*0.16 + 2*0.08) * (24-10) * 30;     // recette+dev eteints 14h/j, 30j
const baseRecette = 0.34*h*0.5;                           // recette en mono-AZ
console.log('\nGESTES, PAR RENTABILITE DECROISSANTE :');
console.log('  1. supprimer les orphelins (disques + IP)      ', eur(orphelins).padStart(9), `= ${(orphelins/total*100).toFixed(0)} % de la facture`);
console.log('  2. eteindre recette et dev la nuit et le week-end', eur(extinction).padStart(7), `= ${(extinction/total*100).toFixed(0)} %`);
console.log('  3. passer la base de RECETTE en mono-AZ        ', eur(baseRecette).padStart(9), `= ${(baseRecette/total*100).toFixed(0)} %`);
const economie = orphelins + extinction + baseRecette;
console.log(`\n  economie cumulee : ${eur(economie)} sur ${eur(total)}, soit ${(economie/total*100).toFixed(0)} %`);
console.log(`  ces trois gestes ne changent RIEN a la production.`);
console.log(`\n  transfert sortant seul : ${eur(3000*0.09)} = ${(3000*0.09/total*100).toFixed(0)} % — poste le plus gros, et le moins regarde.`);
