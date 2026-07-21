# Correction — Jour 176 : Projet 5 — ChurnScope : EDA et baseline

[← Retour au jour 176](../days/day-176.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : regarder les données et entraîner un premier modèle. Solution améliorée : mener une EDA orientée métier (distribution de la cible/déséquilibre, qualité, corrélations, chasse aux FUITES), confirmer le cadrage, faire un split STRATIFIÉ en réservant un test intouché, et établir une baseline honnête sur la métrique métier (pas l'accuracy). La preuve : les pièges (fuite, déséquilibre) sont identifiés et une baseline donne le seuil à battre avant toute modélisation.

## ⚠️ Erreurs probables et points à vérifier
- Sauter l'EDA : on rate une fuite, un déséquilibre extrême ou des features inutilisables qui invalideront tout.
- Établir une baseline sur l'accuracy : trompeuse sur du churn déséquilibré — utiliser la métrique métier.
- Split non stratifié sur une cible rare : trop peu de positifs dans le test, évaluation instable.
- Toucher au jeu de test pendant l'exploration : il doit rester intouché jusqu'à l'évaluation finale.

## 🔍 Comment vérifier ta solution
- La distribution de la cible et le déséquilibre sont analysés.
- Les fuites potentielles sont chassées (features suspectes/calculées après l'événement).
- Le split réserve un test intouché et est stratifié sur la cible.
- Une baseline honnête est établie sur la métrique métier.
- Le premier livrable est le socle EDA + baseline, pas un modèle.

## 🎤 À savoir expliquer à l'oral
Explique que le premier livrable est EDA + baseline, pas un modèle : l'EDA révèle les pièges (fuite, déséquilibre), la baseline donne le seuil à battre (« AUC 0,72 ne veut rien dire sans savoir que la baseline est à 0,50 »). Mentionne la stratification sur une cible rare et le test intouché. Cette rigueur de départ prouve que tu as compris le problème avant d'investir dans la modélisation.
