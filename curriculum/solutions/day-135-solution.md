# Correction — Jour 135 : SQL avancé : index

[← Retour au jour 135](../days/day-135.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : ajouter un index sur la colonne filtrée. Solution améliorée : MESURER d'abord avec `EXPLAIN` (scan vs index), n'indexer que les colonnes réellement interrogées (WHERE/JOIN/ORDER BY), choisir l'ordre d'un index composite selon le filtre, REMESURER temps et plan pour prouver le gain, et assumer l'arbitrage lecture/écriture (ne pas sur-indexer). La preuve : le plan passe de SCAN à SEARCH USING INDEX et le temps chute, sans dégrader inutilement les écritures.

## ⚠️ Erreurs probables et points à vérifier
- Ajouter des index au hasard sans `EXPLAIN` : optimisation à l'aveugle, souvent sur la mauvaise colonne.
- Tout indexer « par sécurité » : écritures ralenties et espace gaspillé — chaque index a un coût.
- Index composite dans le mauvais ordre : inutile pour le filtre réel (l'ordre des colonnes compte).
- Ne pas remesurer après ajout : on ne prouve pas le gain ni que l'index est réellement utilisé.

## 🔍 Comment vérifier ta solution
- La requête lente est diagnostiquée avec `EXPLAIN` avant toute action.
- L'index porte sur une colonne réellement interrogée (WHERE/JOIN/ORDER BY).
- Le plan après montre l'utilisation de l'index (SEARCH, pas SCAN).
- Le gain est mesuré (temps avant/après).
- Le nombre d'index reste justifié (arbitrage lecture/écriture assumé).

## 🎤 À savoir expliquer à l'oral
Décris l'index comme un arbre trié (O(log n) vs O(n)) et déroule la démarche mesurée : `EXPLAIN` → index justifié → remesure. Insiste sur le COÛT (écritures + espace) qui interdit d'indexer par principe. Relier au « mesurer avant d'optimiser » du front (jour 102) montre que tu vois le principe général, pas une astuce SQL isolée.
