<!-- keep -->
# Leçon — Machine learning : les bases

## Pourquoi c'est important
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

## Exemple
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

## Pièges classiques
- Évaluer sur le train (score illusoire).
- Normaliser/encoder AVANT de splitter (leakage).
- Rapporter l'accuracy sur du déséquilibré.
- S'arrêter aux métriques agrégées : REGARDER les erreurs une par une révèle des patterns que les chiffres cachent.
- Croire que le deep learning est toujours mieux : sur des données tabulaires modestes, le ML classique gagne souvent.

## Lien avec l'IA / le futur
Les LLM (mois 7) sont du ML géant : mêmes concepts (données d'entraînement, généralisation, overfitting) à une autre échelle. Et l'évaluation RAG (mois 9) est un transfert DIRECT : golden set = jeu de test, fidélité = métrique choisie selon le coût d'erreur, biais du juge LLM = biais de mesure, « le retrieval trouve-t-il le bon chunk » = du rappel@k. Maîtriser cette leçon, c'est déjà savoir évaluer un système IA.

## Mini-exercice
Sur un dataset public de classification déséquilibrée : établis la baseline (classe majoritaire), entraîne une régression logistique, produis la matrice de confusion, et réponds par écrit : quelle métrique est pertinente ICI et pourquoi ? Que coûte un faux positif vs un faux négatif dans ce contexte métier ?

## Vocabulaire à retenir
**modèle** · **feature / cible** · **split / leakage** · **baseline** · **overfitting / underfitting** · **régularisation** · **cross-validation** · **matrice de confusion** · **précision / rappel / F1 / AUC** · **pipeline** · **hyperparamètre**.

## Résumé
Le ML apprend des règles depuis des exemples — et tout l'art est l'HONNÊTETÉ de l'évaluation : split avant tout, baseline à battre, cross-validation, métriques choisies selon le coût métier des erreurs, chasse au leakage, diagnostic overfitting sur les courbes. Les features comptent plus que le modèle, et l'analyse qualitative des erreurs plus que les chiffres agrégés. Ce protocole se transfère tel quel à l'évaluation des systèmes LLM.
