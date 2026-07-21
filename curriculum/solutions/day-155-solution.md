# Correction — Jour 155 : ML : le workflow et scikit-learn

[← Retour au jour 155](../days/day-155.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : charger un dataset, split, fit, predict, score. Solution améliorée : structurer le workflow standard réutilisable (inspecter → séparer X/y → split avec random_state fixe pour la reproductibilité → fit sur train uniquement → évaluer sur test), comprendre que fit apprend et predict applique, et exploiter l'API uniforme pour comparer plusieurs modèles en ne changeant qu'une ligne. La preuve : le même code évalue proprement plusieurs algorithmes sans leakage.

## ⚠️ Erreurs probables et points à vérifier
- Évaluer sur le train (fit puis score sur les mêmes données) : on mesure la mémorisation, pas la généralisation.
- Oublier le random_state : les résultats ne sont pas reproductibles d'une exécution à l'autre.
- Confondre fit et predict, ou fit sur l'ensemble complet avant le split : source de data leakage.
- Se focaliser sur les maths d'un algorithme au lieu de la rigueur du workflow d'évaluation.

## 🔍 Comment vérifier ta solution
- Le workflow suit charger → split → fit (train) → predict/score (test).
- L'évaluation se fait sur des données jamais vues à l'entraînement.
- random_state est fixé pour la reproductibilité.
- fit et predict sont utilisés correctement (apprendre vs appliquer).
- Changer de modèle ne demande que de modifier l'instanciation.

## 🎤 À savoir expliquer à l'oral
Déroule le workflow (charger → split → fit → predict → évaluer) et insiste sur fit (apprendre sur le train) vs predict (appliquer), et sur l'évaluation sur le test (généralisation) pas le train (mémorisation). Souligne que scikit-learn rend les modèles interchangeables, donc la compétence est la RIGUEUR du processus. « L'important est le protocole, pas la connaissance par cœur de chaque algo » est la phrase qui montre ta maturité de praticien.
