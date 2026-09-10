# Semaine 34 — DocQA : interface, session, robustesse ; bilan RAG + revue mensuelle 8

> **Mois 8** · Compétences : RAG

[← Mois 8](month-08.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 232](days/day-232.md)
- [Jour 233](days/day-233.md)
- [Jour 234](days/day-234.md)
- [Jour 235](days/day-235.md)
- [Jour 236](days/day-236.md)
- [Jour 237](days/day-237.md)
- [Jour 238](days/day-238.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** La semaine où le RAG cesse d'être un script et devient un produit qu'un autre peut utiliser : une interface, une conversation qui se souvient, et un comportement défini quand la question n'a pas de réponse dans le corpus. Elle ferme le mois 8 et prépare l'évaluation du projet 6.
- **Test pratique :** 90 min : rends ton DocQA utilisable par quelqu'un d'autre — interface (web ou CLI enrichie) avec sources cliquables, historique de session conservé entre deux questions, et trois cas limites traités explicitement : question hors corpus, corpus vide, document illisible. Chacun doit produire un message utile, jamais une réponse inventée.
- **Test théorique :** Que doit répondre un RAG quand aucun chunk n'est pertinent, et pourquoi le silence vaut mieux qu'une réponse plausible ; ce que l'historique de session change au prompt envoyé (et ce qu'il coûte en tokens) ; pourquoi optimiser le prompt de génération avant d'optimiser le retrieval est souvent une erreur ; trois cas limites qu'un RAG de démo ne rencontre jamais et qu'un RAG réel rencontre tout le temps.
- **Mini-projet :** Fiche de préparation à l'évaluation du projet 6 : les 15 questions de test de ton corpus, la réponse attendue pour chacune, ce que ton RAG répond aujourd'hui, et le classement des échecs par cause (retrieval, génération, corpus). C'est cette fiche que le mois 9 transformera en évaluation chiffrée.
- **Critères de passage :**
  - [ ] DocQA utilisable par un tiers, sources affichées
  - [ ] Trois cas limites traités et démontrés
  - [ ] Fiche des 15 questions complète avec causes d'échec
  - [ ] Revue mensuelle 8 complétée
- **Exercice d'architecture :** Ton DocQA garde l'historique de session. Écris ce qui se passe au bout de 30 échanges : taille du contexte, coût par question, latence, qualité des réponses. Puis choisis une politique (fenêtre glissante, résumé du passé, remise à zéro explicite) et justifie-la en trois lignes. C'est la même question que la fenêtre de contexte du mois 7, revenue sous forme de produit.
