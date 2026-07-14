# Correction — Jour 194 : Classification de texte

[← Retour au jour 194](../days/day-194.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La réussite du jour n'est pas le score brut mais la MÉTHODE recyclée : split stratifié, baseline comparée, métriques par classe, erreurs regardées une à une. Les embeddings ne dispensent d'aucune honnêteté du mois 6.

## ⚠️ Erreurs probables et points à vérifier
- Ré-embedder à chaque exécution (lent et coûteux) : cache-les dès le premier calcul.
- Accuracy globale sur classes déséquilibrées (le F1 par classe dit la vérité).
- Oublier la baseline TF-IDF : sans comparaison, impossible de justifier les embeddings.

## 🔍 Comment vérifier ta solution
- F1 par classe ≥ baseline TF-IDF (ou l'écart expliqué).
- 5 erreurs de classification lues et commentées.
- Les embeddings sont chargés depuis le cache au 2e run (instantané).

## 🎤 À savoir expliquer à l'oral
Le pattern « embeddings + tête légère » en 60 secondes : pourquoi ça marche (représentations pré-apprises), quand ça suffit (peu de données, catégories claires), quand passer au cran supérieur.
