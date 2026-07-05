# Correction — Jour 64 : Projet 2 — LivreAPI : recherche, pagination, filtres

[← Retour au jour 64](../days/day-064.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Recherche = WHERE LIKE. Pagination = LIMIT/OFFSET (mentionne les limites de OFFSET sur gros volumes). Filtres = conditions combinées, comme rechercher() du jour 23.

## ⚠️ Erreurs probables et points à vérifier
- Recherche sensible à la casse non voulue.
- Pas d'index → recherche lente.

## 🧩 Questions de réflexion
- Que se passe-t-il à la page 10000 avec OFFSET ? (pagination par curseur)
