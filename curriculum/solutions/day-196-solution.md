# Correction / Grille — Jour 196 : Revue de la semaine 28

[← Retour au jour 196](../days/day-196.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **MLP sur données réelles, régularisation, courbes**. Entraîner de vrais petits réseaux, diagnostiquer avec les courbes train/val, et connaître les 3 remèdes de base à l'overfitting profond.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : MLP PyTorch sur MNIST (ou Fashion-MNIST) — DataLoader, boucle d'entraînement propre, courbes train/val, early stopping simple, dropout testé avec effet mesuré.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Batch/epoch/itération ; pourquoi un set de validation distinct du test ; que voit-on quand ça overfitte (courbes) ; dropout : intuition ; batch norm : à quoi ça sert (intuition suffit) ?
- **Mini-projet / livrable** conforme : Rapport d'expériences : 5 configurations (largeur, dropout, lr) comparées rigoureusement sur le même split, tableau de résultats, conclusion.
- **Exercice d'architecture** fait sérieusement : Ton entraînement prend 10 min. Il en prendra 10h sur un vrai dataset. Qu'est-ce que ça change dans ta façon de travailler (checkpoints, logs, reprise, coût d'une erreur de code) ? Liste 5 pratiques.

## 📋 Checklist de validation
- [ ] Boucle d'entraînement écrite maison (pas copiée)
- [ ] Courbes systématiques
- [ ] Une seule variable changée par expérience
- [ ] Seed fixée pour comparer

## 🚦 Critères de passage à la semaine suivante
- [ ] > 95% sur MNIST test
- [ ] Diagnostic overfitting démontré et corrigé
- [ ] Tableau d'expériences propre

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
