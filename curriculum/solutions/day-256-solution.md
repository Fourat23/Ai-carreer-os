# Correction — Jour 256 : Métriques : fidélité, pertinence, exactitude

[← Retour au jour 256](../days/day-256.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Les trois axes sont orthogonaux : fidélité (vs extraits), pertinence (vs question), exactitude (vs vérité externe). On les mesure séparément parce que chaque combinaison d'échec pointe un étage différent (corpus, retrieval, compréhension). La matrice de diagnostic transforme trois scores en actions ciblées ; une note globale les perdrait.

## ⚠️ Erreurs probables et points à vérifier
- Fusionner en une note « qualité » : tu perds le diagnostic — impossible de savoir quoi réparer.
- Optimiser l'exactitude seule : une partie du score peut venir de la mémoire du modèle (infidèle) et s'effondrer sur de nouvelles données — le piège classique.
- Juger la pertinence AVEC les extraits sous les yeux : le juge confond « pertinent pour la question » et « cohérent avec les extraits » — juge la pertinence question<->réponse seule.
- Ignorer le cas fidèle-mais-inexact : il accuse le CORPUS (sources fausses/mal chunkées), pas le générateur — sans la matrice, on optimiserait le mauvais étage.

## 🔍 Comment vérifier ta solution
- Les trois évaluateurs tournent séparément (fidélité et pertinence par juge, exactitude vs vérité).
- La matrice de diagnostic est construite et chaque combinaison d'échec est comptée.
- Au moins un cas « exact mais infidèle » est identifié et son danger expliqué.
- L'action prioritaire découle de la combinaison la plus fréquente, pas d'une intuition.

## 🎤 À savoir expliquer à l'oral
Déroule la matrice avec le cas piège : « exact mais infidèle — la réponse est juste, mais le modèle a répondu de sa mémoire, pas des sources ; ça marche sur mon corpus, ça hallucinera ailleurs — seule la fidélité SÉPARÉE le détecte ». Cette démonstration qu'un bon score peut mentir est un moment d'entretien mémorable.
