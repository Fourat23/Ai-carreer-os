# Semaine 7 — Programmation fonctionnelle en TS, puis PROJET 1 : TaskFlow CLI

> **Mois 2** · Compétences : JavaScript / TypeScript, Software engineering

[← Mois 2](month-02.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 43](days/day-043.md)
- [Jour 44](days/day-044.md)
- [Jour 45](days/day-045.md)
- [Jour 46](days/day-046.md)
- [Jour 47](days/day-047.md)
- [Jour 48](days/day-048.md)
- [Jour 49](days/day-049.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Première semaine à dominante projet. La composition et la pureté vues lundi ne restent pas théoriques : elles servent dès le lendemain à construire TaskFlow. Objectif : LIVRER, pas perfectionner. Le projet suit la spec de curriculum/projects/project-01.md.
- **Test pratique :** Le projet EST le test : CRUD complet, persistance JSON, commandes list/add/done/rm/stats, gestion d'erreurs propre (fichier absent, id inconnu, JSON corrompu). Il doit tourner depuis un terminal vierge, avec les seules instructions de ton README.
- **Test théorique :** Ce qu'est une fonction pure et ce que la pureté te fait gagner quand tu débogues ; pourquoi composer de petites fonctions bat une grosse fonction paramétrée ; où ton projet garde son ÉTAT et pourquoi il est isolé ; quels cas d'erreur tu as traités et lesquels tu as sciemment laissés de côté (les deux réponses comptent) ; et l'auto-révision du mois 2 : les 15 questions de month-02.md, sans notes.
- **Mini-projet :** TaskFlow lui-même, plus son README (template dans le fichier projet) et une ADR de dix lignes : pourquoi JSON plutôt qu'une base, et à partir de quel volume ce choix deviendrait mauvais.
- **Critères de passage :**
  - [ ] CRUD complet fonctionnel et persistant
  - [ ] Trois cas d'erreur démontrés en direct
  - [ ] README suffisant pour un inconnu
  - [ ] Auto-révision mois 2 faite et corrigée
- **Exercice d'architecture :** TaskFlow écrit tout son fichier JSON à chaque commande. Décris ce qui se passe à 10 000 tâches, puis à deux processus qui écrivent en même temps. Choisis la parade que tu appliquerais en premier et dis pourquoi les autres attendent.
