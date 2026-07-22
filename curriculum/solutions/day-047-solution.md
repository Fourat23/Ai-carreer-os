# Correction — Jour 47 : Projet 1 — TaskFlow : stats, tests, README, ADR

[← Retour au jour 47](../days/day-047.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Finir vraiment TaskFlow : commande stats en reduce (jour 24), tests sur la logique pure (rendue testable par l'immutabilité) verrouillant les cas d'erreur un par un, README qui rend le projet utilisable et compréhensible par un inconnu en 5 minutes, et ADR n°1 (JSON vs SQLite) au format complet. Ne pas tout tester (le câblage trivial) mais la logique ; ne pas documenter chaque choix mais les décisions structurantes.

## ✅ Une solution simple
Ajouter stats, quelques tests et un README de base. Le projet est présentable.

## 🚀 Une solution améliorée
Tester la logique pure en verrouillant CHAQUE cas d'erreur (id inexistant, liste vide) un par un, rédiger un README qui passe le test « inconnu opérationnel en 5 minutes » (install/usage/archi/appris), et écrire l'ADR n°1 au format complet (contexte/options/décision/conséquences/révision). Stats en reduce par statut et priorité.

## ⚠️ Erreurs probables et points à vérifier
- README bâclé : le projet devient invisible et inutilisable par un tiers, quel que soit le code.
- Cas d'erreur non testés un par un : on suppose la couverture au lieu de la garantir.
- Vouloir tout tester (câblage trivial) au lieu de cibler la logique à valeur.
- ADR absent ou réduit à une phrase : la décision de stockage paraît subie, pas raisonnée.

## 🔍 Comment vérifier ta solution
- Toutes les commandes de la spec passent, stats incluse (reduce par statut/priorité).
- Les tests couvrent la logique et verrouillent les cas d'erreur un par un.
- Un inconnu peut installer, utiliser et comprendre l'architecture en 5 minutes via le README.
- L'ADR n°1 est écrit au format complet (contexte/options/décision/conséquences/révision).

## ❓ Réponses du mini-quiz
1. **Pourquoi la finition (README, tests, ADR) compte-t-elle autant que le code qui marche ?**
   → Sans README, le projet est invisible (personne ne sait l'utiliser) ; sans tests, il est fragile (régressions) ; sans décisions tracées, il paraît suivre des recettes. La finition transforme du code en artefact professionnel.
2. **Que doit contenir un README pour rendre un projet utilisable en 5 minutes ?**
   → À quoi il sert, comment l'installer (commandes exactes), comment l'utiliser (exemples), l'architecture (contrat Store, inversion de dépendance), et « ce que ça prouve / ce que j'ai appris ».
3. **Qu'est-ce qu'un ADR et pourquoi vaut-il de l'or en entretien ?**
   → Un Architecture Decision Record : contexte, options, décision, conséquences, révision. Il prouve que tu arbitres CONSCIEMMENT et montre ton raisonnement, pas seulement ton résultat.
4. **Pourquoi peut-on tester facilement la logique de TaskFlow ?**
   → Parce que l'immutabilité (jour 46) rend les opérations pures (mêmes entrées → mêmes sorties, sans fichiers) : on les teste en isolation, rapidement, sans montage.

## 🎤 À savoir expliquer à l'oral
Insiste sur l'idée que « fini » dépasse « ça marche » : tests sur la logique pure (rendue testable par l'immutabilité), README utilisable en 5 minutes, ADR qui trace le raisonnement. Explique pourquoi l'ADR vaut de l'or (il montre comment tu arbitres, pas juste le résultat) et pourquoi on cible la logique plutôt que tout tester. Montrer que tu vois la finition comme la moitié du travail — celle que le recruteur regarde — te distingue de ceux qui livrent du code brut.
