# Correction / Grille — Jour 224 : Revue de la semaine 32

[← Retour au jour 224](../days/day-224.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Function calling, tool use, intégration app**. Le LLM qui agit : déclarer des outils, router les appels, exécuter côté code, renvoyer les résultats. La base des agents, comprise mécaniquement.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : assistant météo+calcul : 2 outils déclarés (get_weather mockée, calculate), boucle complète requête→tool_call→exécution→réponse finale, gestion du cas 'aucun outil nécessaire' et 'outil échoue'.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Qui exécute les outils (le modèle ou ton code) ; que contient une déclaration d'outil ; pourquoi décrire précisément les paramètres ; que renvoyer au modèle après exécution ; quand le function calling est-il un mauvais choix ?
- **Mini-projet / livrable** conforme : Intègre un appel LLM utile dans une de TES apps précédentes (ex : BiblioApp — résumé de livre, ou TaskFlow — décomposition de tâche), proprement : module dédié, erreurs gérées, coût loggé.
- **Exercice d'architecture** fait sérieusement : Ton app dépend maintenant d'une API externe non-déterministe. Qu'est-ce que ça impose : timeouts, retries, circuit breaker (intuition), cache, mode dégradé ? Écris la politique d'appel de ton intégration.

## 📋 Checklist de validation
- [ ] La boucle tool-call écrite à la main une fois
- [ ] Timeout et erreurs d'outil gérés
- [ ] Je logge chaque appel (tokens, latence, coût)
- [ ] L'app reste utilisable si le LLM est down

## 🚦 Critères de passage à la semaine suivante
- [ ] Assistant 2-outils robuste
- [ ] Intégration dans ton app fonctionnelle
- [ ] Dégradation gracieuse démontrée

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
