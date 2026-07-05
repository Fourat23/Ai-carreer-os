# Semaine 40 — Agents : boucle ReAct, outils, mémoire

> **Mois 10** · Compétences : Agents, LLM

[← Mois 10](month-10.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 274](days/day-274.md)
- [Jour 275](days/day-275.md)
- [Jour 276](days/day-276.md)
- [Jour 277](days/day-277.md)
- [Jour 278](days/day-278.md)
- [Jour 279](days/day-279.md)
- [Jour 280](days/day-280.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Les agents démystifiés : une boucle while + function calling + un budget. Tu la codes toi-même pour ne plus jamais subir le mot 'agent'.
- **Test pratique :** 90 min : code un agent maison (SANS framework) — boucle plan/act/observe avec 3 outils (recherche dans tes docs, calcul, lecture de fichier), budget de 10 itérations, trace complète de chaque étape affichée, arrêt propre (réussite, échec, budget épuisé).
- **Test théorique :** Différence agent vs workflow (définition opérationnelle) ; pourquoi limiter les itérations ; que mettre dans l'observation renvoyée au modèle ; 3 modes d'échec classiques d'un agent (boucle, dérive d'objectif, outil mal utilisé) ?
- **Mini-projet :** Ton agent appliqué à un cas utile : 'vérificateur de cohérence de documentation' (il lit tes docs et signale les contradictions), avec ses traces.
- **Critères de passage :**
  - [ ] Agent 3-outils fonctionnel avec traces
  - [ ] Cas utile démontré
  - [ ] Modes d'échec documentés avec exemples vécus
- **Exercice d'architecture :** Pour 5 tâches données (tri de mails, veille quotidienne, migration de données, support niveau 1, résumé de réunion) : agent, workflow, ou simple script ? Justifie chaque choix par coût/fiabilité/besoin d'adaptation.
