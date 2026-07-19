# Correction — Jour 334 : DocSense : rapport qualité v1.0

[← Retour au jour 334](../days/day-334.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : lister les scores finaux. Solution améliorée : la trajectoire chiffrée baseline → v1.0 sur toutes les dimensions (avec les arbitrages assumés), les 3 améliorations les plus RENTABLES documentées (gain/effort, avec problème/changement/effet), et la méthode reproductible rappelée (chaque chiffre refaisable). Le rapport transforme le travail de qualité en preuve démontrable — « +0,10, voici le tableau » vs « c'est mieux ».

## ⚠️ Erreurs probables et points à vérifier
- Dire « c'est mieux » sans chiffres : une impression ne prouve rien — la trajectoire chiffrée, si.
- Rapport unidimensionnel (exactitude seule) : cacher les arbitrages (latence, coût) rend le rapport suspect — montrer toutes les dimensions.
- Chiffres non reproductibles (golden non versionné, juge non validé) : le lecteur ne peut pas refaire, le rapport ne prouve rien.
- Confondre amélioration impressionnante et rentable : le gain/effort compte — un prompt bien tourné bat parfois un reranking complexe.

## 🔍 Comment vérifier ta solution
- La trajectoire baseline → v1.0 couvre toutes les dimensions (qualité par type, latence, coût).
- Les 3 améliorations les plus rentables sont documentées (problème/changement/effet).
- La méthode reproductible est rappelée (golden versionné, juge validé).
- Les arbitrages (ex. latence du reranking) sont assumés.
- Toutes les améliorations sont classées par rentabilité (variante).

## 🎤 À savoir expliquer à l'oral
Raconte le rapport comme une preuve de valeur : « baseline 0,82, v1.0 0,92, +10 points ; les 3 améliorations les plus rentables sont X, Y, Z — et le prompt de synthèse, effort faible, a plus payé que le reranking ; tout est reproductible sur mon golden set ». Prouver ET communiquer l'amélioration par les chiffres est la compétence complète qui distingue un ingénieur IA.
