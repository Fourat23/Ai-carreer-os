# Correction — Jour 173 : Interprétabilité

[← Retour au jour 173](../days/day-173.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : afficher la feature importance native. Solution améliorée : comparer l'importance native (rapide, biaisée, sur le train) à la permutation importance (agnostique, sur la validation, plus honnête), expliquer une prédiction individuelle (SHAP), et utiliser l'interprétabilité comme DÉTECTEUR de leakage (une feature démesurément importante est suspecte). La preuve : une explication fiable des features qui comptent ET la détection d'une feature anormale.

## ⚠️ Erreurs probables et points à vérifier
- Prendre la feature importance native pour une vérité : elle est biaisée et calculée sur le train — préférer la permutation.
- Calculer l'importance sur le train : elle peut refléter du surapprentissage — la mesurer sur la validation.
- Ignorer une feature anormalement importante : c'est souvent le signe d'un leakage à investiguer.
- Se contenter d'une importance globale quand il faut expliquer une décision individuelle (SHAP).

## 🔍 Comment vérifier ta solution
- L'importance native et la permutation importance sont comparées.
- La permutation importance est mesurée sur la validation.
- Une feature suspecte est examinée comme possible leakage.
- Les contributions locales (SHAP) sont mobilisées pour expliquer une prédiction individuelle si besoin.
- L'interprétation sert l'adoption, la conformité et le débogage.

## 🎤 À savoir expliquer à l'oral
Oppose importance native (rapide, biaisée, train) et permutation importance (agnostique, validation, honnête), et cite SHAP pour l'explication individuelle. Donne les trois enjeux (adoption, conformité, débogage) et le réflexe « une feature trop importante = suspicion de leakage ». Montrer que l'interprétabilité attrape un leakage qu'une métrique masque prouve que tu la vois comme un outil, pas une formalité.
