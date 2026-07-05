# Correction — Jour 50 : HTTP en profondeur : le protocole du web

[← Retour au jour 50](../days/day-050.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
HTTP est sans état : chaque requête est indépendante. Le statut résume le résultat (2xx ok, 4xx client, 5xx serveur). L'idempotence (GET/PUT/DELETE rejouables) structure le design REST.

## ⚠️ Erreurs probables et points à vérifier
- 200 pour tout (les statuts sont de l'info).
- Confondre 401 (non authentifié) et 403 (interdit).

## 🧩 Questions de réflexion
- Peux-tu dessiner ce qui se passe entre navigateur et serveur ?
