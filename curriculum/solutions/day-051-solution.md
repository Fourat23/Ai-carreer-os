# Correction — Jour 51 : REST design : concevoir une API qu'on comprend

[← Retour au jour 51](../days/day-051.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Concevoir le contrat AVANT tout code : ressources au pluriel, verbes HTTP pour les actions (aucun verbe dans l'URL), statuts précis par cas (succès et erreur), query string pour pagination/filtres/recherche, sous-ressources pour les relations. Le critère de réussite : un développeur devine l'API sans doc. Spécifier explicitement les cas d'erreur, pas seulement les succès.

## ✅ Une solution simple
Lister les endpoints CRUD avec leurs verbes et une URL par opération. L'API est utilisable.

## 🚀 Une solution améliorée
Couvrir TOUTES les ressources avec des pluriels cohérents, attribuer le statut précis de chaque cas (201/204/400/404/409), modéliser les relations en sous-ressources, mettre pagination/filtres/tri en query string, et SPÉCIFIER les cas d'erreur. Vérifier la prévisibilité en faisant deviner le contrat à un tiers. Assumer les entorses pragmatiques (action métier) en restant cohérent.

## ⚠️ Erreurs probables et points à vérifier
- Mettre des verbes dans les URLs (`/getLivres`, `/deleteLivre`) : anti-REST, casse la prévisibilité.
- Répondre 200 pour tout, y compris les erreurs : prive les clients du langage des statuts.
- Incohérences (pluriel/singulier mélangés, statuts variables pour un même cas) qui forcent à lire la doc.
- Ne spécifier que les succès : les cas d'erreur (400, 404, 409) font partie du contrat.

## 🔍 Comment vérifier ta solution
- Le contrat couvre toutes les ressources avec verbes et statuts corrects.
- Aucun verbe dans les URLs ; pluriels cohérents partout.
- Les cas d'erreur sont spécifiés (400/404/409), pas seulement les succès.
- Un développeur devine les endpoints sans lire la doc (test de prévisibilité réussi).

## ❓ Réponses du mini-quiz
1. **Quelle est la règle d'or de la conception d'URL REST ?**
   → L'URL dit QUOI (la ressource, un nom au pluriel), le verbe HTTP dit COMMENT (l'action). Jamais de verbe dans l'URL : `GET /livres`, pas `GET /getLivres`.
2. **Qu'est-ce qui fait qu'une API REST est « bien conçue » ?**
   → La PRÉVISIBILITÉ : on devine ses endpoints sans lire la doc. Qui connaît `GET /livres` devine `POST /livres`, `DELETE /livres/42`, `GET /livres/42/emprunts`. La cohérence vaut plus qu'une doc exhaustive.
3. **Où placer la pagination, les filtres et la recherche, et pourquoi ?**
   → En query string (`?page=2&genre=sf`), sur un GET : ils RAFFINENT la ressource sans la changer. Ils ne créent pas une nouvelle ressource, donc pas de nouvelle URL.
4. **Pourquoi `POST /deleteLivre/42` est-il un anti-pattern ?**
   → Il duplique dans l'URL l'action que porte déjà le verbe HTTP et casse la prévisibilité. En REST : `DELETE /livres/42` — l'URL nomme la ressource, le verbe dit l'action.

## 🎤 À savoir expliquer à l'oral
Pose le principe : « l'URL nomme une ressource, le verbe HTTP dit l'action, et je vise la prévisibilité — une bonne API se devine sans doc ». Déroule le CRUD complet avec les statuts précis par cas, dont les erreurs (404, 400, 409). Montrer que tu spécifies les erreurs et que tu assumes une entorse pragmatique cohérente (POST .../emprunter) prouve que tu conçois avec jugement, pas en récitant REST mécaniquement.
