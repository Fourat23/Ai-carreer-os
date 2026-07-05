# Correction — Jour 71 : Réseau et web : DNS, TCP, TLS, HTTP/2 (culture solide)

[← Retour au jour 71](../days/day-071.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
DNS résout le nom en IP, TCP établit la connexion (handshake), TLS la chiffre, HTTP transporte la requête. HTTPS protège confidentialité et intégrité (pas la disponibilité).

## ⚠️ Erreurs probables et points à vérifier
- Confondre chiffrement (TLS) et authentification.
- Croire que HTTPS cache l'existence de la requête (le domaine fuite via SNI/DNS).

## 🧩 Questions de réflexion
- 'Que se passe-t-il quand tu tapes une URL ?' — peux-tu répondre 5 minutes sans hésiter ?
