# Correction / Grille — Jour 105 : Revue de la semaine 15

[← Retour au jour 105](../days/day-105.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **React : effets, fetch, formulaires, routing**. Ton front parle au monde extérieur : fetch, chargement, erreurs, formulaires contrôlés, navigation.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 75 min : app qui consomme une API publique — liste + page détail (routing), état loading/error/data explicite, formulaire de recherche contrôlé avec validation.
- **Test théorique** (réponds de mémoire puis auto-corrige) : À quoi sert useEffect et quand NE PAS l'utiliser ; que représente le tableau de dépendances ; pourquoi le double appel en StrictMode ; formulaire contrôlé vs non contrôlé ; où gérer les erreurs de fetch ?
- **Mini-projet / livrable** conforme : Front 'citations' branché sur TON API du mois 3 (liste, ajout, suppression, aléatoire).
- **Exercice d'architecture** fait sérieusement : Ton front appelle l'API à 4 endroits avec du code dupliqué. Conçois un petit module `api.ts` unique (fonctions typées, gestion d'erreur commune). Qu'est-ce que ça améliore ? Qu'est-ce que ça rigidifie ?

## 📋 Checklist de validation
- [ ] Chaque fetch a ses 3 états gérés
- [ ] useEffect : dépendances justes, cleanup si besoin
- [ ] Erreurs affichées à l'utilisateur (pas juste console)
- [ ] Formulaires contrôlés + validation

## 🚦 Critères de passage à la semaine suivante
- [ ] App du test complète
- [ ] Front citations opérationnel sur ton API locale
- [ ] Pas de warning React en console

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
