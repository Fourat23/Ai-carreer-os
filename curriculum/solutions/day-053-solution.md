# Correction — Jour 53 : Express : routes, middlewares, structure en couches

[← Retour au jour 53](../days/day-053.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Un middleware (req,res,next) traite puis appelle next(). Les 3 couches : routes (HTTP), services (logique), data (persistance), chacune testable et remplaçable.

## ⚠️ Erreurs probables et points à vérifier
- Toute la logique dans les routes (intestable, jour 16).
- Oublier next() (requête bloquée).

## 🧩 Questions de réflexion
- Où placer validation et auth ? (middlewares dédiés)
