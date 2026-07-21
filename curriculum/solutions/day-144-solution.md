# Correction — Jour 144 : Projet 4 — Load

[← Retour au jour 144](../days/day-144.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : un `to_sql` pour écrire les données. Solution améliorée : charger dans un schéma pensé (types, contraintes, clés), transactionnellement (tout ou rien), idempotemment (replace ou upsert selon le cas), derrière un point d'entrée unique qui enchaîne extract → transform → load. Le critère de réussite : tout le pipeline se rejoue en une commande et reconstruit un état correct sans doublon. La preuve : deux exécutions successives laissent la base identique.

## ⚠️ Erreurs probables et points à vérifier
- `to_sql` brut sans schéma pensé : types et contraintes absents, base fragile et incohérente.
- Chargement non transactionnel : une interruption laisse une base à moitié chargée, dashboard faux.
- Chargement non idempotent : relancer duplique les données.
- Pipeline à étapes manuelles multiples : ni reproductible, ni démontrable, casse si on oublie une étape.

## 🔍 Comment vérifier ta solution
- Le schéma cible est pensé (types, contraintes, clés).
- Le chargement est transactionnel (tout ou rien).
- Le chargement est idempotent (relancer ne duplique pas).
- Tout le pipeline se lance depuis un point d'entrée unique.
- Deux exécutions successives produisent une base identique (rejouable en une commande, prouvé).

## 🎤 À savoir expliquer à l'oral
Vise le critère « rejouable en une commande » et explique ce qu'il force : automatisation propre, ordre des étapes, idempotence. Détaille les trois piliers du load (schéma pensé, transaction, idempotence) hérités des jours 134/136/139. La preuve par double exécution (base identique) démontre l'idempotence — le cœur d'un pipeline reproductible et démontrable.
