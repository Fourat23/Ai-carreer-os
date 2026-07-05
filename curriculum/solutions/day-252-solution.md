# Correction / Grille — Jour 252 : Revue de la semaine 36

[← Retour au jour 252](../days/day-252.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Hybrid search, reranking, amélioration du retrieval**. Le retrieval est le maillon faible de 80% des RAG. Cette semaine : recherche lexicale + vectorielle combinées, reranking, et mesure de chaque amélioration.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : ajoute à DocQA — recherche lexicale (BM25 ou FTS5 de SQLite), fusion des scores (RRF), reranking du top-20 vers top-5 (par cross-encoder léger ou LLM), et mesure avant/après sur tes questions test (le bon passage est-il remonté ?).
- **Test théorique** (réponds de mémoire puis auto-corrige) : Ce que la recherche lexicale attrape et que la vectorielle rate (et inversement, exemples) ; principe du RRF ; que fait un reranker et pourquoi après (et pas à la place) du retrieval ; coût/latence du reranking ?
- **Mini-projet / livrable** conforme : Tableau d'ablation : vectoriel seul / lexical seul / hybride / hybride+rerank sur 15 questions — quel gain à chaque étage ?
- **Exercice d'architecture** fait sérieusement : Chaque étage (retrieval, fusion, rerank) ajoute latence et coût. Budget : réponse en < 3s. Répartis le budget par étage, identifie le levier principal, et propose 2 optimisations (cache, parallélisation, k réduit...).

## 📋 Checklist de validation
- [ ] FTS/BM25 fonctionnel sur mes chunks
- [ ] Fusion implémentée et comprise
- [ ] Chaque ajout MESURÉ avant adoption
- [ ] Latence totale suivie

## 🚦 Critères de passage à la semaine suivante
- [ ] Hybride + rerank opérationnels
- [ ] Tableau d'ablation complet
- [ ] Amélioration démontrée (ou rejet argumenté)

## ⚠️ Erreurs fréquentes en revue
- Se sur-noter (familiarité ≠ maîtrise) : ne compte que ce que tu produis SEUL et sais EXPLIQUER.
- Bâcler le test théorique en le relisant au lieu de répondre de mémoire (rappel actif).
- Avancer malgré des critères non atteints : mieux vaut consolider 2-3 jours que bâtir sur du sable.
- Oublier de mettre à jour ses scores de compétences dans l'application.

## 🧩 Auto-évaluation finale
- Note honnête de la semaine (0-5) : ____
- Ma plus grande difficulté cette semaine : ____
- Ce que je dois revoir avant d'avancer : ____
- Si des critères ne sont pas atteints : quel plan de rattrapage (daté) ?
