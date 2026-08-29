# V69 — Standard éditorial académique

> Document de référence. Il ne décrit pas une structure de sections : il décrit **ce qu'un
> texte doit faire au lecteur**. Tous les exemples viennent du corpus — aucun n'est inventé
> pour ce document.

---

## 1. Définir n'est pas enseigner

C'est la distinction dont tout le reste découle.

**Définir**, c'est donner le nom, la forme et les propriétés d'une chose à quelqu'un qui
saura alors la reconnaître.

**Enseigner**, c'est amener quelqu'un à pouvoir la **reconstruire** — donc lui montrer le
problème d'abord, la décision ensuite, et pourquoi cette décision plutôt qu'une autre.

Une définition répond à *« qu'est-ce que c'est ? »*. Un enseignement répond à *« comment
aurais-je pu le trouver ? »*.

### AVANT — corpus, `recursion`

> - **Backtracking (intro)** : générer les combinaisons = un arbre de choix (prendre/ne pas
>   prendre → 2 appels), on essaie, on explore, on DÉFAIT. 2^n sous-ensembles :
>   l'exponentiel vient du PROBLÈME, pas de la solution.

Trente-huit mots, tout est exact. Un lecteur qui connaît déjà le backtracking hoche la tête.
Un lecteur qui ne le connaît pas n'a **rien** à quoi se raccrocher : il ne sait pas ce qu'on
« défait », ni pourquoi il faudrait défaire quoi que ce soit.

### APRÈS — la forme attendue

Le texte doit d'abord créer le besoin de défaire :

> Pour lister tous les sous-ensembles de `[1,2,3]`, tu prends chaque élément et tu décides :
> je le garde, ou je ne le garde pas. Deux décisions par élément, trois éléments — huit
> chemins possibles. C'est un arbre, et l'écrire revient à parcourir cet arbre.
>
> Le problème arrive quand tu remontes. Si tu construis ton sous-ensemble dans un tableau
> partagé, l'élément que tu viens d'ajouter dans la branche « je le garde » est **toujours
> là** quand tu explores la branche « je ne le garde pas ». Tes deux branches ne partent pas
> du même état, et tes résultats sont faux.
>
> D'où le troisième geste, qui n'a rien d'évident tant qu'on ne s'est pas fait avoir :
> **avant de remonter, on retire ce qu'on avait ajouté.** C'est ce qu'on appelle défaire —
> et c'est la seule différence entre parcourir un arbre et faire du backtracking.

Le second passage est plus long. Ce n'est pas ce qui le rend meilleur : il est meilleur
parce qu'il fait **rencontrer le problème** que le mot « défaire » résout.

---

## 2. Le mouvement fondamental

```
PROBLÈME → INTUITION → MODÈLE MENTAL → VOCABULAIRE → MÉCANISME → EXEMPLE → LIMITE → PRATIQUE → TRANSFERT
```

Ce n'est pas une liste de sections. C'est l'ordre dans lequel le lecteur peut suivre.

**La règle qui en découle** : le mot technique arrive **après** que son besoin soit
intelligible. Exception : les termes triviaux, où l'attente coûterait plus qu'elle
n'apporterait (on n'introduit pas « fichier » par un problème).

Corpus, `terminal-shell-filesystem` — le mouvement en une phrase :

> Le shell cherche le programme dans les dossiers listés par la variable `PATH`, l'exécute,
> affiche sa sortie. C'est tout. **Une « commande magique » n'est jamais que : un programme,
> des arguments.**

Le mot `PATH` arrive au moment où le lecteur se demande comment le shell trouve le
programme. Pas avant.

---

## 3. L'exemple guidé — le cœur du sprint

> **Un exemple guidé montre comment on pense. Pas ce qu'on a conclu.**

### Ce qui n'en est pas

Quatre formes rencontrées dans le corpus, toutes intitulées « Exemple guidé » :

| Forme | Corpus | Pourquoi ce n'en est pas un |
|---|---|---|
| Le fragment commenté | `clean-code`, 13 mots | montre un avant/après ; aucune décision |
| La liste d'options | `architecture-basics`, 85 mots | tableau comparatif |
| Le catalogue | `portfolio-github`, 52 mots | énumération |
| Le gabarit à 4 étiquettes | 39 leçons, 54 mots | la ligne « Raisonnement » **annonce** un raisonnement |

### Ce qui en est un

Corpus, `javascript-basics` — le raisonnement est numéroté, et **chaque numéro est une
décision, pas une étape** :

> 1. « Les noms des employés tech » contient deux gestes, pas un : d'abord **choisir** des
>    employés, ensuite **en extraire** une donnée. Deux gestes, deux outils — `filter` puis
>    `map`. Écrire une seule boucle qui fait les deux marche aussi, mais on ne relit plus
>    l'intention.
> […]
> 3. Pour l'augmentation, la contrainte « sans abîmer l'original » est ce qui décide de
>    tout. Le réflexe naturel serait `lina.salaire *= 1.1`. Mais `lina` est une RÉFÉRENCE
>    vers l'objet du tableau : le modifier modifie la liste que l'autre écran affiche. Il
>    faut donc produire du NEUF.

Puis le code — **après** le raisonnement, jamais avant. Puis :

> **Ce que ça t'a appris** : la contrainte « sans toucher l'original » ne s'obtient pas en
> faisant attention, elle s'obtient en ne modifiant jamais.

### La forme attendue

Un exemple guidé comporte, dans l'ordre que le sujet impose :

1. **une situation** — assez précise pour qu'on voie ce qu'on a sous les yeux ;
2. **une contrainte** — ce qui rend le cas non trivial ;
3. **au moins trois décisions**, chacune avec *pourquoi celle-là* ;
4. **le réflexe naturel qui échoue**, quand il existe — nommé, pas seulement évité ;
5. **le code ou la manipulation**, après le raisonnement ;
6. **la lecture du résultat** — qu'est-ce qui prouve que ça marche ;
7. **l'enseignement généralisable** ;
8. **une variante qui déplace le problème** — un cas voisin que le lecteur doit résoudre.

Le point 8 est le test de transfert intégré au cours. Corpus, `typescript-basics` :

> **Variante qui déplace le problème** : ajoute `'archived'` à `Statut`. Le code ci-dessus
> continue de compiler — normal, il n'énumère pas les statuts. Mais écris maintenant une
> fonction qui rend une couleur par statut avec un `switch` […] : le compilateur signale que
> le cas `'archived'` ne renvoie rien. **C'est là que l'union littérale paie vraiment** :
> elle ne protège pas seulement contre les typos, elle te DÉSIGNE tous les endroits à mettre
> à jour le jour où le domaine change.

---

## 4. Vulgarisation et analogies

Une analogie est autorisée si — et seulement si — **sa limite est écrite**. Sans quoi elle
devient le modèle mental, et le lecteur raisonne sur l'image au lieu du mécanisme.

Corpus, `javascript-basics` — la forme complète :

> **Analogie** : le primitif est une photocopie (chacun la sienne) ; l'objet est un Google
> Doc partagé (deux liens, un seul document).
>
> **Limite de l'analogie** : avec un Google Doc, tu VOIS le curseur de l'autre bouger. Ici,
> rien ne signale le partage — c'est justement ce qui rend le bug si difficile. […] Retiens
> la conséquence plutôt que l'image : **passer un objet à une fonction, c'est lui donner le
> droit de le modifier.**

Contre-exemple relevé en V68, `networking-addressing-routing` **avant correction** :
la leçon annonçait partir de l'analogie des quartiers « en précisant vite ses limites », puis
employait « quartier » douze fois sans jamais en préciser aucune. Une limite promise et non
tenue est pire qu'une analogie assumée.

---

## 5. Densité cognitive

**Le défaut le plus répandu du corpus n'est pas la brièveté, c'est le nombre d'idées par
phrase.**

Corpus, `agent-workflows-orchestration` :

> découpage en unités reprenables, file de travail, état persisté, reprise sur échec
> PARTIEL, budget global avec arrêt propre, et traces par unité.

Six concepts, une phrase, aucun expliqué. Le lecteur qui les connaît lit une check-list ;
celui qui ne les connaît pas lit une liste de mots.

**La règle** : une idée neuve par phrase, et une phrase de conséquence après chaque idée
neuve. Si une phrase contient trois notions non encore construites, elle doit devenir trois
phrases — ou une seule notion et deux renvois.

Test opérationnel : *puis-je supprimer un mot technique de cette phrase sans que le lecteur
perde quelque chose ?* Si oui, il n'y était pas pour lui.

---

## 6. Correction

Acquis de V68 sur 66 leçons, repris ici sans changement :

1. le raisonnement attendu ;
2. **l'erreur probable nommée** — celle que le lecteur fera vraiment ;
3. **pourquoi elle séduit** ;
4. comment la reconnaître la prochaine fois ;
5. une **alternative défendable**, quand il y en a une ;
6. une **vérification sans corrigé** — des critères, pas des réponses.

Corpus, `git-fundamentals` :

> Le piège séduit parce que la résolution *ressemble* à une opération Git, alors que c'est
> une décision de code : on choisit ce que le programme doit faire, pas quelle version du
> texte garder.

---

## 7. Cas métier et entretien

**Cas métier** : une situation professionnelle réaliste, avec un coût. Pas de SaaS
générique. Le corpus fait déjà cela correctement — c'est l'une des dimensions à ne pas
abîmer.

**Entretien** : la question, ce qu'elle évalue, la bonne manière de raisonner, et le piège.
Pas une fiche à mémoriser. Corpus, `agents-fundamentals` :

> « Ton agent réussit 9 fois sur 10, c'est bon ? » → Pas sur une tâche à plusieurs étapes :
> les taux se multiplient. 90 % sur cinq étapes, c'est 59 %.

---

## 8. Interdits de forme — l'anti-slop

Aucune des 40 leçons ne doit devenir la copie d'une autre.

**Interdits** : « Dans cette leçon, nous allons… » ; le même nombre de sections partout ;
les mêmes titres partout ; les listes à puces interminables ; le triptyque
définition → exemple → résumé répété à l'identique ; les analogies systématiques ; les
phrases télégraphiques en série ; le gras à chaque ligne ; « important », « essentiel »,
« clé » en pilotage automatique ; les anecdotes inventées ; le storytelling artificiel ; les
slogans ; le langage corporate ; la répétition du titre dans chaque section.

**La forme suit le sujet** :

| Domaine | Forme naturelle |
|---|---|
| Git | une histoire de commits qui se déroule |
| SQL | un jeu de données qu'on interroge |
| Réseau | une requête qu'on suit couche par couche |
| React | un bug d'interface qu'on diagnostique |
| Statistiques | une donnée mal interprétée qu'on redresse |
| Linux | une machine qui rame et qu'on ausculte |
| LLM | une sortie plausible et fausse |

---

## 9. Exactitude

Toute affirmation vérifiable est vérifiée : calculs exécutés, commandes relues, définitions
contrôlées, simplifications annoncées comme telles.

Précédents à ne pas reproduire, tous trouvés dans ce dépôt :

- un p99 annoncé à 5 000 ms là où il vaut 50 ms (V68, `metrics-percentiles`) ;
- « ton acquis Next.js du mois 3 » alors qu'aucune journée n'enseigne Next.js (V68,
  `day-233`) ;
- des concepts cités au Vocabulaire et jamais prononcés ailleurs (31 leçons).

Si une affirmation ne peut pas être raisonnablement vérifiée depuis le dépôt : **ne pas
l'inventer**, reformuler prudemment, et documenter la limite.

---

## 10. Le test en six niveaux

Appliqué à chaque notion importante avant de considérer la leçon finie.

| Niveau | Question |
|---|---|
| 1 | Puis-je l'expliquer sans jargon ? |
| 2 | Puis-je ensuite introduire le vocabulaire correct ? |
| 3 | Puis-je expliquer le mécanisme ? |
| 4 | Puis-je expliquer quand l'utiliser ? |
| 5 | Puis-je expliquer quand **ne pas** l'utiliser ? |
| 6 | Puis-je résoudre un cas légèrement différent ? |

**Une leçon qui s'arrête au niveau 2 n'est pas approfondie** — c'est la définition
opérationnelle du registre B du CP0.
