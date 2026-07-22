# Correction — Jour 36 : TypeScript : le typage qui attrape les bugs avant l'exécution

[← Retour au jour 36](../days/day-036.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Comprendre que TypeScript vérifie des CONTRATS à la compilation sans changer l'exécution. La démarche de conversion : annoter les signatures (paramètres, retour), laisser l'inférence faire le reste à l'intérieur, activer strict, remplacer chaque any par un type précis ou unknown + validation, puis LIRE chaque erreur tsc comme un bug futur désigné. La preuve de compréhension : documenter au moins un bug réel révélé par le typage.

## ✅ Une solution simple
Ajouter les annotations de types aux signatures des 3 fichiers, corriger jusqu'à zéro erreur tsc. Fonctionnel, mais on peut rester superficiel (any qui traîne).

## 🚀 Une solution améliorée
Activer strict et viser ZÉRO any : remplacer les any par des types précis ou unknown + narrowing aux frontières (données externes), traiter explicitement les cas null/undefined, et TENIR un journal des bugs que le typage a révélés (ex. concaténation silencieuse, propriété absente). Savoir expliquer any vs unknown avec un exemple.

## ⚠️ Erreurs probables et points à vérifier
- Mettre `any` pour faire taire le compilateur : c'est désactiver l'outil et réintroduire les bugs du JS non typé.
- Croire que tsc exécute le code : il VÉRIFIE puis transpile ; c'est node (ou tsx) qui exécute.
- Sur-annoter en dupliquant ce que l'inférence déduit déjà (`const x: number = 2`) : bruit inutile.
- Croire qu'un code qui compile est forcément correct : le typage n'attrape pas les erreurs de logique.

## 🔍 Comment vérifier ta solution
- Les 3 fichiers convertis compilent en strict, zéro any (vérifiable par recherche `any` dans le code).
- Au moins un bug réel révélé par le typage est documenté dans les notes.
- Les données externes passent par `unknown` + narrowing, pas par `any`.
- Les cas null/undefined possibles sont traités explicitement (pas d'accès non gardé).

## ❓ Réponses du mini-quiz
1. **Quelle est la différence entre `tsc` et `node` ?**
   → `tsc` VÉRIFIE les types et transpile en JavaScript, avant exécution. `node` EXÉCUTE le JavaScript. Une erreur `tsc` est un avertissement anticipé, pas une erreur d'exécution.
2. **Pourquoi préférer `unknown` à `any` pour une donnée externe ?**
   → `any` désactive toute vérification (bug latent possible). `unknown` FORCE à vérifier le type (narrowing) avant d'utiliser la valeur — sûr par défaut pour un JSON d'API ou une saisie.
3. **Qu'apporte concrètement le mode `strict` (strictNullChecks) ?**
   → Il rend `null`/`undefined` non assignables implicitement : le compilateur oblige à traiter le cas « valeur absente », éliminant la classe des « Cannot read property of undefined ».
4. **Le typage garantit-il que mon code est correct ?**
   → Non : il élimine une CLASSE de bugs (incohérences de type), pas les erreurs de LOGIQUE. Un type juste peut cacher une formule fausse. Le typage complète les tests, il ne les remplace pas.

## 🎤 À savoir expliquer à l'oral
Formule l'idée forte : « TypeScript ne change pas ce que le code fait, il ajoute un contrat vérifié qui déplace les bugs de type de la production vers l'éditeur ». Montre un exemple de bug attrapé (concaténation silencieuse), oppose any (désactive) et unknown (force la vérification), et conclus par l'honnêteté : « ça élimine une classe de bugs, pas la logique fausse ». Savoir LIRE une erreur tsc à voix haute, en la reliant à sa cause, est le signal recherché.
