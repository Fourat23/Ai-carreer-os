# Correction — Jour 254 : Évaluation du retrieval

[← Retour au jour 254](../days/day-254.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
L'évaluateur mesure le retrieval SEUL via rappel@k (la métrique plafond), précision@k (le gaspillage) et MRR (le rang, sensible au reranking). Il est VALIDÉ sur des cas connus avant d'être appliqué — un évaluateur non testé mesure ses propres bugs. La lecture par type localise les faiblesses.

## ⚠️ Erreurs probables et points à vérifier
- Confondre rappel@k et précision@k : le premier dit « le bon chunk est-il là », le second « les chunks remontés sont-ils bons » — en RAG le rappel prime, la précision surveille le coût.
- Croire l'évaluateur sans le valider : un chunk_contient_verite qui rate les quasi-recouvrements sous-estime le rappel — teste-le sur des cas connus D'ABORD.
- Ignorer MRR et ne regarder que rappel@k : tu deviens aveugle à l'effet du reranking (qui bouge les rangs, pas la présence).
- Double-compter un passage partagé par deux chunks (overlap) : la précision monte artificiellement — dédoublonne sur le passage de vérité.

## 🔍 Comment vérifier ta solution
- Les 4 cas de contrôle de l'évaluateur passent (rang 1, rang 3, hors corpus, overlap).
- Le tableau rappel@k / MRR / précision@k par type est produit.
- La courbe rappel@1/@3/@5/@10 est tracée et son plateau identifié.
- Une divergence rappel/MRR est repérée et interprétée (marge de reranking ou non).

## 🎤 À savoir expliquer à l'oral
Explique la hiérarchie des métriques : « rappel@k d'abord — c'est le plafond ; MRR ensuite — il voit les rangs et donc le reranking ; précision@k pour le gaspillage ». Puis LA règle de diagnostic : « rappel@k haut + mauvaises réponses = c'est la génération, pas le retrieval ». Cette phrase seule vaut la moitié d'un entretien RAG.
