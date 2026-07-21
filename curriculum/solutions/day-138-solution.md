# Correction — Jour 138 : ETL : concevoir un pipeline

[← Retour au jour 138](../days/day-138.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : une fonction qui lit, traite et écrit. Solution améliorée : trois étapes strictement séparées — extract (lecture du brut + erreurs de source), transform (traitement en mémoire, fonctions pures testables, aucune écriture), load (écriture transactionnelle dans un schéma pensé) — composées proprement, avec un staging optionnel pour rejouer une étape sans refaire les précédentes. La preuve : chaque étape se teste isolément et une source/cible se remplace sans toucher au reste.

## ⚠️ Erreurs probables et points à vérifier
- Mélanger extraction et transformation : impossible de rejouer le traitement sans re-télécharger.
- Écrire en base depuis l'étape transform : couplage à la cible, transform non testable sans base.
- Une fonction fourre-tout E+T+L : intestable, impossible à rejouer partiellement ou à faire évoluer.
- Ne pas gérer les erreurs de source dans extract : une API en panne casse tout le pipeline sans diagnostic clair.

## 🔍 Comment vérifier ta solution
- Extract, transform et load sont trois responsabilités strictement séparées.
- Transform ne fait aucune écriture (fonctions pures en mémoire).
- Load écrit dans un schéma pensé, transactionnellement.
- Chaque étape est testable isolément.
- Une source ou une cible peut être remplacée sans réécrire le reste.

## 🎤 À savoir expliquer à l'oral
Déroule E/T/L en insistant sur la responsabilité STRICTE de chacune (extract lit, transform traite en mémoire, load écrit) et sur les bénéfices : rejouabilité sans re-télécharger, remplaçabilité des sources/cibles, débogage par localisation. Relier à l'architecture propre du jour 121 (responsabilités isolées) montre que tu vois le principe général derrière l'ETL.
