# Correction — Jour 192 : Attention

[← Retour au jour 192](../days/day-192.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le mini-calcul vaut mille lectures : scores par produits scalaires, softmax pour normaliser, mélange des valeurs. La compréhension se teste par la PRÉDICTION : avant de recalculer avec une autre requête, devine vers qui bascule l'écoute.

## ⚠️ Erreurs probables et points à vérifier
- Confondre les rôles : la VALEUR est ce qui est transmis, pas ce qui décide (c'est Q·K qui décide).
- Oublier le softmax et mélanger avec des scores bruts (poids non normalisés).
- Réciter « queries keys values » sans savoir refaire le calcul 3×2.

## 🔍 Comment vérifier ta solution
- Ton calcul manuel : les poids somment à 1.
- Ta prédiction avant le recalcul (variante) était correcte.
- Tu sais dire pourquoi 3 projections distinctes plutôt qu'une seule.

## 🎤 À savoir expliquer à l'oral
L'analogie de la réunion + le mini-exemple chiffré + la phrase « coût quadratique → fenêtre bornée → RAG » : trois éléments, une réponse d'entretien complète en 90 secondes.
