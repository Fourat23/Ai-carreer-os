# Correction — Jour 157 : Train/test split et baseline

[← Retour au jour 157](../days/day-157.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : split train/test et évaluer sur le test. Solution améliorée : DÉMONTRER le leakage (préprocessing sur tout le dataset, ou feature du futur) en montrant le score gonflé, puis le corriger (split d'abord, préprocessing ajusté sur le train seul, appliqué au test), et poser une baseline triviale que le modèle doit battre. La preuve : montrer côte à côte le score optimiste (avec leakage) et le score honnête (sans), et le modèle qui bat la baseline.

## ⚠️ Erreurs probables et points à vérifier
- Normaliser/imputer avant le split : le train voit les statistiques du test — leakage classique.
- Inclure une feature calculée à partir de la cible (feature du futur) : score quasi parfait, inutilisable en réel.
- Ne pas poser de baseline : on ne sait pas si le modèle apporte quelque chose.
- Faire confiance à un score trop beau : c'est souvent le symptôme d'un leakage, pas d'un bon modèle.

## 🔍 Comment vérifier ta solution
- Le split est fait AVANT tout préprocessing.
- Le préprocessing est ajusté sur le train uniquement, puis appliqué au test.
- Aucune feature ne fuit la cible (pas de feature du futur).
- Une baseline est posée et le modèle la bat.
- Le leakage est démontré puis corrigé (comparaison des scores).

## 🎤 À savoir expliquer à l'oral
Définis le leakage comme « de l'information du futur/du test qui fuit dans l'entraînement, invisible car sans erreur ». Donne les deux formes clés (préprocessing sur tout le dataset ; feature du futur) et la parade (split d'abord, apprentissage sur le train seul, Pipeline). Ajoute « un score trop beau est suspect » et « toujours une baseline ». Savoir démontrer un leakage prouve que tu comprends l'évaluation, pas juste que tu appelles fit/predict.
