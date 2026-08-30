<!-- keep -->
# Leçon — Le workflow scikit-learn

## 🌍 Le problème d'abord
Ton notebook ML « marche » : tu normalises les données, tu entraînes, tu obtiens 92 %. Puis
un collègue essaie de le rejouer et obtient un autre chiffre ; en production, le modèle se
trompe sur une ville jamais vue et plante. Que s'est-il passé ? Souvent : tu as normalisé sur
TOUT le dataset avant de séparer train et test (le test a « fuité »), tes cellules
s'exécutent dans un ordre magique connu de toi seul, et rien ne garantit que la production
applique les mêmes transformations que l'entraînement. Le vrai sujet n'est pas « quelle
fonction appeler » — c'est le WORKFLOW : un processus reproductible où ce que le train a
appris s'applique à l'identique partout, sans fuite. Cette leçon présente l'outil qui rend
ce protocole automatique (le Pipeline), pas un catalogue d'API.

## 🎯 Objectif
Maîtriser l'API scikit-learn (fit/predict/transform) et surtout le **Pipeline**, qui rend tout le workflow ML reproductible et anti-leakage par construction. C'est l'outillage standard du ML tabulaire — celui de ton projet 5 et des entretiens data.

## 🧠 Modèle mental
scikit-learn a UNE grammaire : **tout objet apprend avec `fit`, applique avec `predict` (modèles) ou `transform` (préprocesseurs)**. Le Pipeline enchaîne ces objets en un SEUL : ce que le train a appris s'applique à l'identique partout — le protocole d'honnêteté du ML, outillé.

## 🧩 Prérequis
Tu dois comprendre le workflow ML (problème → données → split → entraînement → évaluation)
et pourquoi le test ne doit jamais guider l'entraînement
(`/doc/lessons/machine-learning-basics`, `/doc/lessons/model-evaluation`), ainsi que le
feature engineering et la fuite de données (`/doc/lessons/feature-engineering`), car le
Pipeline existe précisément pour rendre le leakage impossible. Des bases de Python suffisent ;
aucune connaissance préalable de scikit-learn n'est supposée.

## 📖 Explication complète
- **La grammaire** : `model.fit(X_train, y_train)` apprend ; `model.predict(X_test)` prédit ; `scaler.fit_transform(X_train)` apprend ET applique ; `scaler.transform(X_test)` applique SEULEMENT (jamais re-fit sur le test !). Tous les objets (régressions, forêts, scalers, encodeurs) parlent cette langue — en changer est trivial.
- **Le piège que le Pipeline élimine** : normaliser/encoder sur TOUT le dataset avant le split = le test a fuité dans les paramètres appris (leakage). Le **Pipeline** encapsule préprocessing + modèle : `pipe.fit(X_train)` fait apprendre chaque étape SUR LE TRAIN uniquement, `pipe.predict(X_test)` applique la chaîne — le leakage devient structurellement impossible.
- **ColumnTransformer** : appliquer des traitements différents par type de colonne (numériques → scaler ; catégorielles → one-hot) dans un seul objet, intégrable au Pipeline.
- **Cross-validation intégrée** : `cross_val_score(pipe, X, y, cv=5)` refait fit/transform DANS chaque pli — la bonne évaluation sans effort. `GridSearchCV(pipe, params, cv=5)` cherche les hyperparamètres proprement (la recherche voit le pipeline entier, donc zéro fuite).
- **Reproductibilité** : `random_state` fixé partout, le pipeline sauvegardé (joblib) = le MÊME objet sert en entraînement et en production (mêmes transformations, mêmes encodages, gestion des catégories inconnues).

**Ce que `cv=5` veut dire réellement**, parce qu'on l'écrit partout sans que personne ne l'explique. On découpe les données d'entraînement en 5 paquets de taille égale, appelés **plis**. On entraîne sur 4 d'entre eux et on évalue sur le 5ᵉ ; puis on recommence en changeant le pli d'évaluation, cinq fois. Chaque ligne sert donc exactement une fois à évaluer et quatre fois à entraîner, et l'on obtient **cinq scores**.

Ces cinq scores valent bien mieux qu'un seul, et pour deux raisons distinctes. Leur moyenne est plus fiable qu'un score unique, qui dépend du hasard d'une séparation. Mais surtout, **leur dispersion est une information en soi** : cinq scores à 0,81 / 0,82 / 0,80 / 0,81 / 0,82 décrivent un modèle stable ; 0,91 / 0,62 / 0,88 / 0,55 / 0,84 — même moyenne, 0,76 — décrivent un modèle qui dépend énormément des données sur lesquelles il tombe, donc imprévisible en production. Ne regarder que la moyenne d'une cross-validation, c'est reproduire exactement l'erreur que la leçon de statistiques dénonce.

**La syntaxe `étape__param`** n'est pas une bizarrerie à mémoriser : un `Pipeline` est un objet unique dont les réglages appartiennent à ses étapes internes. `model__max_depth` se lit « le paramètre `max_depth` de l'étape nommée `model` », et `prep__cat__handle_unknown` descend de deux crans. Le double tiret bas est simplement le séparateur de chemin — c'est ce qui permet à `GridSearchCV` de régler n'importe quoi dans la chaîne sans la connaître à l'avance.

**Le piège qui reste APRÈS le Pipeline, et il en attrape beaucoup.** `GridSearchCV` essaie cinquante combinaisons et retient la meilleure. Rapporter son `best_score_` comme la performance du modèle est optimiste : ce score a été **choisi pour être le meilleur** parmi cinquante, donc il a capté une part de chance propre à ces données. C'est la même faute que d'évaluer sur le train, déplacée d'un cran. La parade : mettre de côté un jeu de test AVANT toute recherche, n'y toucher qu'une seule fois, à la fin, et rapporter CE score-là. Le Pipeline supprime la fuite de prétraitement ; il ne supprime pas la fuite par sélection.

## 🔧 Exemple simple
```python
pipe = Pipeline([("scaler", StandardScaler()), ("model", LogisticRegression())])
pipe.fit(X_train, y_train)
pipe.score(X_test, y_test)   # le scaler du TRAIN s'applique au test, automatiquement
```

## 🧭 Exemple guidé — « mon modèle fait 97 % », et ce que ce chiffre vaut

Le script `scripts/v70-verifications/ml-pieges-mesures.py` construit un jeu de
détection de fraude : 4 000 lignes, 106 fraudes, soit 2,6 %. Il est exécuté avec
scikit-learn 1.9.0, pandas 3.0.5 et numpy 2.4.6, avec une graine fixe pour que
les chiffres soient reproductibles.

### 1. La référence, que presque personne ne calcule

Avant de regarder un modèle, il faut savoir ce que vaut le fait de ne rien faire.

```
toujours « pas fraude »            : exactitude 97,33 % · rappel  0,0 %
au hasard, proportions respectées  : exactitude 94,42 % · rappel  3,1 %
```

**97,33 % d'exactitude est le score d'un modèle qui ne prédit jamais de fraude.**
Annoncer « mon modèle fait 97 % » sans annoncer ce chiffre-là revient à annoncer
un nombre qui ne dit rien. La référence n'est pas une formalité de rigueur
académique : c'est ce qui rend le score du modèle interprétable, et elle coûte
deux lignes de code.

### 2. Le vrai modèle — un résultat qu'il faut lire tel quel

```
exactitude : 97,33 %
précision  :  0,0 %      rappel : 0,0 %      F1 : 0,0 %
aire ROC   : 79,3 %
matrice    : vrais négatifs 1168, faux positifs 0, faux négatifs 32, vrais positifs 0
```

Au seuil par défaut de 0,5, la régression logistique ne prédit **aucune fraude**.
Sa matrice de confusion est exactement celle du modèle « toujours pas fraude », et
son exactitude aussi — 97,33 % dans les deux cas.

Et pourtant **elle n'est pas équivalente** : son aire sous la courbe ROC est de
79,3 %, contre 50 % pour le hasard. Elle **classe** correctement — elle donne aux
fraudes des probabilités plus élevées qu'aux non-fraudes — mais elle ne **décide**
pas, parce qu'aucune probabilité n'atteint 0,5.

Ces deux capacités sont distinctes, et une seule dépend du seuil. C'est la leçon
centrale : **sur des classes déséquilibrées, l'exactitude ne distingue pas un
modèle qui a tout appris d'un modèle qui n'a rien appris.** Il faut la matrice de
confusion, qui montre les quatre cas, et une métrique indépendante du seuil.

Le vocabulaire, une fois pour toutes, sur ce cas concret :

- **précision** : parmi les fraudes annoncées, combien en sont réellement. Elle
  répond au coût des fausses alertes.
- **rappel** : parmi les fraudes réelles, combien ont été trouvées. Il répond au
  coût des fraudes manquées.
- **aire sous la courbe ROC** : la probabilité que le modèle donne un score plus
  élevé à une fraude tirée au hasard qu'à une non-fraude tirée au hasard. Elle ne
  dépend d'aucun seuil.

### 3. Le seuil est une décision métier, pas un réglage par défaut

```
seuil | précision | rappel | fraudes trouvées | fausses alertes
 0,50 |     0,0 % |  0,0 % |                0 |               0
 0,20 |     0,0 % |  0,0 % |                0 |               5
 0,10 |    12,2 % | 15,6 % |                5 |              36
 0,05 |     9,3 % | 43,8 % |               14 |             137
 0,03 |     6,9 % | 65,6 % |               21 |             283
```

Le même modèle, sans un octet de réentraînement, trouve 0 fraude ou 21 selon un
nombre qu'on choisit. **0,5 n'est pas un choix, c'est un défaut** hérité de la
convention des classes équilibrées.

Le bon seuil dépend de deux quantités que le modèle ne peut pas connaître : le
coût d'une fraude manquée et le coût d'une fausse alerte. Si vérifier une alerte
coûte cinq minutes et qu'une fraude coûte 200 €, alors passer de 0,10 à 0,03
achète 16 fraudes de plus (3 200 €) contre 247 alertes de plus (environ 20 heures
de vérification). **Ce calcul se fait avec le métier, pas dans le carnet de
notes.**

### 4. La fuite de données, et un résultat qui contredit l'intuition

La règle « ne jamais ajuster une transformation sur l'ensemble du jeu avant la
séparation » est universellement enseignée. On la met à l'épreuve :

```
normaliseur ajusté sur TOUT (fuite)   : aire ROC 79,25 %
normaliseur dans le pipeline (propre) : aire ROC 79,25 %
écart : +0,00 point
```

**Zéro.** Il faut publier ce résultat et le comprendre plutôt que le cacher : une
normalisation ne transporte du jeu de test vers l'entraînement que deux nombres,
la moyenne et l'écart-type de chaque variable. Sur 4 000 lignes, cela ne
représente presque aucune information.

La conclusion n'est donc **pas** « la fuite est sans gravité ». Elle est : **la
gravité d'une fuite dépend de la quantité d'information qui fuit.** Voici l'autre
extrémité du spectre — une variable construite à partir de la cible :

```
variable construite À PARTIR de la cible : aire ROC 97,93 %
écart avec le modèle propre : +18,68 points
```

Voilà la fuite qui compte. Le score est excellent et le modèle est
**inutilisable** : en production, cette variable n'existe pas encore au moment où
il faut prédire. C'est le piège le plus coûteux du métier, parce qu'il ne
ressemble pas à une erreur — il ressemble à une réussite.

Le réflexe à acquérir : **un score anormalement bon est un signal d'alerte, pas
une victoire.** Devant une aire ROC de 98 % sur un problème réputé difficile, la
première action est de chercher la fuite, pas de préparer la présentation.

Et le corollaire sur la méthode : on garde le pipeline (`make_pipeline`) non pas
parce que la fuite de normalisation est grave — elle ne l'est pas ici — mais
parce que le pipeline rend **structurellement impossible** toute une famille de
fuites, y compris celles qui, elles, seraient graves. On ne raisonne pas au cas
par cas sur ce qui fuit : on choisit une construction où la question ne se pose
plus.

### 5. Un seul découpage ne mesure rien de stable

```
20 découpages différents du MÊME jeu, MÊME modèle :
min 70,26 % · médiane 77,52 % · max 81,30 % · écart 11,04 points
validation croisée 5 blocs : 77,03 % ± 6,39
```

Onze points d'écart entre le pire et le meilleur découpage, **sans qu'une seule
ligne du modèle change**. Annoncer 81,30 % revient donc à annoncer un choix de
graine aléatoire.

C'est ce qui rend la validation croisée nécessaire, et surtout ce qui rend
l'**écart-type** aussi important que la moyenne : c'est lui qui dit si la
différence entre deux modèles est réelle ou dans le bruit. Un modèle à 79 % ± 6
et un modèle à 77 % ± 6 ne se départagent pas — et sur un seul découpage, on
aurait « prouvé » que le premier est meilleur.

### La démarche complète

1. **Calculer la référence** avant tout modèle.
2. **Regarder la matrice de confusion**, jamais la seule exactitude.
3. **Choisir une métrique indépendante du seuil** pour comparer des modèles.
4. **Choisir le seuil séparément**, à partir des coûts métier.
5. **Tout enchaîner dans un pipeline**, pour rendre les fuites impossibles par
   construction.
6. **Valider en croisé**, et publier la moyenne **et** la dispersion.
7. **Se méfier d'un score trop bon.**

## 🤖 Exemple appliqué (IA / data / architecture)
Le Pipeline EST une leçon d'architecture : encapsuler une chaîne de transformations derrière une interface unique (fit/predict), versionnable et déployable telle quelle. Tu retrouveras ce pattern dans tes pipelines RAG (ingest→chunk→embed→index) : mêmes exigences de reproductibilité, autre domaine.

## ⚠️ Erreurs fréquentes
- `fit_transform` sur le test (re-apprentissage → leakage).
- Préprocessing HORS pipeline puis cross-validation (la CV fuit).
- Oublier `handle_unknown` → crash en prod sur une catégorie inconnue.
- Comparer des modèles sans fixer `random_state` (résultats non reproductibles).

## 🚫 Anti-patterns
- Le notebook où les cellules s'exécutent dans un ordre magique connu de toi seul.
- GridSearch massif avant d'avoir une baseline et des features sensées.

## ✍️ Mini-exercice
Sans relire : ton modèle a 97 % d'exactitude et 0 % de rappel. Qu'a-t-il appris,
et comment le sais-tu ?

## 🔥 Pratique — reproduire les cinq mesures

**A. La référence et la matrice.** Sur un jeu déséquilibré (fabrique-le si
besoin), entraîne un classifieur de référence et un modèle réel. Produis pour
chacun : exactitude, précision, rappel, matrice de confusion, aire ROC. Livrable :
le tableau des six nombres pour les deux.

**B. La courbe des seuils.** Fais varier le seuil de décision de 0,5 à 0,01 et
produis le tableau seuil / précision / rappel / vrais positifs / faux positifs.
Puis, en te donnant un coût par fraude manquée et un coût par fausse alerte,
calcule le seuil qui minimise le coût total. Livrable : le tableau et le seuil
retenu, avec le calcul.

**C. Les deux fuites.** Reproduis la fuite par normalisation puis la fuite par
variable construite depuis la cible. Mesure l'écart dans chaque cas. Livrable :
les deux écarts, et ton explication de leur différence de grandeur.

**D. La dispersion.** Entraîne le même modèle sur vingt découpages aléatoires
différents et publie min, médiane, max. Compare à une validation croisée en cinq
blocs. Livrable : les quatre nombres, et ta réponse à « le modèle A à 79 %
est-il meilleur que le modèle B à 77 % ? ».

**E. Le détecteur de fuite.** Écris une fonction qui, avant tout entraînement,
signale les variables dont la corrélation avec la cible dépasse un seuil élevé.
Teste-la sur le jeu de C. Livrable : la sortie, et les limites que tu identifies.

## ✅ Correction attendue

**A — les six nombres.** Le résultat attendu est celui mesuré : une exactitude
identique entre la référence et le modèle (97,33 %), une matrice identique au
seuil 0,5, et une aire ROC très différente (50 % contre 79,3 %).

Ce que tu dois savoir formuler : **classer et décider sont deux capacités
distinctes.** Un modèle peut avoir parfaitement appris à ordonner les exemples et
ne rien décider, si aucune probabilité n'atteint le seuil. L'exactitude confond
les deux et n'en mesure aucune correctement sur des classes déséquilibrées.

Erreur classique dans le tableau : oublier `zero_division` et laisser un
avertissement transformer silencieusement une précision indéfinie (0 prédiction
positive) en 0. Ce ne sont pas la même chose, et la distinction est justement ce
que la matrice révèle.

**B — le seuil optimal.** Le calcul attendu est explicite :

```
coût total(seuil) = (fraudes manquées × coût d une fraude)
                  + (fausses alertes × coût d une vérification)
```

Avec 200 € par fraude et 5 minutes à 30 €/h (soit 2,50 €) par vérification, on
compare ligne à ligne. Le point important n'est pas le résultat numérique, c'est
que **le seuil sort d'un calcul de coûts et non d'une métrique**. Optimiser le F1
revient à supposer que précision et rappel ont la même valeur, ce qui est
rarement vrai et n'est presque jamais vérifié.

Une nuance qu'une bonne réponse ajoute : ces coûts varient dans le temps
(fraude plus chère en période de forte activité, vérification plus chère quand
l'équipe est réduite). Le seuil n'est donc pas fixé une fois pour toutes ; c'est
un paramètre d'exploitation, pas une constante du modèle.

**C — les deux fuites.** Les écarts mesurés : **+0,00 point** pour la
normalisation, **+18,68 points** pour la variable dérivée de la cible.

L'explication attendue porte sur la **quantité d'information transportée**. Une
normalisation transporte deux nombres par variable ; une variable construite à
partir de la cible transporte la réponse elle-même. Une réponse qui se contente
de « la fuite est grave » a manqué l'exercice, parce que la mesure montre
précisément qu'elle peut ne pas l'être.

Ce qui ne change pas malgré ce résultat : on garde le pipeline. Non par
superstition, mais parce qu'il rend une **famille entière** de fuites impossible
par construction — y compris celles qui seraient graves, comme un remplissage de
valeurs manquantes par la médiane globale, ou une sélection de variables faite
sur tout le jeu. Raisonner au cas par cas sur « celle-ci est-elle grave ? » est
une stratégie qui échoue une fois sur dix, ce qui suffit.

**D — la dispersion.** Les valeurs mesurées : min 70,26 %, médiane 77,52 %, max
81,30 %, soit 11,04 points d'écart. La validation croisée donne 77,03 % ± 6,39.

La réponse à la question posée est **non** : un modèle à 79 % ± 6 et un modèle à
77 % ± 6 ne se départagent pas. Les intervalles se recouvrent largement, et
l'écart de deux points est bien inférieur à la dispersion.

C'est le point le plus utile de tout l'exercice, parce qu'il s'oppose à une
pratique très répandue : comparer deux modèles sur un seul découpage et conclure.
Sur ce jeu, **le choix de la graine aléatoire produit un écart cinq fois plus
grand que la différence qu'on cherchait à mesurer.**

**E — le détecteur.** Une fonction utile calcule la corrélation (ou l'information
mutuelle, plus générale) entre chaque variable et la cible, et signale ce qui
dépasse un seuil élevé.

Les limites attendues, et elles sont importantes :

- **Faux positifs légitimes.** Une variable peut être très corrélée à la cible
  sans être une fuite — c'est même le but d'une bonne variable. Le détecteur
  signale, il ne juge pas.
- **Faux négatifs.** Une fuite peut passer par une combinaison de variables dont
  aucune n'est individuellement suspecte, ou par une corrélation non linéaire que
  la corrélation de Pearson ne voit pas.
- **Le seul test qui tranche est temporel** : cette variable est-elle disponible,
  avec cette valeur, **au moment où il faudra prédire** ? C'est une question sur
  le système d'information, pas sur les données — et aucun script ne peut y
  répondre à ta place.

C'est pourquoi la protection principale contre les fuites n'est pas un détecteur
mais une **séparation temporelle** de l'évaluation : entraîner sur le passé,
évaluer sur le futur. Toute variable indisponible à l'instant de la prédiction
détruit alors le score, ce qui rend la fuite visible au lieu de la rendre
flatteuse.

## 🎤 Questions d'entretien
- « Pourquoi un Pipeline plutôt que des étapes séparées ? » → Anti-leakage par construction, CV correcte, un seul objet pour train et prod.
- « Que fait fit_transform vs transform ? » → Apprendre+appliquer (train seulement) vs appliquer (test/prod).
- « Comment gères-tu une catégorie jamais vue en prod ? » → `handle_unknown="ignore"` (ou stratégie explicite) — prévu dans le pipeline.

## 🧾 À retenir
- Une grammaire : fit / predict / transform — pour tout objet sklearn.
- Le Pipeline rend le leakage structurellement impossible et la prod cohérente.
- ColumnTransformer par type de colonne ; CV et GridSearch ENGLOBENT le pipeline.

## 📚 Vocabulaire
**fit / predict / transform** · **Pipeline** · **ColumnTransformer** · **OneHotEncoder / StandardScaler** · **cross_val_score / GridSearchCV** · **handle_unknown** · **random_state** · **joblib**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Tout mon préprocessing vit DANS un Pipeline.
- [ ] Ma CV et mon GridSearch englobent le pipeline entier.
- [ ] Mon pipeline sauvegardé prédit à l'identique sur des données neuves.

## 🔗 Liens avec le programme
Mois 6 (jours ~155-180), projet 5 (ChurnScope). Leçons liées : `machine-learning-basics`, `feature-engineering`, `model-evaluation`.
