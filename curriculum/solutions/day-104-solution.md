# Correction — Jour 104 : Consolidation front + préparation Projet 3

[← Retour au jour 104](../days/day-104.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : une liste d'écrans et de composants. Solution améliorée : trois artefacts articulés — un arbre de composants avec les réutilisables identifiés, un plan d'état qui place chaque donnée (plus petit ancêtre commun, props/Context justifiés, état dérivé repéré) et décrit sa circulation, et un backlog d'incréments livrables ordonnés. Le critère de réussite : le codage des jours 113-118 devient de la simple exécution, sans décision structurante restante.

## ⚠️ Erreurs probables et points à vérifier
- Sauter le cadrage pour « coder plus vite » : les décisions d'état mal placées se paient en refactors à mi-parcours.
- Un plan d'état flou (« on verra où mettre ça ») : props drilling et doublons de state garantis.
- Un backlog par couches horizontales (tout le CSS, puis toute la logique) : effet tunnel, rien de démontrable avant la fin — découpe en incréments verticaux.
- Une décomposition trop plate sans composants réutilisables : on n'a pas vraiment pensé en briques.

## 🔍 Comment vérifier ta solution
- L'arbre de composants couvre chaque route et identifie les réutilisables.
- Le plan d'état place chaque donnée (lieu + circulation + Context justifié).
- L'état dérivé est distingué de l'état stocké (pas de doublon).
- Le backlog est fait d'incréments livrables et ordonnés.
- Chaque incrément produit quelque chose de démontrable (découpage vertical).

## 🎤 À savoir expliquer à l'oral
Explique le principe : « je décide l'architecture sur papier — arbre, état, backlog — parce que c'est dix fois moins cher que de la découvrir dans le code ». Donne le critère de réussite : « un bon cadrage rend le codage ennuyeux ». Décrire ces trois artefacts en réponse à « comment démarres-tu ? » signale que tu conçois une application, pas que tu empiles des features.
