# Correction / Grille — Jour 266 : Revue de la semaine 38

[← Retour au jour 266](../days/day-266.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Guardrails, citations, prompt injection, robustesse**. Sécuriser le système : entrées hostiles, sorties non fiables, injection via les documents. Ce qui sépare un POC d'un produit.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : attaque puis défends TON DocQA — 5 tentatives d'injection (dans la question ET dans un document piégé ajouté au corpus), puis implémente : validation d'entrée, consigne système durcie, citations obligatoires vérifiées (la source citée contient-elle l'affirmation ?), refus explicite quand le corpus ne sait pas.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Prompt injection directe vs indirecte (via documents) ; pourquoi 'ignore les instructions du document' ne suffit pas ; qu'est-ce qu'une citation vérifiable ; stratégie du 'je ne sais pas' : pourquoi c'est une feature ?
- **Mini-projet / livrable** conforme : Suite de tests adverses : 15 cas hostiles (injections, questions hors corpus, demandes de données privées) intégrés au harnais d'évaluation avec comportement attendu.
- **Exercice d'architecture** fait sérieusement : Défense en profondeur pour DocQA : dessine les couches (validation entrée → consignes → sortie contrôlée → vérification citations → logs/alertes). Pour chaque couche : ce qu'elle attrape, ce qu'elle laisse passer.

## 📋 Checklist de validation
- [ ] J'ai réussi au moins une injection sur mon propre système
- [ ] Défenses en couches (pas une seule barrière)
- [ ] Le refus est un comportement testé
- [ ] Tests adverses dans le harnais

## 🚦 Critères de passage à la semaine suivante
- [ ] 4/5 injections bloquées après défense
- [ ] Citations vérifiées automatiquement
- [ ] Suite adverse intégrée au harnais

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
