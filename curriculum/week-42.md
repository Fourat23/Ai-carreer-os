# Semaine 42 — Architecture : clean/hexagonale, event-driven, queues, cache

> **Mois 10** · Compétences : Architecture, Design patterns

[← Mois 10](month-10.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 288](days/day-288.md)
- [Jour 289](days/day-289.md)
- [Jour 290](days/day-290.md)
- [Jour 291](days/day-291.md)
- [Jour 292](days/day-292.md)
- [Jour 293](days/day-293.md)
- [Jour 294](days/day-294.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Le bloc architecture qui te fait passer les entretiens système : styles d'architecture, patterns utiles, et surtout les TRADE-OFFS.
- **Test pratique :** 90 min : refactore DocQA vers une architecture hexagonale légère — le cœur (pipeline RAG) sans dépendance à l'UI ni à la vector DB concrète (ports/adapters), prouvé par : changer de vector DB = changer UN fichier. Puis schéma avant/après.
- **Test théorique :** 3 tiers vs hexagonale : ce qui change vraiment ; event-driven : cas d'usage et coût de complexité ; à quoi sert une queue (découplage, absorption de pics) ; cache : les 2 problèmes difficiles ; 5 design patterns que tu as DÉJÀ utilisés sans le savoir (nomme-les dans ton code).
- **Mini-projet :** Note d'architecture comparée : le MÊME besoin (traitement de documents) en monolithe modulaire vs microservices vs event-driven — coûts, complexité, quand chaque option gagne, laquelle tu recommandes pour DocSense et pourquoi.
- **Critères de passage :**
  - [ ] Refactor hexagonal fonctionnel
  - [ ] Note comparative rédigée
  - [ ] Auto-éval archi ≥ 3
- **Exercice d'architecture :** L'exercice de la semaine EST l'exercice d'architecture : la note comparée. Ajoute une section 'ce que je ferais avec 10x le trafic' pour chaque option.
