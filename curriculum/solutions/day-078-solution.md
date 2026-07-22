# Correction — Jour 78 : Architecture 3-tiers et MVC : structurer une application

[← Retour au jour 78](../days/day-078.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Structurer l'application en couches (présentation/logique/données) où chaque couche ne parle qu'à sa voisine et la logique est indépendante de l'affichage et du stockage ; reconnaître MVC dans l'API (routes = contrôleurs, services = modèle, JSON = vue). Cartographier chaque fichier à sa couche, repérer les violations, et savoir où placer chaque évolution (règle → logique, vue → présentation, stockage → données). La preuve : les frontières sont justifiées et chaque type de changement a une couche d'accueil claire.

## ✅ Une solution simple
Assigner chaque partie du projet à présentation, logique ou données. La structure est identifiée.

## 🚀 Une solution améliorée
Cartographier tous les fichiers par couche, REPÉRER les violations (logique dans une route, SQL dans la présentation) et les corriger, dessiner l'architecture cible de LivreAPI avec les frontières JUSTIFIÉES, et répondre explicitement « où va une nouvelle règle métier ? une nouvelle vue ? un changement de base ? ». Montrer que la logique ne dépend ni de HTTP ni du SQL.

## ⚠️ Erreurs probables et points à vérifier
- Logique métier dans la présentation (route/vue) ou la couche données : intestable, dupliquée, couplée.
- Frontières floues (tout communique avec tout) : le bénéfice des couches disparaît.
- Faire connaître à la logique les détails de HTTP (req/res) ou du SQL : elle n'est plus indépendante ni testable seule.
- Sur-structurer un tout petit outil : les couches se justifient dès qu'on dépasse le script jetable.

## 🔍 Comment vérifier ta solution
- Tes projets cartographiés : chaque fichier assigné à sa couche (et les violations repérées).
- L'architecture cible de LivreAPI dessinée avec les frontières justifiées.
- Réponse écrite : où va une nouvelle règle métier ? une nouvelle vue ? un changement de base ?
- La logique est indépendante de l'affichage et du stockage (vérifiable).

## ❓ Réponses du mini-quiz
1. **Quelles sont les trois couches du 3-tiers et leur rôle ?**
   → Présentation (afficher et saisir), logique (les règles métier, décider), données (persister). Chaque couche ne parle qu'à sa voisine, et la logique est indépendante de l'affichage et du stockage.
2. **Que sont le Modèle, la Vue et le Contrôleur dans une API Express ?**
   → Les routes sont les CONTRÔLEURS (reçoivent l'action, orchestrent), les services sont le MODÈLE (la logique métier), et la réponse (JSON) est la VUE. MVC structure la couche présentation d'une architecture 3-tiers.
3. **Où placer une nouvelle règle métier, une nouvelle vue, un changement de base ?**
   → La règle métier va dans la LOGIQUE (le service), la vue dans la PRÉSENTATION, le changement de stockage dans la couche DONNÉES — chacun dans sa couche, sans toucher le reste.
4. **Pourquoi la logique ne doit-elle connaître ni l'affichage ni le stockage ?**
   → Pour que chaque couche évolue indépendamment : on change l'UI (web → CLI) ou la base (SQLite → Postgres) sans réécrire les règles métier. Cette indépendance rend les couches interchangeables.

## 🎤 À savoir expliquer à l'oral
Explique les trois couches et la règle d'or (« chacune parle à sa voisine ; la logique ignore l'affichage et le stockage »). Montre MVC dans ton API (routes = contrôleurs, services = modèle, JSON = vue). Donne le test pratique « où va quoi » (règle → service, vue → présentation, base → données) et le code smell (logique dans une route). Relier l'indépendance des couches à l'inversion de dépendance (jour 44) montre que tu vois le principe unificateur, pas juste un schéma.
