# Semaine 15 — React : routing, état partagé, contexte, performance et accessibilité

> **Mois 4** · Compétences : JavaScript / TypeScript, Software engineering

[← Mois 4](month-04.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 99](days/day-099.md)
- [Jour 100](days/day-100.md)
- [Jour 101](days/day-101.md)
- [Jour 102](days/day-102.md)
- [Jour 103](days/day-103.md)
- [Jour 104](days/day-104.md)
- [Jour 105](days/day-105.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** La semaine où une page React devient une application : plusieurs écrans et une URL qui a du sens, un état qui remonte là où il doit vivre, un rendu dont on comprend le coût, et une interface utilisable au clavier — parce qu'une interface inaccessible est une interface cassée, pas une interface perfectible.
- **Test pratique :** 75 min : une app qui consomme une API publique — liste et page détail avec de vraies URL partageables, état de recherche partagé entre deux composants voisins (remonté, pas dupliqué), thème ou préférence via un contexte. Puis ouvre les outils React, trouve un re-render inutile, corrige-le et MESURE la différence. Termine en parcourant toute l'app au clavier uniquement : rien d'inatteignable, focus toujours visible.
- **Test théorique :** Ce que le routage change pour l'utilisateur au-delà de l'affichage (partage, retour arrière, rechargement) ; à quel niveau doit vivre un état, et le signe qu'il est trop bas ou trop haut ; ce que le contexte résout et ce qu'il aggrave quand on en abuse ; pourquoi un composant se re-rend et les trois causes les plus fréquentes ; ce qu'un lecteur d'écran fait d'un `div` cliquable ; et pourquoi un ordre de tabulation cassé est un bug de la même gravité qu'un calcul faux.
- **Mini-projet :** Le socle front du projet 3 : routage en place, structure de dossiers assumée, contexte pour le peu qui le mérite, et une liste écrite des composants réutilisables que tu emportes. Plus un rapport d'accessibilité d'une page : ce que tu as trouvé, ce que tu as corrigé, ce que tu laisses et pourquoi.
- **Critères de passage :**
  - [ ] Routing avec vraies URL et page détail fonctionnels
  - [ ] État partagé remonté correctement, sans duplication
  - [ ] Un re-render inutile identifié, corrigé et mesuré
  - [ ] Parcours clavier complet, focus visible partout
- **Exercice d'architecture :** Ton contexte de thème provoque le re-rendu de toute l'application à chaque changement. Explique le mécanisme, puis propose deux parades (découper le contexte, mémoriser la valeur) et dis laquelle tu choisis. Puis pose la question plus large : quel état mérite d'être global, et quel est le vrai coût de le rendre global ?
