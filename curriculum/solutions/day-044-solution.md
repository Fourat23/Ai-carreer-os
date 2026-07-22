# Correction — Jour 44 : Préparation du Projet 1 : TaskFlow — types et interface Store

[← Retour au jour 44](../days/day-044.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Poser les fondations sans coder la logique : modéliser Task et ses états (union littérale), définir le CONTRAT Store (all/load/save) qui masque la persistance, faire dépendre la future logique de ce contrat (inversion de dépendance), et découper le travail en jalons démontrables. Le critère de réussite : la migration vers SQLite ne changera qu'un fichier.

## ✅ Une solution simple
Écrire types.ts avec Task et une interface Store, plus un backlog. Suffisant pour démarrer.

## 🚀 Une solution améliorée
Modéliser les statuts en union littérale (états illégaux irreprésentables), concevoir Store comme un vrai port (contrat minimal et suffisant), rédiger un backlog uniquement en jalons DÉMONTRABLES, et répondre explicitement par écrit « un seul fichier change pour migrer vers SQLite » en le justifiant. Préparer le README (sections vides) pour cadrer la finition.

## ⚠️ Erreurs probables et points à vérifier
- Types trop rigides (impossibles à faire évoluer) ou trop lâches (any qui annule le bénéfice de la conception).
- Jalons non démontrables (« avancer sur le CLI ») qui masquent la procrastination.
- Faire dépendre la logique d'un fichier concret au lieu du contrat Store : l'inversion échoue, la migration touchera tout.
- Sur-concevoir des abstractions pour des besoins hypothétiques : l'interface ne se justifie que si l'implémentation varie réellement (ici oui).

## 🔍 Comment vérifier ta solution
- types.ts complet : Task, statuts en union littérale, interface Store minimale et suffisante.
- Le backlog ne contient que des jalons démontrables.
- Réponse écrite : un seul fichier change pour migrer vers SQLite, avec justification.
- La logique esquissée dépend de Store (abstraction), jamais d'un accès fichier direct.

## ❓ Réponses du mini-quiz
1. **Pourquoi concevoir les types AVANT d'écrire la logique ?**
   → Parce que modéliser le domaine oblige à répondre aux vraies questions (un statut peut-il être vide ? la priorité est-elle obligatoire ?) avant qu'elles ne deviennent des bugs. Un modèle clair rend l'implémentation évidente.
2. **Qu'est-ce que l'inversion de dépendance avec l'interface Store ?**
   → Faire dépendre la logique métier d'un CONTRAT abstrait (Store) plutôt que d'une implémentation concrète (fichier JSON). Le COMMENT devient interchangeable : changer de stockage ne touche pas la logique.
3. **Combien de fichiers doivent changer pour migrer TaskFlow vers SQLite ?**
   → Un seul : la nouvelle implémentation SqliteStore qui respecte le contrat Store. Si la réponse est « toute la logique », l'inversion de dépendance a échoué.
4. **Qu'est-ce qui distingue un jalon démontrable d'une activité floue ?**
   → Un jalon démontrable est vérifiable/cochable (« add + list fonctionnent de bout en bout ») ; une activité floue (« avancer sur le CLI ») ne se coche pas et masque la procrastination.

## 🎤 À savoir expliquer à l'oral
Explique la démarche : « je conçois les types d'abord pour comprendre le domaine, puis je fais dépendre la logique d'un contrat Store, pas d'un fichier ». Donne le test de réussite : « migrer vers SQLite = un fichier ». Relie à SOLID et à l'hexagonale pour situer le principe, et à la testabilité (Store en mémoire pour les tests). Mentionner que l'abstraction ne se justifie que parce que le stockage VA réellement changer montre que tu évites la sur-ingénierie — un signe de jugement.
