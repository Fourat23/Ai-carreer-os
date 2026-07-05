# Semaine 35 — Vector DB, chunking avancé

> **Mois 9** · Compétences : RAG, SQL / Data

[← Mois 9](month-09.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 239](days/day-239.md)
- [Jour 240](days/day-240.md)
- [Jour 241](days/day-241.md)
- [Jour 242](days/day-242.md)
- [Jour 243](days/day-243.md)
- [Jour 244](days/day-244.md)
- [Jour 245](days/day-245.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Industrialiser le stockage vectoriel et affiner le découpage : les deux fondations d'un RAG qui scale au-delà de la démo.
- **Test pratique :** 90 min : migre DocQA vers une vraie vector DB (Chroma en local) — collections, métadonnées, filtres ; puis implémente 2 stratégies de chunking supplémentaires (par structure Markdown/titres, par phrases avec fenêtre) et compare les 3 sur 10 questions.
- **Test théorique :** Que stocke une vector DB en plus des vecteurs ; ANN vs recherche exacte (intuition et trade-off) ; 3 stratégies de chunking et quand chacune gagne ; pourquoi le chunking par structure bat souvent la taille fixe sur de la doc technique ?
- **Mini-projet :** Rapport de comparaison chunking : 3 stratégies × 10 questions, tableau des résultats (le bon chunk est-il dans le top-3 ?), conclusion argumentée.
- **Critères de passage :**
  - [ ] DocQA sur Chroma fonctionnel
  - [ ] Rapport chunking avec tableau
  - [ ] Auto-éval rag ≥ 3
- **Exercice d'architecture :** Ton index doit être reconstruit quand tu changes de stratégie de chunking ou de modèle d'embedding. Conçois le versioning de l'index (comment savoir avec quoi il a été construit, comment migrer sans downtime).
