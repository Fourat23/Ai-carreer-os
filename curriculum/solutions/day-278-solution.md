# Correction — Jour 278 : Agent vs workflow : les critères

[← Retour au jour 278](../days/day-278.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : classer chaque tâche par flux fixe (script/workflow) ou variable (agent). Solution améliorée : appliquer les critères dans l'ordre (flux fixe ? raisonnement requis ? variabilité justifie le coût de l'autonomie ? reproductibilité exigée ?), justifier chaque choix par coût/fiabilité/adaptation, et par défaut choisir le niveau le plus BAS, en ne montant que sur preuve d'insuffisance. La règle : un agent est le choix le plus cher et le moins fiable, réservé aux flux vraiment imprévisibles.

## ⚠️ Erreurs probables et points à vérifier
- Choisir l'agent par défaut (effet hype) : c'est le niveau le plus cher, lent et fragile — le script/workflow est le défaut.
- Confondre « la tâche utilise un LLM » et « il faut un agent » : un workflow utilise un LLM DANS des étapes fixes, sans l'autonomie coûteuse.
- Ne pas justifier par coût/fiabilité/adaptation : une décision sans critères est une préférence, pas une ingénierie.
- Oublier le critère de reproductibilité : une tâche qui exige des résultats stables disqualifie l'agent (non déterministe).

## 🔍 Comment vérifier ta solution
- Les 5 tâches sont classées avec une justification par coût/fiabilité/adaptation.
- Au moins une tâche instinctivement « agent » est ré-exprimée en workflow (variante).
- Les critères sont appliqués dans l'ordre (flux fixe → raisonnement → variabilité → reproductibilité).
- La règle « niveau le plus simple, monter sur preuve » est explicitement appliquée.
- Le seul vrai cas d'agent (flux imprévisible) est identifié et distingué des faux.

## 🎤 À savoir expliquer à l'oral
Défends la position contre-intuitive : « le meilleur choix sur les agents est souvent de ne pas en faire — un agent est le plus cher, le plus lent, le moins fiable ; je commence par un script ou un workflow et je ne monte que sur preuve d'insuffisance ». Puis un exemple : « une tâche que j'aurais faite en agent, un workflow à 4 branches l'a résolue pour un dixième du coût ». Ce jugement impressionne plus que n'importe quel agent complexe.
