// V70 — vérification exécutée pour incident-response et postmortem-rca.
// Ces deux leçons portent sur un processus humain : il n y a pas de mesure de
// laboratoire à faire. Ce qu on PEUT calculer, en revanche, décide de la
// plupart des désaccords sur le sujet. Tout ci-dessous est de l arithmétique
// explicite, pas une simulation : chaque formule est donnée.

const h = (s) => s < 60 ? `${s.toFixed(0)} s`
  : s < 3600 ? `${(s / 60).toFixed(1)} min` : `${(s / 3600).toFixed(1)} h`;

console.log('== 1. Où part réellement le temps d un incident ==');
// Le temps de rétablissement se décompose. On ne peut pas agir sur les cinq
// termes de la même façon, et on agit presque toujours sur le mauvais.
const phases = [
  ['détection      (le système signale)', 6 * 60],
  ['prise en charge (quelqu un regarde)', 4 * 60],
  ['diagnostic      (on comprend)      ', 22 * 60],
  ['décision        (on choisit)       ', 3 * 60],
  ['exécution       (on rétablit)      ', 2 * 60],
];
const total = phases.reduce((s, [, v]) => s + v, 0);
for (const [nom, v] of phases)
  console.log(`   ${nom} : ${String(h(v)).padStart(7)}  (${(v / total * 100).toFixed(0).padStart(2)} %)`);
console.log(`   total                                : ${h(total)}`);
console.log('   (répartition d exemple, à remplacer par la tienne — c est le');
console.log('    calcul qui compte, pas ces valeurs)');
console.log('   -> automatiser l exécution fait gagner au mieux 2 min sur 37.');
console.log('      Le diagnostic pèse 59 %. C est là que se trouvent les gains,');
console.log('      et le diagnostic s accélère par de l observabilité et un');
console.log('      manuel écrit d avance, pas par de l outillage de déploiement.');

console.log('\n== 2. Le coût des fausses alertes ==');
// Une alerte qui se déclenche à tort n est pas neutre : elle consomme de
// l attention, et l attention est la ressource qui manque pendant un incident.
const VERIF_MIN = 8;      // temps pour verifier une alerte et conclure « rien »
for (const [nCtrl, tauxFaux] of [[50, 0.01], [200, 0.01], [200, 0.001]]) {
  const parJour = nCtrl * 24 * tauxFaux;
  console.log(`   ${String(nCtrl).padStart(3)} contrôles · ${(tauxFaux * 100).toFixed(1)} % `
    + `de faux par contrôle et par heure -> ${parJour.toFixed(1)} fausses alertes/jour, `
    + `soit ${h(parJour * VERIF_MIN * 60)}/jour de vérification`);
}
console.log('   -> à 200 contrôles et 1 % de faux, une personne passe plus de');
console.log('      6 heures par jour à vérifier des alertes qui ne sont rien.');
console.log('      Elle cesse de les vérifier — et c est ainsi qu une vraie');
console.log('      alerte est ignorée. Le nombre de contrôles n est pas gratuit.');

console.log('\n== 3. Pourquoi « on a corrigé le bug » ne suffit pas ==');
// Un incident qui se repete N fois par an coûte N fois. Une action corrective
// qui reduit la PROBABILITE et une qui reduit la DUREE ne se valent pas.
const OCC = 6;                    // occurrences par an
const DUREE_H = 37 / 60;
const base = OCC * DUREE_H;
console.log(`   sans action : ${OCC} occurrences/an x ${h(DUREE_H * 3600)} = ${base.toFixed(1)} h/an`);
const actions = [
  ['corriger le bug de cette fois        ', 5 / 6, 1],
  ['diviser le temps de diagnostic par 2 ', 1, 1 - (22 / 37) / 2],
  ['les deux                             ', 5 / 6, 1 - (22 / 37) / 2],
];
for (const [nom, factOcc, factDuree] of actions) {
  const apres = OCC * factOcc * DUREE_H * factDuree;
  console.log(`   ${nom} : ${apres.toFixed(1)} h/an  `
    + `(-${((1 - apres / base) * 100).toFixed(0)} %)`);
}
console.log('   -> corriger le bug ne protège que de CE bug. Réduire le temps de');
console.log('      diagnostic protège de tous les incidents à venir, y compris');
console.log('      ceux qu on ne peut pas prévoir. Un compte rendu qui ne produit');
console.log('      que des actions du premier type recommence à chaque fois.');

console.log('\n== 4. « Cinq pourquoi » : la chaîne dépend du chemin choisi ==');
// Ce n est pas un calcul mais une demonstration : sur le MEME incident, deux
// enchaînements de « pourquoi » également valides mènent à deux causes racines
// differentes, donc a deux actions correctives differentes.
const chemins = {
  'chemin A (le code)': [
    'le service a renvoyé des erreurs 500',
    'une requête SQL a échoué',
    'une colonne attendue n existait pas',
    'la migration n avait pas été appliquée',
    'le script de déploiement ne lance pas les migrations',
  ],
  'chemin B (le processus)': [
    'le service a renvoyé des erreurs 500',
    'une version incompatible avec le schéma est partie en production',
    'personne n a vérifié la compatibilité avant la mise en production',
    'la revue ne demande pas de vérifier les migrations',
    'la liste de contrôle de mise en production n a jamais été relue',
  ],
  'chemin C (la détection)': [
    'le service a renvoyé des erreurs 500',
    'la panne a duré 37 minutes',
    'personne n a vu les erreurs pendant 6 minutes',
    'aucune alerte ne surveille le taux d erreur par version',
    'le tableau de bord n est pas découpé par version déployée',
  ],
};
for (const [nom, ch] of Object.entries(chemins)) {
  console.log(`   ${nom} :`);
  ch.forEach((e, i) => console.log(`     ${i === 0 ? '·' : '↳'} ${e}`));
  console.log(`     => action : ${{
    'chemin A (le code)': 'le déploiement applique les migrations',
    'chemin B (le processus)': 'la revue exige une vérification de compatibilité',
    'chemin C (la détection)': 'alerter sur le taux d erreur par version',
  }[nom]}`);
}
console.log('   -> les trois chaînes sont correctes et partent du même fait.');
console.log('      « La » cause racine n existe pas : il y a un ARBRE de causes,');
console.log('      et « cinq pourquoi » n en explore qu une branche — celle que');
console.log('      choisit la personne qui pose les questions. Un compte rendu');
console.log('      utile explore les trois axes : ce qui a cassé, ce qui l a');
console.log('      laissé passer, et ce qui a retardé la détection.');
