# Correction — Jour 188 : Régularisation et diagnostic

[← Retour au jour 188](../days/day-188.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La preuve de maîtrise est le TABLEAU comparatif : 4 runs, une variable d'écart chacun, val_acc finale + forme des courbes. L'overfitting doit être VISIBLE dans le témoin (sinon rien n'est démontré) avant d'être corrigé.

## ⚠️ Erreurs probables et points à vérifier
- Dropout actif à l'évaluation (model.eval() oublié) : les scores de val sous-estimés.
- Early stopping sur la loss TRAIN (contresens complet).
- Changer dropout ET capacité en même temps : effet indémêlable.

## 🔍 Comment vérifier ta solution
- Run A : écart train/val flagrant sur les courbes.
- Runs B/C/D : val_acc ≥ A avec écart réduit.
- Le tableau final tient sur un écran et se raconte en 90 secondes.

## 🎤 À savoir expliquer à l'oral
Dessine les courbes de l'overfitting (train qui plonge, val qui remonte, le point d'arrêt idéal) et récite les remèdes par ordre de coût. Question posée dans quasi tous les entretiens ML/DL.
