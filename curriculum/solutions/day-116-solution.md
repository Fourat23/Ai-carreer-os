# Correction — Jour 116 : Projet 3 — Tests

[← Retour au jour 116](../days/day-116.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : ajouter des tests un peu partout. Solution améliorée : identifier les PARCOURS CRITIQUES (créer, supprimer, rechercher) et leur appliquer le bon type de test — unitaire pour la logique (filtres, validation, cas limites), comportement pour les composants (rôle/label), intégration pour les flux (api mockée) qui attrapent les bugs d'assemblage — en visant la confiance, pas le pourcentage, et en prouvant que chaque test rougit sur une régression. La preuve : saboter un parcours critique casse un test.

## ⚠️ Erreurs probables et points à vérifier
- Courir après 100 % de couverture : beaucoup d'effort sur du code trivial, peu de protection sur les vrais flux.
- Ne faire que des tests unitaires : on rate les bugs d'ASSEMBLAGE entre formulaire, api et affichage (rôle de l'intégration).
- Tester les composants par leur implémentation : la suite casse au refactor sans attraper de vrais bugs.
- Ne pas vérifier que les tests rougissent : une suite verte qui ne peut pas échouer sur un parcours critique est un faux filet.

## 🔍 Comment vérifier ta solution
- Les parcours critiques (créer, supprimer, rechercher) sont couverts.
- Chaque chose a le bon type de test (unitaire/comportement/intégration).
- Les flux critiques ont un test d'intégration avec api mockée.
- La suite est verte et chaque test a été prouvé en sabotant le code.
- La stratégie vise la confiance sur le critique, pas un pourcentage de couverture.

## 🎤 À savoir expliquer à l'oral
Explique la stratégie : « je vise la confiance sur les parcours critiques, pas 100 % de couverture ». Décris la pyramide (unitaires nombreux, intégrations ciblées) et le rôle unique des tests d'intégration (bugs d'assemblage). Cite le contre-exemple de la course à la couverture. Montrer qu'une régression sur « créer » casse un test prouve que ta suite protège ce qui compte.
