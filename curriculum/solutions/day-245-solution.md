# Correction / Grille — Jour 245 : Revue de la semaine 35

[← Retour au jour 245](../days/day-245.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Vector DB, chunking avancé**. Industrialiser le stockage vectoriel et affiner le découpage : les deux fondations d'un RAG qui scale au-delà de la démo.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : migre DocQA vers une vraie vector DB (Chroma en local) — collections, métadonnées, filtres ; puis implémente 2 stratégies de chunking supplémentaires (par structure Markdown/titres, par phrases avec fenêtre) et compare les 3 sur 10 questions.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Que stocke une vector DB en plus des vecteurs ; ANN vs recherche exacte (intuition et trade-off) ; 3 stratégies de chunking et quand chacune gagne ; pourquoi le chunking par structure bat souvent la taille fixe sur de la doc technique ?
- **Mini-projet / livrable** conforme : Rapport de comparaison chunking : 3 stratégies × 10 questions, tableau des résultats (le bon chunk est-il dans le top-3 ?), conclusion argumentée.
- **Exercice d'architecture** fait sérieusement : Ton index doit être reconstruit quand tu changes de stratégie de chunking ou de modèle d'embedding. Conçois le versioning de l'index (comment savoir avec quoi il a été construit, comment migrer sans downtime).

## 📋 Checklist de validation
- [ ] Migration Chroma sans perte de fonctionnalité
- [ ] Filtres métadonnées utilisés
- [ ] Comparaison chunking OBJECTIVE (mêmes questions)
- [ ] Choix final justifié par les données

## 🚦 Critères de passage à la semaine suivante
- [ ] DocQA sur Chroma fonctionnel
- [ ] Rapport chunking avec tableau
- [ ] Auto-éval rag ≥ 3

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
