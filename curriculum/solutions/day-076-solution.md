# Correction — Jour 76 : Modularité et API design : concevoir des interfaces propres

[← Retour au jour 76](../days/day-076.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Un bon module cache son implémentation derrière un contrat minimal (comme ton interface Store). Couplage faible = changer un module n'oblige pas à changer les autres. Cohésion forte = un module fait une chose.

## ⚠️ Erreurs probables et points à vérifier
- Modules qui exposent tout (pas d'encapsulation).
- Dépendances circulaires (A→B→A).

## 🧩 Questions de réflexion
- Si tu changes l'implémentation d'un module, combien d'autres cassent ? (objectif : zéro)
