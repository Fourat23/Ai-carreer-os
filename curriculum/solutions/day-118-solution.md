# Correction — Jour 118 : Projet 3 — README, schéma, ADR, démo

[← Retour au jour 118](../days/day-118.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : un README qui décrit l'app et comment la lancer. Solution améliorée : un README qui commence par le problème et la valeur avec un GIF de démo, un schéma d'architecture 3-tiers (front ↔ API ↔ base, avec le parcours d'une requête), une ADR qui fige une VRAIE décision arbitrée de BiblioApp (Context vs local) avec options écartées et conséquences, et une démo de 2 min du parcours CRUD — le tout écrit pour un lecteur extérieur pressé et validé par le test du regard neuf.

## ⚠️ Erreurs probables et points à vérifier
- README qui commence par la stack (« React + Vite ») au lieu du problème et de la valeur : le lecteur ne sait pas pourquoi le projet existe.
- Pas de schéma d'architecture : sur un projet full-stack, on ne prouve pas qu'on comprend comment les couches collaborent.
- ADR qui ne liste que la décision sans les options écartées : sans l'arbitrage, elle ne prouve pas la pensée d'architecte.
- Démo hésitante ou absente : « ça marche sur ma machine » ne convainc pas — un parcours CRUD fluide de 2 min, oui.

## 🔍 Comment vérifier ta solution
- Le README commence par le problème/la valeur et inclut un GIF de démo.
- Un schéma 3-tiers montre front ↔ API ↔ base et le parcours d'une requête.
- L'ADR fige une vraie décision (Context vs local) avec options écartées et conséquences.
- La démo de 2 min déroule le parcours CRUD de façon fluide.
- Le test du regard neuf est passé : un inconnu comprend en 90 secondes.

## 🎤 À savoir expliquer à l'oral
Entraîne ta démo de 2 minutes jusqu'à la fluidité : problème → parcours CRUD vivant → schéma 3-tiers → décision arbitrée (ADR Context vs local). Insiste sur ce que le full-stack ajoute : le schéma prouve que tu comprends comment front, API et base collaborent. C'est LA présentation de projet que tu réutiliseras en entretien — répète-la chronomètre en main.
