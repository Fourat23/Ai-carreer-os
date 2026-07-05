# Correction — Jour 80 : Cache et performance : les fondamentaux

[← Retour au jour 80](../days/day-080.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Optimiser SANS mesurer = deviner. Le cache échange fraîcheur contre vitesse ; ses 2 problèmes durs : l'invalidation et le nommage. Le N+1 (une requête par élément d'une liste) se corrige par un JOIN ou un batch.

## ⚠️ Erreurs probables et points à vérifier
- Optimiser au hasard sans profiler.
- Cache sans stratégie d'invalidation (données périmées servies).

## 🧩 Questions de réflexion
- Où est le vrai goulot ? L'as-tu MESURÉ ou deviné ?
