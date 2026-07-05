<!-- keep -->
# Standard de qualité d'une journée de cours

Ce document définit ce qu'est une **bonne journée** dans AI Career OS. Il sert de référence pour enrichir le curriculum et est vérifié automatiquement par `npm run curriculum:depth-check`.

## Principe directeur
AI Career OS est une **plateforme d'apprentissage**, pas un simple planning. Une journée doit permettre de **comprendre en profondeur**, pas seulement de cocher un exercice. Chaque paragraphe doit aider à comprendre — zéro remplissage.

## Structure obligatoire d'une journée
Chaque jour de travail (hors revues) DOIT contenir, dans cet ordre :

1. **🎯 Objectif du jour** — ce que je dois comprendre, ce que je dois savoir faire, et pourquoi c'est utile pour devenir AI Engineer / LLM-RAG Engineer / dev IA.
2. **📖 Cours approfondi** — définition claire, le *pourquoi*, le *comment*, un modèle mental, un exemple concret, une analogie si utile, les erreurs de compréhension fréquentes, le vocabulaire à retenir, et un renvoi vers la ou les **leçons de fond** (`curriculum/lessons/`).
3. **🧭 Exemple guidé** — un pas-à-pas AVANT l'exercice autonome : énoncé simple, raisonnement, solution, explication ligne par ligne (si code), variante. *(Obligatoire jours 1-30 ; recommandé ensuite.)*
4. **✍️ Pratique autonome** — exercice principal + exercice bonus, avec la consigne « d'abord sans IA ».
5. **❓ Mini-quiz** — questions de compréhension (définition, raisonnement, application, piège), pas de simple mémorisation.
6. **📦 Livrable attendu** — ce que je produis concrètement.
7. **✅ Critères de validation** — vérifiables, cochables.
8. **⚠️ Erreurs fréquentes** — les pièges concrets du jour.
9. **🧠 À retenir** — 3-5 points de synthèse.
10. **🚀 Pourquoi ça comptera plus tard** — réutilisation en architecture, en data, en IA/LLM/RAG, et en entretien.
11. **🧩 Questions de réflexion** + lien vers la correction.

## Profondeur minimale par tranche
| Tranche | Niveau | Longueur indicative |
|---|---|---|
| **Jours 1-30** | Vrai cours débutant, très détaillé | 700+ mots (souvent 1200-2000) |
| **Jours 31-90** | Détaillé, exploitable | 450+ mots |
| **Jours 91-365** | Actionnable, avec théorie ciblée OU renvoi vers une leçon de fond | 220+ mots + leçon liée |

## La correction attendue (dans le fichier solution)
Elle n'est JAMAIS juste une réponse finale. Elle contient : la **logique attendue** (le raisonnement), une **solution simple**, une **solution améliorée** quand pertinent, les **erreurs probables** et points à vérifier, **comment s'auto-évaluer**, les **réponses du quiz**, et **ce qu'il faut savoir expliquer à l'oral**. Pour les jours de revue/projet : une **grille d'évaluation** (attendu, checklist, critères de passage, erreurs fréquentes).

## Les leçons de fond (`curriculum/lessons/`)
Réutilisables entre plusieurs jours, elles contiennent : explication complète, pourquoi c'est important, concepts clés, exemple, pièges, mini-exercice, lien avec l'IA/ML/LLM, vocabulaire à retenir, résumé final. Un jour peut s'appuyer dessus au lieu de tout répéter.

## Différence « fiche superficielle » vs « vrai cours »
| Fiche superficielle ❌ | Vrai cours ✅ |
|---|---|
| Liste d'exercices | Explication du *pourquoi* avant le *comment* |
| « Fais X » | « Voici le modèle mental, un exemple, un piège, puis fais X » |
| Réponse finale en correction | Raisonnement + solution simple + améliorée + oral |
| Notions isolées | Notions reliées aux projets futurs et à l'entretien |
| Aucun exemple travaillé | Un exemple guidé pas-à-pas |
| Jargon non défini | Vocabulaire explicité et récapitulé |

## Erreurs à éviter en rédigeant
- Le remplissage (« l'IA c'est important ») : chaque phrase doit apprendre quelque chose.
- Les buzzwords sans définition.
- La théorie déconnectée de la pratique (toujours un exemple concret).
- L'exemple guidé identique à l'exercice autonome (l'exemple doit être PLUS SIMPLE).
- La correction qui donne la réponse sans le raisonnement.

## Comment enrichir une journée
- Édite `curriculum/days/day-XXX.md` et ajoute `<!-- keep -->` en première ligne pour le protéger, **ou**
- Édite les données sources (`scripts/data/`) puis `npm run generate`.
- Vérifie avec `npm run curriculum:depth-check`.
