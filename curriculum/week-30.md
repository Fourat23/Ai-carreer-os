# Semaine 30 — LLM : fonctionnement, APIs, hallucinations + revue mensuelle 7

> **Mois 7** · Compétences : LLM

[← Mois 7](month-07.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 204](days/day-204.md)
- [Jour 205](days/day-205.md)
- [Jour 206](days/day-206.md)
- [Jour 207](days/day-207.md)
- [Jour 208](days/day-208.md)
- [Jour 209](days/day-209.md)
- [Jour 210](days/day-210.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Tu utilises enfin des LLM en sachant ce qu'il y a dedans. Appels API propres, paramètres compris, limites mesurées toi-même. Revue mensuelle 7 en fin de semaine.
- **Test pratique :** 75 min : script (Node ou Python) qui appelle une API LLM — system prompt, température comparée (0 vs 1) sur 5 prompts, streaming, comptage de tokens et coût calculé, 3 hallucinations provoquées et documentées.
- **Test théorique :** Qu'est-ce qu'un LLM prédit exactement ; pourquoi il hallucine (mécanisme, pas morale) ; température/top-p ; pourquoi le même prompt donne des réponses différentes ; que contient VRAIMENT le contexte envoyé ?
- **Mini-projet :** Petit banc d'essai : 10 questions dont tu connais les réponses, posées à 2 modèles, avec un tableau juste/faux/inventé et 10 lignes de conclusions.
- **Critères de passage :**
  - [ ] Script API complet fonctionnel
  - [ ] Banc d'essai documenté
  - [ ] Revue mensuelle 7 complétée
  - [ ] Note transformer publiée (livrable mois 7)
- **Exercice d'architecture :** Un LLM dans une architecture n'est PAS une base de données ni un moteur de règles. Écris 5 propriétés d'ingénierie qui le distinguent (non-déterminisme, latence, coût/appel, faillibilité, dérive) et ce que chacune impose à ton code appelant.
