# Correction — Jour 171 : Pipelines scikit-learn

[← Retour au jour 171](../days/day-171.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : mettre le préprocessing et le modèle dans un Pipeline. Solution améliorée : encapsuler un ColumnTransformer (numériques normalisés, catégorielles one-hot) et le modèle dans un Pipeline, l'utiliser en validation croisée (préprocessing ré-appris à chaque fold = anti-leakage structurel), le sérialiser pour le déploiement (préprocessing + modèle ensemble), et démontrer que le score Pipeline est le score honnête (vs un préprocessing global qui fuit). La preuve : le même objet s'entraîne, s'évalue sans leakage et se déploie.

## ⚠️ Erreurs probables et points à vérifier
- Faire le préprocessing à la main sur tout X avant la CV : leakage — le Pipeline l'évite par construction.
- Oublier de déployer le préprocessing avec le modèle : incohérence train/production — le Pipeline les embarque ensemble.
- Ne pas utiliser ColumnTransformer pour des types de colonnes différents : préprocessing hétérogène mal géré.
- Ré-ajuster le préprocessing à la prédiction : il doit appliquer les paramètres appris à l'entraînement, pas les réapprendre.

## 🔍 Comment vérifier ta solution
- Préprocessing et modèle sont encapsulés dans un Pipeline unique.
- Un ColumnTransformer applique le bon traitement à chaque type de colonne.
- La CV utilise le Pipeline (préprocessing ré-appris à chaque fold).
- Le Pipeline est sérialisé (déployable avec son préprocessing).
- Le score Pipeline est reconnu comme le score honnête (sans leakage).

## 🎤 À savoir expliquer à l'oral
Présente le Pipeline comme la transformation de l'anti-leakage « discipline » en garantie « structurelle » : en CV, le préprocessing se ré-apprend sur le train de chaque fold. Ajoute la reproductibilité/déploiement (préprocessing sérialisé avec le modèle) et la lisibilité. Dire « un projet ML sérieux encapsule toujours en Pipeline » et expliquer POURQUOI montre une rigueur de praticien que les revues attendent.
