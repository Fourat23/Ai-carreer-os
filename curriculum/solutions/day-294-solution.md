# Correction / Grille — Jour 294 : Revue de la semaine 42

[← Retour au jour 294](../days/day-294.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Architecture : clean/hexagonale, event-driven, queues, cache**. Le bloc architecture qui te fait passer les entretiens système : styles d'architecture, patterns utiles, et surtout les TRADE-OFFS.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : refactore DocQA vers une architecture hexagonale légère — le cœur (pipeline RAG) sans dépendance à l'UI ni à la vector DB concrète (ports/adapters), prouvé par : changer de vector DB = changer UN fichier. Puis schéma avant/après.
- **Test théorique** (réponds de mémoire puis auto-corrige) : 3 tiers vs hexagonale : ce qui change vraiment ; event-driven : cas d'usage et coût de complexité ; à quoi sert une queue (découplage, absorption de pics) ; cache : les 2 problèmes difficiles ; 5 design patterns que tu as DÉJÀ utilisés sans le savoir (nomme-les dans ton code).
- **Mini-projet / livrable** conforme : Note d'architecture comparée : le MÊME besoin (traitement de documents) en monolithe modulaire vs microservices vs event-driven — coûts, complexité, quand chaque option gagne, laquelle tu recommandes pour DocSense et pourquoi.
- **Exercice d'architecture** fait sérieusement : L'exercice de la semaine EST l'exercice d'architecture : la note comparée. Ajoute une section 'ce que je ferais avec 10x le trafic' pour chaque option.

## 📋 Checklist de validation
- [ ] Hexagonal appliqué à MON code (pas un exemple jouet)
- [ ] Le test "changer un adapter" passe
- [ ] Patterns identifiés dans mon propre code
- [ ] Anti-patterns : j'en ai repéré 2 chez moi

## 🚦 Critères de passage à la semaine suivante
- [ ] Refactor hexagonal fonctionnel
- [ ] Note comparative rédigée
- [ ] Auto-éval archi ≥ 3

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
