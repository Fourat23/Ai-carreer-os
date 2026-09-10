# Semaine 33 — RAG v1 multi-formats, métadonnées, DocQA v0 sur corpus réel

> **Mois 8** · Compétences : RAG

[← Mois 8](month-08.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 225](days/day-225.md)
- [Jour 226](days/day-226.md)
- [Jour 227](days/day-227.md)
- [Jour 228](days/day-228.md)
- [Jour 229](days/day-229.md)
- [Jour 230](days/day-230.md)
- [Jour 231](days/day-231.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Ton RAG passe de la démo au réel : PDF/Markdown, métadonnées, interface, robustesse.
- **Test pratique :** 90 min : ajoute au rag-from-scratch — extraction PDF et Markdown, métadonnées par chunk (source, page, section), filtre par document, petite UI (web ou CLI enrichie), gestion des documents mis à jour (ré-ingestion).
- **Test théorique :** Pourquoi les PDF sont pénibles (structure perdue) ; à quoi servent les métadonnées de chunk ; stratégie de mise à jour d'un index ; que faire des tableaux et du code dans les documents ?
- **Mini-projet :** DocQA v0 : ton RAG sur un corpus RÉEL qui t'intéresse (docs techniques d'un outil, notes de cours...) avec 15 questions de test et tes observations d'échecs.
- **Critères de passage :**
  - [ ] Multi-format opérationnel
  - [ ] DocQA v0 utilisable sur ton corpus
  - [ ] Journal d'échecs avec 5+ cas analysés
- **Exercice d'architecture :** ADR n°6 : stockage des vecteurs — JSON en mémoire vs vraie vector DB. Jusqu'à quelle taille de corpus ton approche actuelle tient-elle ? Calcule un ordre de grandeur (n docs × chunks × dimensions × 4 octets) avant de répondre.
