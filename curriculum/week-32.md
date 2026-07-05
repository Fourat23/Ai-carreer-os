# Semaine 32 — Function calling, tool use, intégration app

> **Mois 8** · Compétences : LLM, JavaScript / TypeScript

[← Mois 8](month-08.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 218](days/day-218.md)
- [Jour 219](days/day-219.md)
- [Jour 220](days/day-220.md)
- [Jour 221](days/day-221.md)
- [Jour 222](days/day-222.md)
- [Jour 223](days/day-223.md)
- [Jour 224](days/day-224.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Le LLM qui agit : déclarer des outils, router les appels, exécuter côté code, renvoyer les résultats. La base des agents, comprise mécaniquement.
- **Test pratique :** 90 min : assistant météo+calcul : 2 outils déclarés (get_weather mockée, calculate), boucle complète requête→tool_call→exécution→réponse finale, gestion du cas 'aucun outil nécessaire' et 'outil échoue'.
- **Test théorique :** Qui exécute les outils (le modèle ou ton code) ; que contient une déclaration d'outil ; pourquoi décrire précisément les paramètres ; que renvoyer au modèle après exécution ; quand le function calling est-il un mauvais choix ?
- **Mini-projet :** Intègre un appel LLM utile dans une de TES apps précédentes (ex : BiblioApp — résumé de livre, ou TaskFlow — décomposition de tâche), proprement : module dédié, erreurs gérées, coût loggé.
- **Critères de passage :**
  - [ ] Assistant 2-outils robuste
  - [ ] Intégration dans ton app fonctionnelle
  - [ ] Dégradation gracieuse démontrée
- **Exercice d'architecture :** Ton app dépend maintenant d'une API externe non-déterministe. Qu'est-ce que ça impose : timeouts, retries, circuit breaker (intuition), cache, mode dégradé ? Écris la politique d'appel de ton intégration.
