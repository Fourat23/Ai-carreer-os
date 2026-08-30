<!-- keep -->
# Leçon — Réseaux de neurones : ouvrir la boîte noire

## 🌍 Le problème d'abord
« Réseau de neurones », « deep learning », « intelligence artificielle » : les mots
impressionnent et donnent l'impression d'une magie inaccessible. Pourtant, à la base, il y a
une idée simple. Imagine une machine avec des milliers de petits boutons à régler, et une
note qui te dit à quel point elle se trompe. Si tu savais, pour chaque bouton, dans quel sens
le tourner pour améliorer la note, tu pourrais — en répétant des millions de fois — obtenir
une machine très performante. C'est EXACTEMENT ce qu'est l'entraînement d'un réseau de
neurones : des poids (les boutons), une loss (la note), un gradient (le sens du réglage). Pas
de magie — des maths simples empilées. Cette leçon ouvre la boîte noire pour que tu raisonnes
sur les réseaux (et plus tard les LLM) au lieu de les subir.

## 🎯 Objectif
Comprendre ce qu'est VRAIMENT un réseau de neurones (une composition de fonctions simples optimisée par gradient), savoir en entraîner un petit en PyTorch, et diagnostiquer avec les courbes. Le socle pour comprendre les transformers et les LLM — pas de la magie, des maths simples empilées.

## 🧠 Modèle mental
Un réseau de neurones, c'est **une machine à régler des boutons** : des millions de boutons (les poids), une note à chaque essai (la loss), et une méthode pour savoir dans quel sens tourner chaque bouton pour améliorer la note (le gradient). L'entraînement = tourner les boutons petit à petit jusqu'à ce que la note soit bonne.

## 🧩 Prérequis
Tu dois comprendre ce qu'est un modèle supervisé et son entraînement, la loss et la notion de
métrique (`/doc/lessons/machine-learning-basics`), ainsi que overfitting / train-validation et
les réflexes statistiques (`/doc/lessons/statistics-for-ml`, `/doc/lessons/model-evaluation`),
car un réseau se diagnostique par ses courbes train/validation. Une intuition de la dérivée
(la pente d'une fonction) aide pour le gradient, mais on la construit ici par l'image de la
vallée. Aucun framework n'est supposé.

## 📖 Explication complète
- **Le neurone** : une somme pondérée + un biais + une **activation** non linéaire (`sortie = f(w·x + b)`). Sans la non-linéarité, empiler des couches ne servirait à rien (une composition de fonctions linéaires reste linéaire) — c'est elle qui permet d'apprendre des formes complexes.
- **Le réseau (MLP)** : des couches de neurones — chaque couche transforme la représentation, des pixels bruts vers des concepts de plus en plus abstraits.
- **La loss** : UN nombre qui mesure « à quel point on se trompe » sur les exemples. Tout l'entraînement consiste à la faire baisser.
- **La descente de gradient** : le gradient dit, pour CHAQUE poids, dans quel sens le bouger pour réduire la loss (calculé efficacement par **backpropagation** — la règle de dérivation en chaîne, automatisée). On fait un petit pas (le **learning rate**) dans ce sens, et on recommence. LR trop grand : ça diverge ; trop petit : ça n'avance pas — les deux pathologies à savoir reconnaître.
- **La boucle d'entraînement** : par **batchs** — prédire → mesurer la loss → rétropropager → mettre à jour ; une **epoch** = un passage sur tout le dataset.
- **Le diagnostic par les courbes** : loss train ET validation. Les deux baissent : ça apprend. Train baisse, val remonte : **overfitting** (le réseau mémorise) → régularisation (dropout), plus de données, ou arrêt anticipé (early stopping). Rien ne baisse : learning rate, données ou architecture à revoir.

## 🔧 Exemple simple
Un neurone unique avec sigmoïde peut apprendre le ET logique : 4 exemples, quelques dizaines d'itérations de gradient — la loss descend, les poids convergent. Le faire UNE fois en NumPy pur démystifie tout le domaine.

## 🧭 Exemple guidé
**Énoncé** : la boucle d'entraînement minimale — et ce qui se passe quand on en retire une
ligne.

```python
for epoch in range(10):
    for X, y in loader:                 # par batchs
        optimizer.zero_grad()           # 1. remettre les gradients à zéro
        pred = model(X)                 # 2. prédire (forward)
        loss = critere(pred, y)         # 3. mesurer l'écart
        loss.backward()                 # 4. rétropropager : de combien chaque poids est fautif
        optimizer.step()                # 5. faire un petit pas dans la bonne direction
```

Ces cinq gestes se récitent facilement. Ce qu'il faut, c'est comprendre pourquoi ils sont
**cinq et pas quatre** — parce que la première ligne est celle que tout le monde oublie, et
qu'elle est la seule dont l'absence ne provoque aucune erreur.

**Décision 1 — lire la boucle comme un cycle, pas comme une liste.** Chaque tour dit :
« voici ma prédiction (2), voilà à quel point je me trompe (3), voilà de combien chaque
poids est responsable de cette erreur (4), je corrige un peu (5) ». `backward()` ne modifie
aucun poids : il **calcule et dépose** une dérivée à côté de chaque poids. `step()` est le
seul qui touche aux poids, et il lit ce que `backward()` a déposé. Une fois cette
répartition claire, la première ligne devient évidente.

**Décision 2 — que se passe-t-il si on retire `zero_grad()` ?** Non pas une erreur, non pas
un plantage : les dérivées **s'additionnent** d'un batch au suivant au lieu d'être
remplacées. Chaque pas est donc calculé à partir de la somme de tous les batchs vus depuis
le début. Voici l'effet, reproduit sur une régression minuscule dont on connaît la réponse
exacte (`y = 3x + 1`) :

```
AVEC remise à zéro   w = 2,998   b =  1,003   perte : 1,09 → 0,01
SANS remise à zéro   w = 4,204   b = -7,016   perte : 9,98 → 64,90
```

**La perte a été multipliée par six pendant que le modèle « s'entraînait ».** Et regarde la
trajectoire, c'est elle le vrai enseignement :

```
9,98   9,23   8,65   8,57   8,98   10,20   12,16   15,15 …
```

Les quatre premières époques **s'améliorent**. Quelqu'un qui lance un entraînement, voit la
perte descendre et part déjeuner revient devant un modèle divergent. C'est pour cela que ce
bug est le plus classique de tous : il ne ressemble pas à un bug, il ressemble à un
entraînement qui commence bien.

**Décision 3 — comment le détecter, et la règle générale.** Trace la perte à chaque époque,
et regarde-la. Une perte qui **monte** ne signifie qu'une petite famille de choses : un pas
d'apprentissage trop grand, des gradients accumulés, ou des données mal normalisées. Une
perte qui stagne en dit une autre. La courbe de perte est à l'entraînement ce que le test
rouge est au code : **le seul retour d'information qui ne ment pas**, à condition de le
regarder. Un entraînement lancé sans courbe est un programme lancé sans tests.

**Décision 4 — pourquoi cette accumulation existe-t-elle ?** Parce que ce n'est pas un
défaut, c'est une fonctionnalité. Elle permet de simuler un grand batch sur une machine qui
n'a pas la mémoire pour le contenir : on accumule les gradients de quatre petits batchs,
puis on fait un seul pas. C'est une technique courante et utile. Retiens la leçon générale,
qui dépasse largement ce cas : **beaucoup de « pièges » d'une bibliothèque sont des
fonctionnalités vues par quelqu'un qui n'en avait pas besoin.** Chercher à quoi sert un
comportement surprenant est presque toujours plus rentable que de mémoriser qu'il faut s'en
méfier.

**Variante qui déplace le problème.** Ta courbe de perte d'entraînement descend
magnifiquement — et celle de validation remonte à partir de la cinquième époque. Rien n'est
cassé cette fois : le modèle apprend le jeu d'entraînement **par cœur**. C'est le
surapprentissage, et il se voit uniquement parce qu'on trace **deux** courbes. Provoque-le
volontairement une fois, avec un très petit jeu de données et un réseau surdimensionné :
voir les deux courbes se séparer de ses propres yeux vaut toutes les définitions.

## 🤖 Exemple appliqué (IA / data / architecture)
Un LLM est exactement ceci, à grande échelle : des milliards de « boutons », entraînés par la même descente de gradient à prédire le token suivant. Comprendre la mécanique te permet de raisonner sur les LLM (pourquoi ils généralisent, pourquoi ils hallucinent) au lieu de les subir — et de répondre en entretien à « explique la backpropagation avec les mains ».

## ⚠️ Erreurs fréquentes
- Oublier `zero_grad()` (gradients accumulés, entraînement chaotique).
- Évaluer sur le train (le réseau mémorise très bien — score illusoire).
- Learning rate au hasard sans regarder la courbe de loss.
- Changer 3 hyperparamètres à la fois (effet indémêlable — une variable par expérience, seed fixée).

## 🚫 Anti-patterns
- Le gros réseau d'emblée sur un petit dataset tabulaire (le ML classique gagne souvent).
- Copier une boucle d'entraînement sans savoir ce que fait chaque ligne.

## ✍️ Mini-exercice
Sans relire : pourquoi empiler dix couches linéaires ne vaut-il pas mieux qu'une
seule ?

## 🔥 Pratique — écrire un réseau à la main, et le voir échouer

Le seul moyen de ne pas confondre un réseau avec une boîte noire est d'en écrire
un. Trente lignes suffisent, sans aucune bibliothèque d'apprentissage profond.

**A. Le réseau minimal.** Implémente, avec numpy seul, un réseau à une couche
cachée qui apprend le OU exclusif : passe avant, calcul de l'erreur,
rétropropagation, mise à jour. Livrable : le code, et les quatre sorties après
entraînement.

**B. La preuve par l'absence.** Entraîne le même problème **sans** couche cachée,
aussi longtemps que tu veux. Livrable : les quatre sorties et l'erreur finale, et
ton explication de pourquoi l'entraînement n'y changera rien.

**C. La non-linéarité est le tout.** Remplace l'activation par l'identité (donc
plus de non-linéarité) en gardant la couche cachée. Mesure. Puis vérifie
numériquement que le produit de deux matrices aléatoires a le rang de la plus
petite. Livrable : l'erreur obtenue et le rang mesuré.

**D. Le gradient qui s'évanouit.** Calcule l'amplitude du gradient après 1, 5,
10, 20 et 50 couches, pour une activation dont la dérivée est majorée par 0,25 et
pour une dérivée de 1. Livrable : le tableau, et le nombre de couches à partir
duquel l'entraînement devient impossible en pratique.

**E. Le neurone mort.** Entraîne la version ReLU sur vingt initialisations
différentes et compte les échecs. Pour chaque échec, compte les neurones qui ne
s'activent jamais. Livrable : le taux d'échec et le nombre de neurones morts.

## ✅ Correction attendue

> Toutes les valeurs ci-dessous sont produites par
> `scripts/v70-verifications/reseaux-et-attention.py`, exécuté avec numpy 2.4.6
> et une graine fixe. Aucune bibliothèque d'apprentissage profond n'est utilisée :
> la rétropropagation y est écrite à la main pour que le mécanisme soit visible.

**A — le réseau.** La sortie attendue avec une activation sigmoïde et quatre
neurones cachés :

```
[0.    0.999 0.999 0.001]     erreur quadratique 0,000001
attendu : [0, 1, 1, 0]
```

Le point de compréhension n'est pas le résultat mais la **rétropropagation** :
l'erreur calculée en sortie remonte couche par couche, chaque couche recevant la
part de responsabilité que la règle de dérivation en chaîne lui attribue. Si tu
as réussi à l'écrire, tu sais ce que fait une bibliothèque d'apprentissage
profond ; sinon tu utilises un outil dont tu ignores le mécanisme.

**B — l'échec sans couche cachée.**

```
sans couche cachée : [0.5 0.5 0.5 0.5]     erreur 0,2500
```

Toutes les sorties à 0,5, c'est-à-dire aucune décision. Et ce résultat **ne
s'améliore pas** avec plus d'itérations, un pas plus fin ou une meilleure
initialisation, parce qu'il n'est pas un problème d'optimisation : il est
structurel. Une régression logistique trace une seule frontière droite, et aucune
droite ne sépare les points du OU exclusif.

C'est le plus petit exemple qui justifie l'existence des couches cachées, et
c'est pour cela qu'on l'utilise depuis cinquante ans.

**C — la non-linéarité.** Avec une activation identité, l'erreur retombe à 0,25 :
la couche cachée n'apporte rien. La vérification numérique le montre autrement —
le rang du produit d'une matrice 2×8 par une matrice 8×3 est **2** :

```
rang de (A @ B) : 2 — deux couches linéaires équivalent à UNE matrice 2x3
```

Empiler des transformations linéaires produit une transformation linéaire. Ce
qu'apporte une « couche » n'est donc pas la matrice, c'est **la fonction non
linéaire qui la suit**. Une réponse qui attribue la puissance des réseaux à la
profondeur sans mentionner ce point a manqué l'essentiel.

**D — le gradient.**

```
 1 couche  · dérivée ≤ 0,25 : ×2,500e-01     dérivée = 1 : ×1,000e+00
 5 couches · dérivée ≤ 0,25 : ×9,766e-04     dérivée = 1 : ×1,000e+00
10 couches · dérivée ≤ 0,25 : ×9,537e-07     dérivée = 1 : ×1,000e+00
20 couches · dérivée ≤ 0,25 : ×9,095e-13     dérivée = 1 : ×1,000e+00
50 couches · dérivée ≤ 0,25 : ×7,889e-31     dérivée = 1 : ×1,000e+00
```

Le gradient est un **produit** d'une dérivée par couche. Avec une sigmoïde, dont
la dérivée ne dépasse jamais 0,25, ce produit s'effondre : sur vingt couches il
vaut 9,1 × 10⁻¹³. Les premières couches ne reçoivent plus rien et n'apprennent
pas.

**C'est un fait arithmétique, pas une malchance ni un défaut d'implémentation.**
Voilà pourquoi les réseaux profonds ont échoué pendant des décennies, et pourquoi
le passage à une activation de dérivée 1 sur sa partie active a été un
changement de régime plutôt qu'une optimisation. Le seuil pratique se situe
généralement autour de dix couches, mais le tableau montre que la dégradation est
continue et commence bien avant.

**E — le neurone mort, résultat négatif publié.** Sur le problème du OU exclusif
avec quatre neurones :

```
activation ReLU : [0.5 0.5 1.  0. ]   erreur 0,125000   (2/4 neurones morts)
sur 20 initialisations différentes : ReLU échoue 7 fois
```

**Sept échecs sur vingt.** Ce n'est pas une erreur de code, et on ne le corrige
pas en cherchant la graine qui donne un bon résultat.

Le mécanisme : la dérivée de ReLU vaut **exactement zéro** pour toute entrée
négative. Un neurone que la mise à jour a poussé du mauvais côté ne reçoit plus
aucun gradient, ne peut plus bouger, et reste définitivement inutile. Sur quatre
neurones, en perdre deux suffit à rendre le problème insoluble — et le réseau
converge vers un optimum local qu'il ne quittera jamais.

Ce que cela enseigne dépasse le cas : **ReLU résout le problème de la section D
et en introduit un autre.** Il n'y a pas de choix d'activation gratuit, seulement
des compromis. Les remèdes usuels — initialisation adaptée à la taille des
couches, pas d'apprentissage plus petit, davantage de neurones, ou une variante à
pente non nulle du côté négatif — traitent chacun un aspect du problème sans le
faire disparaître.

Et une leçon de méthode : un entraînement qui échoue une fois sur trois échoue
silencieusement. Sans avoir compté sur vingt initialisations, tu aurais conclu de
ton unique essai que « ReLU ne marche pas » ou que « ReLU marche », selon la
graine. **Un seul essai ne mesure rien sur un procédé stochastique** — c'est le
même raisonnement que la dispersion des découpages dans `model-evaluation`.

## 🎤 Questions d'entretien
- « Explique la descente de gradient avec les mains. » → La loss est une vallée ; le gradient donne la pente ; on descend à petits pas (learning rate).
- « Pourquoi une activation non linéaire ? » → Sans elle, l'empilement de couches reste une fonction linéaire — incapable de formes complexes.
- « Comment reconnais-tu l'overfitting ? » → Loss train qui baisse, loss validation qui remonte ; remèdes : données, régularisation, early stopping.

## 🧾 À retenir
- Réseau = composition de fonctions simples ; entraînement = gradient + petits pas.
- La non-linéarité est indispensable ; la loss est le seul juge.
- Diagnostic par courbes train/val ; une variable par expérience.

## 📚 Vocabulaire
**poids / biais / activation** · **loss** · **gradient / backpropagation** · **learning rate** · **batch / epoch** · **overfitting / dropout / early stopping** · **MLP** · **seed**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'ai codé la descente de gradient à la main une fois.
- [ ] Je connais la boucle PyTorch de tête (les 5 gestes).
- [ ] Je diagnostique overfitting/LR par les courbes.

## 🔗 Liens avec le programme
Mois 7 (jours ~183-196). Leçons liées : `machine-learning-basics`, `transformers`, `statistics-for-ml`.
