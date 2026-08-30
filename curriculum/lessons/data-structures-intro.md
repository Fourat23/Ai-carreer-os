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

## 🧭 Exemple guidé — dédoublonner un million de lignes

**La situation.** Un fichier d'export contient 1 000 000 d'adresses e-mail, avec des
doublons. Tu dois produire la liste des adresses uniques, dans l'ordre de première
apparition.

**Décision 1 — le premier réflexe, et pourquoi il ne tient pas.**

Presque tout le monde écrit ceci, et c'est un code correct :

```js
const uniques = [];
for (const email of emails) {
  if (!uniques.includes(email)) uniques.push(email);   // ❌ le piège est ici
}
```

Le problème n'est pas visible à la lecture, parce que `includes` **ressemble** à une
opération élémentaire. Elle ne l'est pas : pour savoir si une valeur est dans un tableau,
il faut la comparer à chaque élément, un par un. C'est O(n).

Et cet appel est **dans** une boucle qui parcourt le million. Au millième e-mail, `includes`
en compare mille ; au cent-millième, cent mille. Le nombre total de comparaisons est de
l'ordre de n²/2, soit **cinq cents milliards**. Le programme ne plante pas : il ne finit
jamais, ce qui est plus difficile à diagnostiquer.

**Le repère à emporter : une recherche linéaire à l'intérieur d'une boucle est un O(n²) qui
ne se voit pas**, parce que la boucle intérieure est cachée dans un nom de méthode.

**Décision 2 — nommer l'opération dominante avant de choisir.**

C'est le geste central de cette leçon. On ne se demande pas « quelle structure est la
meilleure », on se demande **ce que le programme fait le plus souvent**.

Ici, une seule opération est répétée un million de fois : *« ai-je déjà vu cette valeur ? »*
C'est une **appartenance**. Ni un tri, ni un accès par position, ni un parcours ordonné —
une appartenance.

Et il se trouve qu'une structure existe dont c'est précisément le métier : la table de
hachage, exposée en JavaScript sous les noms `Set` et `Map`. Elle calcule à partir de la
valeur une position dans un tableau interne, et va directement voir si quelque chose s'y
trouve. Le temps de réponse ne dépend **pas** du nombre d'éléments déjà stockés : c'est
O(1).

```js
const vus = new Set();
const uniques = [];
for (const email of emails) {
  if (!vus.has(email)) { vus.add(email); uniques.push(email); }
}
```

Un million d'appels à `has`, chacun à coût constant. On passe de cinq cents milliards de
comparaisons à un million d'opérations — un facteur cinq cent mille, obtenu en changeant
une structure, pas un algorithme.

**Décision 3 — pourquoi garder le tableau à côté du Set.**

On pourrait croire que `[...new Set(emails)]` suffit. C'est vrai ici, parce que les `Set`
JavaScript conservent l'ordre d'insertion — mais c'est une **garantie du langage, pas une
propriété des tables de hachage**. Dans beaucoup de langages, l'ordre d'un ensemble est
arbitraire, et la contrainte « ordre de première apparition » serait perdue.

Garder les deux rend l'intention explicite : le `Set` répond à la question, le tableau
détient le résultat. C'est aussi ce qui permettra, si la spécification change, de trier
autrement sans toucher à la logique de dédoublonnage.

**Comment tu sais que ça marche.** Chronomètre les deux versions sur 50 000 lignes — pas un
million, tu n'attendrais pas la fin de la première. Tu dois observer un écart de plusieurs
ordres de grandeur, et **le même résultat exactement** : même longueur, même ordre. Si les
longueurs diffèrent, c'est une histoire de normalisation (`Alice@x.com` et `alice@x.com`
sont deux valeurs distinctes pour un `Set`), et cette décision-là est métier, pas technique.

**Ce que ça t'a appris.** Choisir une structure de données, ce n'est pas connaître un tableau
de complexités. C'est **nommer l'opération que le programme répète le plus**, puis prendre
la structure qui la rend peu coûteuse. Toutes les autres opérations deviennent secondaires —
on accepte qu'elles soient lentes, parce qu'elles sont rares.

**Variante qui déplace le problème.** On ne veut plus les adresses uniques, mais les **dix
plus fréquentes**. Repose la question : quelle opération domine ? Ce n'est plus
l'appartenance mais le **comptage** — donc une `Map` de compteurs, un million d'incréments à
coût constant. Puis vient une seconde opération, exécutée **une seule fois** : trouver les
dix plus grands parmi les compteurs. Trier l'ensemble coûte O(m log m), ce qui est
parfaitement acceptable pour une opération unique. **Une structure ne se choisit jamais sur
l'opération rare, et une opération rare ne justifie presque jamais une structure
compliquée.**

## ⚠️ Erreurs fréquentes
- Tout faire au tableau + `includes` : des O(n²) déguisés partout.
- `new Map(arr)` attend des PAIRES `[[k, v], ...]` — pas des valeurs simples.
- BST alimenté par des données triées : O(n) au lieu de O(log n).
- Parcourir un graphe sans Set des visités : boucle infinie au premier cycle.

## 🔗 Liens avec le programme
L'**index inversé** (mot → ensemble de documents) est le cœur de la recherche lexicale BM25 de ton RAG hybride (mois 9) — tu le construiras toi-même en 30 lignes avec une Map de Sets. Les documents à chunker sont des ARBRES (sections/sous-sections). Le cache LLM (mois 10) est une Map avec politique d'éviction (LRU). Et les files de messages (mois 10) sont des queues distribuées.

## Mini-exercice
Sur 20 phrases : construis un index inversé (Map mot → Set d'indices), puis `rechercher(mot1, mot2)` qui renvoie les phrases contenant LES DEUX (intersection de Sets). Tu viens d'écrire le cœur d'un moteur de recherche.

## 🔥 Exercice plus difficile
Cette leçon t'a donné des coûts. **Ne les crois pas : mesure-les.** Trois mesures, un
banc d'essai que tu écris toi-même. Chauffe toujours la fonction une fois avant de
chronométrer, sinon tu mesures la compilation du moteur et non ton code.

**A — la classe de coût.** Pour n = 100, 1 000, 10 000 et 100 000, compare la recherche
d'un élément **absent** dans un tableau (`.includes`) et dans un `Set` (`.has`). Livrable :
le tableau des quatre rapports. Le chiffre à interpréter n'est pas la durée mais **la
façon dont le rapport évolue quand n est multiplié par dix**.

**B — le seuil de rentabilité.** Construire un `Set` coûte aussi. À n = 10 000 fixé,
compare « k recherches dans le tableau » à « construire le Set + k recherches », pour
k = 1, 5, 20, 50, 100, 200, 500, 1 000. Livrable : le k à partir duquel le `Set` devient
gagnant. Prédis-le **avant** de lancer, et note ta prédiction.

**C — la file d'attente.** Vide une file de n éléments de deux façons : `while (f.length)
s += f.shift()` d'un côté, un index de tête qui avance de l'autre. Fais-le pour
n = 10 000, puis 100 000. **Prévois du temps** : l'une des deux versions va te surprendre,
et il faut la laisser finir pour voir de combien.

**Critère de réussite** : tu peux répondre par écrit à « une structure asymptotiquement
meilleure est-elle toujours le bon choix ? » en citant **ton propre** chiffre du B.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. `.includes` sur 100 éléments prend 0,00045 ms, `.has` prend 0,00006 ms. Pourquoi ce
   rapport de 8 ne prouve-t-il presque rien, alors que le même rapport mesuré à n = 100 000
   prouve quelque chose ?
2. Dans le B, pourquoi la ligne « Set + construction » reste-t-elle à peu près constante
   quand k passe de 1 à 2 000, alors que la ligne « tableau » est multipliée par plus de
   mille ?
3. Un objet ordinaire et une `Map` sont tous deux annoncés en coût constant. Peuvent-ils
   avoir des vitesses différentes ? Si oui, que signifie exactement « coût constant » ?
4. Ton index inversé associe un mot à un `Set` d'indices. Pourquoi un `Set` et non un
   tableau, et à partir de quand la différence devient-elle visible ?

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

### Correction de l'exercice difficile

> Mesures produites par `scripts/v70-verifications/structures-couts-mesures.mjs`
> sur Node.js 22. **Tes durées absolues seront différentes** — autre machine, autre
> charge. Les rapports, eux, tiendront.

**A — la classe de coût.** Recherche d'un élément absent :

| n | `.includes` | `.has` | rapport |
|---|---|---|---|
| 100 | 0,00045 ms | 0,00006 ms | ×8 |
| 1 000 | 0,00158 ms | 0,00004 ms | ×35 |
| 10 000 | 0,01067 ms | 0,00005 ms | ×222 |
| 100 000 | 0,15021 ms | 0,00004 ms | ×3 494 |

La lecture correcte n'est aucune de ces lignes prise seule. C'est la **colonne `.has`** :
elle ne bouge pas quand n est multiplié par mille. Et c'est la **colonne `.includes`** :
elle est multipliée par dix quand n l'est. Voilà ce que « constant » et « linéaire »
veulent dire — pas « rapide » et « lent », mais « indépendant de n » et « proportionnel
à n ». Un rapport unique ne dit rien ; c'est la **pente** qui identifie la classe.

**B — le seuil, et c'est là que la surprise arrive.** À n = 10 000 :

| k recherches | tableau | Set + construction | gagnant |
|---|---|---|---|
| 1 | 0,0015 ms | 0,9270 ms | tableau |
| 5 | 0,0069 ms | 0,8591 ms | tableau |
| 20 | 0,0827 ms | 0,8462 ms | tableau |
| 50 | 0,6314 ms | 0,8534 ms | **tableau** |
| 100 | 1,1987 ms | 0,8126 ms | **Set** |
| 1 000 | 12,3808 ms | 0,8327 ms | Set |

Le basculement est **entre 50 et 100 recherches**. En dessous, la structure
« asymptotiquement mauvaise » gagne — et elle gagne largement : à une seule recherche, le
tableau est six cents fois plus rapide que la solution savante.

**L'erreur probable, et elle est encouragée par les cours d'algorithmique.** On apprend
que le `Set` est meilleur, on en déduit qu'il faut toujours l'utiliser, et l'on construit
un `Set` de dix mille éléments pour faire trois recherches. La théorie décrit un
**comportement à l'infini** ; ton programme, lui, s'exécute sur des tailles finies avec
des constantes réelles. « Meilleure complexité » ne veut pas dire « plus rapide ici », et
la seule façon de savoir est celle que tu viens d'employer : mesurer.

Le piège séduit parce que la complexité asymptotique est enseignable et vérifiable à la
lecture, alors que la constante ne se connaît qu'en exécutant. On préfère le critère
qu'on peut appliquer sans se lever.

**C — la file d'attente.**

| n | `shift()` | index de tête | rapport |
|---|---|---|---|
| 10 000 | 1,61 ms | 0,71 ms | ×2 |
| 100 000 | **12 280 ms** | 6,32 ms | ×1 943 |
| 200 000 | **50 096 ms** | 9,61 ms | ×5 212 |

Douze secondes, puis cinquante. Ce n'est pas une lenteur, c'est un changement de nature :
en doublant n, le temps est multiplié par quatre — la signature d'un coût quadratique.
`shift()` décale tous les éléments restants d'un cran ; le faire n fois coûte n²/2
déplacements. L'index de tête, lui, n'écrit rien : il avance un compteur.

Et la vraie leçon est dans la première ligne : à n = 10 000, l'écart n'est que de ×2.
**Le défaut est invisible pendant les tests et catastrophique en production**, parce que
la volumétrie de test est presque toujours un ordre de grandeur en dessous. C'est le même
mécanisme que la requête N+1 de la leçon `sql-performance-indexing`.

**Généralisation.** Ces trois mesures disent la même chose sous trois angles : la
complexité te dit **comment le coût évolue**, jamais **combien il coûte**. Les deux
questions sont utiles et il faut les poser dans cet ordre — d'abord la pente, parce
qu'elle décide de ce qui arrivera quand les données grossiront ; ensuite la constante,
parce qu'elle décide de ce qui se passe aujourd'hui.

### Correction de la vérification de compréhension

1. À n = 100, le rapport de 8 peut venir d'à peu près n'importe quoi — coût d'appel,
   optimisation du moteur, bruit de mesure. À n = 100 000, un rapport de 3 494 ne peut
   plus s'expliquer par une constante : il faut un terme qui grandit avec n. **Un rapport
   isolé ne démontre rien ; une série de rapports croissants démontre une classe de coût.**
2. Parce que le coût de la ligne « Set » est presque entièrement celui de la
   **construction**, payé une fois quel que soit k ; les k recherches qui suivent sont
   gratuites à l'échelle du graphique. La ligne « tableau » n'a pas de coût fixe mais paie
   k fois un parcours complet. C'est un coût fixe contre un coût variable — le même
   arbitrage qu'entre un index de base de données et un balayage de table.
3. **Oui, et c'est mesuré** : insertion 20,1 ms contre 15,3 ms (×1,32), lecture 6,3 ms
   contre 5,2 ms (×1,23), à 100 000 clés. « Coût constant » ne signifie pas « même
   vitesse » ni « instantané » : il signifie que la durée **ne dépend pas du nombre
   d'éléments**. Deux structures en coût constant peuvent différer d'un facteur mesurable,
   et le seul moyen de connaître ce facteur est de le chronométrer.
4. Un `Set` parce que la même phrase peut contenir deux fois le mot, et parce que
   l'intersection interroge l'appartenance en boucle. Avec un tableau, chaque `includes`
   de l'intersection redevient un parcours : d'après le tableau du B, la différence
   devient visible au-delà d'une centaine d'interrogations — soit, pour un index, dès la
   première requête à deux mots un peu fréquents.

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
