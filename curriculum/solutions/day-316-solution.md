# Correction — Jour 316 : DocSense : golden set

[← Retour au jour 316](../days/day-316.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : écrire 40 questions sur le corpus. Solution améliorée : les dériver des cas d'usage de la SPEC (représentativité selon l'usage visé), les ancrer dans le corpus RÉEL avec vérité-terrain exploitable (doc + passage), inclure les cas difficiles et les hors corpus (refus attendu), et versionner/figer. La qualité du golden set plafonne toute l'évaluation ; il mesure ce que DocSense PROMET, pas des questions génériques.

## ⚠️ Erreurs probables et points à vérifier
- Golden set sur corpus jouet ou générique : il ne mesure pas la vraie qualité perçue — ancrer dans le corpus réel.
- Questions tirées des documents (mémorisation) : elles testent la récupération d'un passage, pas l'usage réel — partir des cas d'usage.
- Pas de vérité-terrain avec passage exact : les métriques de retrieval redeviennent manuelles — poser doc + passage.
- Oublier les hors corpus : le refus est un comportement à mesurer ; un golden set sans hors-corpus ne teste pas la fiabilité.

## 🔍 Comment vérifier ta solution
- 40+ questions ancrées dans le corpus réel DocSense.
- Distribution dérivée des cas d'usage de la SPEC (pondérée selon l'usage).
- Chaque question a une vérité-terrain (doc + passage exact).
- Les cas difficiles et hors corpus (refus attendu) sont présents.
- Le golden set est versionné et figé.

## 🎤 À savoir expliquer à l'oral
Explique la continuité SPEC → golden set : « mes 40 questions viennent des cas d'usage de ma SPEC, sur mon corpus réel, avec vérité-terrain — donc je mesure ce que DocSense PROMET, pas des questions génériques ». Puis : « il est figé, il ne sert jamais à développer ». Un golden set dérivé des cas d'usage réels est la preuve d'une évaluation sérieuse.
