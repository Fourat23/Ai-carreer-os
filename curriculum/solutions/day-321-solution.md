# Correction — Jour 321 : DocSense : jalon évaluation et reproductibilité

[← Retour au jour 321](../days/day-321.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : montrer que l'évaluation marche. Solution améliorée : démontrer l'infrastructure complète sur machine propre (git clone → docker compose up → docsense eval → dashboard avec baseline), plus une revue d'architecture (le cœur est-il resté pur, l'évaluation branchée par les ports ?). Ce jalon atteste que DocSense est mesurable, reproductible et suivi — le socle qui rend les améliorations restantes pilotables.

## ⚠️ Erreurs probables et points à vérifier
- Démontrer sur sa propre machine configurée : le test qui compte est sur machine PROPRE (clone + up).
- Infrastructure de qualité incomplète (dashboard sans baseline, éval non reproductible) : elle ne pilotera pas les améliorations — la compléter avant d'avancer.
- Sauter la revue d'architecture : l'ajout de l'infrastructure d'évaluation peut avoir contaminé le cœur — vérifier.
- Une infrastructure lente/pénible : si évaluer ou lancer prend trop de friction, elle ne sera pas utilisée — la rendre fluide.

## 🔍 Comment vérifier ta solution
- git clone + docker compose up fait tourner DocSense sur machine propre.
- docsense eval produit un rapport complet en une commande.
- Le dashboard affiche la tendance avec la baseline v0.
- La revue d'architecture confirme que le cœur est resté pur.
- Le parcours complet est fluide et chronométré (variante).

## 🎤 À savoir expliquer à l'oral
Décris le jalon comme un tournant : « à mi-parcours, DocSense n'est plus juste un moteur qui répond — il est mesurable (docsense eval), reproductible (docker compose up sur machine propre) et suivi (dashboard avec baseline) ». Puis l'implication : « ça rend les 6 dernières semaines d'amélioration pilotables — chaque changement mesuré, visualisé, démontré ». Une infrastructure de qualité à mi-projet signale un projet qui finira solide.
