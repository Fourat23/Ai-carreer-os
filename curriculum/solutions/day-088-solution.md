# Correction — Jour 88 : Le front consomme l'API : fetch et états async

[← Retour au jour 88](../days/day-088.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Chaque fetch a 3 états à gérer explicitement. Un module api.ts centralise les appels (gestion d'erreur commune, types partagés) — l'Adapter du jour 39.

## ⚠️ Erreurs probables et points à vérifier
- États async oubliés (UI cassée sur réseau lent).
- fetch dupliqué hors du module api.

## 🧩 Questions de réflexion
- Le clic 'ajouter un livre' déclenche quelle chaîne complète (front→API→SQL→réponse→re-render) ?
