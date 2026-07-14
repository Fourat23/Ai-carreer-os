# Correction — Jour 187 : Entraînement sur données réelles

[← Retour au jour 187](../days/day-187.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
L'architecture minimale (784→128→10) suffit largement pour 95 %+ : le POINT du jour est la boucle propre et l'évaluation honnête, pas la performance. La précision se calcule sur des données jamais vues, en mode eval, sans gradient.

## ⚠️ Erreurs probables et points à vérifier
- Évaluer en mode train (ou sans no_grad) : chiffres faussés et mémoire gaspillée.
- shuffle=False sur le train : les batchs ordonnés biaisent l'apprentissage.
- Mesurer l'accuracy sur le train et s'émerveiller (mémorisation, pas généralisation).

## 🔍 Comment vérifier ta solution
- val_acc > 0.95 avant 10 epochs.
- Les deux courbes (train/val) sont tracées et cohérentes.
- model.eval() + no_grad() encadrent bien toute évaluation.

## 🎤 À savoir expliquer à l'oral
Déroule la boucle d'entraînement de mémoire (les 5 gestes × batchs × epochs) et explique pourquoi l'évaluation exige un jeu à part — en une minute, tableau blanc.
