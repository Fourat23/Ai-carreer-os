# Correction — Jour 32 : Récursion consolidée : backtracking d'introduction

[← Retour au jour 32](../days/day-032.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Voir le problème comme un arbre de décisions et appliquer le squelette du backtracking : à chaque niveau, énumérer les choix possibles, pour chacun CHOISIR (muter l'accumulateur), EXPLORER (récursion), puis DÉFAIRE (remettre l'accumulateur en état). Au cas de base, enregistrer une COPIE de la solution partielle. Sous-ensembles = choix binaire par élément (2ⁿ). Permutations = choix d'un élément non utilisé (n!). CombinaisonsDeSomme = sous-ensembles avec élagage quand la somme dépasse la cible.

## ✅ Une solution simple
Sous-ensembles par récursion à deux appels (avec/sans l'élément courant), en accumulant dans un tableau partiel copié au cas de base. Direct et suffisant pour de petits n.

## 🚀 Une solution améliorée
Factoriser le squelette (choisir/explorer/défaire) réutilisable pour les trois générateurs, ajouter l'ÉLAGAGE pour combinaisonsDeSomme (abandonner une branche dès que la somme partielle dépasse la cible), et dessiner l'arbre de décision pour [1,2,3] afin de PROUVER que l'exécution correspond aux 8 feuilles. Nommer la complexité (2ⁿ, n!) et sa cause.

## ⚠️ Erreurs probables et points à vérifier
- Muter l'accumulateur partagé sans en enregistrer une COPIE au cas de base : tous les résultats deviennent identiques.
- Oublier le « défaire » (pop) entre deux branches : les choix d'une branche polluent la suivante.
- Manquer le cas de base (plus d'éléments à décider) : récursion infinie ou dépassement de pile.
- Confondre l'exponentiel inévitable (2ⁿ résultats) avec un exponentiel dû à une mauvaise solution (recalcul redondant).

## 🔍 Comment vérifier ta solution
- sousEnsembles([1,2,3]) retourne exactement 8 tableaux, tous distincts.
- permutations([1,2,3]) retourne 6 résultats, chacun une permutation valide sans doublon.
- combinaisonsDeSomme ne retient que les sous-ensembles dont la somme égale la cible.
- L'arbre de décision dessiné correspond nœud par nœud aux appels tracés (ajouter des console.log).

## ❓ Réponses du mini-quiz
1. **Pourquoi les sous-ensembles de n éléments sont-ils au nombre de 2ⁿ ?**
   → Chaque élément offre 2 choix indépendants (dedans/dehors), donc 2 × 2 × … × 2 (n fois) = 2ⁿ configurations. L'arbre de décision a 2ⁿ feuilles.
2. **À quoi sert précisément le « pop » (défaire) dans le backtracking ?**
   → Il remet l'accumulateur PARTAGÉ dans son état d'avant le choix, pour que la branche suivante reparte propre. Sans lui, les choix s'accumulent et corrompent les autres branches.
3. **Pourquoi enregistre-t-on `[...partiel]` et non `partiel` au cas de base ?**
   → `partiel` est un tableau muté en continu : pousser sa référence ferait pointer tous les résultats vers le MÊME tableau, vidé au retour. La copie fige l'état à cet instant.
4. **En quoi cet exponentiel diffère-t-il de celui de fib(n) naïf ?**
   → Ici l'exponentiel est imposé par la TAILLE du résultat (2ⁿ sous-ensembles à produire) — inévitable. Pour fib naïf, il vient de sous-problèmes RECALCULÉS — évitable par mémoïsation.

## 🎤 À savoir expliquer à l'oral
Explique en dessinant : « chaque élément = un embranchement, la récursion descend, atteint une feuille = une solution, puis remonte en défaisant ». Insiste sur les deux pièges qui trahissent la compréhension : copier au cas de base et défaire au retour. Termine par l'analyse de complexité en distinguant l'exponentiel du problème (inévitable) de celui d'une solution maladroite (mémoïsable) — c'est ce raisonnement qui impressionne, plus que le code lui-même.
