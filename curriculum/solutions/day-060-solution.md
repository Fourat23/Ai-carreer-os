# Correction — Jour 60 : Préparation du Projet 2 : LivreAPI — modèle et contrat

[← Retour au jour 60](../days/day-060.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le modèle précède tout : de mauvaises tables condamnent l'API. Emprunts = table de liaison (membre+livre+dates). Le contrat est promis AVANT le code — Postman le vérifiera.

## ⚠️ Erreurs probables et points à vérifier
- Oublier les relations (emprunt sans clés étrangères).
- Endpoints incohérents avec le design du jour 51.

## 🧩 Questions de réflexion
- Ton modèle survit-il à 'un livre a plusieurs auteurs' ?
