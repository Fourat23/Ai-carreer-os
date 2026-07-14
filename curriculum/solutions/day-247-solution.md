# Correction — Jour 247 : Hybrid search

[← Retour au jour 247](../days/day-247.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
RRF est correct s'il opère sur des classements élargis (top-20 par moteur), s'il est insensible aux échelles de scores (il ne les lit jamais), et si sa mesure se compare à la cible d'hier : l'union des réussites. L'analyse du résidu (les questions sous le plafond) prépare l'étage suivant.

## ⚠️ Erreurs probables et points à vérifier
- Fusionner les top-3 : un chunk rang 8 vectoriel + rang 2 lexical mérite de gagner mais n'entre jamais dans la fusion — élargir d'abord, tronquer après.
- Normaliser puis additionner les scores bruts « pour faire mieux que RRF » : fragile (échelles, distributions), à re-calibrer sans cesse — c'est le piège que RRF existe pour éviter.
- Oublier que bm25 SQLite est un coût lors de la construction du classement lexical : un tri inversé en entrée détruit la fusion en silence.
- Attendre de l'hybride qu'il batte le plafond de l'union : par construction il ne peut que s'en approcher — le résidu est un fait, pas un échec.

## 🔍 Comment vérifier ta solution
- RRF testé unitairement : deux classements jouets, scores calculés à la main, égalité vérifiée.
- Le tableau vectoriel/lexical/hybride/union est complet sur le golden set étendu.
- Les identifiants (4/4 lexical) sont récupérés par l'hybride SANS perdre les reformulées.
- La ou les questions sous le plafond sont identifiées avec leur explication (rangs dans chaque moteur).

## 🎤 À savoir expliquer à l'oral
Écris RRF au tableau de mémoire (Σ 1/(k+rang)) et déroule UN exemple à deux moteurs en 30 secondes. Puis le chiffre : « 19 → 22, plafond 23, résidu identifié ». Formule + mesure + prochaine étape : la réponse complète tient en une minute.
