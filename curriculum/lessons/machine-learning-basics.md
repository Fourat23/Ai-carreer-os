<!-- keep -->
# Leçon — Machine learning : les bases

## 🌍 Le problème d'abord
Imagine que tu doives écrire un programme qui reconnaît un email de spam. À la main, tu
essaierais des règles (« contient le mot loterie » → spam) ; mais les spammeurs s'adaptent, et
tu passerais ta vie à rajouter des règles. Et si, au lieu de coder les règles, tu MONTRAIS à
l'ordinateur 10 000 emails déjà étiquetés « spam » / « pas spam », et le laissais TROUVER
lui-même les régularités ? C'est exactement l'idée du **machine learning** : apprendre une
règle à partir d'exemples plutôt que la programmer. Toute l'IA moderne, LLM compris, repose
là-dessus. Mais un modèle peut aussi « tricher » (mémoriser au lieu d'apprendre) et te donner
des scores magnifiques tout en étant inutile. Cette leçon t'apprend le ML ET l'honnêteté de
son évaluation — ce qui sépare un praticien sérieux d'un récitant.

## 🎯 Objectif
Comprendre le renversement du ML (données + réponses → règles), les familles (supervisé/
non supervisé, régression/classification), et surtout le **protocole d'évaluation honnête**
(train/test split, baseline, overfitting, métriques choisies selon le coût des erreurs).

## 🧩 Prérequis
Tu dois avoir les réflexes statistiques de base — distribution, moyenne vs médiane,
corrélation ≠ causalité, l'intuition de Bayes (`/doc/lessons/statistics-for-ml`) — car évaluer
un modèle EST un raisonnement statistique. Savoir programmer en Python
(`/doc/lessons/python-foundations`) aide pour la pratique. Aucune connaissance préalable d'un
algorithme de ML n'est supposée ; les exemples de code restent illustratifs.

## 🧠 Modèle mental
Le renversement à intégrer : en programmation classique, tu fournis des RÈGLES + des données
et obtiens des réponses ; en machine learning, tu fournis des données + les RÉPONSES et
obtiens les RÈGLES (le « modèle »). Deux dangers permanents en découlent : le modèle peut
MÉMORISER ses exemples au lieu d'apprendre à généraliser (overfitting), et on peut l'ÉVALUER
malhonnêtement (sur les données qu'il a déjà vues). Tout le sérieux du ML tient à un principe :
évaluer un modèle sur des données qu'il n'a JAMAIS vues.

## 💡 Pourquoi c'est important
Le ML est la capacité à APPRENDRE une règle depuis des exemples, au lieu de la programmer à la main. C'est le socle conceptuel de toute l'IA moderne — y compris des LLM, qui sont « juste » du ML à très grande échelle. Comprendre le workflow honnête (baseline, split, métriques, overfitting) te distingue immédiatement : la plupart des candidats juniors récitent des modèles ; toi tu sauras dire si un modèle MENT.

## Explication complète

### Le renversement conceptuel
Programmation classique : règles + données → réponses. Machine learning : données + réponses → RÈGLES (le modèle). Tu montres 10 000 emails étiquetés spam/non-spam, l'algorithme trouve les régularités. Trois familles : **supervisé** (on a les réponses : régression = prédire un nombre, classification = prédire une classe), **non supervisé** (pas de réponses : clustering = découvrir des groupes), et par renforcement (hors scope).

### Le protocole d'honnêteté : train/test split
Un modèle peut MÉMORISER ses données d'entraînement — l'évaluer dessus revient à faire passer un examen avec les réponses. D'où le rituel intangible : séparer AVANT tout travail un jeu de test (20 %) que le modèle ne verra qu'à l'évaluation finale. Le **leakage** (une information du test qui fuite vers l'entraînement — normaliser AVANT de splitter, une feature qui contient la réponse) est l'erreur la plus sournoise du ML : des scores magnifiques, un modèle inutile en production.

### La baseline : le garde-fou
AVANT tout modèle : quelle performance atteint la prédiction NAÏVE (la moyenne, la classe majoritaire) ? Un modèle sophistiqué qui ne bat pas la baseline est du théâtre. Et une baseline à 95 % (classes déséquilibrées !) recadre immédiatement ce que « 96 % d'accuracy » vaut vraiment.

### Overfitting / underfitting : LE concept central
- **Overfitting** : le modèle mémorise le bruit du train au lieu d'apprendre le signal — score train excellent, score test médiocre. Analogie : l'étudiant qui apprend le corrigé PAR CŒUR et échoue dès que l'énoncé change.
- **Underfitting** : le modèle est trop simple pour capturer le signal — mauvais partout.
Le diagnostic se lit sur les courbes train vs validation ; les remèdes à l'overfitting : plus de données, moins de complexité, régularisation. La **cross-validation** (k découpages, k évaluations, moyenne) rend l'évaluation robuste au hasard d'un split unique.

### Les métriques : dire la vérité utile
- Régression : **MAE/RMSE** (l'erreur en unités réelles — des euros, des degrés).
- Classification : l'**accuracy ment** sur les classes déséquilibrées (99 % en prédisant « jamais fraude »). La **matrice de confusion** détaille : **précision** (des positifs prédits, combien de vrais ?) vs **rappel** (des vrais positifs, combien de trouvés ?) — l'arbitrage dépend du COÛT MÉTIER des erreurs : le dépistage médical veut du rappel (ne rater personne), le filtre anti-spam de la précision (ne pas bloquer un vrai mail). **F1** les combine, **AUC** résume tous les seuils.

### Les features : là où se gagne la partie
Les **features** (variables d'entrée) comptent souvent plus que le choix du modèle : encoder une date en « jour de la semaine », créer un ratio métier, encoder les catégories (one-hot). Le **Pipeline** scikit-learn (préprocessing + modèle empaquetés) garantit que les transformations apprises sur le train s'appliquent à l'identique partout — l'anti-leakage outillé.

## Concepts clés
Supervisé / non supervisé · régression, classification, clustering · train/test split · leakage · baseline · overfitting / underfitting · régularisation · cross-validation · matrice de confusion · précision / rappel / F1 / AUC · MAE / RMSE · feature engineering · Pipeline.

## 🧭 Exemple guidé
Le workflow honnête, en squelette :
```python
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
baseline = y_train.mean()                       # à battre !
pipe = Pipeline([("scaler", StandardScaler()),  # transfos DANS le pipeline
                 ("model", Ridge())])
scores = cross_val_score(pipe, X_train, y_train, cv=5)   # évaluation robuste
pipe.fit(X_train, y_train)
evaluation_finale = pipe.score(X_test, y_test)  # le test, UNE fois, à la fin
```
Chaque ligne encode une leçon d'honnêteté : split d'abord, baseline, transfos encapsulées, cross-validation, test intouché jusqu'au bout.

## ⚠️ Erreurs fréquentes
- Évaluer sur le train (score illusoire).
- Normaliser/encoder AVANT de splitter (leakage).
- Rapporter l'accuracy sur du déséquilibré.
- S'arrêter aux métriques agrégées : REGARDER les erreurs une par une révèle des patterns que les chiffres cachent.
- Croire que le deep learning est toujours mieux : sur des données tabulaires modestes, le ML classique gagne souvent.

## 🔗 Liens avec le programme
Les LLM (mois 7) sont du ML géant : mêmes concepts (données d'entraînement, généralisation, overfitting) à une autre échelle. Et l'évaluation RAG (mois 9) est un transfert DIRECT : golden set = jeu de test, fidélité = métrique choisie selon le coût d'erreur, biais du juge LLM = biais de mesure, « le retrieval trouve-t-il le bon chunk » = du rappel@k. Maîtriser cette leçon, c'est déjà savoir évaluer un système IA.

## Mini-exercice
Sur un dataset public de classification déséquilibrée : établis la baseline (classe majoritaire), entraîne une régression logistique, produis la matrice de confusion, et réponds par écrit : quelle métrique est pertinente ICI et pourquoi ? Que coûte un faux positif vs un faux négatif dans ce contexte métier ?

## ✅ Correction attendue
**La démarche** : baseline d'abord, toujours. Sur un jeu déséquilibré à 5 % de positifs, la classe majoritaire donne **95 % d'accuracy** sans rien apprendre. C'est ce chiffre — écrit noir sur blanc avant tout modèle — qui empêche de se réjouir d'un 96 %.

**L'erreur probable, et elle est presque universelle chez les débutants.** La régression logistique sort une accuracy de 0,96, supérieure à la baseline de 0,95, et l'on conclut que le modèle fonctionne. Puis on regarde la matrice de confusion : sur 100 positifs réels, le modèle en trouve 12.

Le piège tient à ce que l'accuracy **améliore effectivement** la baseline — d'un point. Ce point vient presque entièrement des négatifs, qui représentent 95 % des cas et que le modèle classe très bien. La question qui intéresse le métier — trouve-t-on les positifs ? — n'a jamais été posée. Ce n'est pas que le chiffre soit faux : il répond honnêtement à une question sans intérêt.

Il y a plus vicieux encore, et il faut le savoir : par défaut, un classifieur décide à un seuil de 0,5. Sur des classes très déséquilibrées, presque aucun exemple n'atteint ce score, et le modèle prédit « négatif » quasiment partout — **alors même qu'il a parfaitement appris à ordonner les cas par risque**. Un modèle jugé inutile peut n'avoir qu'un seuil mal placé. Regarder l'AUC avant de conclure évite de jeter un modèle qui marche.

**Alternative défendable** au rééquilibrage des classes : ne rien rééquilibrer et ajuster le seuil de décision. Le sur-échantillonnage de la classe rare fabrique des exemples qui n'existent pas et dégrade souvent la calibration des probabilités ; déplacer le seuil ne touche pas aux données et se pilote directement par le coût métier. Rééquilibrer se justifie quand la classe rare est si peu représentée que le modèle ne peut rien en apprendre.

**Vérifie seul, sans corrigé** :
1. Ta baseline est-elle écrite AVANT le score du modèle, dans cet ordre, dans ton compte rendu ? Écrite après, elle sert d'excuse plutôt que de garde-fou.
2. Ta matrice de confusion contient-elle des vrais positifs ? Si la colonne « positif prédit » est presque vide, ton modèle ne fait rien d'utile quel que soit son score.
3. Ta réponse écrite sur le coût des erreurs cite-t-elle des conséquences concrètes — un client perdu, un examen inutile, une fraude non détectée — ou seulement « les faux négatifs sont plus graves » ? La seconde formulation ne permet de choisir aucun seuil.
4. Réentraîne en incluant volontairement une colonne qui contient la réponse. Le score doit devenir presque parfait. **Avoir vu cette illusion une fois** est ce qui te fera reconnaître un leakage en production, où personne ne te préviendra.

## 🏢 Cas professionnel
Une équipe met en production un modèle de prédiction de résiliation à 0,94 d'AUC en validation. En production, il ne prédit presque plus rien de juste. L'enquête met trois semaines et trouve deux causes, toutes deux invisibles dans les scores.

D'abord une fuite temporelle : le `train_test_split` aléatoire avait mélangé les mois, si bien que le modèle s'entraînait sur novembre pour prédire octobre. En production, l'avenir n'est pas disponible. Ensuite un décalage plus profond : le modèle avait appris sur une période promotionnelle, dont les comportements d'achat ne ressemblaient à aucune autre. Les données d'entraînement décrivaient un monde qui n'existait plus.

La leçon générale dépasse le ML tabulaire : **un jeu de test ne valide que ce qu'il ressemble.** Il répond à « mon modèle généralise-t-il à des données tirées de la même distribution ? », jamais à « le monde va-t-il rester le même ? ». C'est pourquoi les équipes sérieuses surveillent en production la distribution des entrées autant que la performance, et réévaluent périodiquement sur des données fraîches. Un modèle n'est pas livré une fois ; il se surveille comme un service.

## 🎤 Questions d'entretien
- « Qu'est-ce que l'overfitting, et comment le détectes-tu ? » → Le modèle mémorise le bruit : excellent sur l'entraînement, médiocre en test. Se lit sur l'écart entre les deux courbes.
- « Ton modèle fait 96 %, la baseline 95 %. Bon modèle ? » → Presque certainement non. Il faut la matrice de confusion : le point gagné vient probablement de la classe majoritaire.
- « Cite trois façons de fuiter des données. » → Une feature qui contient la cible ; un prétraitement calculé avant le split ; une séparation aléatoire sur des données temporelles.
- « Pourquoi une baseline ? » → Parce qu'un score n'a de sens que comparé. Sans elle, on ne sait pas si le modèle a appris quoi que ce soit.
- « Ton modèle marchait en validation et pas en production. Que cherches-tu ? » → Une fuite, un décalage de distribution, ou une différence entre les données d'entraînement et celles réellement disponibles au moment de prédire.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'écris ma baseline avant d'entraîner quoi que ce soit.
- [ ] Je ne conclus jamais d'un score agrégé sans regarder la matrice de confusion.
- [ ] Je sais nommer trois mécanismes de fuite et les repérer dans un notebook.
- [ ] Je regarde une dizaine d'erreurs réelles avant de décider quoi améliorer.

## 📚 Vocabulaire
**modèle** · **feature / cible** · **split / leakage** · **baseline** · **overfitting / underfitting** · **régularisation** · **cross-validation** · **matrice de confusion** · **précision / rappel / F1 / AUC** · **pipeline** · **hyperparamètre**.

## 🧾 À retenir
Le ML apprend des règles depuis des exemples — et tout l'art est l'HONNÊTETÉ de l'évaluation : split avant tout, baseline à battre, cross-validation, métriques choisies selon le coût métier des erreurs, chasse au leakage, diagnostic overfitting sur les courbes. Les features comptent plus que le modèle, et l'analyse qualitative des erreurs plus que les chiffres agrégés. Ce protocole se transfère tel quel à l'évaluation des systèmes LLM.
