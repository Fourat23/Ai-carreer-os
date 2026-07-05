# Correction / Grille — Jour 231 : Revue de la semaine 33

[← Retour au jour 231](../days/day-231.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **RAG v1 : chunking, embeddings, retrieval naïf**. Ton premier RAG, SANS framework : chaque étape codée et comprise. C'est le savoir-faire le plus demandé du marché junior IA.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : pipeline complet sur 5 documents texte — découpage en chunks (taille fixe + overlap), embeddings via API, stockage (JSON suffit), recherche par similarité cosinus (implémentée TOI-même), top-k injecté dans le prompt, réponse avec citation des sources.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Pourquoi le RAG plutôt que tout mettre dans le prompt ; rôle de l'overlap ; pourquoi normaliser les vecteurs ; que retourne exactement la similarité cosinus ; qu'est-ce qui fait échouer un RAG (liste 4 causes) ?
- **Mini-projet / livrable** conforme : 'rag-from-scratch' : le pipeline propre en modules (ingest/chunk/embed/search/answer), CLI simple, README expliquant chaque étape. Base du projet 6.
- **Exercice d'architecture** fait sérieusement : Liste les 6 décisions de conception de ton RAG (taille chunks, overlap, k, modèle d'embedding, format du prompt, seuil de similarité). Pour chacune : comment saurais-tu qu'elle est mauvaise ? (Tu viens d'inventer le besoin d'évaluation — mois 9.)

## 📋 Checklist de validation
- [ ] Similarité cosinus codée à la main (une fois)
- [ ] Zéro framework RAG
- [ ] Citations des sources dans chaque réponse
- [ ] J'ai lu mes chunks (oui, avec les yeux)

## 🚦 Critères de passage à la semaine suivante
- [ ] Pipeline bout-en-bout fonctionnel
- [ ] Réponses avec sources correctes sur 8/10 questions test
- [ ] README pédagogique écrit

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
