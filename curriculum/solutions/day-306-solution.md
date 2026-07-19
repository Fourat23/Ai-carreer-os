# Correction — Jour 306 : DocSense : dérisquage (spikes)

[← Retour au jour 306](../days/day-306.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : lister des risques et prévoir d'y travailler. Solution améliorée : identifier les risques MAJEURS (proba × impact), formuler une QUESTION binaire par risque, planifier un spike time-boxé (~2h, code jetable, livrable = la réponse), et définir la décision que chaque spike informera. Un spike qui révèle un problème est un succès. Le dérisquage précoce paie un petit coût maintenant pour éliminer l'incertitude majeure.

## ⚠️ Erreurs probables et points à vérifier
- Confondre spike et développement : un spike répond à une question de risque en 2h, il ne construit pas la fonctionnalité — code jetable assumé.
- Dérisquer des risques mineurs : concentrer les spikes sur ce qui pourrait FAIRE ÉCHOUER le projet (impact fort), pas sur le confort.
- Spike sans question binaire : « explorer l'ingestion » n'a pas de fin ; « les tableaux survivent-ils ? oui/non » se répond en 2h.
- Ignorer un spike qui révèle un problème : c'est justement le signal le plus précieux — adapter le plan MAINTENANT, pas en semaine 6.

## 🔍 Comment vérifier ta solution
- 3 risques MAJEURS sont identifiés (proba × impact justifiés).
- Chaque risque a une question de spike binaire et précise.
- Chaque spike est time-boxé (~2h) avec un livrable = la réponse.
- La décision informée par chaque spike est explicitée.
- Le ratio coût-du-spike vs coût-si-explosion-tardive est estimé (variante).

## 🎤 À savoir expliquer à l'oral
Explique le dérisquage comme de l'humilité outillée : « je reconnais ce que je ne SAIS pas encore — mon extraction PDF marche-t-elle sur mon corpus ? — et je le teste en 2h avant de construire 5 semaines dessus ; un spike qui révèle un problème m'a fait économiser des semaines ». Attaquer l'incertitude tôt, quand elle est bon marché, est un marqueur d'ingénieur expérimenté.
