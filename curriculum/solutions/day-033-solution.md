# Correction — Jour 33 : Stacks et Queues : implémenter pour posséder

[← Retour au jour 33](../days/day-033.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Stack sur tableau : push/pop natifs, O(1). parenthesesValides : empiler les ouvrantes, sur une fermante dépiler et vérifier la correspondance, pile vide à la fin = valide.

## ⚠️ Erreurs probables et points à vérifier
- Queue avec shift() = O(n) sur gros volumes (mentionner la version à deux index).
- Oublier le cas 'ouvrantes en trop' (pile non vide à la fin).

## 🧩 Questions de réflexion
- Où as-tu déjà empilé/dépilé sans le nommer ? (la call stack de la récursion !)
