# Correction — Jour 186 : MLP : perceptron multicouche

[← Retour au jour 186](../days/day-186.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le XOR tombe parce que la couche cachée offre un espace intermédiaire où recombiner les entrées. La preuve de compréhension n'est pas « ça marche » mais l'ABLATION : 1 neurone caché échoue, 8 réussissent, et tu sais expliquer l'écart.

## ⚠️ Erreurs probables et points à vérifier
- Oublier la ReLU entre les Linear : deux transformations linéaires composées = UNE linéaire → le XOR échoue encore.
- BCEWithLogitsLoss attend les logits BRUTS (pas de sigmoide avant la loss).
- y en shape [4] au lieu de [[4,1]] : broadcast silencieux et loss fantaisiste.

## 🔍 Comment vérifier ta solution
- Prédictions arrondies exactement [0,1,1,0].
- L'ablation (1 vs 8 neurones cachés) est faite et documentée.
- Retirer la ReLU fait échouer — vérifié.

## 🎤 À savoir expliquer à l'oral
Le récit XOR en 60 secondes : un neurone = frontière droite → échec ; une couche cachée = re-représentation → victoire ; et la phrase clé « le deep learning apprend des représentations, pas seulement des décisions ».
