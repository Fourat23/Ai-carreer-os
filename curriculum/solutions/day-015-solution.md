# Correction — Jour 15 : Big O : apprendre à mesurer le coût d'un code

[← Retour au jour 15](../days/day-015.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Réponses : 1→O(1) ; 2→O(n) ; 3→O(n) (addition, pas multiplication !) ; 4→O(n×m) (deux tableaux différents : on dit n×m, pas n²) ; 5→O(n²) (boucle + includes caché) ; 6→O(1) (1000 itérations FIXES, n ne change rien) ; 7→O(log n) (on divise par 2 : c'est la signature du log) ; 8→O(n) ; 9→O(n²) ; 10→O(1).

## ✅ Une solution simple
```js
function contientDoublonNaif(arr) {
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)   // j = i+1 : ne pas se comparer à soi-même
      if (arr[i] === arr[j]) return true;
  return false;
}
const tailles = [1000, 10000, 100000];
for (const n of tailles) {
  const arr = Array.from({ length: n }, () => Math.floor(Math.random() * n * 10));
  console.time(`doublon n=${n}`);
  contientDoublonNaif(arr);
  console.timeEnd(`doublon n=${n}`);
}
```

## 🚀 Une solution améliorée
Note le * 10 dans la génération aléatoire : avec des valeurs entre 0 et 10n, les doublons sont rares → l'algo parcourt presque tout (pire cas). Avec des valeurs entre 0 et 10, un doublon arrive dans les premières itérations (meilleur cas) et tes mesures mentiraient. CHOISIR ses données de test pour viser le pire cas est une compétence de benchmarking à part entière.

## ⚠️ Erreurs probables et points à vérifier
- Extrait 3 : si tu as répondu O(n²), tu as confondu succession et imbrication — c'est l'erreur la plus commune et la plus importante à corriger AUJOURD'HUI
- Extrait 4 : O(n²) accepté si tu as précisé "si les tableaux ont des tailles comparables", mais O(n×m) est la réponse rigoureuse
- console.time : la première mesure d'un process Node est souvent polluée (démarrage) — lance chaque mesure 2 fois, garde la seconde

## 🔍 Comment vérifier ta solution
- Tes mesures O(n) : n×10 → temps ≈ ×10 (à la louche)
- Tes mesures O(n²) : n×10 → temps ≈ ×100
- Si tes mesures contredisent la théorie : c'est TOI qui as un bug (données, mesure) — trouve-le, c'est le meilleur exercice du jour

## ❓ Réponses du mini-quiz
1. **Boucle imbriquée sur le même tableau : complexité et pourquoi ?**
   → O(n²) : pour chacun des n éléments, on refait n opérations → n×n.
2. **O(n² + n), on simplifie en quoi ?**
   → O(n²) : à grande échelle, le terme dominant écrase l'autre (à n=1000 : 1 000 000 vs 1 000).
3. **Pourquoi arr.includes dans une boucle est-il un piège ?**
   → includes cache une boucle O(n) ; dans une boucle, ça devient O(n²) invisible à l'œil nu.
4. **n passe de 10 000 à 20 000 : temps d'un algo O(n²) ?**
   → ×4. Doubler n quadruple le coût quadratique — la question d'entretien la plus classique du sujet.

## 🧩 Questions de réflexion
- Ton benchmark du jour 20 (semaine 3) mesurera recherche linéaire vs binaire : prédis DÈS MAINTENANT le résultat avec ton vocabulaire tout neuf.
- Cite un endroit de ton annuaire (jour 13) qui deviendrait lent avec 100 000 contacts. Comment le saurais-tu AVANT tes utilisateurs ?
