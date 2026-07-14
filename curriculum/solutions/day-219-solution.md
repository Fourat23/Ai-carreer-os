# Correction — Jour 219 : RAG : recherche par similarité

[← Retour au jour 219](../days/day-219.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La recherche exacte tient en trois morceaux : cosinus correct (testé sur les cas triviaux), matrice pré-normalisée pour vectoriser, tri top-k avec scores conservés. L'exactitude d'abord, la performance est déjà là (NumPy), l'échelle plus tard (et tu as chiffré QUAND).

## ⚠️ Erreurs probables et points à vérifier
- Oublier de normaliser (ou normaliser deux fois) : les scores changent d'échelle et les comparaisons deviennent fausses — testez cos(v, v) == 1.
- Boucle Python sur les chunks au lieu du produit matriciel : ×100-1000 plus lent, et tu masques la beauté de l'opération.
- Ignorer les scores et ne garder que les rangs : un top-1 à 0.4 est une alerte que le rang seul cache.
- Re-embedder les chunks à chaque requête au lieu de charger l'index : coût et latence absurdes.

## 🔍 Comment vérifier ta solution
- Les 3 tests unitaires du cosinus passent (1, -1, 0).
- Sur tes 10 questions types : le chunk attendu est-il dans le top-3 ? Note le score de chaque top-1.
- Latence mesurée et notée (et ton seuil d'échelle extrapolé).
- Une question absurde (hors corpus) → top-1 avec score FAIBLE : constaté et noté.

## 🎤 À savoir expliquer à l'oral
Écris la formule du cosinus au tableau et explique la normalisation en une phrase (« seule la direction porte le sens »). Puis le positionnement : « exhaustif exact jusqu'à ~100k chunks, ANN au-delà — j'ai les deux chiffres ». Précis, chiffré, imparable.
