# Correction — Jour 177 : Projet 5 — Premiers modèles

[← Retour au jour 177](../days/day-177.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : entraîner deux modèles et comparer leurs scores. Solution améliorée : évaluer chaque modèle sur le MÊME protocole (Pipeline identique, même CV, même métrique), rapporter moyenne ± écart-type, tenir un journal d'expériences traçant chaque essai, commencer par la logistique et ne complexifier qu'en prouvant un gain, et gérer le déséquilibre (class_weight) en regardant la métrique métier. La preuve : une comparaison équitable, tracée et reproductible, pas des impressions.

## ⚠️ Erreurs probables et points à vérifier
- Comparer des modèles sur des splits/préprocessing différents : comparaison non équitable, conclusions fausses.
- Ne pas tenir de journal : on oublie les essais, on les répète, on se raconte des histoires.
- Choisir sur un seul split : un modèle peut sembler meilleur par chance — utiliser la CV avec écart-type.
- Se fier à l'AUC seule sur un problème déséquilibré : regarder aussi la métrique métier (rappel@top-N).

## 🔍 Comment vérifier ta solution
- Tous les modèles sont évalués sur le même protocole (Pipeline, CV, métrique).
- Les scores sont rapportés en moyenne ± écart-type.
- Un journal trace chaque essai (modèle, réglages, score).
- La démarche commence simple (logistique) et ne complexifie qu'en le prouvant.
- Le déséquilibre est géré et la métrique métier est regardée.

## 🎤 À savoir expliquer à l'oral
Insiste sur le protocole IDENTIQUE (seul le modèle change) et la CV (moyenne ± écart-type, pas un split). Décris le journal comme un cahier de laboratoire qui empêche de se mentir. Ajoute « commencer simple, ne complexifier qu'en le prouvant » et « la métrique métier tranche, pas l'AUC ». La rigueur du protocole, pas l'algorithme à la mode, est ce qui montre ta maturité de praticien.
