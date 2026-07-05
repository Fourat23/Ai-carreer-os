# Semaine 41 — Workflows, orchestration, coûts, caching

> **Mois 10** · Compétences : Agents, Architecture

[← Mois 10](month-10.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 281](days/day-281.md)
- [Jour 282](days/day-282.md)
- [Jour 283](days/day-283.md)
- [Jour 284](days/day-284.md)
- [Jour 285](days/day-285.md)
- [Jour 286](days/day-286.md)
- [Jour 287](days/day-287.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** L'alternative sobre aux agents : des workflows explicites, orchestrés, moins chers et plus fiables. Plus la discipline des coûts.
- **Test pratique :** 90 min : transforme le vérificateur de docs en workflow explicite (étapes fixes : lister → extraire les claims → comparer → rapporter), compare avec la version agent : coût total, latence, fiabilité sur 5 exécutions, qualité du résultat.
- **Test théorique :** Chaînage vs parallélisation vs routage vs évaluateur-optimiseur (les 4 patterns de workflow) ; quand le non-déterminisme de l'agent se justifie ; comment estimer le coût d'un workflow avant de le lancer ; que cacher et à quel niveau ?
- **Mini-projet :** Ajoute un cache (fichier ou SQLite) aux appels LLM de tes outils : clé = hash(prompt+modèle), invalidation raisonnée, taux de hit mesuré sur tes évaluations répétées.
- **Critères de passage :**
  - [ ] Comparaison honnête documentée
  - [ ] Cache fonctionnel (hit > 50% sur relances)
  - [ ] Je sais dire quand chaque approche gagne
- **Exercice d'architecture :** Conçois l'orchestration 'analyse quotidienne de 500 documents' : découpage en étapes, parallélisation, reprise sur échec partiel, budget coût, alerte si dérive. Schéma + 1 page.
