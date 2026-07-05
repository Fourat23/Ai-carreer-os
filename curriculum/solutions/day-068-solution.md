# Correction — Jour 68 : Auth par token et gestion des secrets

[← Retour au jour 68](../days/day-068.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le token dans un header Authorization (pas l'URL, loggée/cachée). Un middleware vérifie avant les routes protégées. Secrets en .env, jamais commités.

## ⚠️ Erreurs probables et points à vérifier
- Token dans l'URL (fuite).
- Secret en dur dans le code.

## 🧩 Questions de réflexion
- Pourquoi le token dans un header plutôt que l'URL ?
