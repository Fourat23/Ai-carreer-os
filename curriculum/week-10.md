# Semaine 10 — REST design, Node.js, premiers serveurs, Express

> **Mois 3** · Compétences : HTTP / API, JavaScript / TypeScript

[← Mois 3](month-03.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 64](days/day-064.md)
- [Jour 65](days/day-065.md)
- [Jour 66](days/day-066.md)
- [Jour 67](days/day-067.md)
- [Jour 68](days/day-068.md)
- [Jour 69](days/day-069.md)
- [Jour 70](days/day-070.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Tu passes de consommateur d'API à producteur. D'abord le module http natif (pour comprendre), puis Express (pour produire).
- **Test pratique :** 75 min : serveur Express avec routes GET /livres, GET /livres/:id, POST /livres (validation titre requis), DELETE /livres/:id — données en mémoire, statuts corrects, testé via Postman.
- **Test théorique :** Les 6 contraintes REST (au moins 4 de tête) ; pourquoi GET ne doit pas modifier l'état ; qu'est-ce qu'un middleware Express ; où mettre la validation ; que renvoyer sur un POST réussi ?
- **Mini-projet :** API 'citations' : CRUD complet en mémoire + route GET /citations/aleatoire + middleware de log des requêtes.
- **Critères de passage :**
  - [ ] API du test pratique complète et correcte
  - [ ] Middleware de log écrit maison
  - [ ] Routes nommées selon les conventions REST
- **Exercice d'architecture :** Ton API citations a 3 responsabilités mélangées : routing, logique, données. Propose un découpage en 3 couches (routes/services/data) et applique-le. C'est ton premier 3-tiers.
