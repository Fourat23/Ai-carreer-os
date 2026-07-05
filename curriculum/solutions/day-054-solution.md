# Correction — Jour 54 : Validation, erreurs centralisées, robustesse d'API

[← Retour au jour 54](../days/day-054.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Toute entrée est hostile jusqu'à validation. Centraliser les erreurs évite duplication et fuites. Distinguer erreur attendue (400, on informe) de bug (500, log interne sans détail au client).

## ⚠️ Erreurs probables et points à vérifier
- Valider à une seule porte, en oublier une autre.
- 500 qui fuite la stack trace au client.

## 🧩 Questions de réflexion
- Quelles 5 choses peuvent mal tourner entre client et DB ? Qui répond quoi ?
