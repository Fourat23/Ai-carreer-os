# Semaine 24 — Classification : arbres, forêts, cross-validation, overfitting

> **Mois 6** · Compétences : Machine learning

[← Mois 6](month-06.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 162](days/day-162.md)
- [Jour 163](days/day-163.md)
- [Jour 164](days/day-164.md)
- [Jour 165](days/day-165.md)
- [Jour 166](days/day-166.md)
- [Jour 167](days/day-167.md)
- [Jour 168](days/day-168.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Le cœur du ML classique : arbres, random forest, validation croisée, et le concept le plus important de tout le ML : l'overfitting.
- **Test pratique :** 90 min : dataset de classification déséquilibré fourni — arbre de décision (visualisé), random forest, cross-validation 5 folds, courbe d'apprentissage, matrice de confusion commentée, choix de métrique justifié (pas accuracy !).
- **Test théorique :** Comment un arbre décide d'un split ; pourquoi une forêt bat un arbre ; overfitting/underfitting : symptômes et remèdes ; que montre une matrice de confusion ; pourquoi accuracy ment sur du déséquilibré ?
- **Mini-projet :** Détecteur de spam (dataset public SMS/emails) : vectorisation simple, 2 modèles comparés en cross-validation, analyse des faux positifs/négatifs avec exemples réels.
- **Critères de passage :**
  - [ ] Matrice de confusion correctement lue
  - [ ] Métrique adaptée au déséquilibre choisie
  - [ ] Analyse d'erreurs avec 5 exemples commentés
- **Exercice d'architecture :** Ton détecteur de spam a 2% de faux positifs (vrais mails bloqués). Le coût métier d'un faux positif vs faux négatif est-il symétrique ? Comment régler le seuil de décision en fonction ? Écris ton raisonnement.
