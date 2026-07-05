# Semaine 19 — pandas, CSV/JSON, nettoyage, data quality

> **Mois 5** · Compétences : Python, SQL / Data

[← Mois 5](month-05.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 127](days/day-127.md)
- [Jour 128](days/day-128.md)
- [Jour 129](days/day-129.md)
- [Jour 130](days/day-130.md)
- [Jour 131](days/day-131.md)
- [Jour 132](days/day-132.md)
- [Jour 133](days/day-133.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** La réalité de la data : elle est sale. Cette semaine tu apprends à la charger, l'inspecter, la nettoyer, et à DOCUMENTER ce que tu as nettoyé.
- **Test pratique :** 75 min sur un CSV volontairement sale (fourni au jour 128) : charger, typer les colonnes, traiter les manquants avec justification, dédupliquer, corriger les formats de dates, produire un rapport avant/après.
- **Test théorique :** DataFrame vs liste de dicts ; que fait groupby ; stratégies pour valeurs manquantes (3 minimum, quand utiliser chacune) ; pourquoi inspecter AVANT de nettoyer ; qu'est-ce qu'une donnée aberrante ?
- **Mini-projet :** Notebook 'autopsie d'un dataset' : prendre un dataset public, produire un rapport de qualité (complétude, doublons, types, aberrations) en 15 cellules max, propre et commenté.
- **Critères de passage :**
  - [ ] CSV sale nettoyé avec rapport
  - [ ] Notebook autopsie complet
  - [ ] Je sais expliquer chaque décision de nettoyage
- **Exercice d'architecture :** Ton nettoyage est dans un notebook : inutilisable en production. Découpe-le en fonctions Python pures (load/validate/clean/report) réutilisables et testables. Quand un notebook suffit-il, alors ?
