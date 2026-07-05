# Correction / Grille — Jour 189 : Revue de la semaine 27

[← Retour au jour 189](../days/day-189.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Deep learning : neurones, gradient, PyTorch tenseurs**. Ouvrir la boîte noire : un réseau de neurones est une composition de fonctions simples optimisée par descente de gradient. Tu vas le VOIR en le codant petit.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 75 min : implémente un neurone unique (poids, biais, sigmoïde) en NumPy pur et entraîne-le sur un ET logique par descente de gradient manuelle (boucle, loss, mise à jour). Trace la loss.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Rôle du poids, du biais, de l'activation ; que mesure la loss ; que fait la descente de gradient (image de la vallée) ; qu'est-ce que le learning rate et ses deux pathologies ; pourquoi la non-linéarité est indispensable ?
- **Mini-projet / livrable** conforme : Le même neurone puis un mini-MLP (1 couche cachée) en PyTorch sur des données jouets — en comparant ligne à ligne avec ta version NumPy.
- **Exercice d'architecture** fait sérieusement : Pourquoi entraîne-t-on sur GPU ? Quelles opérations d'un réseau se parallélisent bien ? Réponse en 10 lignes avec le vocabulaire juste (matrices, batchs).

## 📋 Checklist de validation
- [ ] J'ai codé la descente de gradient à la main une fois
- [ ] Je lis une courbe de loss
- [ ] Tenseurs : shape, dtype, opérations de base
- [ ] Je relie chaque ligne PyTorch à sa version manuelle

## 🚦 Critères de passage à la semaine suivante
- [ ] Neurone NumPy converge sur ET logique
- [ ] MLP PyTorch converge
- [ ] Explications théoriques justes

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
