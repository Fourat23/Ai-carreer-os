# Semaine 31 — Prompts en production, guardrails, function calling avancé ; ouverture du RAG

> **Mois 8** · Compétences : LLM, Agents

[← Mois 8](month-08.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 211](days/day-211.md)
- [Jour 212](days/day-212.md)
- [Jour 213](days/day-213.md)
- [Jour 214](days/day-214.md)
- [Jour 215](days/day-215.md)
- [Jour 216](days/day-216.md)
- [Jour 217](days/day-217.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Le LLM qui agit : déclarer des outils, router les appels, exécuter côté code, renvoyer les résultats. La base des agents, comprise mécaniquement.
- **Test pratique :** 90 min : assistant météo+calcul : 2 outils déclarés (get_weather mockée, calculate), boucle complète requête→tool_call→exécution→réponse finale, gestion du cas 'aucun outil nécessaire' et 'outil échoue'.
- **Test théorique :** Qui exécute les outils (le modèle ou ton code) ; que contient une déclaration d'outil ; pourquoi décrire précisément les paramètres ; que renvoyer au modèle après exécution ; quand le function calling est-il un mauvais choix ; qu'est-ce qu'un guardrail d'ENTRÉE et un guardrail de SORTIE, et pourquoi les deux sont nécessaires ; et enfin : quelle limite d'un LLM le RAG vient-il précisément lever ?
- **Mini-projet :** Intègre un appel LLM utile dans une de TES apps précédentes (ex : BiblioApp — résumé de livre, ou TaskFlow — décomposition de tâche), proprement : module dédié, erreurs gérées, coût loggé.
- **Critères de passage :**
  - [ ] Assistant 2-outils robuste
  - [ ] Intégration dans ton app fonctionnelle
  - [ ] Dégradation gracieuse démontrée
- **Exercice d'architecture :** Ton app dépend maintenant d'une API externe non-déterministe. Qu'est-ce que ça impose : timeouts, retries, circuit breaker (intuition), cache, mode dégradé ? Écris la politique d'appel de ton intégration.
