# Correction — Jour 34 : Linked lists, arbres BST : coûts et parcours

[← Retour au jour 34](../days/day-034.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Traiter chaque structure comme un COMPROMIS et l'implémenter pour le vérifier. Liste chaînée : nœuds reliés par pointeurs, insertion en tête O(1), accès O(n), à prouver par un benchmark contre le tableau. BST : insert/contains par descente comparative O(hauteur), inorder récursif (gauche/nœud/droite) qui ressort le tri, hauteur pour mesurer l'équilibre. BFS avec la Queue du jour 33. Point clé : montrer le BST qui dégénère sur des données triées.

## ✅ Une solution simple
LinkedList (append/prepend/removeAt/toArray) et BST (insert/contains/inorder) implémentés directement, testés sur de petits cas construits à la main. Suffisant pour comprendre les pointeurs.

## 🚀 Une solution améliorée
Ajouter les benchmarks qui MATÉRIALISENT les compromis : insertion en tête liste vs unshift tableau (la liste gagne en théorie), et lecture séquentielle (le tableau gagne en pratique, cache CPU). Prouver l'inorder trié sur 20 insertions aléatoires, mesurer la hauteur, et DÉMONTRER la dégénérescence sur des données triées. Implémenter le BFS avec la Queue du jour 33 pour relier les structures.

## ⚠️ Erreurs probables et points à vérifier
- Perdre le reste de la liste en réaffectant les pointeurs dans le mauvais ordre lors d'une insertion/suppression.
- Croire le BST toujours O(log n) : sur des insertions triées il dégénère en O(n) — d'où AVL/rouge-noir à citer.
- Confondre les parcours DFS (pile/récursion) et BFS (file) : le BFS a besoin d'une Queue explicite.
- Conclure « la liste bat le tableau » sur la seule complexité : le cache CPU favorise souvent le tableau en pratique.

## 🔍 Comment vérifier ta solution
- LinkedList : les 4 opérations correctes, y compris sur liste vide (removeAt hors bornes géré).
- BST : inorder ressort les valeurs triées, prouvé sur 20 insertions aléatoires.
- Le benchmark insertion-en-tête liste vs unshift tableau montre l'écart attendu et est expliqué.
- La dégénérescence du BST sur données triées est reproduite (hauteur = n) et commentée.

## ❓ Réponses du mini-quiz
1. **Pourquoi insérer en tête d'une liste chaînée est-il O(1) alors que dans un tableau c'est O(n) ?**
   → La liste crée un nœud qui pointe l'ancienne tête : rien à déplacer. Le tableau doit DÉCALER tous les éléments existants d'un cran pour libérer l'index 0.
2. **Pourquoi le parcours in-order d'un BST ressort-il les valeurs triées ?**
   → Par construction, tout le sous-arbre gauche d'un nœud est plus petit, tout le droit plus grand. Visiter gauche → nœud → droite parcourt donc les valeurs en ordre croissant.
3. **Que se passe-t-il si on insère des valeurs déjà triées dans un BST ?**
   → Chaque insertion part du même côté : l'arbre dégénère en liste chaînée (hauteur = n), et la recherche retombe de O(log n) à O(n). D'où les arbres auto-équilibrés (AVL, rouge-noir).
4. **DFS et BFS : lequel utilise une pile, lequel une file ?**
   → DFS (profondeur) utilise une pile — implicitement, la call stack de la récursion. BFS (largeur) utilise une file : on enfile la racine, on défile en enfilant les enfants, niveau par niveau.

## 🎤 À savoir expliquer à l'oral
Structure ta réponse autour du mot COMPROMIS : « chaque structure rend une chose gratuite en en rendant une autre chère ». Oppose tableau et liste comme des miroirs, puis explique le BST par la recherche binaire en structure et prouve l'inorder trié. Marque des points en soulevant spontanément les deux nuances de maturité : le BST dégénéré (et son remède auto-équilibré) et le rôle du cache CPU — ça montre que tu vas au-delà de la complexité de manuel.
