# Correction — Jour 269 : Projet 6 — Amélioration 2 pilotée

[← Retour au jour 269](../days/day-269.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La deuxième amélioration attaque un chantier différent (2e faiblesse ou régression de la 1re), se compare aux DEUX références (baseline d'origine pour la trajectoire, post-amélioration-1 pour l'apport marginal), vérifie les interactions entre améliorations, et lit les rendements décroissants. Reconnaître le plateau et réallouer l'effort est une compétence de jugement au même titre que l'optimisation.

## ⚠️ Erreurs probables et points à vérifier
- Comparer seulement à la baseline d'origine : tu mesures l'effet cumulé, pas l'apport MARGINAL de la 2e amélioration — les deux références sont nécessaires.
- Ignorer les interactions : la 2e amélioration peut re-dégrader ce que la 1re avait gagné — la mesure multidimensionnelle sur les types concernés le vérifie.
- S'acharner malgré les rendements décroissants : quand la courbe s'aplatit, le gain suivant vient d'un AUTRE levier (corpus, modèle) — insister sur le même est du gaspillage.
- Oublier le coût dans la lecture du rendement : un gain égal pour un coût (latence) qui monte signale que le levier s'épuise — le rendement est gain/effort, pas gain seul.

## 🔍 Comment vérifier ta solution
- Le chantier de l'amélioration 2 est justifié par la baseline (2e faiblesse ou régression de l'amélioration 1).
- La comparaison est double (marginal vs post-amélioration-1, total vs baseline d'origine).
- Les interactions entre améliorations sont vérifiées (pas de re-dégradation).
- Les rendements (gain vs coût) sont lus et le plateau éventuel identifié.
- La trajectoire globale chiffrée est établie (baseline → amélioration 2).

## 🎤 À savoir expliquer à l'oral
Raconte la trajectoire ET le jugement : « deux améliorations, exactitude 0,81 → 0,87 ; mais je voyais le rendement du retrieval s'aplatir avec le coût qui montait — la 3e amélioration devrait venir du corpus, pas de plus de tuning ». Savoir dire « j'arrêterais d'optimiser ici et je réallouerais » est un signal de maturité stratégique que les leads recherchent.
