# Correction / Grille — Jour 49 : Revue de la semaine 7

[← Retour au jour 49](../days/day-049.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Programmation fonctionnelle en TS, puis PROJET 1 : TaskFlow CLI**. Première semaine à dominante projet. La composition et la pureté vues lundi ne restent pas théoriques : elles servent dès le lendemain à construire TaskFlow. Objectif : LIVRER, pas perfectionner. Le projet suit la spec de curriculum/projects/project-01.md.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : Le projet EST le test : CRUD complet, persistance JSON, commandes list/add/done/rm/stats, gestion d'erreurs propre (fichier absent, id inconnu, JSON corrompu). Il doit tourner depuis un terminal vierge, avec les seules instructions de ton README.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Ce qu'est une fonction pure et ce que la pureté te fait gagner quand tu débogues ; pourquoi composer de petites fonctions bat une grosse fonction paramétrée ; où ton projet garde son ÉTAT et pourquoi il est isolé ; quels cas d'erreur tu as traités et lesquels tu as sciemment laissés de côté (les deux réponses comptent) ; et l'auto-révision du mois 2 : les 15 questions de month-02.md, sans notes.
- **Mini-projet / livrable** conforme : TaskFlow lui-même, plus son README (template dans le fichier projet) et une ADR de dix lignes : pourquoi JSON plutôt qu'une base, et à partir de quel volume ce choix deviendrait mauvais.
- **Exercice d'architecture** fait sérieusement : TaskFlow écrit tout son fichier JSON à chaque commande. Décris ce qui se passe à 10 000 tâches, puis à deux processus qui écrivent en même temps. Choisis la parade que tu appliquerais en premier et dis pourquoi les autres attendent.

## 📋 Checklist de validation
- [ ] TaskFlow tourne depuis un terminal vierge en suivant mon seul README
- [ ] Les fonctions de logique sont pures et testables sans fichier
- [ ] Chaque commande a son cas d'erreur traité
- [ ] J'ai livré une version qui marche avant de vouloir l'améliorer

## 🚦 Critères de passage à la semaine suivante
- [ ] CRUD complet fonctionnel et persistant
- [ ] Trois cas d'erreur démontrés en direct
- [ ] README suffisant pour un inconnu
- [ ] Auto-révision mois 2 faite et corrigée

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
