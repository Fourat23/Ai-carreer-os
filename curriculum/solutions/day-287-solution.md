# Correction / Grille — Jour 287 : Revue de la semaine 41

[← Retour au jour 287](../days/day-287.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Workflows, orchestration, coûts, caching**. L'alternative sobre aux agents : des workflows explicites, orchestrés, moins chers et plus fiables. Plus la discipline des coûts.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : transforme le vérificateur de docs en workflow explicite (étapes fixes : lister → extraire les claims → comparer → rapporter), compare avec la version agent : coût total, latence, fiabilité sur 5 exécutions, qualité du résultat.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Chaînage vs parallélisation vs routage vs évaluateur-optimiseur (les 4 patterns de workflow) ; quand le non-déterminisme de l'agent se justifie ; comment estimer le coût d'un workflow avant de le lancer ; que cacher et à quel niveau ?
- **Mini-projet / livrable** conforme : Ajoute un cache (fichier ou SQLite) aux appels LLM de tes outils : clé = hash(prompt+modèle), invalidation raisonnée, taux de hit mesuré sur tes évaluations répétées.
- **Exercice d'architecture** fait sérieusement : Conçois l'orchestration 'analyse quotidienne de 500 documents' : découpage en étapes, parallélisation, reprise sur échec partiel, budget coût, alerte si dérive. Schéma + 1 page.

## 📋 Checklist de validation
- [ ] Workflow explicite implémenté
- [ ] Comparaison agent/workflow chiffrée
- [ ] Cache avec taux de hit mesuré
- [ ] Coût par exécution connu au centime

## 🚦 Critères de passage à la semaine suivante
- [ ] Comparaison honnête documentée
- [ ] Cache fonctionnel (hit > 50% sur relances)
- [ ] Je sais dire quand chaque approche gagne

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
