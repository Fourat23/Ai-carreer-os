# Correction — Jour 172 : Clustering (k-means)

[← Retour au jour 172](../days/day-172.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : lancer k-means et regarder les clusters. Solution améliorée : NORMALISER d'abord (k-means = distance), choisir k avec le coude (inertie) ET la silhouette en gardant le jugement métier, puis surtout CARACTÉRISER chaque cluster (moyennes des features par groupe) et lui donner un sens métier actionnable — le vrai livrable. La preuve : des clusters interprétés en segments métier, pas des groupes anonymes, et une normalisation qui change le résultat.

## ⚠️ Erreurs probables et points à vérifier
- Oublier de normaliser : la feature à grande échelle domine, les clusters ne reflètent qu'elle.
- Choisir k au hasard : utiliser le coude et la silhouette (et le sens métier), pas une valeur arbitraire.
- Livrer des clusters anonymes non interprétés : sans caractérisation métier, le clustering ne sert à rien.
- Attendre une 'accuracy' : il n'y a pas de vérité terrain — on juge par la cohérence et l'utilité métier.

## 🔍 Comment vérifier ta solution
- Les données sont normalisées avant k-means.
- k est choisi avec le coude ET la silhouette (et le jugement métier).
- Chaque cluster est caractérisé par les moyennes de ses features.
- Un sens métier actionnable est donné à chaque segment.
- L'effet de la normalisation sur les clusters est compris.

## 🎤 À savoir expliquer à l'oral
Insiste sur les trois piliers : normaliser (distance), choisir k (coude + silhouette + métier), et INTERPRÉTER (le vrai livrable). Explique qu'il n'y a pas de vérité terrain, donc pas d'accuracy — la valeur vient du sens métier des segments. Montrer qu'un clustering non normalisé se découpe selon la plus grande échelle prouve que tu comprends le rôle de la distance.
