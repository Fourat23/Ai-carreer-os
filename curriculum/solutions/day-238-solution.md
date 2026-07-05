# Correction / Grille — Jour 238 : Revue de la semaine 34

[← Retour au jour 238](../days/day-238.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **RAG v1 complet multi-formats + revue mensuelle 8**. Ton RAG passe de la démo au réel : PDF/Markdown, métadonnées, interface, robustesse. Revue mensuelle 8 en fin de semaine.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : ajoute au rag-from-scratch — extraction PDF et Markdown, métadonnées par chunk (source, page, section), filtre par document, petite UI (web ou CLI enrichie), gestion des documents mis à jour (ré-ingestion).
- **Test théorique** (réponds de mémoire puis auto-corrige) : Pourquoi les PDF sont pénibles (structure perdue) ; à quoi servent les métadonnées de chunk ; stratégie de mise à jour d'un index ; que faire des tableaux et du code dans les documents ?
- **Mini-projet / livrable** conforme : DocQA v0 : ton RAG sur un corpus RÉEL qui t'intéresse (docs techniques d'un outil, notes de cours...) avec 15 questions de test et tes observations d'échecs.
- **Exercice d'architecture** fait sérieusement : ADR n°6 : stockage des vecteurs — JSON en mémoire vs vraie vector DB. Jusqu'à quelle taille de corpus ton approche actuelle tient-elle ? Calcule un ordre de grandeur (n docs × chunks × dimensions × 4 octets) avant de répondre.

## 📋 Checklist de validation
- [ ] Extraction PDF testée sur de vrais PDF moches
- [ ] Chaque chunk garde sa provenance
- [ ] Ré-ingestion sans doublons
- [ ] Journal des échecs de retrieval tenu

## 🚦 Critères de passage à la semaine suivante
- [ ] Multi-format opérationnel
- [ ] DocQA v0 utilisable sur ton corpus
- [ ] Revue mensuelle 8 complétée
- [ ] Journal d'échecs avec 5+ cas analysés

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
