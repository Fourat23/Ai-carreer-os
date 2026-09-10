# Correction / Grille — Jour 63 : Revue de la semaine 9

[← Retour au jour 63](../days/day-063.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **SQLite branché sur l'API, modélisation et transactions, Postman avancé ; démarrage du PROJET 2**. Les données deviennent persistantes et interrogeables, et le stockage mémoire de la semaine dernière disparaît pour de bon. SQL est une compétence à vie : cette semaine pose les fondations, et le projet 2 commence dès jeudi sur un vrai schéma.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 75 min : remplace le stockage mémoire de ton API citations par SQLite — schéma, script d'initialisation, requêtes PARAMÉTRÉES partout. Puis, sur une base fournie (livres/auteurs/emprunts) : dix requêtes — SELECT filtrés, JOIN sur deux puis trois tables, GROUP BY + COUNT, tri, LIMIT, une sous-requête. Termine en tentant une injection SQL sur ta propre API et montre pourquoi elle échoue.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Clé primaire vs clé étrangère ; 1NF/2NF/3NF en une phrase chacune ; ce que fait un index et ce qu'il coûte à l'écriture ; différence WHERE/HAVING ; ACID, les quatre lettres avec un exemple chacune ; pourquoi une requête paramétrée empêche l'injection alors qu'un échappement manuel ne suffit pas ; quand dénormaliser, et ce qu'on accepte de perdre en le faisant.
- **Mini-projet / livrable** conforme : La collection Postman du projet 2 : chaque route du contrat LivreAPI, avec variables d'environnement, tests automatisés sur les statuts, et un scénario complet emprunt → retour qui s'exécute d'un seul clic.
- **Exercice d'architecture** fait sérieusement : Ton API fait une requête par ligne affichée. Explique le problème N+1 avec ton propre schéma, mesure-le sur cinquante livres, puis corrige-le par un JOIN. Écris ensuite pourquoi ce problème ne se voit jamais en développement et toujours en production.

## 📋 Checklist de validation
- [ ] Zéro concaténation de chaîne dans une requête SQL
- [ ] Mon schéma a des clés étrangères réelles, pas des conventions
- [ ] J'ai mesuré l'effet d'un index sur une table de plusieurs milliers de lignes
- [ ] La collection Postman tourne sans intervention manuelle

## 🚦 Critères de passage à la semaine suivante
- [ ] API migrée sur SQLite, requêtes paramétrées partout
- [ ] 10/10 requêtes analytiques justes
- [ ] Collection Postman exécutable de bout en bout
- [ ] Schéma et contrat du projet 2 validés avant de coder

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
