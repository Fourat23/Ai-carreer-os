# Correction — Jour 183 : Le neurone : de zéro en NumPy

[← Retour au jour 183](../days/day-183.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le neurone converge sur le ET parce que le problème est linéairement séparable : une droite peut isoler (1,1) des trois autres points. La loss décroissante est ta preuve d'apprentissage ; les prédictions finales proches de [0,0,0,1] ta preuve de convergence.

## ⚠️ Erreurs probables et points à vérifier
- Learning rate trop grand (0.5 → 50) : les prédictions oscillent, la loss diverge — observe-le exprès.
- Oublier la non-linéarité (retirer la sigmoïde) : le neurone devient une régression linéaire.
- Conclure du XOR que « le neurone est cassé » : c'est la LIMITE structurelle d'un neurone seul, la raison d'être des couches.

## 🔍 Comment vérifier ta solution
- Prédictions finales : [~0, ~0.05, ~0.05, ~0.9].
- La courbe de loss décroît de façon monotone (trace-la).
- Le XOR échoue quel que soit le nombre d'epochs — et tu sais dire pourquoi.

## 🎤 À savoir expliquer à l'oral
Dessine un neurone (entrées → poids → somme+biais → activation → sortie) en 30 secondes et raconte le calcul sur UN exemple chiffré. C'est le schéma le plus rentable de tout le mois.
