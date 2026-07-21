# Correction — Jour 180 : Projet 5 — Analyse d'erreurs et rapport

[← Retour au jour 180](../days/day-180.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : présenter les métriques du modèle. Solution améliorée : mener une analyse d'erreurs qualitative (patterns d'erreurs → limites concrètes), puis un rapport orienté décision (question métier → méthode reproductible → performance vs baseline TRADUITE en actions → coûts des erreurs → limites honnêtes → recommandation actionnable), écrit pour un décideur non technique. La preuve : un non-technique sait quelle action prendre ET ce qui doit le rendre prudent.

## ⚠️ Erreurs probables et points à vérifier
- Livrer un notebook de courbes au lieu d'un rapport orienté décision : le métier ne sait pas quoi en faire.
- Rapporter l'AUC sans la traduire en action/coût : un décideur agit sur des coûts, pas une métrique.
- Cacher les limites : la confiance s'effondre quand elles apparaissent — l'analyse d'erreurs les rend concrètes.
- Recommander une automatisation aveugle : préférer aide au ciblage, A/B, surveillance de la dérive.

## 🔍 Comment vérifier ta solution
- Une analyse d'erreurs qualitative identifie des patterns qui nourrissent les limites.
- Le rapport part de la décision et traduit la performance en actions.
- Les coûts des faux positifs/négatifs sont explicités et reliés au seuil.
- Les limites honnêtes sont assumées (cause, biais, nouveaux clients, causalité).
- Une recommandation actionnable et prudente clôt le rapport (aide, A/B, dérive).

## 🎤 À savoir expliquer à l'oral
Structure : analyse d'erreurs → rapport (décision → méthode → perf vs baseline traduite → coûts → limites → reco). Insiste « le dernier livrable n'est pas le modèle mais ce qui permet d'agir » et que l'analyse d'erreurs rend les limites concrètes et crédibles. Le test « un non-technique sait-il quoi faire ET pourquoi être prudent ? » prouve que ton rapport crée de la valeur — la marque d'un data scientist qui a de l'impact.
