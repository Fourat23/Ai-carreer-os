# Correction — Jour 242 : Versioning de l'index

[← Retour au jour 242](../days/day-242.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le versioning tient en trois preuves : le manifeste complet (on sait ce qu'est l'index), la reconstruction à l'identique (on peut le refaire), la migration blanche jouée avec rollback (on sait en changer sans danger). La règle d'invalidation (incrémental vs total) découle de la recette : tout ce qui change la recette change TOUS les vecteurs.

## ⚠️ Erreurs probables et points à vérifier
- Versionner l'index sans le hash du corpus : le manifeste dit « v3 » mais ne détecte pas un corpus modifié sous lui — le check de synchronisation est la moitié de la valeur.
- Reconstruire « sur place » dans la collection active : pendant la reconstruction, les requêtes tapent un index à moitié vide — toujours en parallèle puis bascule.
- Croire qu'un changement de paramètre de chunking est « mineur » : min_tk 80→120 change tous les chunks, donc tous les vecteurs — reconstruction totale.
- Garder dix versions d'index « au cas où » : deux suffisent (active + précédente pour rollback) ; au-delà, c'est du disque et de la confusion.

## 🔍 Comment vérifier ta solution
- Le manifeste existe pour l'index actif et contient les 4 ingrédients + le score de validation.
- rag build reconstruit un index identique (n_chunks égal, échantillon de vecteurs comparé).
- La migration blanche est jouée : bascule, rollback testé, journal écrit.
- Le check de désynchronisation corpus/manifeste détecte le document modifié en douce (variante).

## 🎤 À savoir expliquer à l'oral
Déroule la règle d'invalidation au tableau : les 4 ingrédients de la recette, une flèche « qui change quoi » (corpus → incrémental ; chunking/embedding/code → total). Puis la procédure de migration en 4 temps. C'est une question de system design RAG quasi certaine — et tu l'auras VÉCUE, pas apprise.
