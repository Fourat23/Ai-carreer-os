# Correction — Jour 148 : Statistiques : tendance et dispersion

[← Retour au jour 148](../days/day-148.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : calculer la moyenne par groupe. Solution améliorée : calculer tendance centrale ET dispersion (moyenne, médiane, écart-type, IQR) par groupe, comparer moyenne et médiane pour détecter l'asymétrie, choisir la statistique représentative selon la forme, et INTERPRÉTER ce que les données disent vraiment — en signalant les cas où la moyenne ment. La preuve : l'interprétation distingue un groupe où la moyenne est fiable d'un groupe asymétrique où la médiane représente mieux.

## ⚠️ Erreurs probables et points à vérifier
- Rapporter la moyenne seule sur une distribution asymétrique : elle n'est pas représentative (outliers) — préférer la médiane.
- Donner une tendance centrale sans dispersion : « en moyenne 50 » cache des données groupées ou très étalées.
- Ignorer l'écart moyenne/médiane : c'est le signal d'une asymétrie à investiguer.
- Utiliser l'écart-type (sensible aux outliers) sans envisager l'IQR sur des données à valeurs extrêmes.

## 🔍 Comment vérifier ta solution
- Tendance centrale ET dispersion sont calculées (jamais l'une seule).
- Moyenne et médiane sont comparées pour détecter l'asymétrie.
- La statistique représentative est choisie selon la forme de la distribution.
- L'interprétation identifie où la moyenne ment.
- L'IQR est utilisé pour la dispersion résistante aux outliers quand pertinent.

## 🎤 À savoir expliquer à l'oral
Martèle « jamais une statistique seule » : tendance centrale + dispersion, toujours. Explique quand la moyenne ment (asymétrie, outliers) et pourquoi la médiane résiste, avec l'écart moyenne/médiane comme signal. L'exemple du salaire du PDG qui tire la moyenne est l'illustration parfaite — elle prouve que tu comprends ce qu'une statistique cache, pas juste comment la calculer.
