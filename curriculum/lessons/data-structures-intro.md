<!-- keep -->
# Leçon — Structures de données : choisir son outil

## 🌍 Le problème d'abord
Tu as une liste de 10 millions de pseudos et tu veux savoir « est-ce que “alice” est déjà
pris ? ». Si tu parcours toute la liste à chaque fois, ton programme rame. Mais si tu avais
rangé les pseudos différemment, la réponse serait INSTANTANÉE. Voilà toute l'idée des
**structures de données** : la même information, RANGÉE autrement, rend certaines questions
ultra-rapides (et d'autres lentes). Il n'existe pas de rangement « meilleur » dans l'absolu
— seulement un rangement adapté à la question que tu poses le plus souvent. Cette leçon
t'apprend à reconnaître, pour un problème donné, quel outil de rangement choisir et à le
justifier.

## 🎯 Objectif
Connaître les structures de base (tableau, hash map, set, pile, file, arbre, graphe),
comprendre le **coût** de leurs opérations, et savoir **choisir** la bonne en identifiant
l'opération dominante d'un problème — puis justifier ce choix à voix haute.

## 🧩 Prérequis
Tu dois savoir manipuler tableaux, objets et boucles (`/doc/lessons/javascript-basics`) et
avoir l'intuition du coût d'un algorithme — « combien d'opérations quand la donnée
grossit ? » (`/doc/lessons/algorithmic-thinking`). La notation Big-O est utilisée ici comme
simple outil de COMPARAISON, pas comme exercice mathématique.

## 🧠 Modèle mental
Une structure de données est un RANGEMENT : elle rend rapides certaines opérations en
acceptant d'en rendre d'autres lentes. Le raisonnement est toujours le même : quelle est
l'opération que mon problème fait le PLUS souvent (chercher ? insérer ? garder l'ordre ?
associer une clé à une valeur ?), et quelle structure rend CETTE opération peu coûteuse ?
Choisir une structure, c'est répondre à cette question — pas mémoriser un tableau.

## 💡 Pourquoi c'est important
Une structure de données est une façon d'ORGANISER l'information pour rendre certaines opérations rapides — et d'autres lentes. Tout le jeu est là : il n'y a pas de structure « meilleure », seulement des structures adaptées à un usage. Savoir choisir (et justifier) est LA question technique junior par excellence, et la moitié de l'infrastructure moderne n'est que des structures de données géantes : Redis est une hash map, RabbitMQ une queue, un index de base de données un arbre.

## Explication complète

### Le tableau de bord des coûts (à connaître par cœur)
| Structure | Accès | Recherche | Insertion | Point fort |
|---|---|---|---|---|
| Tableau | O(1) par index | O(n) | O(1) fin / O(n) début | ordre + accès direct |
| Hash map (Map/objet) | O(1) par clé | O(1) | O(1) | associer clé→valeur |
| Set | — | O(1) | O(1) | appartenance, unicité |
| Liste chaînée | O(n) | O(n) | O(1) aux extrémités | insertions sans décalage |
| Stack (pile) | sommet O(1) | — | O(1) | LIFO : annuler, imbriquer |
| Queue (file) | tête O(1) | — | O(1) | FIFO : traiter dans l'ordre |
| Arbre (BST équilibré) | — | O(log n) | O(log n) | données TRIÉES dynamiques |
| Graphe | — | parcours | — | relations quelconques |

### Le hachage : l'astuce derrière le O(1)
Comment retrouver « Alice » parmi un million d'entrées sans parcourir ? Une **fonction de hachage** transforme la clé en position mémoire (« Alice » → case 7). Chercher = recalculer la position = direct. C'est l'idée derrière Map, Set, les objets JS, les index, les caches. Le grand échange qu'elle incarne : **de la mémoire contre du temps** — une structure auxiliaire qui supprime les re-parcours.

Les trois réflexes hash map à automatiser : **COMPTER** (Map de compteurs), **DÉDOUBLONNER** (Set), **CROISER** deux collections (Set de l'une, parcours de l'autre : intersection en O(n+m) au lieu de O(n×m)).

### LIFO et FIFO : deux disciplines de file d'attente
La **stack** (pile d'assiettes) sort le DERNIER entré : elle porte l'undo/redo, la vérification de parenthèses, et la *call stack* qui exécute ta récursion. La **queue** (file de supermarché) sort le PREMIER entré : files de traitement, BFS, files de messages entre services (mois 10).

### Les arbres : la hiérarchie
Un **arbre** représente ce qui s'emboîte : systèmes de fichiers, JSON, DOM, organisations. Le **BST** (binary search tree) y ajoute un ordre (gauche < nœud < droite) : chercher y est une recherche binaire vivante, O(log n)… tant qu'il est équilibré (inséré trié, il dégénère en liste — d'où les arbres auto-équilibrés, à connaître de nom : AVL, rouge-noir). Deux parcours à maîtriser : **DFS** (profondeur — naturellement récursif) et **BFS** (largeur, niveau par niveau — avec une queue).

### Le graphe : les relations libres
Quand les liens ne sont plus hiérarchiques (réseaux sociaux, dépendances, cartes), c'est un **graphe** : des nœuds + des arêtes. Les mêmes parcours (BFS/DFS) s'y appliquent, avec UN ajout crucial : marquer les nœuds visités (un Set) pour ne pas boucler.

## Concepts clés
Coût par opération · hachage · Map vs objet (clés de tout type, `.size`, itération) · Set · LIFO/FIFO · liste chaînée (pointeurs) · arbre, BST, équilibre · DFS/BFS · graphe, cycle, « déjà visité » · index inversé (mot → documents qui le contiennent).

## 🧭 Exemple guidé
Choisir en une phrase :
- Historique back/forward d'un navigateur → **deux stacks** (LIFO naturel).
- File d'impression → **queue** (premier arrivé, premier servi).
- « Ce pseudo est-il pris ? » sur 10M de comptes → **Set** (O(1)).
- Autocomplétion triée → **arbre** (données ordonnées dynamiques).
- Compter les mots d'un corpus → **Map** de compteurs.
Chaque choix se justifie par UNE opération dominante et son coût.

## ⚠️ Erreurs fréquentes
- Tout faire au tableau + `includes` : des O(n²) déguisés partout.
- `new Map(arr)` attend des PAIRES `[[k, v], ...]` — pas des valeurs simples.
- BST alimenté par des données triées : O(n) au lieu de O(log n).
- Parcourir un graphe sans Set des visités : boucle infinie au premier cycle.

## 🔗 Liens avec le programme
L'**index inversé** (mot → ensemble de documents) est le cœur de la recherche lexicale BM25 de ton RAG hybride (mois 9) — tu le construiras toi-même en 30 lignes avec une Map de Sets. Les documents à chunker sont des ARBRES (sections/sous-sections). Le cache LLM (mois 10) est une Map avec politique d'éviction (LRU). Et les files de messages (mois 10) sont des queues distribuées.

## Mini-exercice
Sur 20 phrases : construis un index inversé (Map mot → Set d'indices), puis `rechercher(mot1, mot2)` qui renvoie les phrases contenant LES DEUX (intersection de Sets). Tu viens d'écrire le cœur d'un moteur de recherche.

## 📚 Vocabulaire
**hachage** · **collision** · **LIFO / FIFO** · **nœud / pointeur** · **racine / feuille / profondeur** · **BST** · **équilibrage** · **DFS / BFS** · **graphe / cycle** · **index inversé** · **LRU**.

## 🧾 À retenir
Chaque structure rend certaines opérations O(1) ou O(log n) au prix d'autres : le métier consiste à identifier l'opération DOMINANTE de ton problème et à choisir en conséquence. Hash map pour associer/compter/croiser, Set pour l'appartenance, stack/queue pour l'ordre de traitement, arbre pour la hiérarchie et le tri dynamique, graphe pour les relations libres. Ces choix — justifiés à voix haute — sont exactement ce qu'évalue un entretien technique.
