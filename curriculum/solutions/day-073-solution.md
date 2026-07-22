# Correction — Jour 73 : Git avancé : rebase, historique propre, collaboration

[← Retour au jour 73](../days/day-073.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Nettoyer une branche de travail par rebase interactif (squash/reword) pour obtenir un historique linéaire et lisible, en respectant la règle absolue : ne jamais rebaser des commits déjà partagés. Comprendre rebase (réécrit, linéaire, avant partage) vs merge (fusion, fidèle, après). Écrire une PR qui raconte le pourquoi. La preuve : 5 commits brouillons deviennent 2 commits propres, et un conflit de rebase est résolu sereinement.

## ✅ Une solution simple
Regrouper quelques commits brouillons en un commit propre par rebase interactif. L'historique est plus lisible.

## 🚀 Une solution améliorée
Transformer 5 commits brouillons en 2 commits cohérents et bien nommés par rebase interactif (squash + reword), provoquer et résoudre un conflit de rebase, respecter la règle « jamais sur du partagé », et écrire une description de PR type (contexte / changements / vérification). Savoir expliquer rebase vs merge et --force-with-lease.

## ⚠️ Erreurs probables et points à vérifier
- Rebaser des commits déjà poussés/partagés : réécrit l'histoire des autres et corrompt leurs dépôts.
- Laisser un historique de brouillons (wip, fix, fix2) : illisible, non documentaire, mauvais signal.
- PR qui liste les fichiers modifiés au lieu de raconter le pourquoi (le diff montre déjà le quoi).
- Utiliser un push --force brut au lieu de --force-with-lease : risque d'écraser un travail distant non vu.

## 🔍 Comment vérifier ta solution
- Les 5 commits brouillons nettoyés en 2 commits propres par rebase interactif.
- Un conflit de rebase provoqué et résolu sereinement.
- Description de PR type écrite (contexte / changements / vérification).
- La règle « jamais rebaser du partagé » est respectée et sait être expliquée.

## ❓ Réponses du mini-quiz
1. **Quelle est la différence entre rebase et merge ?**
   → Le merge crée un commit de fusion reliant deux lignes (historique en losange, fidèle à la chronologie). Le rebase REJOUE tes commits par-dessus la base à jour (historique linéaire et lisible) mais RÉÉCRIT tes commits (nouveaux identifiants).
2. **Quelle est la règle de sécurité absolue du rebase ?**
   → Ne JAMAIS rebaser des commits déjà poussés/partagés : le rebase crée de nouveaux commits, donc si d'autres ont basé leur travail sur les anciens, on corrompt leurs dépôts. Rebase avant de partager, merge après.
3. **À quoi sert le rebase interactif (squash/reword/drop) ?**
   → À transformer une branche de travail brouillonne (cinq « wip ») en une histoire propre (deux commits cohérents et bien nommés), avant de la partager : squash fusionne, reword renomme, drop supprime.
4. **Que doit raconter une bonne pull request ?**
   → Le POURQUOI : le contexte, ce qui change, comment vérifier. Pas la liste des fichiers modifiés (le diff le montre) — l'intention et le raisonnement.

## 🎤 À savoir expliquer à l'oral
Oppose clairement : « merge fusionne et garde l'histoire fidèle en losange ; rebase rejoue et donne un historique linéaire, mais réécrit — donc jamais sur du partagé ». Explique le rebase interactif pour nettoyer une branche avant de la partager, et pourquoi un historique propre est une documentation (revue, bisect). Mentionner --force-with-lease pour renettoyer sa propre branche non partagée montre une maîtrise fine, au-delà des commandes de base.
