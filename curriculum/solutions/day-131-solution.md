# Correction — Jour 131 : pandas : joindre (merge)

[← Retour au jour 131](../days/day-131.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : `pd.merge(a, b, on=cle)`. Solution améliorée : nettoyer et aligner les types de la clé des deux côtés, choisir le type de jointure selon le sort voulu des non-correspondances (left pour préserver la référence, inner/outer selon le besoin), protéger la cardinalité avec `validate`, et VALIDER le résultat en comparant le nombre de lignes avant/après et en comptant les non-correspondances. La preuve : le merge ne perd ni ne duplique de lignes par surprise, et les cas sans correspondance sont quantifiés.

## ⚠️ Erreurs probables et points à vérifier
- `inner` par défaut qui perd silencieusement les lignes sans correspondance : choisir `left`/`outer` selon le besoin.
- Clé non unique côté droit sans `validate` : duplication one-to-many, nombre de lignes qui explose.
- Clé de types différents (int vs str) : zéro correspondance malgré des valeurs identiques à l'œil.
- Ne pas comparer `len` avant/après : les pertes et duplications passent inaperçues.

## 🔍 Comment vérifier ta solution
- La clé est propre et de même type des deux côtés.
- Le type de jointure est choisi selon le sort voulu des non-correspondances.
- `validate` protège la cardinalité attendue.
- Le nombre de lignes avant/après est comparé et cohérent.
- Les lignes sans correspondance sont quantifiées et investiguées.

## 🎤 À savoir expliquer à l'oral
Insiste sur le caractère SILENCIEUX des deux pièges : perte (inner) et duplication (one-to-many). Explique le choix left/inner/outer selon les non-correspondances, le garde-fou `validate`, et la vérification systématique du nombre de lignes. « La vérification est le travail » résume pourquoi un merge facile à écrire est facile à rater — et prouve ta rigueur data.
