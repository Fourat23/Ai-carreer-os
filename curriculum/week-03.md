# Semaine 3 — Algorithmie : Big O, recherche, tris ; Git branches

> **Mois 1** · Compétences : Algorithmie, Git / Linux

[← Mois 1](month-01.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 15](days/day-015.md)
- [Jour 16](days/day-016.md)
- [Jour 17](days/day-017.md)
- [Jour 18](days/day-018.md)
- [Jour 19](days/day-019.md)
- [Jour 20](days/day-020.md)
- [Jour 21](days/day-021.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Première vraie semaine d'algorithmie. Le but n'est pas de mémoriser des tris mais de savoir RAISONNER sur le coût d'un code.
- **Test pratique :** 60 min : implémente recherche linéaire et recherche binaire ; donne le Big O de 6 extraits de code fournis (dans le fichier du jour 21) ; implémente le tri par insertion sur un tableau de nombres.
- **Test théorique :** Explique O(1), O(log n), O(n), O(n²) avec un exemple de la vie réelle chacun. Pourquoi la recherche binaire exige un tableau trié ? Quel est le coût d'un accès par clé dans un objet JS ?
- **Mini-projet :** Benchmark maison : script qui mesure (console.time) recherche linéaire vs binaire sur des tableaux de 1e3, 1e5, 1e7 éléments, et un mini-rapport de 10 lignes sur les résultats.
- **Critères de passage :**
  - [ ] Recherche binaire correcte (y compris bornes)
  - [ ] 5/6 Big O corrects
  - [ ] Benchmark exécuté et interprété
- **Exercice d'architecture :** Ton benchmark est lent à écrire à la main pour chaque taille. Propose (par écrit) comment tu structurerais le code pour tester N fonctions × M tailles sans duplication. Puis regarde la solution du jour 21.
