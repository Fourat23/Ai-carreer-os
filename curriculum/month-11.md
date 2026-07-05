# Mois 11 — Projet final DocSense (build) + Docker, CI, observabilité

[← Vue d'ensemble](year-overview.md)

## Objectif du mois
Construction du projet final : DocSense, assistant d'analyse documentaire technique avec pipeline RAG évalué et dashboard qualité. Cadrage produit, architecture documentée, ingestion, RAG core, évaluation, premiers guardrails. En parallèle : Docker, variables d'environnement, CI simple.

## Semaines
- [Semaine 44](week-44.md) — Projet final : cadrage, specs, architecture, ADRs
- [Semaine 45](week-45.md) — Projet final : ingestion multi-format + RAG core
- [Semaine 46](week-46.md) — Projet final : évaluation + dashboard qualité ; Docker
- [Semaine 47](week-47.md) — Projet final : workflow d'analyse + CI + revue mensuelle 11

## Projet du mois
**Projet 7 : DocSense — assistant d'analyse documentaire technique (build)** — voir [la fiche projet](projects/project-07.md).

## 🗓️ Revue mensuelle
- **Projet validant :** DocSense v0.5 : ingestion multi-format, RAG avec citations, golden set initial, éval automatisée qui tourne, app dockerisée, CI qui lance les tests.
- **Score attendu en fin de mois :**
  - RAG : 4/5
  - Architecture : 3/5
  - Cloud / DevOps : 2/5
  - Autonomie projet : 4/5
- **Compétences acquises :**
  - Cadrer un produit IA : personas, cas d'usage, hors-scope
  - Architecture documentée AVANT le code (ADRs)
  - Docker : image, volumes, compose
  - CI GitHub Actions : lint + tests à chaque push
  - Secrets et variables d'environnement propres
- **Lacunes fréquentes à corriger :** Risque principal : le scope. La spec de la semaine 44 est contractuelle : tout ajout d'idée va dans FUTURE.md, pas dans le code.
- **Livrable portfolio :** Dépôt DocSense avec ADRs (décisions d'architecture), schéma, CI verte.
- **Simulation d'entretien :** Simulation : pitch produit de DocSense en 5 min (problème → solution → démo → chiffres), comme devant un CTO.
- **Exercice d'explication technique orale :** Défends 3 décisions d'architecture de DocSense face à un contradicteur imaginaire (pourquoi SQLite ? pourquoi pas d'agent ici ? pourquoi ce chunking ?).
