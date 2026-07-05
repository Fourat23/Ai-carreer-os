# Correction — Jour 57 : SQLite branché sur l'API : persistance réelle et anti-injection

[← Retour au jour 57](../days/day-057.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Les requêtes paramétrées séparent CODE SQL et DONNÉES : l'entrée ne peut plus être interprétée comme du SQL. LA défense contre l'injection. Couche data isolée = un fichier change si on migre.

## ⚠️ Erreurs probables et points à vérifier
- Concaténer des strings dans le SQL = faille béante.
- Schéma non versionné (irreproductible).

## 🧩 Questions de réflexion
- Pourquoi 'SELECT ... WHERE nom = '+input est dangereux et le paramétrage sûr ?
