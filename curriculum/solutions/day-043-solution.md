# Correction — Jour 43 : Programmation fonctionnelle : composition et pureté en TS

[← Retour au jour 43](../days/day-043.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Réinvestir la boîte à outils fonctionnelle du mois 1 en la TYPANT : compose/pipe génériques qui garantissent l'emboîtement des étapes, memoriser générique, fonctions pures typées, et données readonly pour une immutabilité vérifiée. Construire un mini-pipeline 100 % pur où le compilateur interdit la mutation et le mauvais branchement. La preuve : réordonner mal les étapes ou tenter une mutation provoque une erreur de compilation.

## ✅ Une solution simple
Réécrire compose/pipe/memoriser en TS avec des types simples et un pipeline. Fonctionne, mais des génériques trop lâches peuvent perdre le type au milieu.

## 🚀 Une solution améliorée
Typer compose/pipe génériquement (chaque étape reçoit le type précédent), rendre memoriser générique et testé sur 2 types de fonctions, et marquer tout le pipeline readonly pour prouver l'immutabilité par le compilateur. Démontrer qu'un mauvais ordre d'étapes ET une mutation échouent à la compilation. Discuter la limite des compose variadiques.

## ⚠️ Erreurs probables et points à vérifier
- Génériques de compose trop lâches : le type se perd au milieu du pipeline (retour implicite à any).
- Muter un readonly en croyant que c'est bloqué à l'exécution : c'est bloqué à la COMPILATION, c'est le but.
- Composer dans le mauvais ordre sans typage : le bug de branchement ne surgit qu'à l'appel.
- Imposer la FP partout par dogme là où la POO (état encapsulé) serait plus claire.

## 🔍 Comment vérifier ta solution
- compose et pipe typés fonctionnent sur une chaîne de 3 fonctions sans perte de type.
- memoriser typé fonctionne sur 2 types de fonctions différents.
- Le pipeline est 100 % pur et le compilateur interdit la mutation (readonly prouvé).
- Réordonner mal les étapes provoque une erreur de compilation (démontré).

## ❓ Réponses du mini-quiz
1. **Qu'apporte le typage d'un `compose`/`pipe` générique ?**
   → Il garantit que chaque étape reçoit le type produit par la précédente : impossible d'assembler deux fonctions incompatibles ; le mauvais branchement du pipeline est refusé à la compilation.
2. **Que fait `readonly` pour l'immutabilité ?**
   → Il transforme l'immutabilité de convention en règle mécanique : muter un `readonly string[]` (push/pop) devient une erreur de compilation, pas juste une discipline qu'on espère tenir.
3. **Quand choisir la FP plutôt que la POO ?**
   → La FP (données immuables + transformations pures) convient aux pipelines de données faciles à raisonner et tester. La POO convient à un domaine avec état encapsulé et polymorphisme. On choisit selon le problème, sans dogme.
4. **Quel est le piège des génériques de `compose` ?**
   → Trop lâches, ils perdent le type au milieu du pipeline (retour à `any`) ; parfaitement typés pour un nombre variable d'étapes, ils deviennent très complexes (d'où les surcharges dans les bibliothèques).

## 🎤 À savoir expliquer à l'oral
Résume l'idée forte : « le typage transforme mes conventions (pureté, immutabilité) en contrats que le compilateur vérifie ». Montre que compose typé refuse un mauvais branchement et que readonly refuse une mutation, tous deux à la compilation. Puis nuance : « FP pour les pipelines de données, POO pour l'état encapsulé — je choisis selon le problème ». Reconnaître spontanément la difficulté de typer les compose variadiques prouve une compréhension fine, pas juste un usage superficiel.
