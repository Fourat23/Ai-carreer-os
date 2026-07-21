# Correction — Jour 106 : Tests unitaires (Vitest)

[← Retour au jour 106](../days/day-106.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : quelques tests qui appellent la fonction et vérifient la sortie. Solution améliorée : structurer chaque test en Arrange-Act-Assert avec un nom qui décrit le comportement, couvrir explicitement les cas normaux, limites et d'erreur, garantir le déterminisme (aucune dépendance réseau/horloge), et surtout PROUVER chaque test en sabotant le code pour vérifier qu'il rougit. La preuve de valeur : une régression volontaire casse le bon test.

## ⚠️ Erreurs probables et points à vérifier
- Test « décoratif » sans vraie assertion ou qui ne touche pas le code métier : gonfle la couverture, ne protège rien.
- Ne pas vérifier que le test peut rougir : un test toujours vert donne un faux sentiment de sécurité.
- Ne couvrir que le cas heureux : les bugs se cachent aux cas limites (vide, zéro, espaces, très grand).
- Test non déterministe (dépend du réseau ou de la date) : rougit/verdit au hasard, on ne peut pas s'y fier.

## 🔍 Comment vérifier ta solution
- Chaque test suit Arrange-Act-Assert et porte un nom décrivant le comportement.
- Les cas normaux, limites et d'erreur sont couverts.
- Chaque test a été prouvé en sabotant le code (il rougit).
- Les tests sont rapides et déterministes.
- Au moins 10 tests couvrent la logique métier réelle.

## 🎤 À savoir expliquer à l'oral
Insiste sur le geste clé : « je sabote le code pour prouver que le test peut échouer — sinon il ne protège rien ». Explique AAA, le déterminisme et la couverture des cas limites (« c'est là que les bugs vivent »). Le test décoratif qui ne peut pas rougir est le contre-exemple parfait à citer — il montre que tu comprends À QUOI sert vraiment un test.
