# Correction — Jour 156 : Régression linéaire

[← Retour au jour 156](../days/day-156.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : entraîner une LinearRegression et regarder le score. Solution améliorée : split propre, poser une baseline (DummyRegressor mean) que le modèle doit battre, évaluer en MAE/RMSE sur le test, interpréter les coefficients en tenant compte de l'échelle des features, et diagnostiquer les limites (linéarité, outliers, colinéarité). La preuve : le modèle bat la baseline ET ses coefficients sont interprétés en termes métier.

## ⚠️ Erreurs probables et points à vérifier
- Ne pas comparer à une baseline : sans elle, on ne sait pas si le modèle apporte quoi que ce soit.
- Interpréter les coefficients sans tenir compte de l'échelle des features : des coefficients non comparables.
- Ignorer les outliers : à cause du carré, ils tirent la droite et faussent tout.
- Supposer la linéarité sans la vérifier : une relation courbe est mal capturée (créer des features ou changer de modèle).

## 🔍 Comment vérifier ta solution
- Un split train/test propre est effectué (pas de leakage).
- Une baseline est posée et le modèle la bat.
- L'évaluation utilise MAE/RMSE sur le test.
- Les coefficients sont interprétés (effet par unité, échelle prise en compte).
- Les limites (linéarité, outliers) sont vérifiées.

## 🎤 À savoir expliquer à l'oral
Explique les moindres carrés (minimiser les carrés des erreurs) et l'interprétation des coefficients (effet par unité, toutes choses égales par ailleurs). Insiste sur la baseline (« battre prédire-la-moyenne est le minimum ») et sur les limites (linéarité, outliers). Montrer que tu interprètes les coefficients en termes métier — pas juste un score — prouve que tu comprends le modèle, pas seulement que tu l'exécutes.
