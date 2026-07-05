# Correction / Grille — Jour 49 : Revue de la semaine 7

[← Retour au jour 49](../days/day-049.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **TypeScript sérieux, POO, programmation fonctionnelle de base**. Tu écris maintenant du TypeScript par défaut. POO et FP ne sont pas des religions : ce sont deux outils, tu apprends à choisir.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 75 min : modélise en TS un système de paiement (interface `MoyenPaiement`, classes `Carte`/`Paypal`/`Virement`, fonction `payer` polymorphe) ; puis la même chose en style fonctionnel (union types + fonctions). Compare.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Interface vs type ; génériques : à quoi ça sert (exemple) ; les 4 piliers POO avec exemples courts ; fonction pure et pourquoi c'est testable ; qu'est-ce que l'injection de dépendance (intuition).
- **Mini-projet / livrable** conforme : Refactor de TaskFlow (préparation projet 1) : conçois les types/interfaces du futur CLI (Task, Store, Commands) sans encore tout implémenter.
- **Exercice d'architecture** fait sérieusement : Dans TaskFlow, la persistance (JSON) peut changer plus tard (SQLite). Conçois l'interface `Store` pour que le reste du code ne sache PAS où sont stockées les données. C'est ta première inversion de dépendance.

## 📋 Checklist de validation
- [ ] Génériques simples utilisés à bon escient
- [ ] Je choisis POO ou FP avec une raison
- [ ] Aucun any non justifié
- [ ] Interfaces pensées avant l'implémentation

## 🚦 Critères de passage à la semaine suivante
- [ ] Les 2 versions du test compilent et fonctionnent
- [ ] Comparaison écrite POO vs FP (10 lignes)
- [ ] Types de TaskFlow validés contre la spec du projet

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
