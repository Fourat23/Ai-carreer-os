# Mois 8 — Ingénierie LLM : prompts, structured outputs, tool use, RAG v1

[← Vue d'ensemble](year-overview.md)

## Objectif du mois
Le cœur de ton futur métier : intégrer des LLM dans de vraies applications. Prompt engineering sérieux (pas des recettes magiques), sorties structurées JSON, function calling, gestion des coûts, puis construction de ton premier pipeline RAG de zéro (chunking, embeddings, retrieval).

## Semaines
- [Semaine 31](week-31.md) — Prompt engineering sérieux, structured outputs
- [Semaine 32](week-32.md) — Function calling, tool use, intégration app
- [Semaine 33](week-33.md) — RAG v1 : chunking, embeddings, retrieval naïf
- [Semaine 34](week-34.md) — RAG v1 complet multi-formats + revue mensuelle 8

## Projet du mois
**Projet 6 : DocQA — application RAG locale (démarrage)** — voir [la fiche projet](projects/project-06.md).

## 🗓️ Revue mensuelle
- **Projet validant :** RAG v1 fonctionnel de bout en bout sur un corpus de ton choix : ingestion → chunking → embeddings → retrieval → réponse avec citations. Code à toi, compris ligne par ligne.
- **Score attendu en fin de mois :**
  - LLM : 3/5
  - RAG : 2/5
  - JavaScript / TypeScript : 4/5
  - HTTP / API : 4/5
- **Compétences acquises :**
  - Prompts robustes : rôle, contraintes, exemples, formats
  - Structured outputs + validation (le LLM comme composant faillible)
  - Function calling / tool use
  - RAG : pourquoi, quand, comment ; chunking et embeddings en pratique
  - Coûts d'inférence : estimer et réduire
- **Lacunes fréquentes à corriger :** Le piège du mois : empiler des libs sans comprendre. Règle : RAG v1 SANS framework (pas de LangChain), uniquement des appels API directs.
- **Livrable portfolio :** Dépôt 'rag-from-scratch' : pipeline RAG minimal commenté, sans framework, avec un README qui explique chaque étape.
- **Simulation d'entretien :** Simulation : 'Explique le RAG à un client', 'Pourquoi pas juste un gros prompt ?', 'Comment choisis-tu la taille des chunks ?'
- **Exercice d'explication technique orale :** Explique function calling avec un exemple concret : que envoie-t-on, que répond le modèle, qui exécute quoi.
