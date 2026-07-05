# Correction / Grille — Jour 329 : Revue de la semaine 47

[← Retour au jour 329](../days/day-329.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Projet final : workflow d'analyse + CI + revue mensuelle 11**. La fonctionnalité différenciante de DocSense : le workflow d'analyse (résumé structuré, extraction de points clés, détection d'incohérences) — en workflow explicite, pas en agent gadget. CI complète. Revue mensuelle 11.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : Jalon démontrable : sur un document uploadé, DocSense produit une fiche d'analyse structurée (résumé, points clés, questions ouvertes, incohérences éventuelles avec le reste du corpus) — avec le workflow visible dans les logs, et le coût affiché.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Pourquoi un workflow et pas un agent ici (réponds avec TES critères du mois 10) ; que vérifie ta CI et que ne vérifie-t-elle pas ; comment testes-tu un composant qui appelle un LLM (mock, replay, éval) ?
- **Mini-projet / livrable** conforme : CI GitHub Actions complète : lint + tests unitaires + (si faisable) éval smoke sur 5 questions en mode replay/mock.
- **Exercice d'architecture** fait sérieusement : Revue d'architecture + bilan de mi-projet : écarts entre SPEC.md et la réalité, décisions à re-documenter, coupes de scope à assumer pour tenir la v1.0 (liste-les et coupe MAINTENANT).

## 📋 Checklist de validation
- [ ] Workflow d'analyse démontrable
- [ ] Coût par analyse affiché
- [ ] CI verte avec tests réels
- [ ] Revue mensuelle 11 faite

## 🚦 Critères de passage à la semaine suivante
- [ ] Jalon démontré
- [ ] DocSense v0.5 conforme au backlog
- [ ] Revue mensuelle 11 complétée

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
