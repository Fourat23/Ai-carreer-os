# Correction — Jour 85 : Projet 2 — LivreAPI : durcissement final et performance

[← Retour au jour 85](../days/day-085.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Durcir LivreAPI par une checklist de SYNTHÈSE appliquant tout le mois (sécurité OWASP, index mesurés, cache raisonné avec invalidation, logs structurés + correlation id, tests d'intégration), puis lancer un test de charge léger pour révéler ce que le clic cache (fuites de connexions, latences sous concurrence), mesurer et interpréter. La preuve : la checklist est appliquée avec preuves et le test de charge est exécuté et interprété.

## ✅ Une solution simple
Ajouter de la sécurité, un index et des logs à LivreAPI. Le projet est plus solide.

## 🚀 Une solution améliorée
Appliquer la checklist complète du mois AVEC PREUVES (sécurité auditée, index justifiés par mesure, N+1 corrigés, cache à invalidation, logs+correlation id, tests d'intégration verts), lancer un test de charge léger (requêtes concurrentes), INTERPRÉTER les résultats (latence, erreurs, fuites), et corriger ce que la charge révèle. Viser « défendable en entretien sans rougir ».

## ⚠️ Erreurs probables et points à vérifier
- S'arrêter au « ça marche » sans durcir : le projet trahit son statut de tutoriel à l'inspection.
- Ne pas faire de test de charge : on découvre les limites (fuites, latences) en production.
- Ajouter un index ou un cache sans mesure : optimisation non prouvée (jour 80).
- Durcir à l'infini : rendement décroissant ; viser défendable en entretien, pas la perfection industrielle.

## 🔍 Comment vérifier ta solution
- La checklist complète du mois appliquée (sécurité, index, cache, logs) avec preuves.
- Un test de charge léger exécuté et les résultats interprétés.
- LivreAPI prête à être montrée : tu la défendrais en entretien sans rougir.
- Ce que la charge a révélé (fuite, latence) est corrigé et re-testé.

## ❓ Réponses du mini-quiz
1. **Pourquoi le durcissement est-il un exercice de synthèse ?**
   → Il applique toutes les compétences du mois EN MÊME TEMPS sur un vrai projet (sécurité, index, cache, logs), ce qui teste leur intégration réelle — là où chacune prise isolément n'est que de la théorie.
2. **Qu'est-ce qui distingue un projet crédible d'un projet de tutoriel ?**
   → Un tutoriel s'arrête à « ça marche quand je clique ». Un projet crédible SURVIT à l'inspection (code, sécurité, tests, doc) ET à la charge (requêtes concurrentes sans s'effondrer).
3. **Que révèle un test de charge léger que le clic manuel cache ?**
   → Tout ce qui ne se manifeste que sous CONCURRENCE : fuites de connexions à la base, latences qui explosent quand les requêtes s'accumulent, erreurs de race condition, saturation. Le clic teste une requête à la fois.
4. **Comment interprète-t-on un test de charge ?**
   → On mesure la latence et le taux d'erreur sous charge, et on repère les anomalies : erreurs après N requêtes (fuite de connexions), latence qui explose (goulot à profiler). On corrige ce que la charge révèle.

## 🎤 À savoir expliquer à l'oral
Présente le durcissement comme une SYNTHÈSE : « j'applique tout le mois d'un coup — sécurité, perf mesurée, observabilité, tests — sur le vrai projet ». Explique la double épreuve (inspection + charge) qui distingue un projet crédible d'un tutoriel, et pourquoi le test de charge révèle ce que le clic cache (fuites de connexions, latences sous concurrence). Donner un exemple concret révélé par la charge (fuite de connexions) prouve que tu penses production, pas seulement démo.
