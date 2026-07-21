# Correction — Jour 179 : Projet 5 — Optimisation et validation

[← Retour au jour 179](../days/day-179.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : GridSearchCV et prendre la meilleure config. Solution améliorée : régler par recherche (grid/random) en validation croisée sur le dev set UNIQUEMENT, garder un test final vierge, évaluer la meilleure config UNE seule fois sur ce test et rapporter CE chiffre (pas le score de validation optimiste), rester sobre dans la recherche (regarder la stabilité), et n'optimiser qu'après le feature engineering. La preuve : le score rapporté vient d'un test jamais utilisé pour régler quoi que ce soit.

## ⚠️ Erreurs probables et points à vérifier
- Régler les hyperparamètres en regardant le test : il n'est plus une mesure honnête (leakage) — régler sur la CV.
- Rapporter le meilleur score de validation : il est optimiste par construction — rapporter le test final.
- Sur-optimiser (des centaines de configs) : on choisit la config chanceuse, le score de validation devient trompeur.
- Optimiser les hyperparamètres avant/au lieu du feature engineering : mauvaise priorité (les features rapportent plus).

## 🔍 Comment vérifier ta solution
- Le réglage se fait par recherche en validation croisée sur le dev set.
- Le jeu de test final reste vierge jusqu'à l'évaluation finale.
- Le test final n'est touché qu'une seule fois et c'est ce chiffre qui est rapporté.
- La recherche reste sobre (stabilité regardée, pas de sur-optimisation).
- L'optimisation vient APRÈS le feature engineering.

## 🎤 À savoir expliquer à l'oral
Distingue paramètres (appris) et hyperparamètres (fixés avant), et explique la recherche en CV. Martèle la séparation dev/test : « on règle sur la validation, on ne touche au test qu'une fois, et c'est ce chiffre qu'on rapporte — pas le score de validation, optimiste ». Ajoute la hiérarchie des gains (features d'abord). Rapporter le test final, pas le meilleur score de recherche, est le signe d'une évaluation honnête.
