# Semaine 32 — RAG v1 : chunking, embeddings, retrieval naïf

> **Mois 8** · Compétences : RAG, LLM

[← Mois 8](month-08.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 218](days/day-218.md)
- [Jour 219](days/day-219.md)
- [Jour 220](days/day-220.md)
- [Jour 221](days/day-221.md)
- [Jour 222](days/day-222.md)
- [Jour 223](days/day-223.md)
- [Jour 224](days/day-224.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Ton premier RAG, SANS framework : chaque étape codée et comprise. C'est le savoir-faire le plus demandé du marché junior IA.
- **Test pratique :** 90 min : pipeline complet sur 5 documents texte — découpage en chunks (taille fixe + overlap), embeddings via API, stockage (JSON suffit), recherche par similarité cosinus (implémentée TOI-même), top-k injecté dans le prompt, réponse avec citation des sources.
- **Test théorique :** Pourquoi le RAG plutôt que tout mettre dans le prompt ; rôle de l'overlap ; pourquoi normaliser les vecteurs ; que retourne exactement la similarité cosinus ; qu'est-ce qui fait échouer un RAG (liste 4 causes) ?
- **Mini-projet :** 'rag-from-scratch' : le pipeline propre en modules (ingest/chunk/embed/search/answer), CLI simple, README expliquant chaque étape. Base du projet 6.
- **Critères de passage :**
  - [ ] Pipeline bout-en-bout fonctionnel
  - [ ] Réponses avec sources correctes sur 8/10 questions test
  - [ ] README pédagogique écrit
- **Exercice d'architecture :** Liste les 6 décisions de conception de ton RAG (taille chunks, overlap, k, modèle d'embedding, format du prompt, seuil de similarité). Pour chacune : comment saurais-tu qu'elle est mauvaise ? (Tu viens d'inventer le besoin d'évaluation — mois 9.)
