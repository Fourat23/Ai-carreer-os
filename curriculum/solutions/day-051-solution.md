# Correction — Jour 51 : REST design : concevoir une API qu'on comprend

[← Retour au jour 51](../days/day-051.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
URLs = noms pluriels (/livres, /livres/42), verbes HTTP = actions. Statuts précis : 201 création, 204 suppression, 404 absent, 400 invalide. Un bon design se devine sans doc.

## ⚠️ Erreurs probables et points à vérifier
- Verbes dans l'URL (/getLivres) : anti-REST.
- Tout en 200 même les erreurs.

## 🧩 Questions de réflexion
- Un dev découvre ton API sans doc : devine-t-il comment supprimer un livre ?
