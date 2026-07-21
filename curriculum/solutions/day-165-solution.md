# Correction — Jour 165 : Cross-validation

[← Retour au jour 165](../days/day-165.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : cross_val_score sur 5 folds et regarder la moyenne. Solution améliorée : encapsuler préprocessing + modèle dans un Pipeline pour que la CV soit sans leakage (préprocessing ré-appris à chaque fold), rapporter moyenne ET écart-type, comparer plusieurs modèles sur la MÊME CV, et tracer une courbe d'apprentissage pour diagnostiquer sur/sous-apprentissage. La preuve : la comparaison de modèles tient compte de la variabilité, pas seulement de la moyenne.

## ⚠️ Erreurs probables et points à vérifier
- Décider entre modèles sur un seul split : on parie sur la chance du découpage.
- Faire le préprocessing sur l'ensemble complet avant la CV : leakage qui surestime la performance — l'encapsuler dans un Pipeline.
- Ne rapporter que la moyenne : sans l'écart-type, on ignore si le modèle est stable.
- Confondre CV (comparaison/réglage) et test final : garder un jeu de test jamais touché pendant la CV.

## 🔍 Comment vérifier ta solution
- La CV utilise k folds et rapporte moyenne ET écart-type.
- Le préprocessing est dans un Pipeline (ré-appris à chaque fold, pas de leakage).
- Les modèles sont comparés sur la même CV.
- La variabilité (écart-type) est prise en compte dans la décision.
- Un test final distinct est préservé pour l'évaluation finale.

## 🎤 À savoir expliquer à l'oral
Explique qu'un seul split dépend du hasard du découpage, alors que la CV fait tourner le test sur toutes les données et donne moyenne ± variabilité. Insiste sur l'écart-type (stabilité) et sur le Pipeline anti-leakage (préprocessing ré-appris à chaque fold). Dire « décider sur un seul split, c'est parier sur la chance » montre que tu comprends pourquoi la CV est la référence pour comparer.
