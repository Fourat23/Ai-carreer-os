# Correction — Jour 44 : Préparation du Projet 1 : TaskFlow — types et interface Store

[← Retour au jour 44](../days/day-044.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Concevoir les types force à comprendre le domaine avant de coder. L'interface Store (save/load/all) découple la logique du stockage : JSON aujourd'hui, SQLite demain, le reste ne change pas.

## ⚠️ Erreurs probables et points à vérifier
- Types trop rigides ou trop lâches (any).
- Jalons non démontrables ('avancer sur le CLI').

## 🧩 Questions de réflexion
- Si le stockage passe à SQLite, combien de fichiers changent ? (objectif : un)
