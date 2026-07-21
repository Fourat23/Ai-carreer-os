# Correction — Jour 169 : Feature engineering

[← Retour au jour 169](../days/day-169.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : ajouter quelques features et voir si le score monte. Solution améliorée : garder le modèle FIXE et ne faire varier que les features, traiter chaque feature comme une hypothèse métier, mesurer son effet sur la VALIDATION, tenir un journal (gardée/jetée selon le gain), créer des features variées (ratios, agrégats, dates, interactions), et VÉRIFIER l'absence de leakage (feature calculable au moment de la prédiction, calcul sur le train seul). La preuve : des gains mesurés et reproductibles, sans leakage.

## ⚠️ Erreurs probables et points à vérifier
- Créer une feature à partir d'info non disponible à la prédiction (ou de la cible) : leakage, gains illusoires.
- Calculer une agrégation sur tout le dataset (test compris) : le train voit le test — leakage par les features.
- Garder des features sans mesurer leur effet : certaines hypothèses séduisantes n'apportent rien.
- Empiler des algorithmes sur des features pauvres au lieu d'investir dans les features : effort mal placé.

## 🔍 Comment vérifier ta solution
- Le modèle est fixe ; seules les features varient.
- Chaque feature est une hypothèse métier explicite.
- L'effet de chaque feature est mesuré sur la validation.
- Un journal trace les tentatives et leurs effets.
- L'absence de leakage est vérifiée (feature calculable à la prédiction, sur le train seul).

## 🎤 À savoir expliquer à l'oral
Pose le principe : « de meilleures features battent souvent un meilleur modèle, car le modèle ne voit que ses features ». Décris une feature comme une hypothèse métier testée sur la validation et journalisée. Insiste sur le leakage par les features (calculable au moment de la prédiction, sur le train seul). Donner un exemple concret (contacts/mois pour le churn) montre que tu relies domaine et performance, le cœur du métier.
