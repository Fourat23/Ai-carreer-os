# Correction — Jour 293 : Exercice d'architecture

[← Retour au jour 293](../days/day-293.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : dessiner un flux ingestion + requête. Solution améliorée : dérouler la MÉTHODE complète — clarifier les exigences (elles déterminent l'architecture), estimer les ordres de grandeur (ils orientent les choix), dessiner le flux de haut niveau, approfondir 2-3 points durs, et énoncer les TRADE-OFFS de chaque choix justifiés par une contrainte. Le processus (dirigé, à voix haute, avec limites assumées) compte plus que l'architecture exacte.

## ⚠️ Erreurs probables et points à vérifier
- Dessiner avant de clarifier les exigences : l'architecture dépend du volume/débit/latence — sauter cette étape produit un design hors sol.
- Oublier d'estimer les ordres de grandeur : sans chiffres, impossible de justifier vector DB managée vs fichier, sync vs async.
- Ne pas énoncer les trade-offs : un design présenté comme « la » solution sans coûts est suspect — chaque choix a un prix.
- Rester muet ou dérouler en silence : l'évaluateur note le RAISONNEMENT — penser à voix haute est la moitié de l'exercice.

## 🔍 Comment vérifier ta solution
- L'exercice commence par clarifier les exigences (questions posées avant de dessiner).
- Les ordres de grandeur sont estimés (volume, débit, stockage, coût).
- Le flux ingestion + requête est dessiné au niveau composants.
- 2-3 points durs sont approfondis (reprise, fraîcheur, budget).
- Chaque choix majeur est accompagné de son trade-off justifié par une contrainte.
- L'exercice est fait chronométré à voix haute (variante).

## 🎤 À savoir expliquer à l'oral
L'oral EST l'exercice : entraîne-toi à dérouler la méthode à voix haute en 45 min — « d'abord je clarifie : combien de docs, quel débit ? ; j'estime : 20M chunks → 80 Go → vector DB managée ; je dessine le flux ; j'approfondis la reprise ; et voici mes trade-offs ». Diriger l'exercice avec une méthode et verbaliser les arbitrages est ce qui fait réussir le design système.
