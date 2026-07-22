# Correction — Jour 53 : Express : routes, middlewares, structure en couches

[← Retour au jour 53](../days/day-053.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Structurer l'API en middlewares et en 3 couches : middleware de log maison (traite puis next), routes qui délèguent aux services, services qui portent la logique métier (purs autant que possible, testables sans serveur), data isolée. Comprendre que l'ordre de déclaration des middlewares est l'ordre d'exécution et que next() (ou répondre) est obligatoire. Le smell à bannir : la logique dans les routes.

## ✅ Une solution simple
CRUD citations fonctionnel avec quelques routes et un middleware de log. L'API répond.

## 🚀 Une solution améliorée
Réaliser une VRAIE séparation en 3 couches (aucune logique métier dans les routes, services testables sans serveur), écrire un middleware de log maison (méthode, chemin, statut, durée), respecter l'ordre des middlewares, et tester la logique des services en isolation. Placer validation/auth dans des middlewares dédiés.

## ⚠️ Erreurs probables et points à vérifier
- Mettre toute la logique dans les routes : intestable sans serveur, mélange HTTP et métier, duplication.
- Oublier next() dans un middleware sans répondre : la requête reste bloquée.
- Mal ordonner les middlewares (auth après la route protégée, erreurs pas en dernier) : comportement incorrect.
- Coupler les couches à contre-sens (un service qui connaît le req/res HTTP) : perte de testabilité.

## 🔍 Comment vérifier ta solution
- CRUD citations complet, testé via Postman.
- Structure en 3 couches réelle : aucune logique métier dans les routes.
- Middleware de log maison (méthode, chemin, statut, durée) fonctionnel.
- La logique d'un service se teste en isolation, sans lancer le serveur.

## ❓ Réponses du mini-quiz
1. **Qu'est-ce qu'un middleware Express et comment fonctionne la chaîne ?**
   → Une fonction `(req, res, next)` maillon d'une chaîne : elle traite puis appelle `next()` pour passer au suivant, ou répond pour court-circuiter. L'ordre de DÉCLARATION est l'ordre d'exécution.
2. **Que se passe-t-il si un middleware n'appelle ni `next()` ni ne répond ?**
   → La requête reste BLOQUÉE (pendante) : la chaîne ne continue pas et aucune réponse n'est envoyée. Le client attend jusqu'au timeout.
3. **Quelles sont les 3 couches et leur rôle ?**
   → Routes (traduire HTTP ↔ appels de fonctions), services (logique métier, pure autant que possible), data (persistance). Chaque couche ne connaît que celle du dessous.
4. **Pourquoi mettre la logique métier dans les routes est-il un code smell ?**
   → C'est INTESTABLE sans lancer un serveur et envoyer des requêtes, ça mélange HTTP et métier, et ça se duplique. Extraire dans des services purs rend la logique testable et réutilisable.

## 🎤 À savoir expliquer à l'oral
Explique les deux idées structurantes : « une API est une chaîne de middlewares (l'ordre = l'exécution, toujours next ou répondre) et un empilement de 3 couches (routes → services → data) ». Insiste sur le bénéfice concret : « la logique dans les services est testable sans serveur, alors que la logique dans les routes est le code smell du débutant ». Situer les middlewares comme une Chain of Responsibility (jour 39) et placer validation/auth dedans montre une vision architecturale, pas juste un usage d'Express.
