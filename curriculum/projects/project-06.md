<!-- keep -->
# Projet 6 — DocQA (application RAG évaluée)

> **Mois 8-9 · Semaine 39** · Compétences : RAG, évaluation IA, architecture.
> La pièce maîtresse avant le projet final. Ce qui te distingue : **un RAG avec des chiffres d'évaluation avant/après**.

## 🎯 Objectif
Construire une application de question-réponse sur un corpus documentaire (RAG), **d'abord sans framework** pour tout comprendre, puis l'industrialiser (vector DB, hybrid search, reranking), et surtout l'**évaluer rigoureusement** (golden set, LLM-as-judge, métriques), en documentant les améliorations par les chiffres.

## Ce que le projet prouve
- Tu maîtrises un **pipeline RAG complet**, étape par étape.
- Tu sais **évaluer** un système LLM (la compétence la plus rare chez les juniors).
- Tu **améliores par la mesure**, pas au feeling.
- Tu sécurises (**guardrails**, prompt injection, citations vérifiables).
- Tu raisonnes en **architecture** (le RAG comme composant remplaçable).

> ⭐ **Le différenciateur :** 90 % des candidats montrent un RAG *sans* évaluation. Toi, tu montres un tableau de métriques **avant/après** chaque amélioration. C'est ce qui te fait passer du statut de « prompteur » à celui d'ingénieur.

## Fonctionnalités
- Ingestion multi-format (texte, Markdown, PDF), chunking, métadonnées.
- Retrieval : vectoriel → hybride (lexical + vectoriel) → reranking.
- Génération de réponses **avec citations vérifiables**.
- Refus explicite quand le corpus ne sait pas.
- Harnais d'évaluation automatisé (une commande → rapport de scores).
- Guardrails (validation, défense prompt injection, tests adverses).

## Stack
- TypeScript ou Python (au choix).
- Vector DB : Chroma (ou `sqlite-vec`), recherche lexicale : SQLite FTS5.
- API LLM (Claude) pour génération + LLM-as-judge.
- Golden set : fichier JSON de 30+ questions/réponses attendues.

## Architecture (hexagonale légère)
```
docqa/
├── core/                 # le pipeline RAG, sans dépendance à l'UI ni à la DB concrète
│   ├── ingest.ts / chunk.ts / embed.ts
│   ├── retrieve.ts       # hybride + rerank
│   └── answer.ts         # génération + citations + refus
├── adapters/             # vector DB, LLM, stockage (remplaçables)
├── eval/                 # golden set, LLM-as-judge, harnais, métriques
├── guardrails/           # validation, anti-injection, tests adverses
└── ui/                   # CLI enrichie ou web simple
```
**Test d'architecture :** changer de vector DB = changer **un** adapter.

## Évaluation (le cœur du projet)
- **Golden set** : 30+ questions variées (factuelle, synthèse, absente du corpus, ambiguë).
- **Retrieval** : rappel@k, précision@k (le bon chunk est-il retrouvé ?).
- **Génération** : fidélité (la réponse est-elle fondée sur les sources ?), pertinence, exactitude — via LLM-as-judge **calibré sur des jugements humains**.
- **Rapport avant/après** pour chaque amélioration (chunking, hybride, rerank).

## Critères de qualité
- [ ] Pipeline RAG complet et compris **ligne par ligne** (v1 sans framework).
- [ ] Vector DB + hybrid search + reranking, chacun **mesuré** avant adoption.
- [ ] Golden set ≥ 30 questions, dont des questions **sans réponse** dans le corpus.
- [ ] Harnais d'évaluation reproductible en une commande.
- [ ] Au moins **2 améliorations pilotées par les métriques**, documentées.
- [ ] Guardrails testés (suite adverse verte).
- [ ] Citations **vérifiées** (la source citée contient bien l'affirmation).

## README attendu
Description · démo · architecture (schéma) · **tableau de métriques avant/après** · comment lancer l'évaluation · limites honnêtes · ce que j'ai appris.

## Démo attendue
Vidéo 3 min : poser une question et montrer la réponse citée, poser une question hors corpus (montrer le refus), lancer l'évaluation et commenter le tableau de progression.

## ADR n°6 et n°7 (à écrire)
- **n°6** : stockage des vecteurs (JSON en mémoire vs vraie vector DB) — dimensionnement.
- **n°7** : les 3 décisions les plus structurantes (chunking, hybride, juge), au format ADR complet — elles resserviront **telles quelles** en entretien.

## Erreurs à éviter
- Empiler des frameworks sans comprendre (v1 **sans** LangChain, appels API directs).
- Montrer un RAG sans évaluation.
- LLM-as-judge non calibré (biais de position, verbosité, auto-préférence).
- Ne pas inclure de questions « sans réponse » (le refus est une feature à tester).

## Extensions possibles (FUTURE.md)
Multi-corpus, citations cliquables vers la source, cache des embeddings, streaming des réponses, dashboard de qualité (prélude à DocSense).
