# Correction — Jour 164 : Random forests

[← Retour au jour 164](../days/day-164.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : entraîner une RandomForestClassifier et regarder le score. Solution améliorée : comparer explicitement à un arbre unique (stabilité + performance), expliquer POURQUOI ça marche (bagging + hasard sur les features → arbres décorrélés → vote qui annule les erreurs = sagesse des foules), lire la feature importance en la nuançant (biais, préférer la permutation importance), et assumer le compromis interprétabilité. La preuve : la forêt bat et stabilise l'arbre unique, et le mécanisme est expliqué.

## ⚠️ Erreurs probables et points à vérifier
- Utiliser une forêt sans comprendre le bagging/hasard des features : on ne sait pas pourquoi elle est robuste.
- Interpréter la feature importance comme une vérité causale : elle est biaisée (features à nombreuses modalités) — préférer la permutation importance.
- Empiler des arbres (n_estimators énorme) au-delà du plateau : coût de calcul sans gain.
- Choisir une forêt quand l'interprétabilité de chaque décision est exigée (domaine réglementé) : préférer un modèle explicable.

## 🔍 Comment vérifier ta solution
- La forêt est comparée à un arbre unique (performance et stabilité).
- Le mécanisme (bagging + hasard sur les features + vote) est compris.
- La feature importance est lue avec les nuances d'usage.
- Le compromis interprétabilité est assumé.
- L'effet du nombre d'arbres (plateau de variance) est compris.

## 🎤 À savoir expliquer à l'oral
Explique la sagesse des foules : « des arbres divers (échantillons + features au hasard) se trompent différemment, le vote annule leurs erreurs ». Oppose à l'arbre unique (instable, surapprend). Nuance la feature importance (biaisée, préférer permutation) et assume le compromis interprétabilité. Savoir dire « excellent par défaut sur tabulaire, mais boîte plus noire qu'un arbre » montre un vrai jugement de sélection de modèle.
