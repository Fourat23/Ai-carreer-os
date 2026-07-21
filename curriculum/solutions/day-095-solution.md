# Correction — Jour 95 : Effets et fetch (useEffect)

[← Retour au jour 95](../days/day-095.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : un useEffect qui fetch et remplit un state, avec loading/error/data. Solution améliorée : encoder les 3 états dans UNE machine à états (impossible d'être 'ok' sans data), déclarer les BONNES dépendances (re-fetch quand l'url change), ajouter un nettoyage (drapeau annule) qui ignore les réponses tardives, gérer le statut HTTP (r.ok) et proposer un re-essai propre via une dépendance dédiée. La preuve : naviguer vite entre deux ressources ne produit aucun warning ni affichage incohérent.

## ⚠️ Erreurs probables et points à vérifier
- Dépendances incomplètes : stale closure, l'effet utilise une valeur périmée — inclure tout ce que l'effet lit.
- Pas de nettoyage : setState sur composant démonté, warning et fuite quand une réponse arrive tard.
- Ne gérer que le cas heureux : pas d'état d'erreur ni de chargement — l'app casse sur réseau lent ou API en panne.
- Transformer en effet ce qui est une valeur dérivée : un useEffect inutile qui recopie une donnée calculable (jour 93).

## 🔍 Comment vérifier ta solution
- Les 3 états (chargement, erreur, données) sont rendus, un seul à la fois.
- Le tableau de dépendances contient tout ce que l'effet lit.
- Un nettoyage ignore les réponses tardives (pas de setState après démontage).
- Le statut HTTP est vérifié (r.ok) avant de parser.
- Le re-essai relance un fetch propre sans dupliquer la logique.

## 🎤 À savoir expliquer à l'oral
Définis l'effet comme une synchronisation avec l'extérieur, pas comme « du code après le rendu ». Puis déroule les 3 pièges (dépendances, nettoyage, over-use) et la règle des 3 états. Montre le drapeau `annule` et explique le bug qu'il évite (réponse tardive sur composant démonté) — ce détail prouve que tu as géré des cas réels, pas juste le tutoriel.
