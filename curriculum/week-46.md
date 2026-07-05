# Semaine 46 — Projet final : évaluation + dashboard qualité ; Docker

> **Mois 11** · Compétences : Évaluation IA, Cloud / DevOps

[← Mois 11](month-11.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 316](days/day-316.md)
- [Jour 317](days/day-317.md)
- [Jour 318](days/day-318.md)
- [Jour 319](days/day-319.md)
- [Jour 320](days/day-320.md)
- [Jour 321](days/day-321.md)
- [Jour 322](days/day-322.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Ce qui rendra DocSense crédible : le harnais d'évaluation branché dès maintenant (pas à la fin), le dashboard qualité, et la dockerisation.
- **Test pratique :** Jalon démontrable : golden set de 40+ questions sur le corpus DocSense, éval automatisée (retrieval + fidélité) qui tourne en une commande, dashboard qui affiche les scores par version, app dockerisée (compose up = tout tourne).
- **Test théorique :** Pourquoi évaluer DÈS maintenant et pas à la fin ; qu'affiche un bon dashboard qualité (tendance > valeur absolue) ; image vs conteneur vs volume ; que met-on dans un .dockerignore et pourquoi ?
- **Mini-projet :** Baseline chiffrée officielle de DocSense v0 : le tableau de scores qui servira de référence à toutes les améliorations.
- **Critères de passage :**
  - [ ] Jalon démontré
  - [ ] Baseline enregistrée
  - [ ] Dockerfile compris ligne par ligne (pas copié)
- **Exercice d'architecture :** Revue d'architecture hebdo + : où le harnais d'éval s'insère-t-il dans l'architecture (port ? service ? script ?) sans polluer le cœur ? Justifie ton choix.
