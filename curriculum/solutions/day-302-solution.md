# Correction — Jour 302 : DocSense : cadrage produit (SPEC)

[← Retour au jour 302](../days/day-302.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : lister les fonctionnalités souhaitées de DocSense. Solution améliorée : partir du persona (il oriente tout), en déduire 5 cas d'usage TESTABLES, tracer un hors-scope EXPLICITE et courageux (ce qui rend le projet finissable), et fixer des critères de succès mesurables dès le cadrage. La SPEC se juge sur son hors-scope autant que sur son scope.

## ⚠️ Erreurs probables et points à vérifier
- Pas de hors-scope : le scope enfle (scope creep), chaque idée devient une fonctionnalité, le projet ne se livre jamais — le hors-scope est la partie clé.
- Cas d'usage vagues (« aider à trouver l'info ») : non testables, on ne saura jamais si c'est fait — chaque cas d'usage a une entrée et une sortie vérifiables.
- Construire « pour tout le monde » sans persona : donc pour personne — un persona concret oriente chaque décision.
- Pas de critères de succès mesurables : sans eux, « assez bon » est subjectif et le projet n'a pas de fin claire.

## 🔍 Comment vérifier ta solution
- SPEC.md contient un persona concret, 5 cas d'usage testables, un hors-scope explicite.
- Le hors-scope liste au moins 4 choses que DocSense ne fera PAS en v1.
- Chaque cas d'usage a une entrée et une sortie vérifiables.
- Des critères de succès mesurables (exactitude, latence) sont fixés.
- Les cas d'usage préfigurent le golden set (variante).

## 🎤 À savoir expliquer à l'oral
Défends le hors-scope comme la décision clé : « ma SPEC dit surtout ce que DocSense NE fera PAS en v1 — pas de multi-utilisateurs, pas de temps réel — parce que c'est ça qui le rend livrable en 8 semaines ; un projet fini et borné bat un projet ambitieux inachevé ». Savoir dire non au scope est une maturité produit qui impressionne, surtout venant d'un profil technique.
