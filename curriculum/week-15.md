# Semaine 15 — React : effets, fetch, formulaires, routing

> **Mois 4** · Compétences : JavaScript / TypeScript, HTTP / API

[← Mois 4](month-04.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 99](days/day-099.md)
- [Jour 100](days/day-100.md)
- [Jour 101](days/day-101.md)
- [Jour 102](days/day-102.md)
- [Jour 103](days/day-103.md)
- [Jour 104](days/day-104.md)
- [Jour 105](days/day-105.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Ton front parle au monde extérieur : fetch, chargement, erreurs, formulaires contrôlés, navigation.
- **Test pratique :** 75 min : app qui consomme une API publique — liste + page détail (routing), état loading/error/data explicite, formulaire de recherche contrôlé avec validation.
- **Test théorique :** À quoi sert useEffect et quand NE PAS l'utiliser ; que représente le tableau de dépendances ; pourquoi le double appel en StrictMode ; formulaire contrôlé vs non contrôlé ; où gérer les erreurs de fetch ?
- **Mini-projet :** Front 'citations' branché sur TON API du mois 3 (liste, ajout, suppression, aléatoire).
- **Critères de passage :**
  - [ ] App du test complète
  - [ ] Front citations opérationnel sur ton API locale
  - [ ] Pas de warning React en console
- **Exercice d'architecture :** Ton front appelle l'API à 4 endroits avec du code dupliqué. Conçois un petit module `api.ts` unique (fonctions typées, gestion d'erreur commune). Qu'est-ce que ça améliore ? Qu'est-ce que ça rigidifie ?
