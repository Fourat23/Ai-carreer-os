# Correction — Jour 268 : Projet 6 — Amélioration 1 pilotée

[← Retour au jour 268](../days/day-268.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
L'amélioration pilotée suit : hypothèse écrite (issue de la baseline), UN changement isolé, comparaison MULTIDIMENSIONNELLE contre la baseline (la métrique visée ET toutes les autres), décision tracée et versionnée. Le cas central est l'amélioration qui gagne sur sa cible mais régresse ailleurs — la décision dépend de la distribution d'usage et s'assume explicitement.

## ⚠️ Erreurs probables et points à vérifier
- Changer plusieurs choses à la fois : gain inattribuable, régression cachée — un changement isolé par amélioration.
- Mesurer seulement la métrique visée : la régression est ailleurs (factuelles verbeuses quand on améliore les synthèses) — la comparaison doit être multidimensionnelle.
- Garder une amélioration parce que le score cible monte, sans regarder les régressions : c'est déplacer le problème, pas le résoudre.
- Jeter une hypothèse réfutée sans la documenter : une réfutation propre (« le prompt n'était pas le problème, c'est le chunking ») ré-oriente utilement — un bricolage qui marche sans explication ne s'améliore pas.

## 🔍 Comment vérifier ta solution
- L'hypothèse est écrite AVANT le changement, avec une prédiction chiffrée.
- Un seul changement isolé est appliqué.
- La comparaison est multidimensionnelle (métrique visée + toutes les autres + latence/coût).
- La décision (garder/jeter/nuancer) est explicite et fondée sur la distribution d'usage.
- L'amélioration et son rapport de comparaison sont versionnés.

## 🎤 À savoir expliquer à l'oral
Raconte une amélioration avec sa régression : « hypothèse : le prompt de synthèse gagnera ~0,20 ; résultat : +0,22 sur les synthèses MAIS −0,04 sur les factuelles ; gardée car les synthèses dominent l'usage, régression notée pour l'itération suivante ». Montrer qu'on voit ET qu'on assume les régressions est ce qui distingue l'ingénieur du bricoleur.
