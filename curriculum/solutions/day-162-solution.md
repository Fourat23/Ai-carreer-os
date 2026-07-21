# Correction — Jour 162 : Métriques de classification

[← Retour au jour 162](../days/day-162.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : calculer précision, rappel, F1, AUC. Solution améliorée : montrer d'abord que l'accuracy trompe sur le déséquilibre, lire la matrice de confusion, interpréter précision (fausses alertes) et rappel (cas ratés), CHOISIR lequel optimiser selon le coût métier des faux positifs vs faux négatifs, et régler le seuil en conséquence (pas laisser 0,5 par défaut). La preuve : le choix de métrique et de seuil est argumenté par le coût des erreurs du problème.

## ⚠️ Erreurs probables et points à vérifier
- Se fier à l'accuracy sur des classes déséquilibrées : elle est élevée même pour un modèle inutile.
- Optimiser précision ou rappel sans se demander lequel importe pour le métier : on optimise peut-être la mauvaise chose.
- Laisser le seuil à 0,5 par défaut : le seuil doit refléter le coût relatif des erreurs.
- Rapporter l'AUC seule : elle mesure la séparation mais pas la performance au seuil choisi — compléter par précision/rappel.

## 🔍 Comment vérifier ta solution
- L'accuracy est explicitement écartée sur le déséquilibre.
- Précision et rappel sont calculés et interprétés (fausses alertes vs cas ratés).
- Le choix précision/rappel est justifié par le coût métier.
- Le seuil est réglé en conséquence, pas laissé à 0,5.
- AUC et F1 sont lus correctement (séparation ; compromis).

## 🎤 À savoir expliquer à l'oral
Commence par le piège de l'accuracy (« prédire toujours non donne 99 % et zéro utilité »). Définis précision (fausses alertes) et rappel (cas ratés), leur opposition, et le choix par le COÛT métier (fraude → rappel ; spam → précision). Mentionne F1 et AUC. Conclure par « le seuil est un choix métier, pas 0,5 par défaut » montre que tu penses décision, pas juste métrique.
