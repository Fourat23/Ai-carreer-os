# Correction — Jour 65 : Projet 2 — LivreAPI : tests d'intégration

[← Retour au jour 65](../days/day-065.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Un test d'intégration vérifie le système bout-en-bout (HTTP→logique→DB) sur une base ISOLÉE (réinitialisée). Distinct des tests unitaires (logique seule).

## ⚠️ Erreurs probables et points à vérifier
- Tester sur la base de dev (pollution).
- Ne tester que les chemins heureux.

## 🧩 Questions de réflexion
- Quelle est la différence avec les tests unitaires du projet 1 ?
