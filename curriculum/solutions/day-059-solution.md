# Correction — Jour 59 : Postman avancé : collections, variables, tests automatisés

[← Retour au jour 59](../days/day-059.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Faire de Postman un outil de test sérieux : variables d'environnement pour la portabilité, tests qui vérifient statut ET forme du corps (pas juste le statut), et un scénario enchaîné create → read → update → delete qui capture l'id créé et teste un flux réel. Exporter et versionner la collection (doc vivante + tests + démo). La preuve : la collection se rejoue de bout en bout d'un clic.

## ✅ Une solution simple
Une collection avec les requêtes CRUD et un test de statut par requête. On peut relancer les appels.

## 🚀 Une solution améliorée
Ajouter des variables d'environnement (baseUrl, token), des tests qui vérifient AUSSI la forme du corps (champs, types, valeurs), un scénario CRUD enchaîné (id capturé et réutilisé) qui passe d'un clic via Run collection, et exporter/versionner la collection dans le repo. Mentionner Newman pour l'exécution en CI.

## ⚠️ Erreurs probables et points à vérifier
- Ne tester que le statut, pas le corps : on rate un 200 au corps vide, malformé ou faux.
- Collection non exportée/versionnée : ni reproductible ni partageable, elle vit sur une seule machine.
- URLs en dur au lieu de variables d'environnement : impossible de basculer local/prod, duplication.
- Tester des endpoints isolés sans scénario enchaîné : on ne prouve pas qu'un flux réel fonctionne.

## 🔍 Comment vérifier ta solution
- Collection avec variables d'environnement, exportée et versionnée dans Git.
- Chaque requête a des tests (statut ET forme du corps).
- Le scénario CRUD enchaîné passe de bout en bout en un clic (Run collection).
- L'id créé est capturé et réutilisé dans les requêtes suivantes.

## ❓ Réponses du mini-quiz
1. **Quels sont les trois rôles d'une bonne collection Postman ?**
   → Documentation vivante (chaque requête montre l'usage réel, toujours à jour), suite de tests (assertions à chaque exécution), et outil de démo (importer et tout lancer d'un clic).
2. **Pourquoi tester le statut ne suffit-il pas ?**
   → Une API peut renvoyer 200 avec un corps vide, malformé ou faux. Il faut aussi vérifier la FORME du corps (champs présents, bons types, bonnes valeurs) : « a répondu » vs « a répondu correctement ».
3. **À quoi servent les variables d'environnement ({{baseUrl}}, {{token}}) ?**
   → À rendre la collection PORTABLE : la même collection s'exécute en local et en prod en changeant juste l'environnement, sans dupliquer l'URL partout.
4. **Qu'apporte un scénario enchaîné (create → read → update → delete) ?**
   → Il teste un FLUX réel (le cycle de vie d'une ressource) en passant l'id créé aux requêtes suivantes, pas des endpoints isolés — c'est un test d'intégration du flux.

## 🎤 À savoir expliquer à l'oral
Explique les trois rôles (doc vivante, tests, démo) et martèle la différence clé : « je teste le STATUT ET la FORME du corps — sinon un 200 au corps vide passerait ». Montre les variables d'environnement pour la portabilité et le scénario enchaîné (id capturé) qui teste un flux réel. Mentionner Newman pour la CI prouve que tu vois au-delà du clic manuel — une rigueur de test qui rassure sur ta capacité à livrer des API fiables.
