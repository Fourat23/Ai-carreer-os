# Correction — Jour 323 : DocSense : workflow d'analyse

[← Retour au jour 323](../days/day-323.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : enchaîner résumé, points clés, questions. Solution améliorée : construire l'analyse comme un WORKFLOW explicite (étapes fixes orchestrées par le code, flux connu — pas un agent car pas besoin d'autonomie), avec un nombre d'appels connu (coût borné), une sortie structurée, et la testabilité étape par étape. La valeur est double : une fonctionnalité différenciante ET le bon choix d'architecture (workflow car flux fixe, justifié par la doctrine du jour 278).

## ⚠️ Erreurs probables et points à vérifier
- Construire l'analyse comme un agent : le flux est fixe, l'autonomie d'un agent serait coûteuse et fragile pour rien — un workflow suffit.
- Un résumé en pavé non structuré : la valeur est dans la STRUCTURE (résumé + points clés + questions), pas dans un bloc de texte.
- Ne pas savoir justifier workflow vs agent : le jugement d'architecture est aussi important que la fonctionnalité — savoir dire pourquoi workflow.
- Flux non testable : structurer en étapes permet de tester chacune (jour 327) — un mégaprompt monolithique perd cet avantage.

## 🔍 Comment vérifier ta solution
- L'analyse produit un résumé structuré + points clés + questions ouvertes.
- Elle est construite comme un workflow explicite (étapes fixes orchestrées).
- Le nombre d'appels LLM est connu (coût borné).
- Le choix workflow-pas-agent est justifié (flux fixe).
- Chaque étape est testable en isolation (préfigure jour 327).

## 🎤 À savoir expliquer à l'oral
Présente la fonctionnalité ET le choix d'architecture : « DocSense n'analyse pas seulement, il analyse — résumé structuré, points clés, questions ouvertes ; et je l'ai construit comme un workflow, pas un agent, parce que le flux est fixe : coût borné, testable, pas de modes d'échec ». Montrer une fonctionnalité de valeur avec un choix d'architecture justifié est le combo qui distingue.
