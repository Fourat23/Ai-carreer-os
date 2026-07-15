# Correction — Jour 274 : Agent : la boucle de base

[← Retour au jour 274](../days/day-274.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : une boucle while où le modèle choisit une action, le code l'exécute, l'observation revient — jusqu'à « terminer ». Solution améliorée : ajouter les trois garde-fous structurels (budget d'itérations dur, arrêt propre sur objectif OU budget, traces par tour), la gestion des décisions invalides (outil inconnu → observation d'erreur, pas de plantage), et la sortie structurée validée pour la décision du modèle. La preuve de compréhension est l'enchaînement de 2 outils VISIBLE dans les traces.

## ⚠️ Erreurs probables et points à vérifier
- Pas de budget d'itérations : l'agent qui n'atteint pas son but boucle à l'infini, brûlant des appels — le budget est non négociable dès la v1.
- Laisser le modèle exécuter (eval de sa décision) au lieu de faire exécuter par TON code : la frontière de confiance du jour 207 s'applique aux agents à plus forte raison.
- Pas de traces : impossible de comprendre POURQUOI l'agent a mal agi — la trace par tour est la condition du débogage (jour 275).
- Arrêt par plantage au lieu d'arrêt propre : un budget épuisé doit retourner un message clair, pas une exception.

## 🔍 Comment vérifier ta solution
- La boucle a un budget d'itérations dur et s'arrête proprement (objectif OU budget).
- Chaque tour trace décision + exécution + observation.
- Le modèle DÉCIDE, le code EXÉCUTE (frontière respectée).
- Une décision invalide (outil inconnu) produit une observation d'erreur, pas un plantage.
- L'enchaînement de 2 outils est visible dans les traces (variante).

## 🎤 À savoir expliquer à l'oral
Dessine la boucle plan/act/observe au tableau et place les trois garde-fous (budget, arrêt propre, traces) en rouge. Puis la phrase clé : « un agent, c'est une boucle while avec un LLM comme décideur — pas de la magie ; les garde-fous sont ce qui le rend déployable ». Coder l'agent à nu est le pendant du neurone en NumPy — même argument de profondeur.
