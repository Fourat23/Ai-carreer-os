# Correction — Jour 43 : Programmation fonctionnelle : composition et pureté en TS

[← Retour au jour 43](../days/day-043.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Typer les fonctions d'ordre supérieur affine la compréhension : compose<A,B,C> révèle les contraintes de composition. readonly rend l'immutabilité vérifiée par le compilateur.

## ⚠️ Erreurs probables et points à vérifier
- Génériques de compose trop lâches (perte de type au milieu).
- Muter un readonly (erreur tsc — c'est le but).

## 🧩 Questions de réflexion
- Le typage t'a-t-il forcé à clarifier un contrat resté flou en JS ?
