# Correction / Grille — Jour 84 : Revue de la semaine 12

[← Retour au jour 84](../days/day-084.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **SQL : SELECT, JOIN, agrégats ; SQLite branché sur l'API**. Les données deviennent persistantes et interrogeables. SQL est une compétence à vie : cette semaine pose les fondations.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 75 min sur une base fournie (livres/auteurs/emprunts) : 10 requêtes — SELECT filtrés, JOIN 2 et 3 tables, GROUP BY + COUNT, tri, LIMIT, une sous-requête. Puis remplace le stockage mémoire de ton API par SQLite (node:sqlite ou better-sqlite3).
- **Test théorique** (réponds de mémoire puis auto-corrige) : Clé primaire vs étrangère ; que fait un JOIN (dessin) ; différence WHERE/HAVING ; pourquoi les requêtes paramétrées empêchent l'injection SQL ; qu'est-ce qu'une transaction ?
- **Mini-projet / livrable** conforme : Migration de l'API citations vers SQLite : schéma, script d'initialisation, requêtes paramétrées partout.
- **Exercice d'architecture** fait sérieusement : Modélise la base du projet 2 (bibliothèque : livres, auteurs, membres, emprunts) : tables, colonnes, clés, relations. Dessin + justification de chaque relation. Compare ensuite avec le modèle proposé dans project-02.md.

## 📋 Checklist de validation
- [ ] JOIN écrits sans copier
- [ ] 100% requêtes paramétrées
- [ ] Schéma versionné dans Git (init.sql)
- [ ] Je vérifie mes requêtes dans un client SQL avant de les coder

## 🚦 Critères de passage à la semaine suivante
- [ ] 9/10 requêtes correctes
- [ ] API sur SQLite fonctionnelle
- [ ] Aucune concaténation de SQL dans le code

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
