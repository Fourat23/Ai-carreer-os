# Correction — Jour 80 : Cache et performance : les fondamentaux

[← Retour au jour 80](../days/day-080.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Optimiser par la MESURE : profiler pour trouver le vrai goulot, corriger, re-mesurer pour prouver le gain. Identifier et corriger un N+1 (requêtes qui croissent avec la liste → JOIN/batch), et ajouter un cache uniquement sur une lecture coûteuse et stable, avec une stratégie d'invalidation explicite (TTL + purge à l'écriture). La preuve : chiffres avant/après, et une stratégie d'invalidation écrite (pas juste « on cache »).

## ✅ Une solution simple
Repérer une lenteur et ajouter un cache ou un JOIN. L'API va plus vite.

## 🚀 Une solution améliorée
MESURER d'abord (nombre de requêtes, temps) pour identifier le vrai goulot, corriger le N+1 par un JOIN/batch avec gain re-mesuré (chiffres avant/après), et n'ajouter un cache que sur une lecture coûteuse et stable, avec une stratégie d'invalidation explicite (TTL ET purge à l'écriture). Éviter l'optimisation prématurée et au hasard.

## ⚠️ Erreurs probables et points à vérifier
- Optimiser au hasard sans profiler : on traite un goulot supposé, souvent le mauvais.
- Laisser un N+1 (requêtes qui croissent avec la liste) : latence qui explose à l'échelle.
- Cache sans stratégie d'invalidation : des données périmées sont servies silencieusement.
- Optimisation prématurée : compliquer le code avant d'avoir un problème mesuré.

## 🔍 Comment vérifier ta solution
- Un vrai problème de perf identifié PAR MESURE (chiffres avant).
- Le N+1 corrigé par JOIN/batch, gain mesuré (chiffres après).
- Cache avec stratégie d'invalidation écrite (pas juste « on cache »).
- Re-mesure après optimisation pour prouver le gain et vérifier qu'il n'est pas déplacé.

## ❓ Réponses du mini-quiz
1. **Quelle est la règle n°1 de la performance ?**
   → MESURER avant d'optimiser : l'intuition se trompe presque toujours sur l'emplacement du goulot. On profile, on identifie le vrai goulot, on optimise, on re-mesure pour prouver le gain. Optimiser sans mesurer, c'est deviner.
2. **Qu'est-ce que le problème N+1 et comment le corriger ?**
   → Faire 1 requête pour une liste + 1 requête par élément (51 requêtes pour 50 emprunts). Symptôme : le nombre de requêtes croît avec la liste. Correction : un JOIN ou une requête batch (WHERE id IN (...)).
3. **Qu'échange un cache, et sur quoi n'accélère-t-il que ?**
   → Il échange de la FRAÎCHEUR (résultat potentiellement périmé) contre de la VITESSE. Il n'accélère que ce qui est lu SOUVENT et change PEU.
4. **Quels sont les deux problèmes difficiles du cache ?**
   → L'INVALIDATION (quand purger pour ne pas servir du périmé — trop tôt inutile, trop tard faux) et le NOMMAGE (la clé de cache : identifier correctement ce qui est caché). Un cache sans stratégie d'invalidation sert du périmé silencieusement.

## 🎤 À savoir expliquer à l'oral
Martèle la règle n°1 : « mesurer avant d'optimiser — l'intuition se trompe ; je profile, je corrige la vraie cause, je re-mesure ». Explique le N+1 en chiffres (51 requêtes → 1 par JOIN) comme exemple de goulot mesuré. Puis le cache : « fraîcheur contre vitesse, seulement sur du lu-souvent/change-peu, avec invalidation explicite — sinon il sert du périmé ». Citer les deux problèmes difficiles (invalidation, nommage) montre que tu connais les pièges, pas juste la technique.
