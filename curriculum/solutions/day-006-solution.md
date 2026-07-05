# Correction — Jour 6 : Boucles + GitHub : ton premier code publié

[← Retour au jour 6](../days/day-006.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
FizzBuzz élégant : au lieu d'un arbre de if pour chaque combinaison (qui explose : 3 conditions = 8 cas), on CONSTRUIT la réponse par concaténation — chaque règle ajoute son mot si elle s'applique, et si rien ne s'est appliqué, on affiche le nombre. 3 règles = 3 if à plat, extensible à l'infini.

## ✅ Une solution simple
```js
for (let i = 1; i <= 100; i++) {
  let sortie = "";
  if (i % 3 === 0) sortie += "Fizz";
  if (i % 5 === 0) sortie += "Buzz";
  if (String(i).includes("7")) sortie += "Lucky";
  console.log(sortie === "" ? i : sortie);
}
```
Gamme — les deux fonctions les plus ratées :
```js
function premierNegatif(tableau) {
  for (let i = 0; i < tableau.length; i++) {
    if (tableau[i] < 0) return i;   // return sort ET renvoie : break + valeur
  }
  return -1;
}
function pyramide(n) {
  for (let ligne = 1; ligne <= n; ligne++) {
    console.log(" ".repeat(n - ligne) + "#".repeat(2 * ligne - 1));
  }
}
```

## 🚀 Une solution améliorée
Remarque la version concaténation de FizzBuzz vs la version if/else if : ajoute une 4e règle ('Bang' pour les multiples de 11) mentalement dans chaque version. Concaténation : +1 ligne. If/else : le nombre de cas combinés double. C'est un argument de DESIGN que tu peux ressortir en entretien sur ce simple exercice.

## ⚠️ Erreurs probables et points à vérifier
- pyramide sans les espaces de gauche = triangle, pas pyramide — relis l'énoncé (compétence : lire VRAIMENT la spec)
- deviner() : Math.floor(Math.random() * 100) + 1 pour 1-100 ; sans le +1 tu as 0-99
- 27 → "FizzLucky" : si ton code donne "Fizz" ou "Lucky" seul, tes règles s'excluent au lieu de se cumuler

## 🔍 Comment vérifier ta solution
- somme(1)=1, somme(3)=6, somme(100)=5050
- FizzBuzz : 15→FizzBuzz, 17→Lucky, 70→BuzzLucky, 75→FizzBuzz, 105 (si tu étends)→FizzBuzzLucky ? Non — 105 ne contient pas de 7. Vérifie ta propre trace !
- Ton dépôt s'ouvre en navigation privée (donc vraiment public)

## ❓ Réponses du mini-quiz
1. **Quand while plutôt que for ?**
   → Quand le nombre d'itérations est inconnu à l'avance (attendre une condition, réessayer).
2. **Que fait break dans une boucle imbriquée ?**
   → Il ne sort QUE de la boucle la plus interne — piège classique.
3. **Comment vérifier qu'un nombre contient le chiffre 7 ?**
   → Le convertir en string et tester String(n).includes("7") — changer de représentation (nombre→texte) est une technique générale.
4. **git push fait quoi exactement ?**
   → Envoie tes commits locaux vers le dépôt distant (GitHub). Sans push, ton travail n'existe que sur ta machine.

## 🧩 Questions de réflexion
- Le pattern 'construire par concaténation' vs 'arbre de cas' : où pourrais-tu le réutiliser (pense au validateur d'hier) ?
- Ton README : si un recruteur ne lit QUE lui, que retient-il de toi ?
