# Correction — Jour 81 : Trade-offs et anti-patterns : penser en ingénieur

[← Retour au jour 81](../days/day-081.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Développer le raisonnement par trade-offs : pour chaque décision, identifier l'axe en tension, poser 2-3 options réelles, peser selon les critères issus du CONTEXTE, choisir, et nommer ce qu'on sacrifie ET le signal de révision. Reconnaître les anti-patterns (sur-ingénierie, optimisation prématurée, god-object) dans son propre code. La preuve : chaque analyse répond à « pourquoi X plutôt que Y » sans dogme, avec sacrifice et signal explicites.

## ✅ Une solution simple
Justifier quelques choix techniques de ses projets. On explique ses décisions.

## 🚀 Une solution améliorée
Produire 3 analyses de trade-off COMPLÈTES sur des décisions passées réelles (options / critères contextuels / choix / sacrifice / signal de révision), et identifier 3 anti-patterns dans son propre code avec explication. Montrer que les mêmes options se tranchent différemment selon le contexte, et répondre à « pourquoi X plutôt que Y » sans aucun dogme.

## ⚠️ Erreurs probables et points à vérifier
- Chercher LA solution parfaite : elle n'existe pas ; toute décision sacrifie quelque chose.
- Répondre par des dogmes (« il faut toujours… ») au lieu de peser le contexte.
- Sur-ingénierie : résoudre des problèmes hypothétiques qu'on n'a pas encore.
- Omettre le sacrifice et le signal de révision : la décision paraît subie, pas réfléchie.

## 🔍 Comment vérifier ta solution
- 3 analyses de trade-off complètes sur TES décisions passées (options/critères/choix/sacrifice/signal de révision).
- 3 anti-patterns identifiés dans ton propre code avec explication.
- Chaque analyse répond à « pourquoi X plutôt que Y » sans dogme.
- Le sacrifice et le signal de révision sont explicites pour chaque décision.

## ❓ Réponses du mini-quiz
1. **Pourquoi la question n'est-elle jamais « quelle est la meilleure solution ? » ?**
   → Parce que toute solution sacrifie quelque chose : il n'y a pas de solution parfaite. La bonne question est « quelle est la mieux ADAPTÉE à ces contraintes ? » — la maturité consiste à nommer ce qu'on sacrifie et à choisir selon le contexte.
2. **Que doit contenir une analyse de trade-off complète ?**
   → Les options réelles (2-3), les critères issus du CONTEXTE (volume, équipe, budget, délai), le choix, et surtout ce qu'on SACRIFIE et le signal qui ferait changer d'avis.
3. **Qu'est-ce qu'un anti-pattern, et quel est le plus courant ?**
   → Une solution récurrente qui semble bonne mais nuit à terme. Le plus courant est la sur-ingénierie : construire pour des besoins hypothétiques (résoudre des problèmes qu'on n'a pas).
4. **Quelle est la différence entre répondre par un dogme et par un trade-off ?**
   → Le dogme applique une règle sans contexte (« il faut toujours des microservices »). Le trade-off pèse la règle contre le contexte (« ici ils coûteraient plus qu'ils ne rapportent »). L'entretien senior attend des trade-offs, pas des dogmes.

## 🎤 À savoir expliquer à l'oral
Pose le principe : « il n'y a pas de solution parfaite ; j'arbitre selon le contexte et je nomme ce que je sacrifie ». Déroule une analyse réelle (SQLite vs Postgres) avec options, critères contextuels, choix, sacrifice ET signal de révision — c'est ce dernier point qui impressionne. Reconnaître un anti-pattern dans ton propre code (sur-ingénierie) montre une lucidité rare. Insister sur « trade-offs, jamais dogmes » est exactement ce qu'un entretien senior cherche à entendre.
