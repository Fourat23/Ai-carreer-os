<!-- keep -->
# Projet 5 — ChurnScope (machine learning end-to-end)

> **Mois 6 · Semaine 26** · Compétences : machine learning, évaluation, communication.
> Un problème ML traité **en professionnel** : pas un notebook Kaggle copié, mais une démarche honnête, reproductible, orientée décision.

## 🎯 Objectif
Résoudre un problème de classification (ex : prédiction de résiliation / churn) de bout en bout : EDA, baseline, itérations documentées, analyse d'erreurs, et un rapport qui parle **décision** avant technique.

## Ce que le projet prouve
- Tu suis un **workflow ML rigoureux** (baseline, split propre, cross-validation, anti-leakage).
- Tu **choisis et justifies** tes métriques selon le coût métier.
- Tu **analyses les erreurs** qualitativement, pas seulement les chiffres agrégés.
- Tu **communiques** un résultat ML à un décideur non technique.
- Tu sais dire ce que le modèle **ne sait pas** faire.

## Fonctionnalités / livrables
- EDA propre et question métier formulée.
- Baseline naïve, puis 2+ modèles comparés en cross-validation.
- Feature engineering avec journal d'expériences (tentative → effet mesuré).
- Analyse d'erreurs qualitative (exemples réels).
- Rapport final de 2 pages orienté décision.

## Stack
- Python, pandas, scikit-learn.
- Notebook propre **+** script reproductible.
- Dataset public (immobilier, churn télécom, spam…).

## Architecture / organisation
```
churnscope/
├── notebooks/exploration.ipynb   # EDA, lisible
├── src/
│   ├── data.py         # chargement, split propre
│   ├── features.py     # feature engineering (pur, testé)
│   ├── model.py        # Pipeline sklearn (préproc + modèle)
│   └── evaluate.py     # métriques, matrice de confusion, courbes
├── reports/rapport.md  # 2 pages orientées décision
└── run.py              # reproductible en une commande
```

## Critères de qualité
- [ ] **Baseline** établie avant tout modèle (et battue, ou expliqué pourquoi non).
- [ ] Split **avant** toute transformation apprise (aucun leakage).
- [ ] Métrique **choisie et justifiée** (pas d'accuracy sur du déséquilibré).
- [ ] **Cross-validation** (pas un seul split chanceux).
- [ ] Feature engineering dans un **Pipeline** (anti-leakage).
- [ ] Analyse d'erreurs qualitative (≥ 5 exemples commentés).
- [ ] Reproductible en **une commande**.

## Tests attendus
- Fonctions de features (déterministes, testables).
- Reproductibilité : `run.py` redonne les mêmes scores (seed fixée).

## README / rapport attendu
- README technique : install, `run.py`, structure.
- **Rapport de 2 pages** : question métier → méthode → résultats (avec chiffres) → limites honnêtes → recommandation.

## Démo attendue
Explication orale en 2 versions : 3 min pour un non-technicien, 5 min pour un data scientist (enregistre les deux).

## Erreurs à éviter
- Coder un modèle avant de comprendre les données.
- Évaluer sur le train (score illusoire).
- Rapporter l'accuracy sur un dataset déséquilibré.
- S'arrêter aux métriques agrégées sans regarder les erreurs.

## Extensions possibles (FUTURE.md)
Explicabilité (SHAP), calibration des probabilités, seuil optimisé par coût métier, mise en service (API de prédiction), monitoring de dérive.
