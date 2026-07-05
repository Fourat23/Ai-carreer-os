# Correction — Jour 9 : Fonctions : découper les problèmes en morceaux nommés

[← Retour au jour 9](../days/day-009.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La facture teste la SÉPARATION calcul/présentation : d'un côté des fonctions pures qui prennent des données et retournent des nombres, de l'autre des fonctions de formatage qui retournent des strings, et une composition finale. Cette frontière (logique ↔ présentation) est l'idée derrière TOUTES les architectures que tu verras (MVC, 3-tiers, hexagonal).

## ✅ Une solution simple
```js
const totalLigne = (a) => a.prixUnitaire * a.quantite;
const sousTotal = (achats) => {
  let total = 0;
  for (const a of achats) total += totalLigne(a);
  return total;
};
const calculerRemise = (montant) => (montant > 100 ? montant * 0.05 : 0);
const formaterMontant = (n) => `${n.toFixed(2).replace(".", ",")} €`;
const formaterLigne = (a) =>
  `${a.nom.padEnd(20)} ${String(a.quantite).padStart(3)} x ${formaterMontant(a.prixUnitaire).padStart(10)} = ${formaterMontant(totalLigne(a)).padStart(10)}`;

function genererFacture(achats) {
  const st = sousTotal(achats);
  const remise = calculerRemise(st);
  const tva = (st - remise) * 0.2;
  const lignes = [];
  for (const a of achats) lignes.push(formaterLigne(a));
  lignes.push(`Sous-total : ${formaterMontant(st)}`);
  if (remise > 0) lignes.push(`Remise 5%  : -${formaterMontant(remise)}`);
  lignes.push(`TVA 20%    : ${formaterMontant(tva)}`);
  lignes.push(`TOTAL      : ${formaterMontant(st - remise + tva)}`);
  return lignes.join("\n");
}
console.log(genererFacture(ACHATS));
```

## 🚀 Une solution améliorée
Question de design laissée ouverte exprès : la TVA s'applique-t-elle avant ou après remise ? La solution choisit après (remise puis TVA sur le net) — un autre choix est défendable. Le POINT IMPORTANT : tu devais REMARQUER l'ambiguïté et documenter ton choix en commentaire. En entretien comme en poste, détecter les specs ambiguës vaut plus que coder vite.

## ⚠️ Erreurs probables et points à vérifier
- maximum() sans argument : que renvoie ta version ? -Infinity ? undefined ? Documente ce choix
- padEnd/padStart pour aligner : si tu ne les connaissais pas, tu as probablement aligné à la main — va voir ces méthodes, elles sont faites pour ça
- appliquerDeuxFois(estPair, 4) : estPair(true) → piège conceptuel volontaire. fn doit renvoyer le même type qu'elle prend pour être composable

## 🔍 Comment vérifier ta solution
- calculerRemise(99)=0, (100)=0, (101)=5.05, (150)=7.5
- genererFacture relue : zéro calcul dedans ?
- Changer le taux de TVA = toucher UNE ligne ?

## ❓ Réponses du mini-quiz
1. **Que renvoie une fonction sans return ?**
   → undefined — implicitement. D'où l'importance de returns explicites et cohérents.
2. **Différence entre paramètre et argument ?**
   → Le paramètre est le nom dans la signature (l, h) ; l'argument est la valeur passée à l'appel (3, 4).
3. **Qu'est-ce que le shadowing ?**
   → Une variable interne qui porte le même nom qu'une externe et la masque dans sa portée. Légal mais source de confusion.
4. **Pourquoi 'une fonction = une responsabilité' rend-il le code testable ?**
   → On peut tester chaque morceau isolément avec des entrées simples, au lieu de devoir exécuter tout le programme pour vérifier un calcul.

## 🧩 Questions de réflexion
- genererFacture RETOURNE une string au lieu d'afficher : qu'est-ce que ça permet (tests, écrire dans un fichier, envoyer par mail) ?
- Ta découpe diffère de la solution ? Très bien — liste les différences et demande-toi : laquelle survivrait le mieux à 'ajoute une devise USD' ?
