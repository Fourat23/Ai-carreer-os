# Correction — Jour 159 : Régression logistique (classification)

[← Retour au jour 159](../days/day-159.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : entraîner une LogisticRegression et prédire des classes. Solution améliorée : travailler avec les PROBABILITÉS (predict_proba), comprendre la sigmoïde qui transforme le score linéaire en probabilité, lire la matrice de confusion (vrais/faux positifs/négatifs) plutôt qu'un taux global, et montrer que le SEUIL est un levier métier (le déplacer change le compromis précision/rappel). La preuve : expliquer l'effet d'un changement de seuil sur les faux positifs/négatifs.

## ⚠️ Erreurs probables et points à vérifier
- Croire que la régression logistique prédit un nombre continu : elle classe via une probabilité et un seuil.
- N'utiliser que predict (la classe) et ignorer predict_proba (la probabilité) : on perd le levier du seuil.
- Figer le seuil à 0,5 sans réfléchir au coût métier des faux positifs vs faux négatifs.
- Évaluer par un simple taux de bonnes réponses au lieu de la matrice de confusion (trompeur sur classes déséquilibrées).

## 🔍 Comment vérifier ta solution
- Les probabilités sont obtenues via predict_proba.
- Le rôle de la sigmoïde (score → probabilité) est compris.
- La matrice de confusion est lue (vrais/faux positifs/négatifs).
- L'effet d'un changement de seuil sur précision/rappel est montré.
- La logistique est utilisée comme baseline interprétable.

## 🎤 À savoir expliquer à l'oral
Explique la chaîne : score linéaire → sigmoïde → probabilité → seuil → classe. Insiste sur le nom trompeur (« ça classe, ça ne prédit pas un nombre ») et sur le seuil comme LEVIER métier (précision vs rappel). Cite l'interprétabilité (log-odds) et la matrice de confusion. Savoir dire « le modèle renvoie une probabilité, le seuil se règle selon le coût des erreurs » montre que tu penses production, pas juste entraînement.
