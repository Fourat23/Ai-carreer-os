# Correction — Jour 318 : DocSense : dashboard qualité

[← Retour au jour 318](../days/day-318.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : afficher les scores actuels. Solution améliorée : afficher la TENDANCE par version (courbes dans le temps, à partir des rapports versionnés du jour 317), décomposer par dimension et type (révéler les régressions locales), inclure coût/latence, et annoter chaque version par son changement. La tendance (monte/descend, sans ambiguïté) prime sur la valeur absolue (score isolé ambigu) ; le dashboard raconte l'histoire du progrès.

## ⚠️ Erreurs probables et points à vérifier
- Afficher un score absolu isolé : 0,85 est difficile à juger — la tendance (montée/descente) est sans ambiguïté et guide vraiment.
- Un dashboard global seul : il cache les régressions locales par type — décomposer (le principe du jour 256).
- Oublier coût/latence : une amélioration de qualité qui explose la latence n'est pas un progrès net — les afficher aussi.
- Pas d'annotation des versions : sans relier chaque saut au changement qui l'a causé, le dashboard ne raconte pas d'histoire.

## 🔍 Comment vérifier ta solution
- Le dashboard affiche la tendance par version (courbes dans le temps).
- Les métriques sont décomposées par dimension et par type.
- Coût et latence par version sont visibles.
- Chaque version est annotée par le changement qui l'a causée (variante).
- Le dashboard raconte une histoire de progrès lisible.

## 🎤 À savoir expliquer à l'oral
Explique pourquoi la tendance prime : « un score de 0,85 est difficile à juger dans l'absolu ; mais 0,81 → 0,85 → 0,88 sur trois versions dit sans ambiguïté que ça s'améliore ». Puis la valeur communication : « une courbe montante convainc un manager ou un recruteur instantanément, là où un chiffre isolé demande un contexte ». Piloter par la tendance est un réflexe d'évaluation mûr.
