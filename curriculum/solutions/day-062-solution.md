# Correction — Jour 62 : Projet 2 — LivreAPI : relations et logique d'emprunt

[← Retour au jour 62](../days/day-062.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Emprunter = vérifier la disponibilité (règle métier) avant d'agir, dans une transaction. Les JOIN ramènent les données liées.

## ⚠️ Erreurs probables et points à vérifier
- Emprunter un livre déjà emprunté (règle non vérifiée).
- Pas de transaction (état incohérent si échec).

## 🧩 Questions de réflexion
- Où vit la règle 'pas de double emprunt' — route, service, ou base ?
