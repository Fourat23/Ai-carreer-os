# Correction — Jour 170 : Encodage et préprocessing

[← Retour au jour 170](../days/day-170.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : encoder les catégories et normaliser. Solution améliorée : encoder selon la NATURE (one-hot pour le non-ordonné, label seulement pour l'ordonné), normaliser uniquement pour les modèles sensibles à l'échelle, imputer les manquants avec une décision justifiée, et TOUT encapsuler dans un ColumnTransformer + Pipeline appliquant le bon traitement à chaque type de colonne, ré-appris à chaque fold. La preuve : pas d'ordre fictif, pas de leakage, préprocessing reproductible en production.

## ⚠️ Erreurs probables et points à vérifier
- Label-encoder une catégorie non ordonnée : ordre fictif qui trompe les modèles linéaires — utiliser le one-hot.
- Normaliser sur tout le dataset avant le split : l'info du test fuit — l'encapsuler dans un Pipeline.
- Normaliser pour des arbres/forêts : inutile (ils sont insensibles à l'échelle).
- One-hot sur une variable à très nombreuses modalités : explosion de colonnes — envisager d'autres encodages.

## 🔍 Comment vérifier ta solution
- Les catégories non ordonnées sont en one-hot (pas d'ordre fictif).
- La normalisation n'est appliquée qu'aux modèles qui en ont besoin.
- Les manquants sont imputés avec une décision justifiée.
- Tout le préprocessing est dans un ColumnTransformer + Pipeline.
- Le préprocessing est ré-appris sur le train de chaque fold (pas de leakage).

## 🎤 À savoir expliquer à l'oral
Explique « le modèle ne mange que des nombres » : one-hot pour le non-ordonné (pas d'ordre fictif), label seulement pour l'ordonné, normalisation pour les modèles à base de distance (pas les arbres). Insiste sur le Pipeline + ColumnTransformer qui apprend sur le train seul (anti-leakage) et rend le préprocessing reproductible en production. Citer l'erreur du label-encoding sur du non-ordonné montre que tu connais les pièges réels.
