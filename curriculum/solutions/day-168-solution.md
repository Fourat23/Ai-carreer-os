# Correction / Grille — Jour 168 : Revue de la semaine 24

[← Retour au jour 168](../days/day-168.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Classification : arbres, forêts, cross-validation, overfitting**. Le cœur du ML classique : arbres, random forest, validation croisée, et le concept le plus important de tout le ML : l'overfitting.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : dataset de classification déséquilibré fourni — arbre de décision (visualisé), random forest, cross-validation 5 folds, courbe d'apprentissage, matrice de confusion commentée, choix de métrique justifié (pas accuracy !).
- **Test théorique** (réponds de mémoire puis auto-corrige) : Comment un arbre décide d'un split ; pourquoi une forêt bat un arbre ; overfitting/underfitting : symptômes et remèdes ; que montre une matrice de confusion ; pourquoi accuracy ment sur du déséquilibré ?
- **Mini-projet / livrable** conforme : Détecteur de spam (dataset public SMS/emails) : vectorisation simple, 2 modèles comparés en cross-validation, analyse des faux positifs/négatifs avec exemples réels.
- **Exercice d'architecture** fait sérieusement : Ton détecteur de spam a 2% de faux positifs (vrais mails bloqués). Le coût métier d'un faux positif vs faux négatif est-il symétrique ? Comment régler le seuil de décision en fonction ? Écris ton raisonnement.

## 📋 Checklist de validation
- [ ] Cross-validation par défaut
- [ ] J'inspecte les erreurs une par une (pas que les chiffres)
- [ ] Hyperparamètres : je comprends ceux que je touche
- [ ] Je sais dessiner overfitting sur une courbe

## 🚦 Critères de passage à la semaine suivante
- [ ] Matrice de confusion correctement lue
- [ ] Métrique adaptée au déséquilibre choisie
- [ ] Analyse d'erreurs avec 5 exemples commentés

## ⚠️ Erreurs fréquentes en revue
- Se sur-noter (familiarité ≠ maîtrise) : ne compte que ce que tu produis SEUL et sais EXPLIQUER.
- Bâcler le test théorique en le relisant au lieu de répondre de mémoire (rappel actif).
- Avancer malgré des critères non atteints : mieux vaut consolider 2-3 jours que bâtir sur du sable.
- Oublier de mettre à jour ses scores de compétences dans l'application.

## 🧩 Auto-évaluation finale
- Note honnête de la semaine (0-5) : ____
- Ma plus grande difficulté cette semaine : ____
- Ce que je dois revoir avant d'avancer : ____
- Si des critères ne sont pas atteints : quel plan de rattrapage (daté) ?
