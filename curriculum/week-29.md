# Semaine 29 — LLM : fonctionnement, APIs, tokens et coûts, hallucinations

> **Mois 7** · Compétences : LLM

[← Mois 7](month-07.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 197](days/day-197.md)
- [Jour 198](days/day-198.md)
- [Jour 199](days/day-199.md)
- [Jour 200](days/day-200.md)
- [Jour 201](days/day-201.md)
- [Jour 202](days/day-202.md)
- [Jour 203](days/day-203.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Tu utilises enfin des LLM en sachant ce qu'il y a dedans. Appels API propres, paramètres compris, limites mesurées toi-même.
- **Test pratique :** 75 min : script (Node ou Python) qui appelle une API LLM — system prompt, température comparée (0 vs 1) sur 5 prompts, streaming, comptage de tokens et coût calculé, 3 hallucinations provoquées et documentées.
- **Test théorique :** Qu'est-ce qu'un LLM prédit exactement ; pourquoi il hallucine (mécanisme, pas morale) ; température/top-p ; pourquoi le même prompt donne des réponses différentes ; que contient VRAIMENT le contexte envoyé ?
- **Mini-projet :** Petit banc d'essai : 10 questions dont tu connais les réponses, posées à 2 modèles, avec un tableau juste/faux/inventé et 10 lignes de conclusions.
- **Critères de passage :**
  - [ ] Script API complet fonctionnel
  - [ ] Banc d'essai documenté
- **Exercice d'architecture :** Un LLM dans une architecture n'est PAS une base de données ni un moteur de règles. Écris 5 propriétés d'ingénierie qui le distinguent (non-déterminisme, latence, coût/appel, faillibilité, dérive) et ce que chacune impose à ton code appelant.
