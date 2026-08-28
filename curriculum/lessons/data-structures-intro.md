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

## ✅ Correction attendue
**La démarche** : l'index se construit en une passe. Pour chaque phrase, pour chaque mot, on ajoute l'indice de la phrase au `Set` associé au mot. La recherche à deux mots est une **intersection** : on prend le plus petit des deux ensembles et on ne garde que ses éléments présents dans l'autre.

```js
const index = new Map();
phrases.forEach((p, i) => {
  for (const mot of p.toLowerCase().split(/\W+/).filter(Boolean)) {
    if (!index.has(mot)) index.set(mot, new Set());
    index.get(mot).add(i);
  }
});
```

**L'erreur probable, et pourquoi elle rend le résultat FAUX plutôt que lent.** L'intersection s'écrit très souvent comme ceci :

```js
const a = index.get(mot1), b = index.get(mot2);
return [...a].filter((i) => b.has(i));
```

Ça marche… tant que les deux mots existent. Si l'un est absent de l'index, `index.get` renvoie `undefined`, et `[...undefined]` lève une exception. Le piège est redoutable parce qu'un moteur de recherche reçoit **par nature** des mots absents — c'est le cas le plus fréquent en production, et c'est celui qu'on ne teste jamais parce qu'on essaie ses propres mots. Le bon réflexe : `index.get(mot) ?? new Set()`, et un ensemble vide donne une intersection vide, ce qui est la bonne réponse.

Deuxième erreur, silencieuse celle-là : oublier `toLowerCase()`. « Chat » et « chat » deviennent deux entrées, la recherche marche pour l'une et pas pour l'autre, et rien ne signale l'anomalie. La **normalisation** est un choix de conception, pas un détail — c'est déjà la question que tu te reposeras sur le chunking de ton RAG.

**Alternative défendable** : `Map<mot, number[]>` au lieu de `Map<mot, Set>`. Un tableau consomme moins de mémoire et se sérialise directement en JSON — c'est ce que font les vrais index sur disque. En échange, l'intersection exige des listes triées et une fusion, au lieu du `has` en O(1). Set pour un index en mémoire qu'on interroge ; tableau trié pour un index qu'on stocke et qu'on relit.

**Vérifie seul, sans corrigé** :
1. `rechercher('mot-inexistant', 'chat')` renvoie une liste vide — pas une exception.
2. `rechercher('Chat', 'souris')` donne le même résultat que `rechercher('chat', 'souris')`.
3. Une phrase contenant deux fois le même mot n'apparaît qu'une fois dans le résultat — c'est le `Set` qui te l'offre gratuitement.
4. Compare avec la version naïve (deux boucles imbriquées sur les phrases) sur 20 000 phrases : les deux doivent rendre **exactement** le même résultat. C'est le test par oracle du jour 20, appliqué ici.

## 🏢 Cas professionnel
Une équipe stocke les identifiants d'utilisateurs autorisés dans un tableau et vérifie l'accès par `autorises.includes(id)` à chaque requête. Avec 200 utilisateurs, personne ne remarque rien. À 50 000 utilisateurs et 3 000 requêtes par seconde, le serveur passe l'essentiel de son temps à parcourir ce tableau. Le correctif tient en un mot — `new Set(autorises)` et `.has(id)` — et divise la latence par cent.

Ce qui rend l'histoire instructive n'est pas la solution, c'est **pourquoi personne ne l'a vue venir** : le code était correct, lisible, testé, et il l'est resté. Seule l'échelle a changé. C'est le sens de la phrase d'ouverture de cette leçon — la même information, rangée autrement. Un `includes` dans une boucle chaude est probablement le défaut de performance le plus répandu du métier, et il ne se voit jamais sur les données de développement.

La contrepartie, elle, est réelle : le `Set` occupe de la mémoire en plus et doit être reconstruit quand la liste change. Choisir une structure, c'est accepter un coût pour en supprimer un autre — jamais obtenir quelque chose gratuitement.

## 🎤 Questions d'entretien
- « Quelle structure choisis-tu, et pourquoi ? » → Nomme d'abord l'opération DOMINANTE de ton problème, puis la structure qui la rend peu coûteuse. Une réponse qui commence par le nom d'une structure a sauté le raisonnement.
- « Comment une hash map fait-elle du O(1) ? » → Une fonction de hachage transforme la clé en position ; on ne cherche pas, on calcule où regarder. Le coût est la mémoire et la gestion des collisions.
- « Quand un tableau vaut-il mieux qu'un Set ? » → Quand l'ordre compte, quand on accède par index, quand la collection est petite, ou quand la mémoire est plus contrainte que le temps.
- « Pourquoi marquer les nœuds visités dans un parcours de graphe ? » → Parce qu'un graphe peut contenir des cycles : sans mémoire des nœuds déjà vus, le parcours boucle indéfiniment. C'est ce qui distingue un graphe d'un arbre.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Devant un problème, je nomme l'opération dominante AVANT de choisir une structure.
- [ ] Je repère un `includes` ou un `indexOf` dans une boucle et je sais ce qu'il coûte.
- [ ] Je sais dire ce que je paie en échange de ce que je gagne, pour chaque structure.
- [ ] J'ai écrit un index inversé de mes propres mains au moins une fois.

## 📚 Vocabulaire
**hachage** · **collision** · **LIFO / FIFO** · **nœud / pointeur** · **racine / feuille / profondeur** · **BST** · **équilibrage** · **DFS / BFS** · **graphe / cycle** · **index inversé** · **LRU**.

## 🧾 À retenir
Chaque structure rend certaines opérations O(1) ou O(log n) au prix d'autres : le métier consiste à identifier l'opération DOMINANTE de ton problème et à choisir en conséquence. Hash map pour associer/compter/croiser, Set pour l'appartenance, stack/queue pour l'ordre de traitement, arbre pour la hiérarchie et le tri dynamique, graphe pour les relations libres. Ces choix — justifiés à voix haute — sont exactement ce qu'évalue un entretien technique.
