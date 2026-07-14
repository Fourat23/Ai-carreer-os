# Correction — Jour 199 : Température et paramètres

[← Retour au jour 199](../days/day-199.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
L'étude est une expérience contrôlée : mêmes prompts, même modèle, seule la température varie, 3 runs par condition pour estimer la variance. La conclusion opérationnelle : temp 0 pour le structurel/factuel, temp haute pour le divergent — documentée par TES exemples.

## ⚠️ Erreurs probables et points à vérifier
- Un seul run par condition : tu compares deux tirages de dés et tu crois comparer deux réglages.
- Juger la qualité créative à temp 0 « mauvaise » : elle est surtout UNIFORME — c'est la diversité qui manque, pas la compétence.
- Extrapoler « temp 0 = fiable » : la température ne corrige pas les hallucinations (jour 201).

## 🔍 Comment vérifier ta solution
- Le tableau couvre 5 tâches × 2 températures × 3 runs.
- Chaque conclusion cite un exemple concret de tes runs.
- Tu sais citer une tâche où temp 1 est le BON choix (et pourquoi).

## 🎤 À savoir expliquer à l'oral
Explique température et top-p avec l'image de la loterie : temp 0 = on prend le billet le plus probable ; temp haute = on pioche plus large ; top-p = on jette d'abord les billets improbables. Puis la règle : la sortie est-elle pour une machine ou pour un humain ?
