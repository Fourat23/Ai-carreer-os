# Correction / Grille — Jour 105 : Revue de la semaine 15

[← Retour au jour 105](../days/day-105.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **React : routing, état partagé, contexte, performance et accessibilité**. La semaine où une page React devient une application : plusieurs écrans et une URL qui a du sens, un état qui remonte là où il doit vivre, un rendu dont on comprend le coût, et une interface utilisable au clavier — parce qu'une interface inaccessible est une interface cassée, pas une interface perfectible.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 75 min : une app qui consomme une API publique — liste et page détail avec de vraies URL partageables, état de recherche partagé entre deux composants voisins (remonté, pas dupliqué), thème ou préférence via un contexte. Puis ouvre les outils React, trouve un re-render inutile, corrige-le et MESURE la différence. Termine en parcourant toute l'app au clavier uniquement : rien d'inatteignable, focus toujours visible.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Ce que le routage change pour l'utilisateur au-delà de l'affichage (partage, retour arrière, rechargement) ; à quel niveau doit vivre un état, et le signe qu'il est trop bas ou trop haut ; ce que le contexte résout et ce qu'il aggrave quand on en abuse ; pourquoi un composant se re-rend et les trois causes les plus fréquentes ; ce qu'un lecteur d'écran fait d'un `div` cliquable ; et pourquoi un ordre de tabulation cassé est un bug de la même gravité qu'un calcul faux.
- **Mini-projet / livrable** conforme : Le socle front du projet 3 : routage en place, structure de dossiers assumée, contexte pour le peu qui le mérite, et une liste écrite des composants réutilisables que tu emportes. Plus un rapport d'accessibilité d'une page : ce que tu as trouvé, ce que tu as corrigé, ce que tu laisses et pourquoi.
- **Exercice d'architecture** fait sérieusement : Ton contexte de thème provoque le re-rendu de toute l'application à chaque changement. Explique le mécanisme, puis propose deux parades (découper le contexte, mémoriser la valeur) et dis laquelle tu choisis. Puis pose la question plus large : quel état mérite d'être global, et quel est le vrai coût de le rendre global ?

## 📋 Checklist de validation
- [ ] Mes URL sont partageables et le retour arrière fait ce qu'on attend
- [ ] Aucun état dupliqué dans deux composants
- [ ] Le contexte ne sert qu'à ce qui est vraiment global
- [ ] J'ai traversé toute l'app au clavier, sans souris

## 🚦 Critères de passage à la semaine suivante
- [ ] Routing avec vraies URL et page détail fonctionnels
- [ ] État partagé remonté correctement, sans duplication
- [ ] Un re-render inutile identifié, corrigé et mesuré
- [ ] Parcours clavier complet, focus visible partout

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
