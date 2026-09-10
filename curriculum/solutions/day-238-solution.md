# Correction / Grille — Jour 238 : Revue de la semaine 34

[← Retour au jour 238](../days/day-238.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **DocQA : interface, session, robustesse ; bilan RAG + revue mensuelle 8**. La semaine où le RAG cesse d'être un script et devient un produit qu'un autre peut utiliser : une interface, une conversation qui se souvient, et un comportement défini quand la question n'a pas de réponse dans le corpus. Elle ferme le mois 8 et prépare l'évaluation du projet 6.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : rends ton DocQA utilisable par quelqu'un d'autre — interface (web ou CLI enrichie) avec sources cliquables, historique de session conservé entre deux questions, et trois cas limites traités explicitement : question hors corpus, corpus vide, document illisible. Chacun doit produire un message utile, jamais une réponse inventée.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Que doit répondre un RAG quand aucun chunk n'est pertinent, et pourquoi le silence vaut mieux qu'une réponse plausible ; ce que l'historique de session change au prompt envoyé (et ce qu'il coûte en tokens) ; pourquoi optimiser le prompt de génération avant d'optimiser le retrieval est souvent une erreur ; trois cas limites qu'un RAG de démo ne rencontre jamais et qu'un RAG réel rencontre tout le temps.
- **Mini-projet / livrable** conforme : Fiche de préparation à l'évaluation du projet 6 : les 15 questions de test de ton corpus, la réponse attendue pour chacune, ce que ton RAG répond aujourd'hui, et le classement des échecs par cause (retrieval, génération, corpus). C'est cette fiche que le mois 9 transformera en évaluation chiffrée.
- **Exercice d'architecture** fait sérieusement : Ton DocQA garde l'historique de session. Écris ce qui se passe au bout de 30 échanges : taille du contexte, coût par question, latence, qualité des réponses. Puis choisis une politique (fenêtre glissante, résumé du passé, remise à zéro explicite) et justifie-la en trois lignes. C'est la même question que la fenêtre de contexte du mois 7, revenue sous forme de produit.

## 📋 Checklist de validation
- [ ] Un tiers a utilisé mon DocQA sans que je sois derrière lui
- [ ] La question hors corpus ne produit JAMAIS une réponse inventée
- [ ] L'historique de session est borné (sinon le coût explose)
- [ ] Chaque échec observé est écrit avec sa cause présumée

## 🚦 Critères de passage à la semaine suivante
- [ ] DocQA utilisable par un tiers, sources affichées
- [ ] Trois cas limites traités et démontrés
- [ ] Fiche des 15 questions complète avec causes d'échec
- [ ] Revue mensuelle 8 complétée

## ⚠️ Erreurs fréquentes en revue
- Se sur-noter (familiarité ≠ maîtrise) : ne compte que ce que tu produis SEUL et sais EXPLIQUER.
- Bâcler le test théorique en le relisant au lieu de répondre de mémoire (rappel actif).
- Avancer malgré des critères non atteints : mieux vaut consolider 2-3 jours que bâtir sur du sable.
- Oublier de mettre à jour ses scores de compétences dans l'application.

## 🧩 Auto-évaluation finale
- Note honnête de la semaine (0-5) : ____
- Ma plus grande difficulté cette semaine : ____
- Ce que je dois revoir avant d'avancer : ____
- Si des critères ne sont pas atteints : quel plan de rattrapage (daté) ?
