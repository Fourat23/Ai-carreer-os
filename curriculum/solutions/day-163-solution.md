# Correction — Jour 163 : Arbres de décision

[← Retour au jour 163](../days/day-163.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : entraîner un arbre et regarder le score. Solution améliorée : contraindre la profondeur, VISUALISER les splits pour l'interprétabilité, DÉMONTRER le surapprentissage en comparant un arbre profond (train ≈ 1, test bas) à un arbre limité (train ≈ test), et tracer score train/test vs profondeur pour trouver le compromis. La preuve : identifier la profondeur qui maximise le test (pas le train) et expliquer l'instabilité d'un arbre unique.

## ⚠️ Erreurs probables et points à vérifier
- Laisser l'arbre sans limite de profondeur : il mémorise les données d'entraînement (surapprentissage).
- Juger un arbre sur son score de TRAIN : un arbre profond y atteint presque 100 % sans généraliser.
- Oublier que l'arbre est instable : de petits changements de données changent beaucoup l'arbre.
- Ne pas visualiser l'arbre : on perd son principal atout (l'interprétabilité) et la compréhension des splits.

## 🔍 Comment vérifier ta solution
- L'arbre est entraîné avec une profondeur contrôlée.
- Les splits sont visualisés et interprétés.
- Le surapprentissage est démontré (écart train/test sur un arbre profond).
- La profondeur optimale est cherchée sur le score de TEST.
- L'instabilité d'un arbre unique est comprise (motive les forêts).

## 🎤 À savoir expliquer à l'oral
Décris l'arbre comme une suite de questions oui/non qui homogénéisent les groupes (réduction d'impureté), lisible comme un organigramme. Explique le surapprentissage (mémorise si trop profond, écart train/test) et la profondeur comme curseur biais/variance. Ajoute l'instabilité d'un arbre seul qui motive les forêts. Montrer la courbe train/test vs profondeur prouve que tu comprends le compromis, pas juste l'API.
