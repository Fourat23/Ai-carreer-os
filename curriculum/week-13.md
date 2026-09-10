# Semaine 13 — PROJET 2 durci et raconté ; premier full-stack React + revue mensuelle 3

> **Mois 3** · Compétences : JavaScript / TypeScript, Communication technique, Software engineering

[← Mois 3](month-03.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 85](days/day-085.md)
- [Jour 86](days/day-086.md)
- [Jour 87](days/day-087.md)
- [Jour 88](days/day-088.md)
- [Jour 89](days/day-089.md)
- [Jour 90](days/day-090.md)
- [Jour 91](days/day-091.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Deux mouvements dans la même semaine : LivreAPI est durcie et devient une pièce de portfolio qu'on sait raconter, et le front fait son entrée — React, la consommation de ta propre API, une mini-app de bout en bout. La semaine ferme le mois 3 et le premier trimestre.
- **Test pratique :** 90 min : durcis LivreAPI (limites de charge sur les routes coûteuses, cache sur les lectures, logs exploitables) et mesure le gain. Puis, en React : une mini-app qui consomme TON API — liste, détail, formulaire d'ajout, avec les trois états rendus explicitement à l'écran (chargement, erreur, succès). Le test est réussi quand tu coupes ton API en direct et que l'interface reste compréhensible.
- **Test théorique :** Ce que tu as durci et le chiffre qui le prouve ; comment tu racontes ce projet en deux minutes à quelqu'un qui n'est pas développeur ; ce qu'est un composant React et ce que « l'état » y désigne ; pourquoi un appel réseau ne se fait pas pendant le rendu ; les trois états d'une donnée asynchrone et ce qui arrive quand on en oublie un ; et l'auto-révision du mois 3 : les questions de month-03.md, sans notes.
- **Mini-projet :** La fiche projet de LivreAPI pour ton portfolio : le problème résolu en une phrase, la démo de deux minutes, les décisions d'architecture, les chiffres de performance avant/après. Plus le bilan du trimestre 1 : ce que tu sais faire aujourd'hui et que tu ne savais pas au jour 1, en preuves, pas en adjectifs.
- **Critères de passage :**
  - [ ] LivreAPI durcie, gain mesuré et documenté
  - [ ] Mini-app full-stack fonctionnelle avec les trois états
  - [ ] Fiche projet et démo prêtes pour le portfolio
  - [ ] Revue mensuelle 3 complétée et bilan de trimestre écrit
- **Exercice d'architecture :** Ton front et ton API sont maintenant deux programmes qui doivent se mettre d'accord. Écris le contrat qui les lie — forme des réponses, forme des erreurs, codes de statut — puis liste trois changements côté API qui casseraient le front sans qu'aucun test de l'API ne devienne rouge.
