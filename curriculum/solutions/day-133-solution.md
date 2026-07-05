# Correction / Grille — Jour 133 : Revue de la semaine 19

[← Retour au jour 133](../days/day-133.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **pandas, CSV/JSON, nettoyage, data quality**. La réalité de la data : elle est sale. Cette semaine tu apprends à la charger, l'inspecter, la nettoyer, et à DOCUMENTER ce que tu as nettoyé.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 75 min sur un CSV volontairement sale (fourni au jour 128) : charger, typer les colonnes, traiter les manquants avec justification, dédupliquer, corriger les formats de dates, produire un rapport avant/après.
- **Test théorique** (réponds de mémoire puis auto-corrige) : DataFrame vs liste de dicts ; que fait groupby ; stratégies pour valeurs manquantes (3 minimum, quand utiliser chacune) ; pourquoi inspecter AVANT de nettoyer ; qu'est-ce qu'une donnée aberrante ?
- **Mini-projet / livrable** conforme : Notebook 'autopsie d'un dataset' : prendre un dataset public, produire un rapport de qualité (complétude, doublons, types, aberrations) en 15 cellules max, propre et commenté.
- **Exercice d'architecture** fait sérieusement : Ton nettoyage est dans un notebook : inutilisable en production. Découpe-le en fonctions Python pures (load/validate/clean/report) réutilisables et testables. Quand un notebook suffit-il, alors ?

## 📋 Checklist de validation
- [ ] df.info()/describe()/value_counts() : réflexes
- [ ] Chaque nettoyage justifié par écrit
- [ ] Aucune modification silencieuse des données
- [ ] Notebook lisible par un tiers

## 🚦 Critères de passage à la semaine suivante
- [ ] CSV sale nettoyé avec rapport
- [ ] Notebook autopsie complet
- [ ] Je sais expliquer chaque décision de nettoyage

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
