# Semaine 7 — TypeScript sérieux, POO, programmation fonctionnelle de base

> **Mois 2** · Compétences : JavaScript / TypeScript, Design patterns

[← Mois 2](month-02.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 43](days/day-043.md)
- [Jour 44](days/day-044.md)
- [Jour 45](days/day-045.md)
- [Jour 46](days/day-046.md)
- [Jour 47](days/day-047.md)
- [Jour 48](days/day-048.md)
- [Jour 49](days/day-049.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Tu écris maintenant du TypeScript par défaut. POO et FP ne sont pas des religions : ce sont deux outils, tu apprends à choisir.
- **Test pratique :** 75 min : modélise en TS un système de paiement (interface `MoyenPaiement`, classes `Carte`/`Paypal`/`Virement`, fonction `payer` polymorphe) ; puis la même chose en style fonctionnel (union types + fonctions). Compare.
- **Test théorique :** Interface vs type ; génériques : à quoi ça sert (exemple) ; les 4 piliers POO avec exemples courts ; fonction pure et pourquoi c'est testable ; qu'est-ce que l'injection de dépendance (intuition).
- **Mini-projet :** Refactor de TaskFlow (préparation projet 1) : conçois les types/interfaces du futur CLI (Task, Store, Commands) sans encore tout implémenter.
- **Critères de passage :**
  - [ ] Les 2 versions du test compilent et fonctionnent
  - [ ] Comparaison écrite POO vs FP (10 lignes)
  - [ ] Types de TaskFlow validés contre la spec du projet
- **Exercice d'architecture :** Dans TaskFlow, la persistance (JSON) peut changer plus tard (SQLite). Conçois l'interface `Store` pour que le reste du code ne sache PAS où sont stockées les données. C'est ta première inversion de dépendance.
