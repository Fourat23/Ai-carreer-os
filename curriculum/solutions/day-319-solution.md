# Correction — Jour 319 : DocSense : baseline officielle

[← Retour au jour 319](../days/day-319.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : noter les scores actuels. Solution améliorée : figer le système, mesurer TOUTES les dimensions (retrieval, génération par type, latence, coût) via le harnais, enregistrer immuablement (config + version + date), l'afficher comme v0 sur le dashboard, et ne JAMAIS la retoucher ni rien corriger pendant la mesure. La baseline multidimensionnelle transforme chaque amélioration en mesure et priorise les chantiers par faiblesse.

## ⚠️ Erreurs probables et points à vérifier
- Corriger « un petit truc » pendant la mesure : chaque correction invalide le point de comparaison — mesurer l'état intact.
- Baseline unidimensionnelle (un score) : une amélioration peut gagner ici et dégrader là — mesurer toutes les dimensions.
- Retoucher la baseline plus tard : elle devient mouvante et toutes les comparaisons perdent leur sens — immuable.
- Ne pas enregistrer config/version : une baseline sans contexte n'est pas reproductible ni comparable.

## 🔍 Comment vérifier ta solution
- La baseline couvre retrieval + génération par type + latence + coût.
- Elle est enregistrée immuablement (config + golden version + date).
- Elle est affichée comme v0 sur le dashboard.
- Aucune correction n'a été faite pendant la mesure (état intact).
- Les 2-3 chantiers prioritaires sont identifiés par faiblesse (variante).

## 🎤 À savoir expliquer à l'oral
Explique le rôle du point zéro : « ma baseline v0 est figée et immuable — c'est le chiffre contre lequel toute amélioration se compare ; sans elle, v1-est-meilleur n'a aucun sens ». Puis la discipline : « je ne corrige rien pendant la mesure, sinon je fausse mon propre point de départ ». La baseline transforme le travail de qualité en progrès démontrable.
