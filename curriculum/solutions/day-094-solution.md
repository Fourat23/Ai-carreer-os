# Correction — Jour 94 : Rendu conditionnel et listes

[← Retour au jour 94](../days/day-094.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : map avec key + un ternaire pour le cas vide. Solution améliorée : gérer les trois états (chargement, vide, rempli) explicitement et dans le bon ordre, utiliser une key issue des données (id métier stable), dériver la liste filtrée du state de recherche (pas de doublon de state), et éviter le piège `length &&` qui affiche 0. La preuve de maîtrise : supprimer/réordonner un élément ne décale aucune donnée voisine.

## ⚠️ Erreurs probables et points à vérifier
- key = index sur une liste filtrable/réordonnable : React apparie les mauvais éléments, bugs d'état difficiles à reproduire.
- `{liste.length && <X/>}` : affiche `0` quand vide — toujours `length > 0 &&`.
- Oublier le cas vide : l'écran reste blanc sans expliquer pourquoi — un état vide explicite est attendu.
- Stocker la liste filtrée en state au lieu de la dériver : désynchronisation avec la recherche (jour 93).

## 🔍 Comment vérifier ta solution
- Chaque élément de liste a une key stable issue des données (pas l'index).
- Les états chargement, vide et rempli sont tous rendus explicitement.
- La liste filtrée est dérivée du state de recherche.
- Le cas vide affiche un message clair.
- Supprimer/réordonner ne décale aucune valeur voisine (test de la variante).

## 🎤 À savoir expliquer à l'oral
Explique la réconciliation par key : « React apparie les éléments par leur key pour mettre à jour le minimum ; un index n'est pas une identité stable, donc il se trompe d'élément quand la liste bouge ». Montre le bug du champ qui garde la valeur du voisin supprimé — c'est la démonstration concrète qui prouve que tu as compris à quoi sert vraiment la key.
