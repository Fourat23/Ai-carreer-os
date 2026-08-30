<!-- keep -->
# Leçon — Feature engineering

## 🌍 Le problème d'abord
Tu veux prédire quels clients vont résilier. Tu as un tableau : une ligne par client, des
colonnes (âge, ancienneté, nombre d'appels au support…). Tu lances un modèle : résultat
médiocre. Réflexe du débutant : « prenons un modèle plus puissant ». Mais souvent le vrai
levier est ailleurs — dans la façon dont l'information est PRÉSENTÉE. Une date de naissance
brute ne dit rien ; la transformer en « âge » ou en « client depuis X mois » rend soudain le
signal lisible. À l'inverse, une colonne mal choisie peut contenir la réponse déguisée (la
date de résiliation pour prédire la résiliation !) et donner un modèle « parfait »… qui
s'effondre en production. Cette leçon montre pourquoi les FEATURES comptent souvent plus que
le modèle, et comment éviter le piège qui trompe le plus de débutants : la fuite de données.

## 🎯 Objectif
Comprendre pourquoi les features (variables d'entrée) comptent souvent PLUS que le choix du modèle, savoir en créer d'utiles, encoder les catégories, et éviter le leakage. C'est le levier de performance ML le plus rentable et le plus interrogé en entretien.

## 🧠 Modèle mental
Une feature, c'est **une façon de PRÉSENTER l'information au modèle pour qu'il la comprenne**. Un même fait mal présenté est invisible ; bien présenté, il devient prédictif. Le modèle n'invente pas le signal : tu le lui rends lisible.

## 🧩 Prérequis
Tu dois savoir ce qu'est un modèle supervisé et la distinction feature (variable d'entrée) /
target (ce qu'on prédit) — vue dans les bases du machine learning
(`/doc/lessons/machine-learning-basics`) — et la séparation train/test ainsi que la notion de
fuite de données (`/doc/lessons/statistics-for-ml`, `/doc/lessons/model-evaluation`), car la
plupart des erreurs de feature engineering SONT des fuites. Aucune bibliothèque particulière
n'est supposée : on raisonne sur les transformations, pas sur une API.

## 📖 Explication complète
Le feature engineering transforme des données brutes en variables prédictives :
- **Features dérivées** : d'une date → jour de semaine, mois, week-end ; de deux colonnes → un ratio métier (dépense/revenu). Chaque feature encode une HYPOTHÈSE (« le week-end influence l'achat »).
- **Encodage des catégories** : les modèles veulent des nombres. **One-hot** (une colonne 0/1 par catégorie) pour les catégories sans ordre ; **ordinal** pour celles ordonnées. Attention aux catégories à très haute cardinalité.
- **Mise à l'échelle** : normaliser/standardiser quand le modèle est sensible aux échelles (k-means, régressions régularisées).
Le piège central : le **leakage par feature** — une feature qui contient (directement ou indirectement) l'information du futur ou de la cible. Exemple : « date du dernier paiement » pour prédire le churn peut fuiter le résultat. Et toutes les transformations APPRISES (moyennes d'encodage, paramètres de normalisation) doivent être calculées sur le TRAIN uniquement, puis appliquées au test — d'où le **Pipeline** scikit-learn qui l'automatise.

**Le leakage se reconnaît à un symptôme, et il faut le connaître par cœur** : un score anormalement bon. Un modèle à 0,99 d'AUC sur un problème réputé difficile n'est pas une réussite, c'est une alerte. Le réflexe correct n'est jamais de célébrer mais de demander « qu'est-ce que ce modèle sait qu'il ne devrait pas savoir ? ».

Il prend trois formes, et la troisième est la plus difficile à voir.
1. **La cible déguisée.** `montant_remboursement` pour prédire la fraude : la colonne n'existe QUE parce que la fraude a été constatée. En production, au moment où l'on doit décider, elle est vide. Test simple et infaillible : *cette colonne est-elle remplie à l'instant où je dois prédire ?* Si elle se remplit après, elle est interdite.
2. **La fuite par prétraitement.** Normaliser, imputer ou encoder par fréquence sur l'ensemble du jeu avant de séparer : les statistiques du test entrent dans l'entraînement. C'est ce que le `Pipeline` empêche par construction — il apprend au `fit`, applique au `transform`, et ne peut donc pas regarder le test.
3. **La fuite temporelle**, la plus sournoise. Un `train_test_split` aléatoire sur des données datées met des lignes de mars dans le test et des lignes d'avril dans l'entraînement : le modèle apprend le futur pour prédire le passé. Le score est excellent, la production catastrophique. Sur toute donnée temporelle, la séparation se fait **par date**, jamais au hasard — on entraîne sur avant, on teste sur après, comme la réalité l'imposera.

Un dernier mot sur l'encodage par fréquence, mentionné en variante plus bas : il faut aussi décider ce qu'on fait d'une catégorie **jamais vue** à l'entraînement. Le jour où une nouvelle ville apparaît en production, sa fréquence est inconnue. Prévoir cette valeur par défaut fait partie de la feature, pas des détails d'implémentation.

## 🔧 Exemple simple
D'une colonne `date_achat`, créer `est_weekend` (booléen) : si l'hypothèse « on achète plus le week-end » est vraie, cette feature simple booste le modèle.

## 🧭 Exemple guidé
Tu dois encoder une colonne `ville` pour un modèle. Elle a l'air inoffensive. Regarde-la
d'abord — c'est le geste que l'on saute et qui décide de tout :

```
3 000 lignes, 604 villes distinctes
les 4 villes les plus fréquentes couvrent 80 % des lignes
600 villes n'apparaissent qu'UNE seule fois
```

Voilà le vrai énoncé du problème, et il n'est pas « comment encoder une catégorie » mais
« comment traiter une longue traîne ».

**Décision 1 — pourquoi pas un simple numéro ?** Écrire Paris = 1, Lyon = 2, Marseille = 3
serait le plus court. C'est faux, et il faut savoir dire pourquoi : le modèle traite ces
colonnes comme des **nombres**, donc il lira que Marseille > Lyon > Paris, et qu'un point de
Lyon est « à mi-chemin » entre Paris et Marseille. On aurait inventé un ordre et des
distances qui n'existent pas. C'est le sens réel de « pas d'ordre entre les catégories » :
non pas une convenance, mais une affirmation fausse injectée dans les données.

**Décision 2 — le one-hot, et son coût mesuré.** L'encodage un-parmi-N crée une colonne
booléenne par ville, ce qui n'affirme rien de faux. Mais :

```
one-hot brut                              → 604 colonnes
regroupement des rares en "Autre", puis   →   5 colonnes
```

Une colonne d'entrée est devenue 604. Au-delà de la mémoire, le problème est statistique :
600 de ces colonnes ne valent 1 que pour **une seule ligne**. Un modèle qui dispose d'une
variable active sur un unique individu peut apprendre cet individu par cœur — c'est du
surapprentissage servi sur un plateau. Regrouper la longue traîne en « Autre » ne perd donc
presque rien (ces villes ne portent aucune statistique exploitable) et supprime le risque.
Le seuil de regroupement est un choix à documenter, pas une constante universelle : garde
ce qui apparaît assez souvent pour qu'une moyenne y ait un sens.

**Décision 3 — l'encodage par la cible, ou comment fabriquer un score.** Une technique
séduisante consiste à remplacer chaque ville par le taux de la cible observé dans cette
ville. Elle donne souvent d'excellents résultats. Testons-la sur des données où la ville
n'a, par construction, **aucun lien** avec la cible — le score honnête est donc 0,50 :

```
C) encodage par la cible, calculé sur tout le jeu : 0,610
D) encodage par la fréquence                      : 0,479
```

L'encodage par la cible trouve du signal là où il n'y en a pas. Le mécanisme est limpide une
fois vu : pour les 600 villes qui n'apparaissent qu'une fois, « la moyenne de la cible dans
cette ville » **est la valeur de la cible de cette ligne**. On a littéralement recopié la
réponse dans une colonne d'entrée. L'encodage par la fréquence, lui, ne regarde jamais la
cible et rend bien 0,479 — c'est-à-dire du bruit, ce qui est la bonne réponse.

Cela ne condamne pas la technique : elle est utile et largement employée. Cela dit **à
quelles conditions** — la moyenne doit être calculée uniquement sur le pli d'entraînement,
et lissée vers la moyenne globale d'autant plus fortement que la catégorie est rare. Ces
deux précautions ne sont pas des raffinements : sans elles, la technique ne mesure plus rien.

**Le principe qui traverse la leçon.** Une transformation de variables est un endroit où
l'on peut, sans écrire une seule ligne fausse, faire trois choses différentes : ajouter une
information vraie, affirmer quelque chose de faux (l'ordre des villes), ou recopier la
réponse (l'encodage par la cible non protégé). Avant d'adopter un encodage, pose-lui la
question : **qu'est-ce que celui-ci affirme, et qu'a-t-il eu le droit de regarder ?**

**Variante qui déplace le problème.** Une ville jamais vue à l'entraînement apparaît en
production. Le one-hot ne sait pas quoi en faire, l'encodage par la cible n'a pas de moyenne
à lui donner. Ce n'est pas un cas limite exotique, c'est la situation ordinaire de tout
système qui vit. Décide-le à la conception — une catégorie « inconnu » explicitement prévue
et présente dès l'entraînement, plutôt qu'une valeur manquante découverte en pleine
production. La bonne question, ici encore, arrive avant l'incident : **que fait mon encodage
face à quelque chose qu'il n'a jamais vu ?**

## 🤖 Exemple appliqué (IA / data / architecture)
En ML tabulaire (mois 6), améliorer un modèle par les features (sans changer le modèle) est souvent le gain le plus rentable. Le raisonnement « bien présenter l'information » se retrouve aussi côté LLM : structurer un prompt, c'est présenter l'information pour qu'elle soit exploitable.

## ⚠️ Erreurs fréquentes
- Features sans hypothèse (bruit).
- Leakage : une feature qui contient la réponse ou du futur.
- Encoder/normaliser sur TOUT le dataset avant le split (leakage).
- One-hot sur une catégorie à des milliers de valeurs (explosion).

## 🚫 Anti-patterns
- Empiler des features au hasard « au cas où ».
- Croire qu'un modèle plus complexe compense de mauvaises features.

## ✍️ Mini-exercice
Sans relire : quelle question, à laquelle aucun script ne peut répondre, décide
si une variable est une fuite ?

## 🔥 Pratique — un journal de variables, avec des gains mesurés

Le travail sur les variables se juge à un seul critère : **as-tu mesuré ce que
chaque variable apporte ?** Cette pratique produit un journal, pas une intuition.

**A. Le journal.** Sur un jeu de ton choix, pars d'un modèle de référence et
ajoute les variables **une par une**. Pour chacune, note : l'hypothèse qu'elle
encode, la métrique avant, la métrique après, et ta décision (garder ou retirer).
Livrable : le journal, au moins huit lignes, y compris les variables retirées.

**B. Les dates.** À partir d'une seule colonne d'horodatage, construis au moins
cinq variables — jour de la semaine, heure, mois, indicateur de week-end,
ancienneté en jours — et mesure l'apport de chacune séparément. Livrable : le
tableau des cinq gains.

**C. Les catégories.** Encode une variable catégorielle de trois façons :
ordinale, indicatrice (une colonne par valeur), et par regroupement des valeurs
rares. Mesure les trois. Livrable : les trois scores, le nombre de colonnes
produites par chaque encodage, et ce que l'encodage ordinal impose au modèle.

**D. Fabriquer une fuite, exprès.** Construis une variable dérivée de la cible et
mesure le gain. Puis pose la question temporelle : cette variable existe-t-elle,
avec cette valeur, au moment où il faudra prédire ? Livrable : le gain, et ta
réponse à la question.

**E. Vérifier que rien ne fuit.** Vérifie que toutes tes transformations sont
apprises sur l'entraînement seul, en les plaçant dans un pipeline. Puis mesure
l'écart entre la version avec fuite et la version propre. Livrable : les deux
scores.

## ✅ Correction attendue

**A — le journal, et les lignes négatives.** Le critère de qualité du journal est
le nombre de lignes « retirée ». Un journal où toutes les variables ont été
gardées n'est pas un journal de travail : c'est une liste de ce qui a été
construit, et il révèle qu'aucune décision n'a été prise.

Ce qu'il faut savoir formuler : **une variable encode une hypothèse sur le
problème.** « Le jour de la semaine influence l'achat » est une hypothèse
testable ; l'ajouter sans la mesurer, c'est faire une supposition et l'appeler du
travail. Le journal transforme une intuition en résultat.

Attention au piège de mesure, et il est sévère : la leçon `scikit-learn-workflow`
mesure **11,04 points d'écart** entre le meilleur et le pire découpage aléatoire
du même jeu, pour le même modèle. Un gain de deux points sur un seul découpage
n'est donc pas un gain — c'est du bruit. **Chaque ligne du journal doit reposer
sur une validation croisée**, et le gain doit être comparé à la dispersion. Sans
cela, tu passeras des heures à sélectionner des variables au hasard tout en ayant
l'impression d'optimiser.

**B — les dates.** Le point technique : une date brute est presque toujours
inutilisable telle quelle, parce que le modèle ne peut pas en extraire la
périodicité. Ce qui compte est ce qu'on en **dérive**.

Un détail que la correction attend : les variables cycliques (heure, mois, jour
de la semaine) posent un problème d'encodage. En ordinal, l'heure 23 et l'heure 0
sont à 23 unités l'une de l'autre alors qu'elles sont voisines. Deux solutions
correctes : l'encodage indicateur (une colonne par heure), ou l'encodage
trigonométrique (sinus et cosinus de l'angle correspondant), qui préserve la
proximité.

Et une variable souvent oubliée et souvent la plus utile : l'**ancienneté**, soit
la différence entre l'horodatage et une date de référence. Elle capture une
tendance que les variables cycliques ne voient pas.

**C — les catégories.** Les trois encodages ne coûtent pas la même chose et ne
supposent pas la même chose :

- **ordinal** : une colonne, mais il **impose un ordre** au modèle. Codant
  `petit=0, moyen=1, grand=2`, c'est correct. Codant `Paris=0, Lyon=1, Nice=2`,
  on affirme que Lyon est entre Paris et Nice, ce qui est faux et que le modèle
  exploitera.
- **indicateur** : autant de colonnes que de valeurs, aucun ordre imposé. Le coût
  explose quand la variable a beaucoup de valeurs distinctes — mille codes
  postaux font mille colonnes, presque toutes vides.
- **regroupement des valeurs rares** : les valeurs sous un seuil deviennent une
  catégorie « autre ». C'est la réponse habituelle à la cardinalité élevée, et
  elle a un effet secondaire précieux : elle traite d'avance les valeurs
  **inconnues en production**, celles qui n'existaient pas à l'entraînement.

Ce dernier point est le vrai sujet et il est presque toujours oublié : que fait
ton encodeur quand il rencontre une valeur qu'il n'a jamais vue ? Sans réponse
explicite, il plante en production ou produit silencieusement des zéros partout.

**D — la fuite fabriquée.** Le gain mesuré dans la vérification jumelle est de
**+18,68 points d'aire ROC**, ce qui produit un score de 97,93 % sur un problème
où le modèle honnête plafonne à 79 %.

La réponse à la question temporelle est ce qui compte, et c'est elle qui rend la
fuite évidente : non, cette variable n'existe pas au moment de prédire. Elle est
calculée à partir de ce qu'on cherche justement à déterminer.

**Le test de la fuite est temporel, pas statistique.** Aucun script ne peut y
répondre à ta place, parce que la réponse porte sur ton système d'information :
quand cette donnée est-elle écrite, par qui, et est-elle disponible à l'instant
de la prédiction ? Un détecteur par corrélation aide, mais il signale aussi les
bonnes variables (qui sont corrélées par construction) et rate les fuites
diffuses réparties sur plusieurs colonnes.

Le réflexe à retenir : **un score anormalement bon est un signal d'alerte.**
Devant un bond de dix-huit points, la première action est de chercher la fuite.

**E — le pipeline.** L'écart mesuré pour une fuite par normalisation est de
**+0,00 point** — et c'est un résultat qu'il faut publier plutôt que d'affirmer
le contraire. Une normalisation transporte deux nombres par variable ; ce n'est
presque rien.

La conclusion n'est pas « le pipeline est inutile ». Elle est que **le pipeline
protège d'une famille de fuites dont certaines sont graves**, et qu'on ne veut
pas avoir à décider au cas par cas laquelle l'est. Les transformations
réellement dangereuses ajustées hors pipeline : la sélection de variables faite
sur tout le jeu, le remplissage de valeurs manquantes par une statistique
globale, l'encodage par la moyenne de la cible, et le rééquilibrage de classes
appliqué avant la séparation. Chacune transporte beaucoup plus que deux nombres.

Le raisonnement de conception à retenir dépasse l'apprentissage automatique :
**quand une erreur est difficile à détecter, on choisit une construction où elle
ne peut pas se produire, plutôt qu'une vigilance à répéter.**

## 🎤 Questions d'entretien
- « Modèle ou features, qu'est-ce qui compte le plus ? » → Souvent les features : elles rendent le signal lisible.
- « Comment encodes-tu une variable catégorielle ? » → One-hot (sans ordre) ou ordinal (avec ordre) ; gérer la haute cardinalité.
- « Qu'est-ce que le leakage par feature ? » → Une feature qui contient l'info de la cible/du futur → score illusoire.

## 🧾 À retenir
- Les features rendent le signal lisible : elles comptent souvent plus que le modèle.
- Chaque feature encode une hypothèse ; encoder sans faux ordre.
- Transformations apprises sur le train seulement (Pipeline) — anti-leakage.

## 📚 Vocabulaire
**feature** · **feature dérivée** · **one-hot / ordinal** · **cardinalité** · **normalisation / standardisation** · **leakage** · **Pipeline** · **hypothèse prédictive**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Chaque feature que je crée a une hypothèse explicite.
- [ ] Je sais encoder les catégories et gérer la haute cardinalité.
- [ ] J'évite le leakage (transformations dans un Pipeline, sur le train).

## 🔗 Liens avec le programme
Mois 6 (jours ~155-175), projet 5 (ChurnScope). Leçons liées : `machine-learning-basics`, `model-evaluation`, `data-cleaning-quality`.
