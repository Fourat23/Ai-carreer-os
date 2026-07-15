# Correction — Jour 267 : Projet 6 — DocQA : baseline chiffrée

[← Retour au jour 267](../days/day-267.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La baseline fige le système et le mesure sur TOUTES les dimensions (retrieval, génération par type, sécurité, latence, coût), enregistrée et datée comme référence immuable. Elle sert de point de comparaison ET de diagnostic priorisant les chantiers par faiblesse mesurée. Aucune correction pendant la mesure — l'état est intact, le contraste avant/après viendra ensuite.

## ⚠️ Erreurs probables et points à vérifier
- Corriger « un petit truc » pendant la mesure : chaque correction invalide le point de comparaison — la baseline mesure l'existant intact.
- Une baseline unidimensionnelle (exactitude seule) : une amélioration peut gagner en exactitude et dégrader latence/sécurité — la baseline doit être multidimensionnelle pour le voir.
- Ne pas enregistrer/dater la baseline : sans référence sauvegardée, les comparaisons des jours suivants n'ont rien contre quoi mesurer.
- Choisir les améliorations par envie plutôt que par la baseline : les chantiers sortent des faiblesses MESURÉES (synthèses à 0,50), pas de ce qui est amusant à coder.

## 🔍 Comment vérifier ta solution
- La baseline couvre retrieval + génération par type + sécurité + latence + coût.
- Le rapport est enregistré, daté, versionné (config + golden version).
- Aucune modification du système pendant la mesure (état intact vérifié).
- Les chantiers des jours 268-269 sont priorisés par faiblesse mesurée, avec une hypothèse testable chacun.
- La confirmation « synthèses = génération » est reliée aux jours 244/249.

## 🎤 À savoir expliquer à l'oral
Présente la baseline comme un point de départ d'ingénieur : « avant de toucher quoi que ce soit, je photographie l'état — toutes les dimensions, daté, figé ; ça me donne le point de comparaison ET les chantiers priorisés par faiblesse mesurée ». Puis la règle : « je ne corrige rien pendant la mesure ». Discipline de mesure = crédibilité.
