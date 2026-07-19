# Correction — Jour 324 : DocSense : détection d'incohérences

[← Retour au jour 324](../days/day-324.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : comparer les documents deux à deux. Solution améliorée : extraire les affirmations d'un document, retrouver par retrieval les passages du corpus sur les mêmes sujets, les comparer par le LLM (raisonnement sémantique, pas diff textuel), logger le raisonnement (traçable, jour 297), et signaler avec un format vérifiable (doc A / doc B / conflit). La précision est cruciale (un faux signalement érode la confiance) ; le raisonnement visible rend la fonctionnalité digne de confiance.

## ⚠️ Erreurs probables et points à vérifier
- Comparer par diff textuel : rate les contradictions sémantiques (même sens, mots différents) — le LLM compare le SENS.
- Raisonnement non loggé : un signalement sans justification traçable est inexploitable et non débuggable — logger (jour 297).
- Négliger la précision : un faux signalement d'incohérence érode la confiance — viser des signalements RÉELS et vérifiables.
- Comparer chaque document à tous les autres naïvement : coûteux ; utiliser le retrieval pour ne comparer que les passages sur les mêmes sujets.

## 🔍 Comment vérifier ta solution
- La détection confronte un document au reste du corpus par raisonnement sémantique.
- Le raisonnement (passages comparés, verdict) est loggé et traçable.
- Le signalement précise doc A / doc B / nature du conflit (vérifiable).
- Une incohérence injectée volontairement est détectée ET justifiée (variante).
- La précision est soignée (pas de faux signalements évidents).

## 🎤 À savoir expliquer à l'oral
Explique pourquoi c'est du raisonnement, pas un diff : « un diff ne verrait pas qu'on-utilise-Chroma contredit stockage-JSON — il faut comprendre le sens ; mon workflow retrouve les passages sur le même sujet et le LLM juge la cohérence, avec le raisonnement loggé pour que l'utilisateur vérifie ». Une fonctionnalité de valeur métier avec un raisonnement traçable est une démonstration qui marque.
