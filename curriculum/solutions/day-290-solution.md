# Correction — Jour 290 : Event-driven et queues

[← Retour au jour 290](../days/day-290.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : lister les traitements longs de DocSense et proposer une queue pour chacun. Solution améliorée : distinguer ce qui GAGNE au découplage (ingestion, ré-indexation, évaluation, notifications — long/coûteux/pics) de ce qui reste synchrone (répondre à une question — le cycle requête-réponse est l'usage), dessiner le flux producteur → queue → workers, et ASSUMER les limites (complexité, flux non linéaire → observabilité, garantie de livraison → idempotence). On applique l'événementiel là où il apporte une valeur, pas partout.

## ⚠️ Erreurs probables et points à vérifier
- Tout passer en événementiel : la complexité (queue à opérer, flux non linéaire) ne se justifie que pour les traitements longs/pics — un appel synchrone qui marche reste synchrone.
- Oublier l'idempotence : une queue peut livrer un message deux fois — traiter un document en double doit être sans effet (lien jour 223).
- Ignorer l'observabilité : un flux événementiel est plus dur à suivre qu'un appel direct — sans logs/traces, le débogage devient un cauchemar (jour 297).
- Découpler ce qui n'a pas besoin de l'être (répondre à une question) : ajoute de la latence et de la complexité sans bénéfice.

## 🔍 Comment vérifier ta solution
- Les traitements longs/coûteux de DocSense sont identifiés comme candidats asynchrones.
- Ce qui reste synchrone (répondre à une question) est justifié.
- Un schéma producteur → queue → workers est dessiné pour un cas (ingestion).
- Les limites (complexité, flux non linéaire, garantie de livraison/idempotence) sont assumées.
- Le gain UX + résilience du découplage est explicité (variante).

## 🎤 À savoir expliquer à l'oral
Explique le découplage avec le cas d'ingestion : « au lieu de faire attendre l'utilisateur 30 s pendant l'embedding, j'émets un événement, je réponds immédiatement, un worker traite en arrière-plan et notifie ». Puis le jugement : « j'applique l'événementiel aux traitements longs et aux pics, PAS à répondre à une question — et j'assume la complexité et l'idempotence ». Savoir où NE PAS découpler est aussi important que savoir où le faire.
