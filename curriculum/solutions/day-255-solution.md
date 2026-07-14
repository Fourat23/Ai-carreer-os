# Correction — Jour 255 : LLM-as-judge

[← Retour au jour 255](../days/day-255.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Un LLM-judge fiable évalue UN critère opérationnel, sur une échelle discrète ancrée, en justifiant avant de noter (décomposition en affirmations), à température 0 avec sortie structurée, et CALIBRÉ contre l'humain sur un échantillon. Les biais (longueur, position, auto-préférence) sont connus et surveillés. C'est un proxy validé, pas une vérité.

## ⚠️ Erreurs probables et points à vérifier
- Demander « cette réponse est-elle bonne ? » : vague, non reproductible, mélange les axes — un critère à la fois, défini.
- Note sur 10 : les LLM ne sont pas calibrés sur une échelle continue — des niveaux discrets ancrés sont bien plus stables.
- Ne pas calibrer : le juge mesure alors ses propres biais ; sans comparaison humaine, ses scores sont ininterprétables.
- Ignorer le biais de longueur en optimisant vers le juge : le système apprend à écrire long, pas mieux — mesure le biais et surveille-le.
- Juger fidélité ET exactitude en même temps : ce sont deux axes (jour 256) — un extrait peut être fidèlement rapporté ET factuellement faux.

## 🔍 Comment vérifier ta solution
- Le juge décompose en affirmations atomiques et justifie chaque soutien avant le verdict.
- Sortie structurée validée, température 0.
- Calibration faite : accord >= 7/8 avec tes jugements humains sur l'échantillon.
- Le biais de longueur a été testé sur TON juge (variante).
- Le prompt de jugement est versionné (jour 211) — c'est un artefact critique.

## 🎤 À savoir expliquer à l'oral
Explique la calibration comme la clé de voûte : « un LLM-judge non calibré mesure les biais du modèle ; je note 8 cas moi-même, je compare, j'ajuste le prompt jusqu'à >= 7/8 d'accord ». Puis cite deux biais (longueur, auto-préférence). Utiliser l'outil ET le critiquer : c'est le niveau senior sur un sujet à la mode.
