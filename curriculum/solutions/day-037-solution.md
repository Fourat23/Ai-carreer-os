# Correction — Jour 37 : Types avancés : interfaces, unions, littéraux, génériques

[← Retour au jour 37](../days/day-037.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Utiliser les types pour interdire l'incohérence : interfaces pour les formes d'objets, union littérale pour borner un ensemble fini de valeurs (statut), switch exhaustif avec default:never pour que le compilateur signale tout cas oublié, et générique correctement contraint pour une logique réutilisable sans any. La preuve : ajouter un statut casse la compilation là où il faut agir.

## ✅ Une solution simple
Modéliser Produit/LigneCommande/Commande en interfaces, le statut en union littérale, et écrire premier<T> sans contrainte. Compile et fonctionne.

## 🚀 Une solution améliorée
Ajouter le switch exhaustif à default:never (exhaustivité prouvée), contraindre le générique quand il accède à une propriété (<T extends {id:number}>), utiliser premier<T> sur DEUX types différents pour démontrer l'inférence, et garder zéro any avec des champs optionnels explicites (?). Savoir justifier interface vs type.

## ⚠️ Erreurs probables et points à vérifier
- Laisser le statut en `string` au lieu d'une union littérale : une faute de frappe passe sans être détectée.
- Oublier l'exhaustivité (pas de default:never) : un cas non géré ne déclenche aucune erreur à l'ajout d'un statut.
- Générique sur- ou sous-contraint : `<T>` trop libre n'apporte rien ; sans `extends`, impossible d'accéder à une propriété commune.
- Croire que le typage valide les données réelles : il est effacé à l'exécution ; les données externes exigent une validation runtime (jour 54).

## 🔍 Comment vérifier ta solution
- Le modèle de commande compile et le statut est une union littérale (une valeur invalide est refusée par tsc).
- Le switch est exhaustif : ajouter un statut fictif provoque une erreur de compilation.
- La fonction générique premier<T> est utilisée sur 2 types différents avec inférence correcte.
- Aucun any ; les champs optionnels sont explicites (?).

## ❓ Réponses du mini-quiz
1. **Que signifie « rendre les états illégaux irreprésentables » ?**
   → Modéliser les types si précisément qu'une valeur absurde ne peut même pas être écrite : une union littérale interdit un statut mal orthographié, une interface interdit un objet auquel il manque un champ.
2. **À quoi sert un `default: never` dans un switch sur une union littérale ?**
   → À obtenir l'exhaustivité vérifiée : si un cas de l'union n'est pas traité, l'affectation à `never` échoue à la compilation. Le compilateur devient la checklist de refactoring.
3. **Quand préférer `interface` à `type` (et l'inverse) ?**
   → `interface` pour les formes d'objets extensibles (implements, fusion). `type` pour les unions, intersections, alias de primitives et types calculés. Union littérale = toujours `type`.
4. **Qu'apporte un générique par rapport à dupliquer la fonction pour chaque type ?**
   → Une SEULE implémentation valable pour tous les types, avec le typage préservé : `premier<T>` renvoie `number|undefined` sur des nombres, `Commande|undefined` sur des commandes — sans `any` ni copier-coller.

## 🎤 À savoir expliquer à l'oral
Résume par le principe : « je modélise pour que les états illégaux soient impossibles à écrire ». Montre l'union littérale qui bloque une faute de frappe, puis le switch default:never qui transforme le compilateur en checklist de refactoring. Enchaîne sur le générique (une logique, tous les types, typage préservé) et son piège (bien le contraindre). Terminer par « le typage n'est pas effacé par hasard : à l'exécution, il faut encore valider les données externes » montre une compréhension complète.
