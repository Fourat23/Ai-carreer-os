# Mois 3 — SQL et persistance, sécurité et auth, réseau/Linux/Git, architecture — Projet 2

[← Vue d'ensemble](year-overview.md)

## Objectif du mois
L'API de la fin du mois 2 devient un vrai service. SQLite branché dessus, modélisation, index et transactions, Postman avancé ; le projet 2 (LivreAPI) construit, testé, sécurisé et documenté ; puis les fondations qu'on croit facultatives — réseau, Linux, Git avancé, lecture de code, documentation — et enfin l'architecture en couches, l'observabilité et le cache. Le mois se termine sur le premier front React et le bilan du trimestre.

## Semaines
- [Semaine 9](week-09.md) — SQLite branché sur l'API, modélisation et transactions, Postman avancé ; démarrage du PROJET 2
- [Semaine 10](week-10.md) — PROJET 2 livré : recherche, tests d'intégration, documentation ; sécurité web et authentification
- [Semaine 11](week-11.md) — Réseau, Linux et Git en profondeur ; lire, documenter et concevoir du code qu'on reprend
- [Semaine 12](week-12.md) — Architecture 3-tiers, observabilité, cache et trade-offs ; ouverture Python
- [Semaine 13](week-13.md) — PROJET 2 durci et raconté ; premier full-stack React + revue mensuelle 3

## Projet du mois
**Projet 2 : LivreAPI — API REST de gestion de bibliothèque + collection Postman** — voir [la fiche projet](projects/project-02.md).

## 🗓️ Revue mensuelle
- **Projet validant :** Projet 2 (LivreAPI) : API REST CRUD + recherche, SQLite, validation, erreurs propres, collection Postman avec tests automatisés, README.
- **Score attendu en fin de mois :**
  - HTTP / API : 3/5
  - SQL / Data : 2/5
  - JavaScript / TypeScript : 3/5
  - Software engineering : 2/5
  - Sécurité : 1/5
- **Compétences acquises :**
  - SQL : SELECT/INSERT/UPDATE/DELETE/JOIN, agrégats, sous-requêtes
  - Modélisation, normalisation, index, transactions
  - Requêtes paramétrées et anti-injection
  - Tests d'intégration qui partent d'un état connu
  - OWASP appliqué à ses propres APIs, auth par token, gestion des secrets
  - Réseau (DNS, TCP, TLS, HTTP/2), Linux et Git avancés
  - Architecture en couches, observabilité (logs, métriques, traces), cache
  - Postman : collections, variables, tests automatisés
- **Lacunes fréquentes à corriger :** Statuts HTTP mal choisis et validation d'entrée oubliée sont les 2 lacunes classiques : la checklist du projet 2 les verrouille.
- **Livrable portfolio :** Projet 2 sur GitHub : API + collection Postman exportée + doc des endpoints.
- **Simulation d'entretien :** Simulation : 'Explique-moi ce qui se passe quand tu tapes une URL dans un navigateur' + 'Design une API pour un blog' (30 min, à voix haute).
- **Exercice d'explication technique orale :** Explique idempotence, différence PUT/PATCH/POST, et pourquoi on ne met pas de verbe dans une URL REST.
