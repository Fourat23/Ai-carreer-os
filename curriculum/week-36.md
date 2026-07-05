# Semaine 36 — Hybrid search, reranking, amélioration du retrieval

> **Mois 9** · Compétences : RAG

[← Mois 9](month-09.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 246](days/day-246.md)
- [Jour 247](days/day-247.md)
- [Jour 248](days/day-248.md)
- [Jour 249](days/day-249.md)
- [Jour 250](days/day-250.md)
- [Jour 251](days/day-251.md)
- [Jour 252](days/day-252.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Le retrieval est le maillon faible de 80% des RAG. Cette semaine : recherche lexicale + vectorielle combinées, reranking, et mesure de chaque amélioration.
- **Test pratique :** 90 min : ajoute à DocQA — recherche lexicale (BM25 ou FTS5 de SQLite), fusion des scores (RRF), reranking du top-20 vers top-5 (par cross-encoder léger ou LLM), et mesure avant/après sur tes questions test (le bon passage est-il remonté ?).
- **Test théorique :** Ce que la recherche lexicale attrape et que la vectorielle rate (et inversement, exemples) ; principe du RRF ; que fait un reranker et pourquoi après (et pas à la place) du retrieval ; coût/latence du reranking ?
- **Mini-projet :** Tableau d'ablation : vectoriel seul / lexical seul / hybride / hybride+rerank sur 15 questions — quel gain à chaque étage ?
- **Critères de passage :**
  - [ ] Hybride + rerank opérationnels
  - [ ] Tableau d'ablation complet
  - [ ] Amélioration démontrée (ou rejet argumenté)
- **Exercice d'architecture :** Chaque étage (retrieval, fusion, rerank) ajoute latence et coût. Budget : réponse en < 3s. Répartis le budget par étage, identifie le levier principal, et propose 2 optimisations (cache, parallélisation, k réduit...).
