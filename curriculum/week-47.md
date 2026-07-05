# Semaine 47 — Projet final : workflow d'analyse + CI + revue mensuelle 11

> **Mois 11** · Compétences : Agents, Cloud / DevOps, Autonomie projet

[← Mois 11](month-11.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 323](days/day-323.md)
- [Jour 324](days/day-324.md)
- [Jour 325](days/day-325.md)
- [Jour 326](days/day-326.md)
- [Jour 327](days/day-327.md)
- [Jour 328](days/day-328.md)
- [Jour 329](days/day-329.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** La fonctionnalité différenciante de DocSense : le workflow d'analyse (résumé structuré, extraction de points clés, détection d'incohérences) — en workflow explicite, pas en agent gadget. CI complète. Revue mensuelle 11.
- **Test pratique :** Jalon démontrable : sur un document uploadé, DocSense produit une fiche d'analyse structurée (résumé, points clés, questions ouvertes, incohérences éventuelles avec le reste du corpus) — avec le workflow visible dans les logs, et le coût affiché.
- **Test théorique :** Pourquoi un workflow et pas un agent ici (réponds avec TES critères du mois 10) ; que vérifie ta CI et que ne vérifie-t-elle pas ; comment testes-tu un composant qui appelle un LLM (mock, replay, éval) ?
- **Mini-projet :** CI GitHub Actions complète : lint + tests unitaires + (si faisable) éval smoke sur 5 questions en mode replay/mock.
- **Critères de passage :**
  - [ ] Jalon démontré
  - [ ] DocSense v0.5 conforme au backlog
  - [ ] Revue mensuelle 11 complétée
- **Exercice d'architecture :** Revue d'architecture + bilan de mi-projet : écarts entre SPEC.md et la réalité, décisions à re-documenter, coupes de scope à assumer pour tenir la v1.0 (liste-les et coupe MAINTENANT).
