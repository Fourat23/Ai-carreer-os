# Correction — Jour 55 : SQL : SELECT, WHERE, JOIN, agrégats

[← Retour au jour 55](../days/day-055.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Penser en ensembles et traduire le pipeline du mois 1 en SQL déclaratif : SELECT/WHERE/ORDER/LIMIT pour filtrer et ordonner, JOIN pour relier par les clés (INNER vs LEFT selon qu'on veut les orphelins), GROUP BY + agrégats pour regrouper, en distinguant WHERE (lignes, avant) de HAVING (groupes, après). Paramétrer systématiquement les valeurs. Vérifier chaque résultat à la main sur la base de test.

## ✅ Une solution simple
Écrire des SELECT avec WHERE et des JOIN simples, vérifiés sur la base. On sait interroger.

## 🚀 Une solution améliorée
Réaliser les 10 requêtes croissantes en incluant un JOIN à 3 tables, un GROUP BY avec HAVING, une sous-requête, et un LEFT JOIN pour les orphelins ; vérifier chaque résultat à la main ; écrire la correspondance SQL ↔ map/filter/reduce pour ancrer le déclaratif ; et paramétrer toute valeur variable. Distinguer clairement WHERE et HAVING sur un exemple.

## ⚠️ Erreurs probables et points à vérifier
- Confondre WHERE (filtre les lignes, avant regroupement) et HAVING (filtre les groupes, après agrégation).
- Faire un JOIN sans condition : produit cartésien, explosion du nombre de lignes.
- Utiliser INNER JOIN quand on veut les orphelins (livres jamais empruntés) : il faut un LEFT JOIN.
- Concaténer des valeurs dans le SQL au lieu de les paramétrer (?) : faille d'injection en germe.

## 🔍 Comment vérifier ta solution
- 10/10 requêtes correctes, résultats vérifiés à la main sur la base de test.
- Au moins un JOIN à 3 tables et un GROUP BY avec HAVING fonctionnels.
- La correspondance SQL ↔ map/filter/reduce est écrite pour 2 requêtes.
- Toutes les valeurs variables sont paramétrées (aucune concaténation).

## ❓ Réponses du mini-quiz
1. **En quoi SQL est-il « déclaratif », et à quel geste JS correspond-il ?**
   → On décrit le RÉSULTAT voulu, le moteur trouve comment l'obtenir. SELECT/WHERE/ORDER/LIMIT correspondent au pipeline filter/map/sort/slice ; GROUP BY + agrégats au reduce par groupe.
2. **Quelle est la différence entre WHERE et HAVING ?**
   → WHERE filtre les LIGNES avant le regroupement ; HAVING filtre les GROUPES après agrégation (conditions sur COUNT/SUM…). On ne peut pas filtrer un agrégat dans WHERE, il n'existe pas encore.
3. **Quelle est la différence entre INNER JOIN et LEFT JOIN ?**
   → INNER JOIN ne garde que les lignes ayant une correspondance des deux côtés ; LEFT JOIN garde aussi les orphelins de gauche (ex. les livres jamais empruntés, avec NULL à droite).
4. **Que produit un JOIN sans condition, et pourquoi paramétrer les valeurs ?**
   → Un JOIN sans condition produit un PRODUIT CARTÉSIEN (chaque ligne × chaque ligne, explosion). On paramètre les valeurs (`?`) pour éviter l'injection SQL et laisser le moteur traiter l'entrée comme une donnée.

## 🎤 À savoir expliquer à l'oral
Pose le cadre : « SQL est déclaratif — je décris le résultat, le moteur optimise ; c'est mon pipeline filter/map/reduce en langage de base ». Martèle la distinction WHERE (lignes, avant) / HAVING (groupes, après) avec un exemple de COUNT, et INNER (correspondances) / LEFT (aussi les orphelins). Mentionner le produit cartésien d'un JOIN sans condition et le réflexe du paramétrage montre que tu penses correction ET sécurité — le niveau attendu d'un back.
