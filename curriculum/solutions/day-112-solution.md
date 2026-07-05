# Correction / Grille — Jour 112 : Revue de la semaine 16

[← Retour au jour 112](../days/day-112.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Full-stack réel : front + API + auth simple, tests unitaires**. Assembler les deux mondes proprement, protéger des routes avec un token simple, et écrire tes premiers vrais tests automatisés.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : ajoute à l'ensemble citations — un token d'API simple (header vérifié par middleware), le front qui l'envoie, et 6 tests Vitest sur la logique métier (validation, formatage, filtres).
- **Test théorique** (réponds de mémoire puis auto-corrige) : Pourquoi l'auth par header et pas dans l'URL ; qu'est-ce que CORS et pourquoi ton front le déclenche ; que teste un test unitaire vs un test d'intégration ; qu'est-ce qu'un mock ?
- **Mini-projet / livrable** conforme : Suite de tests du squelette d'API (semaine 11) : au moins 10 tests couvrant validation et services.
- **Exercice d'architecture** fait sérieusement : Pourquoi la logique métier dans les routes Express est-elle difficile à tester ? Refactore UNE route pour extraire la logique en fonction pure testée. Mesure : nombre de lignes de test nécessaires avant/après.

## 📋 Checklist de validation
- [ ] CORS compris et configuré (pas copié)
- [ ] Secrets hors du code (fichier .env, .gitignore)
- [ ] Tests qui échouent si je casse le code (vérifié !)
- [ ] La logique testable est séparée d'Express

## 🚦 Critères de passage à la semaine suivante
- [ ] Auth fonctionnelle front→API
- [ ] 10+ tests verts, et rouges quand on sabote
- [ ] Auto-éval se ≥ 3

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
