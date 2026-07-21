# Correction — Jour 109 : Clean code appliqué au front

[← Retour au jour 109](../days/day-109.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : couper un gros composant en plus petits. Solution améliorée : diagnostiquer les code smells (longueur, mélange logique/rendu, noms vagues, duplication), extraire la logique à état dans un hook custom et les sections en sous-composants nommés, renommer d'après l'intention, et garantir par les tests que le comportement est inchangé (refactor = zéro fonctionnalité ajoutée). Le critère : chaque pièce a une responsabilité nommable d'une phrase sans « et ».

## ⚠️ Erreurs probables et points à vérifier
- Extraire sans nommer d'après l'intention : des sous-composants `Bloc1`/`Bloc2` n'améliorent pas la lisibilité.
- Refactorer sans tests : on ne peut pas prouver que le comportement est resté identique.
- Laisser la logique à état dans le composant de rendu : il reste intestable et mélangé — extraire un hook.
- Ajouter des fonctionnalités pendant le refactor : on ne sait plus si une régression vient du refactor ou de la feature.

## 🔍 Comment vérifier ta solution
- Chaque composant/hook/fonction extrait a une responsabilité nommable d'une phrase.
- La logique à état est dans des hooks, le rendu dans les composants.
- Les noms expriment l'intention (pas data/temp/handleClick).
- Le JSX dupliqué est factorisé en composants mappés.
- Les tests restent verts : le comportement est inchangé.

## 🎤 À savoir expliquer à l'oral
Traite le composant comme une fonction : « trop long, mélange logique/rendu, noms vagues, duplication → j'extrais, une responsabilité par pièce ». Insiste sur « le refactor ne change rien au comportement, il se fait sous protection des tests » et « le code est lu plus qu'écrit ». Proposer de mesurer la lisibilité en temps de compréhension montre une vision d'ingénieur, pas d'esthète.
