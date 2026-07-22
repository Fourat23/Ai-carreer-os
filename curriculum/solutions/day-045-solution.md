# Correction — Jour 45 : Projet 1 — TaskFlow : Store JSON et commandes de base

[← Retour au jour 45](../days/day-045.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Donner corps au contrat Store sans y coupler la logique : JsonStore implements Store, chargement qui distingue absent/valide/corrompu, sauvegarde qui crée le dossier, et commandes add/list. Générer les ids en max+1 pour éviter les doublons. Faire marcher un squelette de bout en bout d'abord, puis enrichir, avec des commits atomiques.

## ✅ Une solution simple
JsonStore avec load/save et les commandes add/list qui fonctionnent. Le cœur du projet tourne.

## 🚀 Une solution améliorée
Rendre le chargement ROBUSTE (trois cas explicitement gérés, arrêt sûr sur corruption sans écraser), créer le dossier data/ au besoin, générer les ids en max+1, persister de façon immuable (nouvelle liste), et livrer un historique de commits atomiques par fonctionnalité. Boucle de feedback sous 10 s validée.

## ⚠️ Erreurs probables et points à vérifier
- Générer les ids en length+1 : doublons après suppression.
- Oublier le mkdir du dossier data (écriture qui échoue au premier lancement).
- Confondre fichier absent et corrompu : planter au démarrage ou écraser des données valides.
- Muter la liste en place au lieu de persister une nouvelle liste (effets de bord difficiles à tester).

## 🔍 Comment vérifier ta solution
- add et list fonctionnent de bout en bout avec persistance réelle.
- Les trois cas de fichier (absent, valide, corrompu) sont gérés et testés un par un.
- Les ids restent uniques après une suppression (max+1 prouvé sur un scénario).
- L'historique contient au moins 2 commits atomiques aux messages clairs.

## ❓ Réponses du mini-quiz
1. **Pourquoi commencer par un « squelette qui marche » plutôt qu'une fonctionnalité parfaite ?**
   → Pour établir la boucle de feedback (coder → lancer → constater) sous 10 secondes. Un programme qui tourne se teste à chaque ajout ; un programme qui ne démarre pas fait coder à l'aveugle.
2. **Quels trois cas `charger()` doit-il distinguer, et pourquoi ?**
   → Fichier absent (premier lancement : liste vide, normal), JSON valide (on parse), JSON corrompu (on s'arrête SANS écraser). Confondre absent et corrompu fait planter au démarrage ou détruit des données.
3. **Pourquoi générer les ids en max+1 et non length+1 ?**
   → length+1 crée des doublons après suppression : ids [1,2,3], on supprime 2 → [1,3] (length 2) → prochain id 3 = collision. max([1,3])+1 = 4 reste unique quelles que soient les suppressions.
4. **Quelle limite a un JsonStore qui réécrit tout le fichier à chaque sauvegarde ?**
   → Simple et parfait pour un CLI personnel, mais inadapté aux gros volumes et à la concurrence (réécriture totale, pas de transactions) — d'où le passage à SQLite au jour 57.

## 🎤 À savoir expliquer à l'oral
Mets en avant la robustesse : « charger() distingue absent (normal), valide, et corrompu (je m'arrête sans écraser) ». Explique le bug d'id length+1 avec le scénario de suppression et pourquoi max+1 le résout. Souligne le « squelette qui marche d'abord » pour la boucle de feedback. Reconnaître la limite du JsonStore face à la concurrence (et annoncer SQLite) prouve que tu vois les compromis, pas seulement le code qui marche aujourd'hui.
