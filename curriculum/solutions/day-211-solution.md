# Correction — Jour 211 : Prompts en production

[← Retour au jour 211](../days/day-211.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le système tient en trois pièces : les prompts en fichiers (versionnés), les cas de test à côté (le contrat), le runner qui produit un taux (la mesure). L'amélioration devient une boucle mesurée : score avant → changement → score après → garde ou revert.

## ⚠️ Erreurs probables et points à vérifier
- Des cas de test tous faciles : le taux affiche 100 % et ne détecte rien — il faut les cas limites du jour 204 (vide, hostile, ambigu).
- Valider le généré à l'œil au lieu de critères écrits : la mesure devient une opinion.
- Modifier prompt ET cas de test en même temps : tu ne sais plus ce que tu mesures.
- Oublier temp 0 dans le runner : le taux fluctue d'un run à l'autre sans changement.

## 🔍 Comment vérifier ta solution
- ≥ 2 prompts sous gestion, chacun ≥ 10 cas dont 3 limites.
- Le runner affiche un taux par prompt en une commande.
- Le test de sabotage (retirer les exemples) fait chuter le score — détection prouvée.
- Le CHANGELOG contient au moins une entrée avec scores avant/après.

## 🎤 À savoir expliquer à l'oral
Raconte le scénario de l'incident évité : « sans versioning, une régression de prompt est invisible ; avec mon système, c'est un diff + deux scores + un revert ». Trente secondes, une histoire, la compétence est établie.
