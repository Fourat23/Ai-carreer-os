<!-- keep -->
# Projet final — DocSense (assistant d'analyse documentaire technique)

> **Mois 11-12 · Semaines 44-52** · Le projet qui te rend crédible sur GitHub, le CV et LinkedIn.
> Un **vrai produit IA local**, évalué, sécurisé, documenté — pas un chatbot générique.

## 🏆 Pourquoi CE projet (justification du choix)
Parmi les options envisagées (copilote de formation, assistant de revue d'architecture, générateur de specs, système RAG à dashboard qualité), **DocSense — assistant d'analyse documentaire technique avec pipeline RAG évalué et dashboard qualité** est le plus **bankable**. Raisons :

1. **C'est LE cas d'usage entreprise n°1 des LLM** : la question-réponse et l'analyse sur un corpus documentaire privé (docs techniques, contrats, procédures, bases de connaissances). Toute entreprise en a besoin. Un recruteur reconnaît immédiatement la valeur métier.
2. **Il prouve toute la chaîne** : compréhension métier, architecture, data, RAG, agents/workflows, **évaluation chiffrée**, sécurité, UX, documentation, tests.
3. **L'évaluation + le dashboard qualité te démarquent** : c'est exactement ce qui distingue un ingénieur IA d'un « prompteur ». Des chiffres avant/après, des guardrails testés, une qualité mesurée : la quasi-totalité des projets RAG de portfolio n'en ont pas.
4. **Faisable en local**, sans coûts cloud ni dépendances fragiles, donc reproductible par un recruteur.

## 🎯 Objectif
Construire un assistant qui ingère un corpus technique, répond aux questions avec citations, **analyse** les documents (résumé structuré, points clés, incohérences), le tout piloté par un **harnais d'évaluation** et un **dashboard qualité** — en qualité « production locale » (guardrails, tests, observabilité, docs, démo).

## Ce que le projet prouve (les 10 dimensions)
| Dimension | Comment DocSense le prouve |
|---|---|
| Compréhension métier | Personas, cas d'usage, hors-scope explicites (SPEC.md) |
| Architecture | Hexagonale, ADRs, schéma C4 |
| Data | Ingestion multi-format, chunking mesuré, métadonnées |
| RAG | Retrieval hybride + reranking, citations vérifiables |
| Agents / workflows | Workflow d'analyse explicite (et justification de NE PAS faire d'agent) |
| Évaluation | Golden set 40+, LLM-as-judge, dashboard qualité |
| Sécurité | Guardrails, anti-injection, suite adverse, threat model |
| UX | Interface claire, états soignés, réponses citées |
| Documentation | README exemplaire, ADRs, démo vidéo |
| Tests | Unitaires + intégration + éval smoke en CI |

## Fonctionnalités
- **Ingestion** : PDF, Markdown, HTML — corpus technique réel (30+ docs).
- **Q&R** : réponses avec citations vérifiables, refus si le corpus ne sait pas.
- **Analyse** : sur un document, produire une fiche (résumé structuré, points clés, questions ouvertes, incohérences avec le reste du corpus).
- **Évaluation** : harnais automatisé (retrieval + fidélité), golden set, dashboard qualité montrant l'évolution des scores par version.
- **Sécurité** : validation, défense prompt injection (question ET documents piégés), citations vérifiées, suite adverse.
- **Observabilité** : logs structurés, coût par analyse affiché, session rejouable.

## Stack
- TypeScript (Next.js) ou Python (FastAPI + petite UI) — au choix.
- Vector DB (Chroma / sqlite-vec) + recherche lexicale (FTS5) + reranking.
- API LLM (Claude) pour génération, analyse et LLM-as-judge.
- Docker + docker-compose, CI GitHub Actions.

## Architecture (hexagonale)
```
docsense/
├── SPEC.md, ARCHITECTURE.md, adr/            # cadrage AVANT le code
├── core/                                     # métier pur, sans dépendance concrète
│   ├── ingestion/  retrieval/  generation/  analysis/
│   └── ports.ts                              # interfaces (LLM, VectorStore, Judge...)
├── adapters/                                 # implémentations remplaçables
├── eval/                                     # golden set, harnais, métriques
├── guardrails/                               # validation, anti-injection, tests adverses
├── ui/                                       # interface + dashboard qualité
├── Dockerfile, docker-compose.yml
└── .github/workflows/ci.yml
```

## Modèle de données
Documents, chunks (avec source/page/section), embeddings, évaluations (version, question, scores), sessions. À concevoir et justifier au jour de cadrage (semaine 44).

## Plan de construction (8 semaines)
- **S44** : cadrage (SPEC, ARCHITECTURE, ADRs, backlog, spikes de dérisquage).
- **S45** : ingestion multi-format + RAG core en architecture cible.
- **S46** : harnais d'évaluation + dashboard qualité + dockerisation + baseline chiffrée.
- **S47** : workflow d'analyse + CI complète.
- **S48** : guardrails + tests + observabilité + rapport qualité v1.0 (feature freeze).
- **S49** : documentation, démo vidéo, storytelling.
- (S50-52 : carrière, mais DocSense reste la vitrine.)

## Critères de qualité (production locale)
- [ ] `docker compose up` = tout tourne sur une machine propre.
- [ ] Éval en **une commande**, scores versionnés, dashboard qui montre la progression.
- [ ] Au moins 3 améliorations documentées par les chiffres (avant/après).
- [ ] Suite adverse verte, injections bloquées, citations vérifiées.
- [ ] Architecture hexagonale prouvée (changer un adapter = un fichier).
- [ ] CI verte (lint + tests + éval smoke).
- [ ] README exemplaire + ADRs + démo vidéo 3 min.

## Tests attendus
- Cœur RAG (unitaires), ingestion (formats moches), workflow d'analyse (mock/replay LLM), intégration bout-en-bout, éval smoke en CI, suite adverse.

## README attendu
Problème → solution → **démo GIF/vidéo** → architecture (schéma) → **chiffres d'évaluation** → installation 5 min (`docker compose up`) → comment lancer l'éval → limites honnêtes → décisions clés (liens ADRs).

## Démo attendue
Vidéo 3 min : pitch produit (problème → solution), question avec réponse citée, analyse d'un document, question hors corpus (refus), dashboard qualité, un cas adverse bloqué.

## Ce que tu dois pouvoir expliquer (arbitrages)
- Pourquoi un **workflow** et pas un agent pour l'analyse.
- Pourquoi ce **chunking** (mesures à l'appui).
- Pourquoi **SQLite/Chroma en local** et pas une infra cloud.
- Comment tu **évalues** et pourquoi tes métriques sont pertinentes.
- Les 3 décisions que tu **referais différemment** (post-mortem).

## Erreurs à éviter
- Le **scope** : la SPEC est contractuelle, toute idée nouvelle va dans FUTURE.md.
- Repousser les candidatures pour « finir de polir » (premières candidatures au jour 358).
- Évaluation ajoutée à la fin (elle doit tourner dès la semaine 46).
- Un agent gadget là où un workflow suffit.

## Extensions possibles (FUTURE.md)
Multi-corpus, RBAC, connecteurs (Notion/Confluence), citations cliquables, streaming, monitoring de dérive, déploiement cloud, mode collaboratif.
