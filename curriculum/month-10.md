# Mois 10 — Agents, workflows, guardrails, sécurité IA, architecture

[← Vue d'ensemble](year-overview.md)

## Objectif du mois
Les sujets qui font 'senior-ready' : agents (boucle outil-réflexion, et surtout quand NE PAS en faire), workflows orchestrés, caching et coûts, guardrails, prompt injection, privacy, et un vrai bloc architecture logicielle (clean/hexagonale, event-driven, queues, observabilité).

## Semaines
- [Semaine 40](week-40.md) — Agents : boucle ReAct, outils, mémoire
- [Semaine 41](week-41.md) — Workflows, orchestration, coûts, caching
- [Semaine 42](week-42.md) — Architecture : clean/hexagonale, event-driven, queues, cache
- [Semaine 43](week-43.md) — Sécurité, privacy, observabilité + revue mensuelle 10

## 🗓️ Revue mensuelle
- **Projet validant :** Mini-projet : agent outillé (2-3 outils) avec limites de sécurité + note d'architecture comparant 3 architectures pour un même besoin, avec trade-offs.
- **Score attendu en fin de mois :**
  - Agents : 3/5
  - Architecture : 3/5
  - Sécurité : 3/5
  - Design patterns : 3/5
- **Compétences acquises :**
  - Boucle agent : plan → outil → observation → décision
  - Workflows vs agents : critères de choix
  - Guardrails entrée/sortie, défense prompt injection
  - Clean architecture, hexagonale, event-driven, queues, cache — avec cas d'usage
  - Observabilité : logs structurés, traces, métriques
- **Lacunes fréquentes à corriger :** L'anti-pattern du mois : l'agent partout. Savoir dire 'un workflow simple suffit ici' vaut plus en entretien qu'un agent complexe.
- **Livrable portfolio :** Note d'architecture publiée (GitHub) : 'Choisir entre workflow et agent' avec ton mini-projet en exemple.
- **Simulation d'entretien :** Simulation architecture : 'Design un système de traitement de documents pour 10 000 docs/jour' — 45 min, schéma + trade-offs.
- **Exercice d'explication technique orale :** Explique la prompt injection avec une démo sur ton propre agent, et 3 défenses concrètes que tu as implémentées.
