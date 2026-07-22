# Correction — Jour 60 : Préparation du Projet 2 : LivreAPI — modèle et contrat

[← Retour au jour 60](../days/day-060.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Cadrer LivreAPI avant tout code : concevoir le schéma normalisé avec la table de liaison emprunts (livre + membre + dates), écrire le contrat d'API complet (endpoints, verbes, statuts dont le 409 du double emprunt), planifier la structure de la collection Postman, et découper en jalons démontrables. Tester la robustesse du modèle (« plusieurs auteurs ? ») en anticipant UNE évolution probable sans sur-concevoir.

## ✅ Une solution simple
Dessiner les tables principales et lister les endpoints. Le projet a un plan.

## 🚀 Une solution améliorée
Modéliser un schéma complet avec la table de liaison emprunts (clés étrangères, dates) ET anticiper « plusieurs auteurs » (table livre_auteurs), écrire le contrat d'API avec tous les statuts (dont le 409 du double emprunt), planifier la collection Postman de vérification, et rédiger un backlog en jalons démontrables. Justifier chaque relation.

## ⚠️ Erreurs probables et points à vérifier
- Oublier les relations (un emprunt sans clés étrangères, ou stocké dans un champ du livre) : modèle bancal.
- Modéliser les emprunts sans table de liaison : impossible de gérer l'historique et les dates.
- Endpoints incohérents avec le design REST du jour 51 (verbes dans l'URL, statuts anarchiques).
- Sur-concevoir (anticiper dix cas hypothétiques) ou sous-concevoir (ignorer « plusieurs auteurs ») : viser l'évolution probable.

## 🔍 Comment vérifier ta solution
- Schéma complet avec la table de liaison emprunts (clés étrangères, dates).
- Contrat d'API écrit avec statuts (dont le 409 du double emprunt).
- Le modèle encaisse « un livre a plusieurs auteurs » (table de liaison prévue).
- Backlog de la semaine en jalons démontrables.

## ❓ Réponses du mini-quiz
1. **Pourquoi cadrer un projet backend par les données ?**
   → Le schéma est la fondation : requêtes, endpoints et logique en dépendent. Un mauvais schéma se paie à chaque requête, à chaque évolution et en bugs de cohérence ; un bon modèle rend l'implémentation évidente.
2. **Qu'est-ce qu'une table de liaison et quand l'utiliser ?**
   → Une table qui modélise une relation plusieurs-à-plusieurs et porte ses propres attributs (ex. `emprunts(livre_id, membre_id, dates)`). On l'utilise pour inscriptions, participations, lignes de commande, emprunts.
3. **Pourquoi écrire le contrat d'API AVANT le code ?**
   → C'est une promesse qui FORCE la cohérence (on conçoit l'ensemble avant les détails) et que Postman vérifiera. Coder d'abord et documenter ensuite produit des APIs incohérentes, inventées au fil de l'eau.
4. **Comment doser l'anticipation des évolutions du modèle ?**
   → Anticiper UNE évolution probable (« et si plusieurs auteurs ? » → table de liaison) est du bon design ; en anticiper dix (chaque cas hypothétique) est de la sur-ingénierie. On encaisse le réaliste, pas l'improbable.

## 🎤 À savoir expliquer à l'oral
Explique l'ordre : « données d'abord (le schéma est la fondation), puis contrat d'API avant le code (une promesse que Postman vérifiera) ». Mets en avant la table de liaison pour les emprunts (relation plusieurs-à-plusieurs avec dates) et le test de robustesse « et si plusieurs auteurs ? ». Terminer par « j'anticipe une évolution probable, pas dix hypothétiques » montre que tu conçois avec jugement, et mentionner le travail parallèle front/back grâce au contrat d'avance prouve une vision d'équipe.
