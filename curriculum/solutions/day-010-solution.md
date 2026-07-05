# Correction — Jour 10 : Objets : représenter le monde dans ton code

[← Retour au jour 10](../days/day-010.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le cœur du jour est la MODÉLISATION : pv ET pvMax (sinon impossible de borner les soins), l'équipement comme RÉFÉRENCE vers un objet de l'inventaire (ou son nom — deux choix défendables aux conséquences différentes), le poids CALCULÉ depuis l'inventaire plutôt que stocké (une source de vérité, jamais désynchronisée).

## ✅ Une solution simple
```js
const perso = {
  nom: "Kael", classe: "rôdeur",
  stats: { force: 12, agilite: 15 },
  pv: 80, pvMax: 100,
  inventaire: [{ nom: "épée courte", poids: 5, valeur: 30 }],
  armeEquipee: null,
};
const poidsTotal = (p) => {
  let total = 0;
  for (const objet of p.inventaire) total += objet.poids;
  return total;
};
function subirDegats(p, n) {
  p.pv = Math.max(0, p.pv - n);
  if (p.pv === 0) console.log(`${p.nom} est KO !`);
}
function soigner(p, n) { p.pv = Math.min(p.pvMax, p.pv + n); }
function ramasser(p, objet) {
  if (poidsTotal(p) + objet.poids > 50) { console.log("Sac plein !"); return false; }
  p.inventaire.push(objet); return true;
}
function equiper(p, nomObjet) {
  const objet = p.inventaire.find((o) => o.nom === nomObjet);
  if (!objet) { console.log(`${nomObjet} n'est pas dans l'inventaire`); return; }
  p.armeEquipee = objet;
}
```

## 🚀 Une solution améliorée
Deux choix de conception à comparer avec le tien : (1) poids CALCULÉ et non stocké — règle générale : ne stocke jamais ce qui se déduit, ça se désynchronise ; (2) armeEquipee référence l'objet de l'inventaire — donc si on ajoute retirerObjet(), il faudra déséquiper si l'arme part. Ta version a d'autres trade-offs : les identifier vaut mieux qu'avoir 'la bonne' réponse.

## ⚠️ Erreurs probables et points à vérifier
- subirDegats appelé après KO : re-affiche "KO" ? Comportement à définir (guard : if (p.pv === 0) return)
- find renvoie undefined si absent — le if (!objet) est OBLIGATOIRE
- ramasser retourne true/false : tes autres fonctions signalent par console.log — INCOHÉRENCE volontaire de l'énoncé, l'as-tu remarquée ? Uniformise (toujours retourner un booléen est plus testable)

## 🔍 Comment vérifier ta solution
- soigner(perso, 999) → pv === pvMax exactement
- Scénario des 10 actions rejoué : chaque sortie correspond à ton attendu
- poids : ajoute 2 objets, vérifie le total à la main

## ❓ Réponses du mini-quiz
1. **Quand utiliser les crochets plutôt que le point ?**
   → Quand la clé est dans une variable (obj[cle]) ou contient des caractères spéciaux. Le point exige une clé littérale connue.
2. **Que fait { ...defauts, ...options } et pourquoi l'ordre compte ?**
   → Fusionne : les clés de droite écrasent celles de gauche. options après defauts = les options gagnent.
3. **user.adresse?.ville quand adresse est undefined : résultat ?**
   → undefined, sans crash. Le ?. court-circuite toute la suite de la chaîne.
4. **Pourquoi limiter l'optional chaining aux frontières du programme ?**
   → En interne, un undefined inattendu est un BUG à corriger, pas à masquer : le ?. partout cache les bugs au lieu de les révéler.

## 🧩 Questions de réflexion
- Pourquoi 'ne jamais stocker ce qui se calcule' ? Trouve un contre-exemple où on stocke QUAND MÊME (indice : coût de calcul, jour 15).
- Ton modèle survivrait-il à 'un personnage peut équiper arme ET armure' ? Qu'est-ce qui devrait changer ?
