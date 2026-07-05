# Semaine 25 — Clustering, feature engineering, pipelines scikit-learn

> **Mois 6** · Compétences : Machine learning, Software engineering

[← Mois 6](month-06.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 169](days/day-169.md)
- [Jour 170](days/day-170.md)
- [Jour 171](days/day-171.md)
- [Jour 172](days/day-172.md)
- [Jour 173](days/day-173.md)
- [Jour 174](days/day-174.md)
- [Jour 175](days/day-175.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Compléter la boîte à outils : non-supervisé (clustering), l'art des features, et les pipelines scikit-learn qui rendent tout reproductible.
- **Test pratique :** 90 min : segmentation clients (k-means) avec choix de k justifié (méthode du coude + silhouette), features normalisées, interprétation métier de chaque cluster ; puis refactor d'un modèle de la semaine 23 en Pipeline scikit-learn complet (préproc + modèle).
- **Test théorique :** Pourquoi normaliser avant k-means ; comment choisir k ; 3 techniques de feature engineering avec exemples ; pourquoi un Pipeline évite le leakage ; one-hot vs label encoding ?
- **Mini-projet :** Feature engineering challenge : améliore le score de ton prédicteur de prix (semaine 23) uniquement par les features (pas le modèle). Documente chaque tentative et son effet mesuré.
- **Critères de passage :**
  - [ ] Segmentation justifiée de bout en bout
  - [ ] Amélioration mesurable par features
  - [ ] Pipeline sans leakage vérifié
- **Exercice d'architecture :** Ton feature engineering est un script de 200 lignes. Un collègue doit l'appliquer aux données de production chaque jour. Que faut-il garantir (mêmes transfos, mêmes encodages, gestion des catégories inconnues) ? Comment le Pipeline y répond-il ?
