# Semaine 16 — Full-stack réel : front + API + auth simple, tests unitaires

> **Mois 4** · Compétences : JavaScript / TypeScript, Software engineering, HTTP / API

[← Mois 4](month-04.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 106](days/day-106.md)
- [Jour 107](days/day-107.md)
- [Jour 108](days/day-108.md)
- [Jour 109](days/day-109.md)
- [Jour 110](days/day-110.md)
- [Jour 111](days/day-111.md)
- [Jour 112](days/day-112.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Assembler les deux mondes proprement, protéger des routes avec un token simple, et écrire tes premiers vrais tests automatisés.
- **Test pratique :** 90 min : ajoute à l'ensemble citations — un token d'API simple (header vérifié par middleware), le front qui l'envoie, et 6 tests Vitest sur la logique métier (validation, formatage, filtres).
- **Test théorique :** Pourquoi l'auth par header et pas dans l'URL ; qu'est-ce que CORS et pourquoi ton front le déclenche ; que teste un test unitaire vs un test d'intégration ; qu'est-ce qu'un mock ?
- **Mini-projet :** Suite de tests du squelette d'API (semaine 11) : au moins 10 tests couvrant validation et services.
- **Critères de passage :**
  - [ ] Auth fonctionnelle front→API
  - [ ] 10+ tests verts, et rouges quand on sabote
  - [ ] Auto-éval se ≥ 3
- **Exercice d'architecture :** Pourquoi la logique métier dans les routes Express est-elle difficile à tester ? Refactore UNE route pour extraire la logique en fonction pure testée. Mesure : nombre de lignes de test nécessaires avant/après.
