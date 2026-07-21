# Correction — Jour 128 : pandas : nettoyer (data quality)

[← Retour au jour 128](../days/day-128.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : dropna, drop_duplicates, quelques conversions. Solution améliorée : mesurer l'état AVANT, traiter les formats/types d'abord (dates, casse) puis les valeurs impossibles, choisir pour les manquants une stratégie JUSTIFIÉE selon le contexte (médiane si aberrants), définir la CLÉ d'un doublon avant de dédoublonner, mesurer l'état APRÈS, et produire un rapport avant/après avec la justification de chaque décision. La preuve : chaque choix est chiffré et argumenté, le biais introduit est assumé.

## ⚠️ Erreurs probables et points à vérifier
- Imputer/supprimer sans justifier : chaque décision introduit un biais — l'assumer et le documenter, pas le cacher.
- Dédoublonner sans définir la clé métier : on efface des données légitimes.
- Oublier de normaliser la casse/les espaces : 'Livre' et 'livre' comptés comme deux catégories distinctes.
- Ne pas produire de rapport avant/après : le nettoyage devient une boîte noire, l'analyse en aval invérifiable.

## 🔍 Comment vérifier ta solution
- L'état avant (manquants, doublons, types) est mesuré.
- Chaque décision (supprimer/imputer/corriger) est justifiée selon le contexte.
- La clé d'un doublon est définie avant dédoublonnage.
- Les formats et la casse sont normalisés.
- Un rapport avant/après chiffré documente toutes les décisions.

## 🎤 À savoir expliquer à l'oral
Martèle que « le nettoyage n'est jamais neutre » : chaque décision (supprimer/imputer/corriger) a un biais. Déroule les trois options pour les manquants avec leurs coûts, la nécessité de définir la clé d'un doublon, et surtout le rapport avant/après. Comparer deux stratégies (dropna vs médiane) sur une statistique clé prouve que tu comprends l'impact réel de tes choix.
