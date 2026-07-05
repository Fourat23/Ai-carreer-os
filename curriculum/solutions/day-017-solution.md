# Correction — Jour 17 : Les tris simples : comprendre le coût en le payant soi-même

[← Retour au jour 17](../days/day-017.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Insertion : l'invariant est « à l'entrée de l'itération i, arr[0..i-1] est trié ». On prend arr[i], on décale vers la droite tous les éléments triés qui lui sont supérieurs, on le pose dans le trou. Bulles : l'invariant est « après k parcours, les k plus grands sont à leur place finale à droite ».

## ✅ Une solution simple
```js
function triInsertion(entree) {
  const arr = [...entree];
  let comparaisons = 0, echanges = 0;
  for (let i = 1; i < arr.length; i++) {
    const valeur = arr[i];
    let j = i - 1;
    while (j >= 0 && (comparaisons++, arr[j] > valeur)) {
      arr[j + 1] = arr[j];                    // décalage vers la droite
      echanges++;
      j--;
    }
    arr[j + 1] = valeur;                      // insertion dans le trou
  }
  return { resultat: arr, comparaisons, echanges };
}
```

## 🚀 Une solution améliorée
Le mini-testeur — ta première suite de tests automatisée digne de ce nom :
```js
function testerTri(fnTri, nbTests = 20) {
  for (let t = 0; t < nbTests; t++) {
    const arr = Array.from({ length: 50 }, () => Math.floor(Math.random() * 100));
    const attendu = [...arr].sort((a, b) => a - b);
    const obtenu = fnTri(arr).resultat;
    if (JSON.stringify(obtenu) !== JSON.stringify(attendu)) {
      console.error("ÉCHEC sur :", arr);
      return false;
    }
  }
  console.log("20/20 ✓");
  return true;
}
```
Le principe (comparer à une référence fiable sur des entrées aléatoires) s'appelle le test par oracle — tu le réutiliseras pour valider des optimisations toute ta carrière.

## ⚠️ Erreurs probables et points à vérifier
- (comparaisons++, arr[j] > valeur) : l'opérateur virgule permet de compter DANS la condition — si c'est illisible pour toi, compte dans le corps de boucle avec une structure légèrement différente, la lisibilité prime
- Expérience B scénario 2 : si l'insertion ne montre PAS ~n comparaisons sur du trié, ton compteur ou ta boucle a un bug
- Le pire cas de l'insertion est le tableau inversé : chaque élément traverse TOUT le trié — vérifie que tes chiffres explosent bien là

## 🔍 Comment vérifier ta solution
- Testeur : 20/20 pour les deux tris
- Insertion sur trié : comparaisons ≈ n-1, échanges = 0
- Bulles avec arrêt anticipé sur trié : UN parcours seulement

## ❓ Réponses du mini-quiz
1. **Pourquoi le tri par insertion est-il rapide sur un tableau presque trié ?**
   → Chaque élément est déjà (presque) à sa place : la boucle interne s'arrête immédiatement → proche de O(n).
2. **Qu'est-ce qu'un tri stable et un cas où ça compte ?**
   → Les égaux gardent leur ordre relatif. Tris successifs : trier par nom puis (stable) par service = groupes de service triés par nom à l'intérieur.
3. **Ton tri à bulles optimisé reste O(n²) : pourquoi ?**
   → Les optimisations réduisent les constantes, pas la croissance : sur un tableau aléatoire, le nombre d'opérations reste proportionnel à n². Big O ignore les constantes.
4. **Que garantit le sort natif de JS moderne ?**
   → O(n log n), stable, et il mute le tableau (copier avant si besoin). Comparateur obligatoire pour les nombres.

## 🧩 Questions de réflexion
- L'invariant de l'insertion (« la gauche est toujours triée ») ressemble à celui de la recherche binaire d'hier : formule ce que ces raisonnements ont en commun (une propriété VRAIE à chaque itération qui GARANTIT le résultat final).
- Le test par oracle exige une référence fiable : que fais-tu quand il n'y en a pas (indice : propriétés — un tableau trié a chaque élément ≤ au suivant) ?
