# Correction — Jour 78 : Architecture 3-tiers et MVC : structurer une application

[← Retour au jour 78](../days/day-078.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le 3-tiers sépare présentation (UI), logique (métier), données (persistance). MVC organise la présentation. La valeur : chaque couche évolue et se teste indépendamment. Tu l'appliques depuis le mois 3.

## ⚠️ Erreurs probables et points à vérifier
- Logique métier dans la présentation ou la couche données.
- Frontières floues (tout communique avec tout).

## 🧩 Questions de réflexion
- Où placerais-tu une nouvelle règle métier ? Une nouvelle vue ? Un changement de base ?
