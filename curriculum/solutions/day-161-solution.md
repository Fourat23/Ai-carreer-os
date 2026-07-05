# Correction / Grille — Jour 161 : Revue de la semaine 23

[← Retour au jour 161](../days/day-161.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **Régression linéaire et logistique, train/test, métriques**. Tes premiers modèles, compris et non subis : régression linéaire (prédire un nombre) et logistique (prédire une classe), avec une évaluation honnête.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 90 min : sur un dataset fourni — split train/test propre, baseline naïve (moyenne / classe majoritaire), régression linéaire puis logistique avec scikit-learn, métriques adaptées (MAE/RMSE ; accuracy/précision/rappel/F1), et 5 lignes de conclusion honnête vs baseline.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Pourquoi une baseline ; pourquoi ne JAMAIS évaluer sur le train ; précision vs rappel avec un cas médical ; que signifie un coefficient de régression ; qu'est-ce que la fuite de données (leakage) ?
- **Mini-projet / livrable** conforme : Prédicteur de prix (dataset immobilier public) : EDA courte, baseline, modèle, métriques, 3 features analysées, rapport 1 page.
- **Exercice d'architecture** fait sérieusement : Ton modèle de prix doit servir des prédictions à une app web. Dessine l'architecture : où vit le modèle, comment on l'appelle, que se passe-t-il quand il est réentraîné, comment on détecte qu'il dérive.

## 📋 Checklist de validation
- [ ] Baseline avant tout modèle
- [ ] Split AVANT toute transformation apprise
- [ ] Métrique choisie et justifiée
- [ ] Conclusion qui avoue ce que le modèle rate

## 🚦 Critères de passage à la semaine suivante
- [ ] Pipeline complet sans leakage
- [ ] Métriques correctement interprétées
- [ ] Rapport 1 page écrit

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
