# Correction — Jour 299 : Threat model

[← Retour au jour 299](../days/day-299.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : lister des menaces et des défenses. Solution améliorée : la démarche complète — acteurs (qui, avec quelles capacités), surfaces (par où), menaces (STRIDE comme checklist pour chaque acteur×surface), priorisation par le RISQUE (probabilité × impact), contre-mesures pour les prioritaires, résiduel assumé. Le threat model relie tous les audits en une vue cohérente et priorisée — se mettre à la place de l'attaquant et prioriser par le risque évite de se défendre au hasard.

## ⚠️ Erreurs probables et points à vérifier
- Prioriser par la peur au lieu du risque : sur-investir sur une menace spectaculaire mais improbable en négligeant une menace banale mais probable et grave.
- Oublier des acteurs (l'initié, l'uploadeur de document piégé) : chaque type d'attaquant a des surfaces et moyens différents.
- Un threat model sans contre-mesures ni résiduel : lister les menaces sans y répondre ni assumer ce qui reste ne sécurise rien.
- Faire une usine à gaz : un threat model LÉGER (5 menaces priorisées) pour un projet, pas un document de 50 pages jamais relu.

## 🔍 Comment vérifier ta solution
- Les acteurs sont listés avec leurs capacités.
- Les surfaces d'attaque sont cartographiées.
- 5 menaces sont dérivées (STRIDE comme aide) et PRIORISÉES par risque (probabilité × impact).
- Chaque menace prioritaire a une contre-mesure et un résiduel assumé.
- Le threat model relie les audits précédents (injection, moindre privilège, secrets, données).
- Une menace est explorée sous plusieurs vecteurs (variante).

## 🎤 À savoir expliquer à l'oral
Déroule la démarche en te mettant en attaquant : « qui pourrait m'attaquer, par où, pour obtenir quoi ? Je priorise par le risque — probabilité × impact, pas par la peur ; voici mes 5 menaces les plus graves, leurs contre-mesures, et ce qui reste ». Penser en attaquant et prioriser par le risque est une posture de sécurité mûre — c'est exactement le raisonnement qu'un entretien sécurité évalue.
