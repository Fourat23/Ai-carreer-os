# Correction — Jour 127 : pandas : charger et inspecter

[← Retour au jour 127](../days/day-127.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : charger le CSV et regarder les premières lignes. Solution améliorée : inspecter systématiquement (shape pour la taille, info pour types et manquants, describe pour les aberrants numériques, value_counts pour les distributions catégorielles et fautes de casse), puis FORMULER des observations écrites qui orientent le nettoyage — le tout en pensant colonnes vectorisées. La preuve : les 5 observations pointent des problèmes réels et actionnables (type à convertir, manquants, doublons de casse, aberrants).

## ⚠️ Erreurs probables et points à vérifier
- Transformer/analyser sans inspecter : une analyse fausse sur des types mal inférés et des manquants, SANS plantage.
- Se fier à l'inférence de type de pandas : une date peut être lue comme texte, un code postal comme un nombre.
- Ignorer les colonnes catégorielles (pas de value_counts) : on rate les fautes de casse et catégories inattendues.
- Boucler ligne par ligne au lieu de vectoriser : lent et non idiomatique.

## 🔍 Comment vérifier ta solution
- shape, info, describe et value_counts ont été utilisés.
- Les types mal inférés (dates, codes) sont repérés.
- Les manquants et valeurs aberrantes sont identifiés.
- Au moins 5 observations écrites orientent le nettoyage à venir.
- L'analyse pense en colonnes vectorisées, pas en boucles.

## 🎤 À savoir expliquer à l'oral
Déroule la séquence d'inspection (shape → info → describe → value_counts) en expliquant ce que CHAQUE commande révèle. Insiste sur le POURQUOI : « une analyse sur des données non inspectées est fausse sans planter, le pire cas ». Donner un exemple concret d'observation (une date en texte, un prix négatif) prouve que tu sais lire des données réelles, pas juste appeler des méthodes.
