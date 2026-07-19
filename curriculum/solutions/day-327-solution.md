# Correction — Jour 327 : DocSense : tests du workflow LLM

[← Retour au jour 327](../days/day-327.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : appeler le vrai LLM dans les tests (mauvais : non déterministe, coûteux, lent). Solution améliorée : injecter un double de test — mock (réponse programmée, pour la logique et les cas d'erreur difficiles à provoquer) ou replay (vraies réponses enregistrées, pour le réalisme gratuit) — et tester la LOGIQUE autour de l'appel (workflow, parsing, erreurs), pas la qualité des réponses (évaluation séparée). Distinguer tester-le-code et évaluer-le-modèle est la clé.

## ⚠️ Erreurs probables et points à vérifier
- Appeler le vrai LLM dans les tests : non déterministe (tests flaky), coûteux, lent — mocker/rejouer.
- Confondre tester le code et évaluer le modèle : le mock teste la logique, le harnais évalue la qualité — deux problèmes séparés.
- Ne mocker que le cas nominal : le mock brille sur les cas d'erreur (JSON invalide, timeout) difficiles à provoquer avec le vrai LLM — les tester.
- Croire que le code LLM est intestable : idée reçue fausse — l'injection de dépendance le rend aussi testable que tout code.

## 🔍 Comment vérifier ta solution
- Les appels LLM sont mockés/rejoués dans les tests (pas de vrais appels).
- Le workflow d'analyse est testé (enchaînement des étapes).
- Les cas d'erreur (JSON invalide, timeout, refus) sont testés via mock.
- La distinction tester-le-code / évaluer-le-modèle est claire.
- Un cas d'erreur difficile à provoquer avec le vrai LLM est testé via mock (variante).

## 🎤 À savoir expliquer à l'oral
Casse l'idée reçue : « on-ne-peut-pas-tester-le-code-LLM est faux — je mocke l'appel pour tester la logique et les cas d'erreur, je rejoue de vraies réponses pour le réalisme, et j'évalue la qualité séparément avec mon harnais ». Puis la distinction clé : « tester le CODE vs évaluer le MODÈLE, deux problèmes différents ». Cette compétence de test IA distingue nettement en entretien.
