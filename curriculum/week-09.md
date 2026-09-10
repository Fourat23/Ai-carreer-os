# Semaine 9 — SQLite branché sur l'API, modélisation et transactions, Postman avancé ; démarrage du PROJET 2

> **Mois 3** · Compétences : SQL / Data, HTTP / API, Software engineering

[← Mois 3](month-03.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 57](days/day-057.md)
- [Jour 58](days/day-058.md)
- [Jour 59](days/day-059.md)
- [Jour 60](days/day-060.md)
- [Jour 61](days/day-061.md)
- [Jour 62](days/day-062.md)
- [Jour 63](days/day-063.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Les données deviennent persistantes et interrogeables, et le stockage mémoire de la semaine dernière disparaît pour de bon. SQL est une compétence à vie : cette semaine pose les fondations, et le projet 2 commence dès jeudi sur un vrai schéma.
- **Test pratique :** 75 min : remplace le stockage mémoire de ton API citations par SQLite — schéma, script d'initialisation, requêtes PARAMÉTRÉES partout. Puis, sur une base fournie (livres/auteurs/emprunts) : dix requêtes — SELECT filtrés, JOIN sur deux puis trois tables, GROUP BY + COUNT, tri, LIMIT, une sous-requête. Termine en tentant une injection SQL sur ta propre API et montre pourquoi elle échoue.
- **Test théorique :** Clé primaire vs clé étrangère ; 1NF/2NF/3NF en une phrase chacune ; ce que fait un index et ce qu'il coûte à l'écriture ; différence WHERE/HAVING ; ACID, les quatre lettres avec un exemple chacune ; pourquoi une requête paramétrée empêche l'injection alors qu'un échappement manuel ne suffit pas ; quand dénormaliser, et ce qu'on accepte de perdre en le faisant.
- **Mini-projet :** La collection Postman du projet 2 : chaque route du contrat LivreAPI, avec variables d'environnement, tests automatisés sur les statuts, et un scénario complet emprunt → retour qui s'exécute d'un seul clic.
- **Critères de passage :**
  - [ ] API migrée sur SQLite, requêtes paramétrées partout
  - [ ] 10/10 requêtes analytiques justes
  - [ ] Collection Postman exécutable de bout en bout
  - [ ] Schéma et contrat du projet 2 validés avant de coder
- **Exercice d'architecture :** Ton API fait une requête par ligne affichée. Explique le problème N+1 avec ton propre schéma, mesure-le sur cinquante livres, puis corrige-le par un JOIN. Écris ensuite pourquoi ce problème ne se voit jamais en développement et toujours en production.
