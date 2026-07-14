# Correction — Jour 198 : Appeler une API LLM

[← Retour au jour 198](../days/day-198.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le script sépare trois préoccupations : configuration (clé en env), spécification (system prompt + paramètres explicites), robustesse (erreurs attrapées, usage loggé). Le streaming est une variante d'affichage, pas un changement de logique.

## ⚠️ Erreurs probables et points à vérifier
- Clé API en dur « juste pour tester » : c'est comme ça qu'elles finissent sur GitHub — .env + .gitignore AVANT le premier appel.
- Pas de max_tokens : une réponse-fleuve te coûte 10× le prévu.
- Ignorer reponse.usage : sans mesure, l'estimation de coûts du jour 200 sera de la fiction.

## 🔍 Comment vérifier ta solution
- git log/status : la clé n'apparaît NULLE PART dans l'historique.
- Le script survit à une clé invalide (message clair, pas de stacktrace brute).
- Chaque exécution affiche tokens in/out.
- La version streaming affiche la réponse progressivement.

## 🎤 À savoir expliquer à l'oral
Sache écrire l'appel minimal AU TABLEAU (rôle system/user, max_tokens, try/except) et justifier chaque ligne. « Pourquoi max_tokens ? » — parce que la sortie est la partie chère et non bornée par défaut.
