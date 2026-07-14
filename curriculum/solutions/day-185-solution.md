# Correction — Jour 185 : PyTorch : tenseurs et autograd

[← Retour au jour 185](../days/day-185.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La traduction réussie prouve l'équivalence : mêmes données + même seed → mêmes prédictions finales que la version NumPy. w.grad à l'itération 1 doit égaler ton calcul manuel (à la précision près) — c'est LA vérification qui ancre.

## ⚠️ Erreurs probables et points à vérifier
- Oublier zero_grad() : les gradients s'ACCUMULENT silencieusement, l'entraînement devient chaotique — provoque-le une fois pour le reconnaître.
- Mettre à jour les poids hors de no_grad() : PyTorch enregistre la mise à jour dans le graphe → erreur ou fuite mémoire.
- Comparer NumPy et PyTorch avec des seeds différentes et s'étonner de l'écart.

## 🔍 Comment vérifier ta solution
- w.grad (itération 1) ≈ ton gradient manuel d'hier.
- Prédictions finales ≈ [0, .05, .05, .9].
- La variante avec optim.SGD donne le même résultat que la boucle manuelle.

## 🎤 À savoir expliquer à l'oral
Explique la boucle canonique en 5 gestes et POURQUOI zero_grad existe (l'accumulation par défaut sert aux gros batchs fractionnés — mais piège les débutants).
