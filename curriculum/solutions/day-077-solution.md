# Correction / Grille — Jour 77 : Revue de la semaine 11

[← Retour au jour 77](../days/day-077.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Express complet : middlewares, erreurs, validation, structure**. La différence entre une API de tutoriel et une API pro : gestion d'erreurs, validation, structure en couches, logs.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 75 min : ajoute à l'API citations — middleware d'erreurs centralisé, validation stricte des entrées (sans lib, à la main), erreurs 400 détaillées, 404 propres, logs avec timestamp. Casse ton API avec Postman (10 requêtes malveillantes) et vérifie chaque réponse.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Pourquoi centraliser la gestion d'erreurs ; différence erreur opérationnelle vs bug ; qu'est-ce que l'injection (intuition) et pourquoi valider TOUTES les entrées ; que logger et que ne JAMAIS logger.
- **Mini-projet / livrable** conforme : Squelette d'API réutilisable : structure routes/services/data + erreurs + validation + logs, qui servira de base au projet 2.
- **Exercice d'architecture** fait sérieusement : Liste 5 choses qui peuvent mal se passer entre un client et ta base de données (réseau, entrée invalide, ressource absente, panne, bug). Pour chacune : qui détecte, qui répond quoi, avec quel statut.

## 📋 Checklist de validation
- [ ] Toute entrée utilisateur est validée
- [ ] Aucune erreur ne fait crasher le process
- [ ] Les erreurs 500 ne fuient pas de détails internes
- [ ] Structure en couches respectée

## 🚦 Critères de passage à la semaine suivante
- [ ] Les 10 requêtes malveillantes reçoivent des réponses correctes
- [ ] Squelette prêt pour le projet 2
- [ ] Auto-éval http ≥ 3

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
