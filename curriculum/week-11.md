# Semaine 11 — Express complet : middlewares, erreurs, validation, structure

> **Mois 3** · Compétences : HTTP / API, Software engineering

[← Mois 3](month-03.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 71](days/day-071.md)
- [Jour 72](days/day-072.md)
- [Jour 73](days/day-073.md)
- [Jour 74](days/day-074.md)
- [Jour 75](days/day-075.md)
- [Jour 76](days/day-076.md)
- [Jour 77](days/day-077.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** La différence entre une API de tutoriel et une API pro : gestion d'erreurs, validation, structure en couches, logs.
- **Test pratique :** 75 min : ajoute à l'API citations — middleware d'erreurs centralisé, validation stricte des entrées (sans lib, à la main), erreurs 400 détaillées, 404 propres, logs avec timestamp. Casse ton API avec Postman (10 requêtes malveillantes) et vérifie chaque réponse.
- **Test théorique :** Pourquoi centraliser la gestion d'erreurs ; différence erreur opérationnelle vs bug ; qu'est-ce que l'injection (intuition) et pourquoi valider TOUTES les entrées ; que logger et que ne JAMAIS logger.
- **Mini-projet :** Squelette d'API réutilisable : structure routes/services/data + erreurs + validation + logs, qui servira de base au projet 2.
- **Critères de passage :**
  - [ ] Les 10 requêtes malveillantes reçoivent des réponses correctes
  - [ ] Squelette prêt pour le projet 2
  - [ ] Auto-éval http ≥ 3
- **Exercice d'architecture :** Liste 5 choses qui peuvent mal se passer entre un client et ta base de données (réseau, entrée invalide, ressource absente, panne, bug). Pour chacune : qui détecte, qui répond quoi, avec quel statut.
