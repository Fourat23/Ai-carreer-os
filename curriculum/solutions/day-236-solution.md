# Correction — Jour 236 : Robustesse et cas limites

[← Retour au jour 236](../days/day-236.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Chaque famille a une DÉCISION écrite (promesse, dégradé, ou refus), une implémentation, et 3 tests dont le verdict est honnête. Le succès n'est pas « tout marche » mais « tout est défini et conforme à sa définition » — y compris les refus assumés.

## ⚠️ Erreurs probables et points à vérifier
- Régler le seuil de refus sur les cas évidents (questions absurdes) : le vrai test est la question PROCHE du corpus — c'est elle qui piège les seuils naïfs.
- Répondre à l'interprétation probable SANS annoncer l'hypothèse : juste, mais dangereux — l'utilisateur ne sait pas qu'un choix a été fait à sa place.
- Traiter le multi-documents en espérant que le top-k global couvre les deux : il ne le garantit jamais — la recherche par périmètre, si.
- Découvrir la prémisse fausse en production : c'est LE cas à tester exprès, car il ne se produit pas dans les tests « gentils ».

## 🔍 Comment vérifier ta solution
- La matrice est complète : 4 familles × (décision + 3 tests + verdict).
- Le cas « proche mais absent » est testé et refusé proprement.
- La comparaison 2023/2025 remonte des chunks des DEUX documents (vérifié dans le contexte).
- Le test prémisse fausse avant/après la clause montre la correction (variante).
- Les décisions sont reportées dans le cadrage du jour 232.

## 🎤 À savoir expliquer à l'oral
Raconte le cas de la prémisse fausse avec l'exemple juridique : la question piégée, la broderie sans clause, la correction avec clause. C'est court, mémorable, et ça démontre les trois couches : compréhension du mécanisme (jour 201), conception, test.
