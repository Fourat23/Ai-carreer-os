# Correction — Jour 108 : Mocks et tests d'intégration

[← Retour au jour 108](../days/day-108.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : mocker fetch/api et vérifier l'affichage. Solution améliorée : mocker uniquement la frontière externe (réseau, temps), couvrir succès + erreur + vide grâce au mock (cas impossibles à provoquer en vrai), écrire un test d'intégration qui laisse collaborer tout le code interne (formulaire → api → UI) et vérifie AUSSI les bonnes données envoyées, sans jamais mocker la logique testée. La preuve : un cas d'erreur 500 et un bug d'assemblage sont couverts.

## ⚠️ Erreurs probables et points à vérifier
- Sur-mocker jusqu'à mocker le code testé : le test ne vérifie plus que la config des mocks.
- Faire de vrais appels réseau dans les tests : lents, non déterministes, cas d'erreur intestables.
- Ne tester que le succès : les cas 500/timeout/vide, pourtant faciles à mocker, cassent en production.
- Oublier de vérifier les DONNÉES envoyées à l'api (toHaveBeenCalledWith) : on rate les bugs de format d'assemblage.

## 🔍 Comment vérifier ta solution
- Seule la frontière externe (réseau, temps) est mockée, pas la logique testée.
- Les cas succès, erreur et vide sont couverts via le mock.
- Un test d'intégration vérifie un flux complet (formulaire → api → UI).
- Les données envoyées à l'api sont vérifiées (bon format).
- Les tests restent rapides et déterministes.

## 🎤 À savoir expliquer à l'oral
Formule la règle : « mock ce que tu ne possèdes pas (réseau, temps), teste en vrai ce que tu possèdes ». Explique le grand intérêt du mock : rendre testables les cas d'erreur rares (500, timeout) impossibles à provoquer autrement. Oppose test unitaire (une unité) et intégration (l'assemblage). Citer l'anti-pattern du sur-mock montre que tu sais où placer la frontière.
