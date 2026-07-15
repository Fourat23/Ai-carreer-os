# Correction — Jour 297 : Observabilité d'une app IA

[← Retour au jour 297](../days/day-297.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : ajouter des logs à chaque étape. Solution améliorée : des logs STRUCTURÉS (JSON requêtable) avec les champs spécifiques LLM (prompt/hash, tokens, coût, modèle, scores, guardrails), un CORRELATION ID propagé à toutes les étapes pour reconstituer le parcours complet (surtout en flux asynchrone), et une traçabilité qui rend un incident diagnosticable a posteriori. Le test de réussite : diagnostiquer une mauvaise réponse à partir des seuls logs, sans re-tester.

## ⚠️ Erreurs probables et points à vérifier
- Logs en texte libre : impossibles à requêter — structurés (JSON) pour pouvoir filtrer/agréger.
- Pas de correlation id : les logs des différentes étapes sont isolés et impossibles à raccorder, surtout en flux éventementiel.
- Oublier les champs spécifiques IA (tokens, coût, scores, prompt) : sans eux, on ne peut ni déboguer ni suivre les coûts ni détecter les dérives.
- Logger le prompt complet avec données personnelles : privacy — hash ou masquage (jour 296), surtout en production.

## 🔍 Comment vérifier ta solution
- Les logs sont structurés (JSON) et requêtables.
- Un correlation id par requête est propagé à toutes les étapes.
- Les champs spécifiques LLM (tokens, coût, modèle, scores, guardrails) sont loggés.
- Une session complète est reconstituable en filtrant par correlation id.
- Une mauvaise réponse est diagnosticable à partir des seuls logs (variante).
- Les données sensibles dans les logs sont masquées/hachées (privacy).

## 🎤 À savoir expliquer à l'oral
Explique le test de réussite : « mon observabilité marche si, quand un utilisateur signale une mauvaise réponse d'hier, je reconstitue toute la session par son correlation id — question, chunks et scores, prompt, réponse, coût — et je diagnostique sans re-tester : retrieval ou génération ? ». Puis les champs IA (tokens, coût, scores). Pouvoir diagnostiquer a posteriori est ce qui distingue un système de production d'un prototype.
