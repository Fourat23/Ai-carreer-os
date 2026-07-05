# Correction — Jour 37 : Types avancés : interfaces, unions, littéraux, génériques

[← Retour au jour 37](../days/day-037.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
interface pour objets extensibles, type pour unions/alias. Les littéraux ('payee') font d'une string un contrat vérifié. Un générique : une logique valable pour tout type sans perdre le typage.

## ⚠️ Erreurs probables et points à vérifier
- Statut en string au lieu d'union littérale (typo non détectée).
- Générique sur/sous-contraint (<T> vs <T extends {id:number}>).

## 🧩 Questions de réflexion
- Une union littérale + switch = le compilateur vérifie l'exhaustivité. Où t'aurait-elle évité un bug au mois 1 ?
