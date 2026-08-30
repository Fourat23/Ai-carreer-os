// V70 — vérification exécutable pour la leçon `clean-code`.
//
// « Ce code est plus lisible » est une opinion. On peut néanmoins mesurer
// certaines choses, et surtout constater ce que la mesure NE dit PAS.
//
// Trois mesures sur le même code, avant et après refactorisation :
//   1. complexité cyclomatique (nombre de chemins d'exécution) ;
//   2. profondeur d'imbrication maximale ;
//   3. longueur des fonctions.
//
// Et une quatrième section qui montre une limite : deux versions peuvent
// avoir exactement les mêmes chiffres et ne pas se valoir du tout.
//
// Aucune dépendance. `node scripts/v70-verifications/lisibilite-mesuree.mjs`

// ---------------------------------------------------------------------------
// Les points de décision : chacun ajoute un chemin possible dans la fonction.
const POINTS = [
  /\bif\b/g, /\belse\s+if\b/g, /\bfor\b/g, /\bwhile\b/g, /\bcase\b/g,
  /\bcatch\b/g, /&&/g, /\|\|/g, /\?\?/g, /\?[^.:]/g,
];

const complexite = (src) => {
  // 1 = le chemin qui traverse la fonction sans jamais brancher.
  let c = 1;
  for (const re of POINTS) c += (src.match(re) || []).length;
  return c;
};

const profondeur = (src) => {
  let d = 0, max = 0;
  for (const ch of src) {
    if (ch === '{') max = Math.max(max, ++d);
    else if (ch === '}') d--;
  }
  return max;
};

const lignes = (src) => src.split('\n').filter((l) => l.trim()).length;

const rapport = (nom, src) =>
  `   ${nom.padEnd(30)} complexité ${String(complexite(src)).padStart(3)}` +
  `   profondeur ${profondeur(src)}   lignes ${String(lignes(src)).padStart(3)}`;

// ---------------------------------------------------------------------------
// La même fonctionnalité, écrite deux fois. Aucune n'est un homme de paille :
// la version « avant » est du code qu'on trouve réellement en production.

const AVANT = `
function traiterCommande(commande) {
  if (commande) {
    if (commande.lignes && commande.lignes.length > 0) {
      let total = 0;
      for (const ligne of commande.lignes) {
        if (ligne.quantite > 0 && ligne.prix >= 0) {
          let sousTotal = ligne.quantite * ligne.prix;
          if (ligne.remise) {
            if (ligne.remise.type === 'pourcent') {
              sousTotal = sousTotal * (1 - ligne.remise.valeur / 100);
            } else if (ligne.remise.type === 'montant') {
              sousTotal = sousTotal - ligne.remise.valeur;
              if (sousTotal < 0) { sousTotal = 0; }
            }
          }
          total += sousTotal;
        } else {
          throw new Error('ligne invalide');
        }
      }
      if (commande.client && commande.client.vip) {
        total = total * 0.95;
      }
      console.log('Total : ' + total.toFixed(2) + ' EUR');
      return total;
    } else {
      throw new Error('commande vide');
    }
  } else {
    throw new Error('commande absente');
  }
}
`;

const APRES = `
function verifierCommande(commande) {
  if (!commande) throw new Error('commande absente');
  if (!commande.lignes?.length) throw new Error('commande vide');
}

function verifierLigne(ligne) {
  if (ligne.quantite <= 0 || ligne.prix < 0) throw new Error('ligne invalide');
}

function appliquerRemise(montant, remise) {
  if (!remise) return montant;
  if (remise.type === 'pourcent') return montant * (1 - remise.valeur / 100);
  if (remise.type === 'montant') return Math.max(0, montant - remise.valeur);
  return montant;
}

function totalCommande(commande) {
  verifierCommande(commande);
  let total = 0;
  for (const ligne of commande.lignes) {
    verifierLigne(ligne);
    total += appliquerRemise(ligne.quantite * ligne.prix, ligne.remise);
  }
  return commande.client?.vip ? total * 0.95 : total;
}
`;

console.log('\n== 1. La même fonctionnalité, deux écritures ==\n');
console.log(rapport('AVANT (une fonction)', AVANT));
console.log(rapport('APRÈS (quatre fonctions)', APRES));

const fonctions = (src) =>
  src.split(/\nfunction /).filter(Boolean).map((f) => 'function ' + f);

console.log('\n   détail APRÈS, fonction par fonction :');
let sommeApres = 0;
for (const f of fonctions(APRES)) {
  const nom = (/function\s+(\w+)/.exec(f) || [, '?'])[1];
  sommeApres += complexite(f);
  console.log(`     ${nom.padEnd(22)} complexité ${String(complexite(f)).padStart(2)}` +
    `   profondeur ${profondeur(f)}   lignes ${lignes(f)}`);
}

console.log(`\n   complexité MAXIMALE par fonction : avant ${complexite(AVANT)}` +
  `   après ${Math.max(...fonctions(APRES).map(complexite))}`);
console.log(`   complexité TOTALE du fichier     : avant ${complexite(AVANT)}` +
  `   après ${sommeApres}`);
console.log('   -> la refactorisation ne SUPPRIME presque pas de complexité.');
console.log('      Elle la RÉPARTIT. Ce qui change est la quantité qu il faut');
console.log('      tenir en tête à la fois, et c est exactement la contrainte');
console.log('      humaine — pas une contrainte de la machine.');

// ---------------------------------------------------------------------------
console.log('\n== 2. Ce que la mesure ne voit pas ==\n');

const NOMS_CLAIRS = `
function appliquerRemise(montant, remise) {
  if (!remise) return montant;
  if (remise.type === 'pourcent') return montant * (1 - remise.valeur / 100);
  return Math.max(0, montant - remise.valeur);
}
`;

const NOMS_OPAQUES = `
function proc(x, y) {
  if (!y) return x;
  if (y.t === 'p') return x * (1 - y.v / 100);
  return Math.max(0, x - y.v);
}
`;

console.log(rapport('noms d intention', NOMS_CLAIRS));
console.log(rapport('noms opaques', NOMS_OPAQUES));
console.log('   -> chiffres IDENTIQUES. Aucune des trois mesures ne distingue');
console.log('      `appliquerRemise(montant, remise)` de `proc(x, y)`.');
console.log('      Le nommage est le premier facteur de lisibilité et il');
console.log('      n entre dans aucune métrique automatique. Une porte de');
console.log('      qualité qui ne mesure que la complexité laissera passer');
console.log('      la deuxième version sans un mot.');

// ---------------------------------------------------------------------------
console.log('\n== 3. Le seuil, et pourquoi il est arbitraire ==\n');
console.log('   Les outils du marché alertent souvent au-delà de 10.');
console.log(`   Ici : AVANT = ${complexite(AVANT)}, donc signalé.`);
console.log('   Mais un « switch » à douze branches, toutes plates et');
console.log('   indépendantes, dépasse lui aussi le seuil — et se lit');
console.log('   sans le moindre effort.');

const SWITCH_PLAT = `
function libelle(code) {
  switch (code) {
    case 1: return 'un'; case 2: return 'deux'; case 3: return 'trois';
    case 4: return 'quatre'; case 5: return 'cinq'; case 6: return 'six';
    case 7: return 'sept'; case 8: return 'huit'; case 9: return 'neuf';
    case 10: return 'dix'; case 11: return 'onze'; case 12: return 'douze';
    default: return 'inconnu';
  }
}
`;
console.log(rapport('switch plat de 12 cas', SWITCH_PLAT));
console.log(`   -> complexité ${complexite(SWITCH_PLAT)} (au-dessus du seuil)` +
  `, profondeur ${profondeur(SWITCH_PLAT)} (très basse).`);
console.log('      La complexité seule produit ici un faux positif. La');
console.log('      PROFONDEUR le rattrape : c est l imbrication, pas le');
console.log('      nombre de branches, qui sature la mémoire de travail.');

console.log('\n== fin ==');
