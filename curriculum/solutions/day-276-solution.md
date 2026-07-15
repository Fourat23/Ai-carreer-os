# Correction — Jour 276 : Agent : cas d'usage utile

[← Retour au jour 276](../days/day-276.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : deux outils (lister, lire) + la boucle du jour 274 + un objectif de recherche de contradictions. Solution améliorée : un objectif VÉRIFIABLE avec format de sortie précis (fichier A / fichier B / nature du conflit), une évaluation en rappel et précision contre ta connaissance des docs, et un test de rappel par contradiction injectée volontairement. Le cas est justifié car il exige du raisonnement sémantique multi-sources qu'un script ne fournit pas.

## ⚠️ Erreurs probables et points à vérifier
- Choisir un cas jouet qui ne prouve rien : le cas doit être RÉEL (tes vraies docs) et VÉRIFIABLE (tu juges le résultat).
- Objectif vague (« améliore la doc ») : il invite à la dérive d'objectif (jour 275) — un format de sortie précis borne l'agent.
- Ne pas évaluer : sans mesure de rappel/précision, tu ne sais pas si l'agent est utile ou hallucine des conflits.
- Utiliser un agent là où un script suffit : si un diff textuel suffisait, l'agent ne serait pas justifié — ici le raisonnement sémantique le justifie.

## 🔍 Comment vérifier ta solution
- Les outils (lister, lire) sont clairs et l'agent lit effectivement le corpus.
- L'objectif impose un format de sortie vérifiable.
- L'agent est évalué en rappel (vraies contradictions) et précision (faux conflits).
- Une contradiction injectée volontairement est bien détectée (test de rappel).
- Le choix de l'agent est justifié (raisonnement sémantique multi-sources qu'un script ne fait pas).

## 🎤 À savoir expliquer à l'oral
Présente le cas d'usage en montrant la valeur : « mon agent lit mes 50 docs et signale qu'un ADR dit Chroma quand le README dit JSON — un diff ne verrait pas cette contradiction sémantique, et personne ne relit 50 docs à la main ». Puis les chiffres : rappel/précision sur une contradiction injectée. Un cas réel, vérifiable et justifié convainc bien plus qu'un agent jouet.
