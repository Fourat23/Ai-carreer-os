# Correction — Jour 137 : SQL avancé : requêtes analytiques

[← Retour au jour 137](../days/day-137.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : des SELECT avec GROUP BY et sous-requêtes. Solution améliorée : distinguer les questions « une valeur par groupe » (GROUP BY) des questions « chaque ligne reliée à son groupe » (window functions), utiliser `ROW_NUMBER/RANK` pour les classements, `SUM() OVER (ORDER BY)` pour les cumuls, `AVG() OVER (PARTITION BY)` pour les comparaisons intra-groupe, `LAG/LEAD` pour les évolutions, et des CTE pour rendre les requêtes complexes lisibles. La preuve : les 5 requêtes répondent en une passe lisible à des questions qu'un GROUP BY seul ne peut pas traiter.

## ⚠️ Erreurs probables et points à vérifier
- Utiliser GROUP BY là où il faut une window function : on perd les lignes qu'on voulait garder (rang, cumul impossibles).
- Auto-jointures compliquées pour un classement ou un cumul que `ROW_NUMBER`/`SUM() OVER` font en une ligne.
- Requête monolithique illisible au lieu de CTE nommées composant les étapes.
- Oublier l'`ORDER BY` dans une window de cumul : le running total n'a pas de sens sans ordre.

## 🔍 Comment vérifier ta solution
- Les questions « par groupe » utilisent GROUP BY, les questions « par ligne reliée au groupe » des window functions.
- Les classements utilisent ROW_NUMBER/RANK, les cumuls SUM() OVER (ORDER BY).
- Les comparaisons intra-groupe utilisent AVG/... OVER (PARTITION BY).
- Les requêtes complexes sont découpées en CTE lisibles.
- Les 5 requêtes analytiques sont correctes et commentées.

## 🎤 À savoir expliquer à l'oral
Pose la distinction clé : « GROUP BY réduit à une ligne par groupe ; une window function garde chaque ligne en la reliant à son groupe ». Illustre avec rang, cumul, comparaison à la moyenne du groupe. Mentionne les CTE pour la lisibilité. Savoir répondre à « rang de chaque vente dans son mois » avec une window function (pas une auto-jointure) est ce qui prouve ton niveau SQL analytique.
