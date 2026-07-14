# Correction — Jour 258 : Évaluer l'évaluateur

[← Retour au jour 258](../days/day-258.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Valider le juge = mesurer son accord avec l'humain par une métrique CORRIGÉE du hasard (kappa, pas accord brut), disséquer les désaccords pour trouver les biais systématiques, corriger le prompt du juge, revalider. Le plafond est l'accord humain-humain. Un juge non validé fait optimiser vers ses erreurs — la validation rend toutes les autres mesures crédibles.

## ⚠️ Erreurs probables et points à vérifier
- Se fier à l'accord brut : sur des classes déséquilibrées (90 % « fidèle »), un juge trivial obtient 90 % sans rien mesurer — kappa obligatoire.
- Analyser les désaccords cas par cas sans chercher le PATTERN : 3 désaccords sur des réponses longues = un biais systématique corrigeable, pas 3 anomalies.
- Exiger du juge un accord parfait : deux humains divergent aussi — l'accord humain-humain est le plafond réaliste.
- Valider une fois et oublier : le modèle du juge dérive, son prompt évolue — la revalidation est déclenchée par tout changement (jour 209).

## 🔍 Comment vérifier ta solution
- 15-20 cas humains de référence, incluant des cas limites (longueur, nuances).
- Kappa calculé (pas seulement l'accord brut) et interprété contre les seuils (0,6 / 0,8).
- Les désaccords sont analysés pour un pattern systématique, et une correction du prompt est faite + revalidée.
- L'accord humain-humain est mesuré sur un sous-échantillon comme plafond de référence.
- Le protocole de validation est écrit et rejouable.

## 🎤 À savoir expliquer à l'oral
Raconte la révélation du kappa : « accord brut 0,80, kappa 0,58 — l'accord brut flattait un juge à peine meilleur que le hasard sur les cas qui comptent ; le kappa l'a démasqué, les désaccords pointaient un biais de longueur, prompt durci, kappa 0,71 ». Puis la phrase méta : « un évaluateur non validé fait optimiser vers ses erreurs ». Rigueur récursive = signal senior.
