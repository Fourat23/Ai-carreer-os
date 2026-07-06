<!-- keep -->
# Leçon — Le workflow scikit-learn

## 🎯 Objectif
Maîtriser l'API scikit-learn (fit/predict/transform) et surtout le **Pipeline**, qui rend tout le workflow ML reproductible et anti-leakage par construction. C'est l'outillage standard du ML tabulaire — celui de ton projet 5 et des entretiens data.

## 🧠 Modèle mental
scikit-learn a UNE grammaire : **tout objet apprend avec `fit`, applique avec `predict` (modèles) ou `transform` (préprocesseurs)**. Le Pipeline enchaîne ces objets en un SEUL : ce que le train a appris s'applique à l'identique partout — le protocole d'honnêteté du ML, outillé.

## 📖 Explication complète
- **La grammaire** : `model.fit(X_train, y_train)` apprend ; `model.predict(X_test)` prédit ; `scaler.fit_transform(X_train)` apprend ET applique ; `scaler.transform(X_test)` applique SEULEMENT (jamais re-fit sur le test !). Tous les objets (régressions, forêts, scalers, encodeurs) parlent cette langue — en changer est trivial.
- **Le piège que le Pipeline élimine** : normaliser/encoder sur TOUT le dataset avant le split = le test a fuité dans les paramètres appris (leakage). Le **Pipeline** encapsule préprocessing + modèle : `pipe.fit(X_train)` fait apprendre chaque étape SUR LE TRAIN uniquement, `pipe.predict(X_test)` applique la chaîne — le leakage devient structurellement impossible.
- **ColumnTransformer** : appliquer des traitements différents par type de colonne (numériques → scaler ; catégorielles → one-hot) dans un seul objet, intégrable au Pipeline.
- **Cross-validation intégrée** : `cross_val_score(pipe, X, y, cv=5)` refait fit/transform DANS chaque pli — la bonne évaluation sans effort. `GridSearchCV(pipe, params, cv=5)` cherche les hyperparamètres proprement (la recherche voit le pipeline entier, donc zéro fuite).
- **Reproductibilité** : `random_state` fixé partout, le pipeline sauvegardé (joblib) = le MÊME objet sert en entraînement et en production (mêmes transformations, mêmes encodages, gestion des catégories inconnues).

## 🔧 Exemple simple
```python
pipe = Pipeline([("scaler", StandardScaler()), ("model", LogisticRegression())])
pipe.fit(X_train, y_train)
pipe.score(X_test, y_test)   # le scaler du TRAIN s'applique au test, automatiquement
```

## 🧭 Exemple guidé
**Énoncé** : pipeline complet avec colonnes mixtes (numériques + catégorielles).
**Raisonnement** : ColumnTransformer pour router par type, Pipeline pour tout englober, cross-validation pour évaluer.
**Solution** :
```python
prep = ColumnTransformer([
    ("num", StandardScaler(), ["age", "revenu"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["ville", "segment"]),
])
pipe = Pipeline([("prep", prep), ("model", RandomForestClassifier(random_state=42))])
scores = cross_val_score(pipe, X_train, y_train, cv=5, scoring="f1")
```
**Explication** : chaque pli de la CV re-apprend le préprocessing sur SA partie train — zéro fuite ; `handle_unknown="ignore"` gère les catégories jamais vues (la réalité de la prod). **Variante** : ajoute un GridSearchCV sur `model__max_depth` (la syntaxe `étape__param`).

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
Prends un de tes modèles « à plat » (scaler séparé du modèle) et refactore-le en Pipeline. Vérifie que le score ne change pas — mais que le code, si.

## 🔥 Exercice plus difficile
Pipeline complet ColumnTransformer + modèle + GridSearchCV sur 2 hyperparamètres, avec `random_state` partout, sauvegardé en joblib et rechargé pour prédire sur des données « neuves » contenant une catégorie inconnue.

## ✅ Correction attendue
La logique : la grammaire fit/predict/transform, le Pipeline comme garant anti-leakage, la CV qui englobe TOUT. Vérifie : aucun `fit` ne touche le test ; la catégorie inconnue ne crashe pas ; deux exécutions donnent le même résultat (seed) ; le pipeline rechargé prédit à l'identique.

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
