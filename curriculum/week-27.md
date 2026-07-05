# Semaine 27 — Deep learning : neurones, gradient, PyTorch tenseurs

> **Mois 7** · Compétences : Deep learning, Python

[← Mois 7](month-07.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 183](days/day-183.md)
- [Jour 184](days/day-184.md)
- [Jour 185](days/day-185.md)
- [Jour 186](days/day-186.md)
- [Jour 187](days/day-187.md)
- [Jour 188](days/day-188.md)
- [Jour 189](days/day-189.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Ouvrir la boîte noire : un réseau de neurones est une composition de fonctions simples optimisée par descente de gradient. Tu vas le VOIR en le codant petit.
- **Test pratique :** 75 min : implémente un neurone unique (poids, biais, sigmoïde) en NumPy pur et entraîne-le sur un ET logique par descente de gradient manuelle (boucle, loss, mise à jour). Trace la loss.
- **Test théorique :** Rôle du poids, du biais, de l'activation ; que mesure la loss ; que fait la descente de gradient (image de la vallée) ; qu'est-ce que le learning rate et ses deux pathologies ; pourquoi la non-linéarité est indispensable ?
- **Mini-projet :** Le même neurone puis un mini-MLP (1 couche cachée) en PyTorch sur des données jouets — en comparant ligne à ligne avec ta version NumPy.
- **Critères de passage :**
  - [ ] Neurone NumPy converge sur ET logique
  - [ ] MLP PyTorch converge
  - [ ] Explications théoriques justes
- **Exercice d'architecture :** Pourquoi entraîne-t-on sur GPU ? Quelles opérations d'un réseau se parallélisent bien ? Réponse en 10 lignes avec le vocabulaire juste (matrices, batchs).
