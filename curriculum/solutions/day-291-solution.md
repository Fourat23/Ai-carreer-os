# Correction — Jour 291 : Monolithe modulaire vs microservices

[← Retour au jour 291](../days/day-291.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : comparer les styles sur quelques axes et conclure. Solution améliorée : comparer sur des axes CONCRETS (déploiement, communication, complexité opérationnelle, débogage, scaling, équipes), identifier ce que les microservices résolvent VRAIMENT (échelle organisationnelle, pas problème de code), assumer leur coût (complexité distribuée permanente), et conclure pour DocSense (monolithe modulaire + événementiel, découpable plus tard). La règle : ne jamais commencer par des microservices.

## ⚠️ Erreurs probables et points à vérifier
- Choisir les microservices par mode/CV-driven : ils importent une taxe opérationnelle permanente rarement justifiée pour un petit projet.
- Croire que les microservices « rendent le code plus propre » : la propreté vient du découpage modulaire (hexagonal), qu'un monolithe offre aussi — sans le coût réseau.
- Sous-estimer le coût distribué : réseau, débogage éclaté, cohérence des données, infra — une liste longue qui pèse en permanence.
- Opposer monolithe et modularité : un monolithe MODULAIRE est très modulaire ; le monolithe critiqué est le monolithe SPAGHETTI, un autre problème.

## 🔍 Comment vérifier ta solution
- La comparaison couvre des axes concrets (déploiement, communication, complexité, débogage, scaling, équipes).
- Ce que les microservices résolvent vraiment (échelle organisationnelle) est identifié.
- Le coût distribué des microservices est assumé explicitement.
- La conclusion pour DocSense (monolithe modulaire) est justifiée.
- La liste de ce qu'il faudrait ajouter pour passer en microservices est faite (variante).

## 🎤 À savoir expliquer à l'oral
Défends « monolithe modulaire d'abord » : « bien découpé en hexagonal, il donne 90 % des bénéfices de la modularité pour 10 % du coût opérationnel ; les microservices résolvent l'échelle organisationnelle, pas un problème de code, et coûtent une complexité distribuée permanente — je découpe en services plus tard, sur besoin réel ». Résister à la hype microservices avec cet argument est le consensus senior — un signal de maturité.
