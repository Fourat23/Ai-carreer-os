# Correction — Jour 32 : Récursion consolidée : backtracking d'introduction

[← Retour au jour 32](../days/day-032.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Chaque élément offre un choix : le prendre ou non → deux appels récursifs. L'arbre de tous les choix a 2^n feuilles (sous-ensembles) — la taille du RÉSULTAT dicte la complexité, pas ton code.

## ⚠️ Erreurs probables et points à vérifier
- Muter l'accumulateur partagé sans le copier au bon moment (backtracking : défaire après essayer).
- Oublier le cas de base (plus d'éléments à décider).

## 🧩 Questions de réflexion
- Ici l'exponentiel vient du PROBLÈME. Comment le distinguer d'un exponentiel dû à une mauvaise solution (fib naïf) ?
