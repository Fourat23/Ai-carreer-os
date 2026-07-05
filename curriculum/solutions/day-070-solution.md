# Correction / Grille — Jour 70 : Revue de la semaine 10

[← Retour au jour 70](../days/day-070.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **REST design, Node.js, premiers serveurs, Express**. Tu passes de consommateur d'API à producteur. D'abord le module http natif (pour comprendre), puis Express (pour produire).

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 75 min : serveur Express avec routes GET /livres, GET /livres/:id, POST /livres (validation titre requis), DELETE /livres/:id — données en mémoire, statuts corrects, testé via Postman.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Les 6 contraintes REST (au moins 4 de tête) ; pourquoi GET ne doit pas modifier l'état ; qu'est-ce qu'un middleware Express ; où mettre la validation ; que renvoyer sur un POST réussi ?
- **Mini-projet / livrable** conforme : API 'citations' : CRUD complet en mémoire + route GET /citations/aleatoire + middleware de log des requêtes.
- **Exercice d'architecture** fait sérieusement : Ton API citations a 3 responsabilités mélangées : routing, logique, données. Propose un découpage en 3 couches (routes/services/data) et applique-le. C'est ton premier 3-tiers.

## 📋 Checklist de validation
- [ ] Je comprends req/res sans framework
- [ ] Middlewares : je sais dessiner la chaîne
- [ ] Statuts et corps de réponse cohérents
- [ ] Postman systématique pour tester

## 🚦 Critères de passage à la semaine suivante
- [ ] API du test pratique complète et correcte
- [ ] Middleware de log écrit maison
- [ ] Routes nommées selon les conventions REST

## ⚠️ Erreurs fréquentes en revue
- Se sur-noter (familiarité ≠ maîtrise) : ne compte que ce que tu produis SEUL et sais EXPLIQUER.
- Bâcler le test théorique en le relisant au lieu de répondre de mémoire (rappel actif).
- Avancer malgré des critères non atteints : mieux vaut consolider 2-3 jours que bâtir sur du sable.
- Oublier de mettre à jour ses scores de compétences dans l'application.

## 🧩 Auto-évaluation finale
- Note honnête de la semaine (0-5) : ____
- Ma plus grande difficulté cette semaine : ____
- Ce que je dois revoir avant d'avancer : ____
- Si des critères ne sont pas atteints : quel plan de rattrapage (daté) ?
