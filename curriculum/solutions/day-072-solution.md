# Correction — Jour 72 : Terminal et Linux avancés : scripts, permissions, processus

[← Retour au jour 72](../days/day-072.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Un script d'automatisation encode un savoir-faire répétable. Permissions (chmod +x), secrets via env (jamais en dur), sortie claire (echo avec statut). C'est le germe de la CI (mois 11).

## ⚠️ Erreurs probables et points à vérifier
- Secrets en dur dans le script.
- Pas de gestion d'échec (set -e, vérifier les codes de sortie).

## 🧩 Questions de réflexion
- Ce script pourrait-il tourner en CI sans modification ?
