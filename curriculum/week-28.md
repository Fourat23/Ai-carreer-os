# Semaine 28 — MLP sur données réelles, régularisation, courbes

> **Mois 7** · Compétences : Deep learning

[← Mois 7](month-07.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 190](days/day-190.md)
- [Jour 191](days/day-191.md)
- [Jour 192](days/day-192.md)
- [Jour 193](days/day-193.md)
- [Jour 194](days/day-194.md)
- [Jour 195](days/day-195.md)
- [Jour 196](days/day-196.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Entraîner de vrais petits réseaux, diagnostiquer avec les courbes train/val, et connaître les 3 remèdes de base à l'overfitting profond.
- **Test pratique :** 90 min : MLP PyTorch sur MNIST (ou Fashion-MNIST) — DataLoader, boucle d'entraînement propre, courbes train/val, early stopping simple, dropout testé avec effet mesuré.
- **Test théorique :** Batch/epoch/itération ; pourquoi un set de validation distinct du test ; que voit-on quand ça overfitte (courbes) ; dropout : intuition ; batch norm : à quoi ça sert (intuition suffit) ?
- **Mini-projet :** Rapport d'expériences : 5 configurations (largeur, dropout, lr) comparées rigoureusement sur le même split, tableau de résultats, conclusion.
- **Critères de passage :**
  - [ ] > 95% sur MNIST test
  - [ ] Diagnostic overfitting démontré et corrigé
  - [ ] Tableau d'expériences propre
- **Exercice d'architecture :** Ton entraînement prend 10 min. Il en prendra 10h sur un vrai dataset. Qu'est-ce que ça change dans ta façon de travailler (checkpoints, logs, reprise, coût d'une erreur de code) ? Liste 5 pratiques.
