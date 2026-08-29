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
Implémente UN neurone (poids, biais, sigmoïde) en NumPy et entraîne-le sur le ET logique par descente de gradient manuelle. Trace la loss.

## 🔥 Exercice plus difficile
MLP PyTorch sur MNIST : DataLoader, boucle maison, courbes train/val, early stopping, et un tableau d'expériences (largeur × dropout × LR, une variable à la fois, seed fixée) avec conclusion.

## ✅ Correction attendue
La logique : neurone → loss → gradient → petit pas → répéter ; diagnostic par les courbes. Vérifie : ton neurone NumPy converge (loss décroissante) ; > 95 % sur MNIST test ; un overfitting provoqué PUIS corrigé (dropout/early stopping) avec les courbes à l'appui.

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
