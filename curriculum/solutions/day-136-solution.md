# Correction — Jour 136 : SQL avancé : transactions (ACID)

[← Retour au jour 136](../days/day-136.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : BEGIN, les écritures, COMMIT. Solution améliorée : englober les écritures LIÉES dans un try (commit sur succès, rollback sur toute exception), détecter les échecs métier (stock insuffisant via rowcount) pour déclencher le rollback, et PROUVER l'atomicité en provoquant une erreur au milieu et en vérifiant qu'aucune écriture ne subsiste. La preuve : après un échec, la base est exactement dans son état d'avant — ni commande fantôme, ni stock incohérent.

## ⚠️ Erreurs probables et points à vérifier
- Faire les écritures liées hors transaction : une panne au milieu laisse un état incohérent (stock décrémenté sans commande).
- Oublier le rollback dans le `except` : la transaction reste ouverte ou l'état partiel persiste.
- Ne pas détecter les échecs métier (rowcount == 0) : le décrément « réussit » sur 0 ligne et l'incohérence passe.
- Mettre dans une transaction des opérations indépendantes qui n'ont pas à être atomiques : verrouillage inutile.

## 🔍 Comment vérifier ta solution
- Les écritures qui doivent réussir ensemble sont dans une seule transaction.
- Commit sur succès complet, rollback sur toute exception.
- Les échecs métier (stock insuffisant) déclenchent le rollback.
- Après un échec provoqué, aucune écriture ne subsiste (atomicité prouvée).
- Aucune opération indépendante n'est enfermée inutilement dans une transaction.

## 🎤 À savoir expliquer à l'oral
Définis la transaction comme « tout ou rien » et déroule ACID (atomicité en tête). Donne l'exemple commande+stock : sans transaction, un échec laisse un état incohérent. Montre la structure try → commit / except → rollback, et la PREUVE par erreur provoquée (aucune écriture ne subsiste). Relier à l'atomicité du CRUD front (jour 114) montre une cohérence de raisonnement à tous les niveaux.
