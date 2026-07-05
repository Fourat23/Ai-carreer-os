# Semaine 12 — SQL : SELECT, JOIN, agrégats ; SQLite branché sur l'API

> **Mois 3** · Compétences : SQL / Data, HTTP / API

[← Mois 3](month-03.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 78](days/day-078.md)
- [Jour 79](days/day-079.md)
- [Jour 80](days/day-080.md)
- [Jour 81](days/day-081.md)
- [Jour 82](days/day-082.md)
- [Jour 83](days/day-083.md)
- [Jour 84](days/day-084.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Les données deviennent persistantes et interrogeables. SQL est une compétence à vie : cette semaine pose les fondations.
- **Test pratique :** 75 min sur une base fournie (livres/auteurs/emprunts) : 10 requêtes — SELECT filtrés, JOIN 2 et 3 tables, GROUP BY + COUNT, tri, LIMIT, une sous-requête. Puis remplace le stockage mémoire de ton API par SQLite (node:sqlite ou better-sqlite3).
- **Test théorique :** Clé primaire vs étrangère ; que fait un JOIN (dessin) ; différence WHERE/HAVING ; pourquoi les requêtes paramétrées empêchent l'injection SQL ; qu'est-ce qu'une transaction ?
- **Mini-projet :** Migration de l'API citations vers SQLite : schéma, script d'initialisation, requêtes paramétrées partout.
- **Critères de passage :**
  - [ ] 9/10 requêtes correctes
  - [ ] API sur SQLite fonctionnelle
  - [ ] Aucune concaténation de SQL dans le code
- **Exercice d'architecture :** Modélise la base du projet 2 (bibliothèque : livres, auteurs, membres, emprunts) : tables, colonnes, clés, relations. Dessin + justification de chaque relation. Compare ensuite avec le modèle proposé dans project-02.md.
