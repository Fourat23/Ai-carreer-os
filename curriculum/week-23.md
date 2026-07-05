# Semaine 23 — Régression linéaire et logistique, train/test, métriques

> **Mois 6** · Compétences : Machine learning, Python

[← Mois 6](month-06.md) · [Vue d'ensemble](year-overview.md)

## Jours de la semaine
- [Jour 155](days/day-155.md)
- [Jour 156](days/day-156.md)
- [Jour 157](days/day-157.md)
- [Jour 158](days/day-158.md)
- [Jour 159](days/day-159.md)
- [Jour 160](days/day-160.md)
- [Jour 161](days/day-161.md) _(revue hebdo)_

## Revue hebdomadaire (jour 7)
- **Bilan :** Tes premiers modèles, compris et non subis : régression linéaire (prédire un nombre) et logistique (prédire une classe), avec une évaluation honnête.
- **Test pratique :** 90 min : sur un dataset fourni — split train/test propre, baseline naïve (moyenne / classe majoritaire), régression linéaire puis logistique avec scikit-learn, métriques adaptées (MAE/RMSE ; accuracy/précision/rappel/F1), et 5 lignes de conclusion honnête vs baseline.
- **Test théorique :** Pourquoi une baseline ; pourquoi ne JAMAIS évaluer sur le train ; précision vs rappel avec un cas médical ; que signifie un coefficient de régression ; qu'est-ce que la fuite de données (leakage) ?
- **Mini-projet :** Prédicteur de prix (dataset immobilier public) : EDA courte, baseline, modèle, métriques, 3 features analysées, rapport 1 page.
- **Critères de passage :**
  - [ ] Pipeline complet sans leakage
  - [ ] Métriques correctement interprétées
  - [ ] Rapport 1 page écrit
- **Exercice d'architecture :** Ton modèle de prix doit servir des prédictions à une app web. Dessine l'architecture : où vit le modèle, comment on l'appelle, que se passe-t-il quand il est réentraîné, comment on détecte qu'il dérive.
