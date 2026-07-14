# Correction — Jour 181 : Projet 5 — README, reproductibilité, démo

[← Retour au jour 181](../days/day-181.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Reproductibilité = fixer le hasard (seeds), figer l'environnement (requirements), scripter les données, unifier l'entrée (run.py). Le README raconte : problème → méthode → chiffres → limites, dans cet ordre.

## ⚠️ Erreurs probables et points à vérifier
- Seed fixée au split mais pas au modèle (RandomForest a son propre hasard).
- Données « déjà là » sur TA machine mais non téléchargeables par le lecteur.
- README écrit de mémoire sans re-suivre les étapes sur un clone frais.

## 🔍 Comment vérifier ta solution
- Deux exécutions consécutives → scores identiques au centième.
- Clone frais + README suivi à la lettre → tout passe.
- La démo de 2 min est enregistrée et fluide.

## 🎤 À savoir expliquer à l'oral
Sache raconter ChurnScope en STAR : la question métier, la baseline battue (chiffres), UNE décision de feature engineering justifiée, ce que le modèle NE sait pas faire. Deux minutes, zéro jargon creux.
