# Semaine 34 — RAG v1 complet multi-formats + revue mensuelle 8

> **Mois 8** · Compétences : RAG, Software engineering

[← Mois 8](month-08.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 232](days/day-232.md)
- [Jour 233](days/day-233.md)
- [Jour 234](days/day-234.md)
- [Jour 235](days/day-235.md)
- [Jour 236](days/day-236.md)
- [Jour 237](days/day-237.md)
- [Jour 238](days/day-238.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Ton RAG passe de la démo au réel : PDF/Markdown, métadonnées, interface, robustesse. Revue mensuelle 8 en fin de semaine.
- **Test pratique :** 90 min : ajoute au rag-from-scratch — extraction PDF et Markdown, métadonnées par chunk (source, page, section), filtre par document, petite UI (web ou CLI enrichie), gestion des documents mis à jour (ré-ingestion).
- **Test théorique :** Pourquoi les PDF sont pénibles (structure perdue) ; à quoi servent les métadonnées de chunk ; stratégie de mise à jour d'un index ; que faire des tableaux et du code dans les documents ?
- **Mini-projet :** DocQA v0 : ton RAG sur un corpus RÉEL qui t'intéresse (docs techniques d'un outil, notes de cours...) avec 15 questions de test et tes observations d'échecs.
- **Critères de passage :**
  - [ ] Multi-format opérationnel
  - [ ] DocQA v0 utilisable sur ton corpus
  - [ ] Revue mensuelle 8 complétée
  - [ ] Journal d'échecs avec 5+ cas analysés
- **Exercice d'architecture :** ADR n°6 : stockage des vecteurs — JSON en mémoire vs vraie vector DB. Jusqu'à quelle taille de corpus ton approche actuelle tient-elle ? Calcule un ordre de grandeur (n docs × chunks × dimensions × 4 octets) avant de répondre.
