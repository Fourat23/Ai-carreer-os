# Correction — Jour 34 : Linked lists, arbres BST : coûts et parcours

[← Retour au jour 34](../days/day-034.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Liste chaînée : chaque nœud pointe le suivant ; insérer en tête = O(1), accéder au n-ième = O(n). BST : gauche < nœud < droite ; contains = recherche binaire sur arbre O(hauteur) ; inorder ressort le tri. DFS = récursion, BFS = queue.

## ⚠️ Erreurs probables et points à vérifier
- Perdre le reste de la liste en réaffectant les pointeurs dans le mauvais ordre.
- BST déséquilibré (insertions triées) dégénère en O(n) — d'où AVL/rouge-noir, à connaître de nom.

## 🧩 Questions de réflexion
- Pourquoi l'inorder d'un BST est-il trié ? (dessine 5 nœuds) Le tableau bat-il souvent la liste chaînée en pratique — pourquoi (cache CPU) ?
