# Correction — Jour 158 : Métriques de régression

[← Retour au jour 158](../days/day-158.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : calculer MAE, RMSE, R² et les afficher. Solution améliorée : les interpréter (MAE = erreur réelle robuste, RMSE = sensible aux grosses erreurs, R² = variance expliquée relative), lire l'écart RMSE/MAE comme un indicateur de grosses erreurs, et JUSTIFIER laquelle est pertinente selon le coût métier des erreurs — en rapportant au moins une métrique en unités réelles. La preuve : le choix de métrique est argumenté par le contexte, pas par défaut.

## ⚠️ Erreurs probables et points à vérifier
- Rapporter R² seul : un R² flatteur peut cacher une erreur absolue inacceptable pour le métier.
- Ignorer l'écart RMSE/MAE : il révèle des grosses erreurs qu'une seule métrique masque.
- Choisir la métrique par défaut sans lien avec le coût des erreurs : on optimise peut-être la mauvaise chose.
- Confondre R² (relatif, sans unité) et une erreur en unités réelles : ils ne répondent pas à la même question.

## 🔍 Comment vérifier ta solution
- Les trois métriques sont calculées sur le test.
- MAE et RMSE sont interprétées en unités réelles.
- L'écart RMSE/MAE est lu comme indicateur de grosses erreurs.
- R² est lu relativement (vs prédire la moyenne).
- Le choix de la métrique principale est justifié par le coût métier.

## 🎤 À savoir expliquer à l'oral
Oppose les trois métriques par ce qu'elles DISENT : MAE (erreur réelle robuste), RMSE (punit les grosses erreurs), R² (variance expliquée, relatif). Donne la règle de choix (coût métier des erreurs) et le signal RMSE > MAE. Insiste : « une métrique est un choix, pas une vérité ; un R² de 0,9 peut cacher une MAE inacceptable ». Relier la métrique à la décision montre que tu communiques, pas seulement que tu calcules.
