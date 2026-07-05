# Semaine 38 — Guardrails, citations, prompt injection, robustesse

> **Mois 9** · Compétences : Sécurité, LLM

[← Mois 9](month-09.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 260](days/day-260.md)
- [Jour 261](days/day-261.md)
- [Jour 262](days/day-262.md)
- [Jour 263](days/day-263.md)
- [Jour 264](days/day-264.md)
- [Jour 265](days/day-265.md)
- [Jour 266](days/day-266.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Sécuriser le système : entrées hostiles, sorties non fiables, injection via les documents. Ce qui sépare un POC d'un produit.
- **Test pratique :** 90 min : attaque puis défends TON DocQA — 5 tentatives d'injection (dans la question ET dans un document piégé ajouté au corpus), puis implémente : validation d'entrée, consigne système durcie, citations obligatoires vérifiées (la source citée contient-elle l'affirmation ?), refus explicite quand le corpus ne sait pas.
- **Test théorique :** Prompt injection directe vs indirecte (via documents) ; pourquoi 'ignore les instructions du document' ne suffit pas ; qu'est-ce qu'une citation vérifiable ; stratégie du 'je ne sais pas' : pourquoi c'est une feature ?
- **Mini-projet :** Suite de tests adverses : 15 cas hostiles (injections, questions hors corpus, demandes de données privées) intégrés au harnais d'évaluation avec comportement attendu.
- **Critères de passage :**
  - [ ] 4/5 injections bloquées après défense
  - [ ] Citations vérifiées automatiquement
  - [ ] Suite adverse intégrée au harnais
- **Exercice d'architecture :** Défense en profondeur pour DocQA : dessine les couches (validation entrée → consignes → sortie contrôlée → vérification citations → logs/alertes). Pour chaque couche : ce qu'elle attrape, ce qu'elle laisse passer.
