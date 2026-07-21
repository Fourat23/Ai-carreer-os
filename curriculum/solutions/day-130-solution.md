# Correction — Jour 130 : pandas : grouper et agréger

[← Retour au jour 130](../days/day-130.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : `df.groupby(cle)[col].sum()`. Solution améliorée : penser split-apply-combine, faire plusieurs agrégations en une passe avec `.agg({...})` (somme, moyenne, nunique), grouper par plusieurs clés pour croiser des dimensions, réaplatir avec `reset_index()`, et savoir choisir groupby vs pivot_table vs agrégation globale. La preuve : les agrégations reproduisent le GROUP BY SQL en une ligne vectorisée, et le tableau comparatif montre le même raisonnement en JS/SQL/pandas.

## ⚠️ Erreurs probables et points à vérifier
- Boucler sur les catégories puis les lignes au lieu de groupby : long, lent, sujet aux erreurs d'accumulation.
- Faire plusieurs passes pour plusieurs statistiques au lieu d'un seul `.agg({...})`.
- Oublier `reset_index()` et se retrouver bloqué avec un index de groupe pour la suite.
- Confondre groupby (résumé par groupe) et pivot_table (croisement en tableau) : contorsions inutiles.

## 🔍 Comment vérifier ta solution
- L'agrégation utilise groupby (split-apply-combine), pas de boucle.
- Les agrégations multiples sont faites en une passe avec `.agg`.
- Le groupement par plusieurs clés croise correctement les dimensions.
- `reset_index()` aplatit le résultat quand nécessaire.
- Le tableau comparatif JS/SQL/pandas est correct et éclairant.

## 🎤 À savoir expliquer à l'oral
Déroule split-apply-combine en nommant chaque étape, et donne la forme multi-agrégation (`.agg({...})`). Relie explicitement au `GROUP BY` SQL et au `reduce` JS pour montrer que c'est le même raisonnement d'agrégation. « Toute question métier par X est un groupby sur X » est la formule qui prouve que tu relies l'outil au besoin analytique.
