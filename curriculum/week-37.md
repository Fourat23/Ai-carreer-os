# Semaine 37 — Évaluation LLM/RAG : golden set, LLM-as-judge, métriques

> **Mois 9** · Compétences : Évaluation IA, RAG

[← Mois 9](month-09.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 253](days/day-253.md)
- [Jour 254](days/day-254.md)
- [Jour 255](days/day-255.md)
- [Jour 256](days/day-256.md)
- [Jour 257](days/day-257.md)
- [Jour 258](days/day-258.md)
- [Jour 259](days/day-259.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** LA semaine différenciante de ton profil : évaluer un système LLM avec rigueur. Golden set, juges automatiques, métriques de fidélité et pertinence.
- **Test pratique :** 90 min : construis un golden set de 30 questions/réponses attendues sur ton corpus (variées : factuelle, synthèse, absente du corpus, ambiguë) ; implémente 2 évaluateurs — un programmatique (le bon chunk est-il retrouvé ? rappel@k) et un LLM-as-judge (fidélité de la réponse aux sources, avec prompt de jugement strict).
- **Test théorique :** Pourquoi évaluer retrieval et génération SÉPARÉMENT ; fidélité vs pertinence vs exactitude ; biais connus du LLM-as-judge (position, verbosité, auto-préférence) et parades ; qu'est-ce qu'un bon golden set ?
- **Mini-projet :** Harnais d'évaluation automatisé : une commande qui fait tourner le golden set et sort un rapport (scores par question + agrégats). Il resservira toute l'année.
- **Critères de passage :**
  - [ ] Harnais opérationnel
  - [ ] 30 questions évaluées automatiquement
  - [ ] Scores de base établis (avant optimisation mois 9)
- **Exercice d'architecture :** Ton juge LLM se trompe parfois. Comment évalues-tu l'évaluateur ? (accord avec tes jugements humains sur un échantillon, kappa intuitif). Combien de cas humains faut-il ? Écris ton protocole.
