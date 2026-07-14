# Correction — Jour 243 : Embeddings : comparer les modèles

[← Retour au jour 243](../days/day-243.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La comparaison est propre si le chunking est gelé (seul le modèle change), si les verdicts sont automatiques et par type, et si la décision intègre le coût complet — pas seulement le score. Les questions basculées se lisent une à une : deux modèles à score égal peuvent avoir des profils d'échec très différents.

## ⚠️ Erreurs probables et points à vérifier
- Comparer les SCORES de similarité entre modèles : les échelles diffèrent — seuls les rangs et les verdicts top-k sont comparables.
- Mélanger les espaces (question embeddée par A, chunks par B) : l'erreur silencieuse du jour 218, qui revient à chaque comparaison.
- Choisir le gagnant à +1 question sans lire les basculées ni la facture : le score global est le début de l'analyse, pas la fin.
- Oublier que le choix engage : chaque futur changement de modèle = reconstruction totale (jour 242) — le critère « prix de reconstruction » pèse d'autant plus que le corpus grandit.

## 🔍 Comment vérifier ta solution
- Les deux manifestes d'index prouvent que seul le modèle diffère.
- La grille de décision complète (6 lignes) est remplie avec des mesures, pas des estimations.
- Les questions basculées (dans les deux sens) sont lues et caractérisées.
- La décision écrite inclut ses conditions de révision (comme une mini-ADR).

## 🎤 À savoir expliquer à l'oral
Raconte la décision à contre-courant : « le challenger gagnait +1 en global mais perdait 2 factuelles et coûtait ×4,5 — j'ai gardé le titulaire avec des conditions de révision écrites ». Savoir défendre un NON chiffré face à la nouveauté est un marqueur de séniorité rare.
