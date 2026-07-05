# Correction / Grille — Jour 259 : Revue de la semaine 37

[← Retour au jour 259](../days/day-259.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Évaluation LLM/RAG : golden set, LLM-as-judge, métriques**. LA semaine différenciante de ton profil : évaluer un système LLM avec rigueur. Golden set, juges automatiques, métriques de fidélité et pertinence.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : construis un golden set de 30 questions/réponses attendues sur ton corpus (variées : factuelle, synthèse, absente du corpus, ambiguë) ; implémente 2 évaluateurs — un programmatique (le bon chunk est-il retrouvé ? rappel@k) et un LLM-as-judge (fidélité de la réponse aux sources, avec prompt de jugement strict).
- **Test théorique** (réponds de mémoire puis auto-corrige) : Pourquoi évaluer retrieval et génération SÉPARÉMENT ; fidélité vs pertinence vs exactitude ; biais connus du LLM-as-judge (position, verbosité, auto-préférence) et parades ; qu'est-ce qu'un bon golden set ?
- **Mini-projet / livrable** conforme : Harnais d'évaluation automatisé : une commande qui fait tourner le golden set et sort un rapport (scores par question + agrégats). Il resservira toute l'année.
- **Exercice d'architecture** fait sérieusement : Ton juge LLM se trompe parfois. Comment évalues-tu l'évaluateur ? (accord avec tes jugements humains sur un échantillon, kappa intuitif). Combien de cas humains faut-il ? Écris ton protocole.

## 📋 Checklist de validation
- [ ] Golden set varié (au moins 4 types de questions)
- [ ] Questions SANS réponse dans le corpus incluses
- [ ] Juge LLM calibré sur 5 cas vérifiés à la main
- [ ] Rapport reproductible en une commande

## 🚦 Critères de passage à la semaine suivante
- [ ] Harnais opérationnel
- [ ] 30 questions évaluées automatiquement
- [ ] Scores de base établis (avant optimisation mois 9)

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
