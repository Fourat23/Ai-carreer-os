# Correction — Jour 142 : Projet 4 — Extract

[← Retour au jour 142](../days/day-142.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : lire le CSV / appeler l'API. Solution améliorée : capturer le brut fidèlement sans transformer, gérer les défaillances de source (FileNotFoundError, timeout, erreur HTTP) avec des exceptions spécifiques et des messages clairs, faire un retry avec backoff sur les erreurs transitoires (429/timeout) mais pas sur un 404, contrôler la forme minimale tôt (colonnes attendues), et matérialiser le brut en staging. La preuve : couper la source produit un message clair, et le transform se rejoue sans re-télécharger.

## ⚠️ Erreurs probables et points à vérifier
- Supposer la source toujours disponible et bien formée : casse au premier incident réel.
- Nettoyer pendant l'extraction : empêche de rejouer le transform sans re-télécharger.
- Retry aveugle sur toute erreur (y compris un 404 définitif) : boucle inutile — retry seulement sur les transitoires.
- Ne pas contrôler la forme : une source qui change de schéma fait dérailler tout le pipeline sans diagnostic clair.

## 🔍 Comment vérifier ta solution
- L'extraction capture le brut sans le transformer.
- Les défaillances de source sont rattrapées avec un message clair.
- Le retry avec backoff ne s'applique qu'aux erreurs transitoires.
- La forme minimale (colonnes attendues) est vérifiée tôt.
- Le brut est matérialisé en staging pour rejouer la suite.

## 🎤 À savoir expliquer à l'oral
Définis l'extraction : « capturer la source telle quelle en survivant à ses défaillances propres ». Détaille indisponibilité (message clair), rate limit (backoff sur transitoire, pas sur 404), contrôle de forme tôt, staging. Le test « je coupe la source et j'obtiens un message clair » prouve que tu as conçu pour le réel, pas pour le fichier de démo parfait.
