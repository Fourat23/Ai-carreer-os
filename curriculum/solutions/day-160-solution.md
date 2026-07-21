# Correction — Jour 160 : Rapport de modèle

[← Retour au jour 160](../days/day-160.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : décrire le modèle et ses métriques. Solution améliorée : structurer orienté décision — question métier d'abord, méthode reproductible, performance TOUJOURS vs baseline et traduite en termes métier, limites honnêtes assumées (biais, classe rare, corrélation ≠ causalité), et recommandation d'action. Écrit pour un décideur non technique. La preuve : un lecteur non technique sait quelle décision prendre après lecture.

## ⚠️ Erreurs probables et points à vérifier
- Commencer par le score ou la stack au lieu de la question métier : le décideur ne sait pas à quoi ça sert.
- Rapporter un score nu sans baseline : un chiffre sans comparaison ne veut rien dire.
- Cacher les limites pour bien vendre le modèle : la confiance s'effondre quand elles apparaissent en production.
- Empiler des métriques sans les relier à une décision : le rapport n'est pas actionnable.

## 🔍 Comment vérifier ta solution
- Le rapport commence par la question métier et la décision éclairée.
- La méthode est reproductible (données, split, modèle, métrique justifiée).
- La performance est rapportée vs une baseline et traduite en termes métier.
- Les limites sont assumées explicitement (biais, classe rare, causalité).
- Une recommandation d'action clôt le rapport ; un non-technique sait quoi décider.

## 🎤 À savoir expliquer à l'oral
Structure : question métier → méthode reproductible → performance vs baseline (traduite métier) → limites assumées → recommandation. Insiste que « un modèle ne vaut que par la décision qu'il éclaire » et que les limites CRÉDIBILISENT au lieu d'affaiblir. Le test « un non-technique sait-il quoi décider ? » prouve que ton rapport est orienté décision, la marque d'un data scientist qui a de l'impact.
