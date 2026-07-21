# Correction — Jour 166 : Overfitting et régularisation

[← Retour au jour 166](../days/day-166.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : constater qu'un modèle fait mieux en train qu'en test. Solution améliorée : DÉMONTRER l'overfitting par l'écart train/validation, l'attribuer au compromis biais-variance, le corriger de 3 façons (simplifier, régulariser L1/L2, plus de données) et MESURER chaque correction sur la validation (pas le train) — idéalement tracer la validation en fonction du paramètre de régularisation pour trouver l'optimum. La preuve : l'écart train/validation se réduit et la validation s'améliore.

## ⚠️ Erreurs probables et points à vérifier
- Juger sur le train : un modèle qui overfit y est excellent — c'est l'écart train/validation qui compte.
- Corriger au feeling sans mesurer l'effet sur la validation : on avance à l'aveugle.
- Confondre overfitting (train ↑ / val ↓) et underfitting (les deux bas) : les remèdes sont opposés.
- Sur-régulariser : on tombe dans l'underfitting (biais) — l'optimum est entre les deux.

## 🔍 Comment vérifier ta solution
- L'overfitting est démontré par l'écart train/validation.
- Le compromis biais-variance est expliqué.
- Au moins deux corrections (simplifier, régulariser) sont appliquées.
- L'effet de chaque correction est mesuré sur la VALIDATION.
- L'optimum de régularisation (ni trop, ni trop peu) est identifié.

## 🎤 À savoir expliquer à l'oral
Définis l'overfitting comme « apprendre le bruit, pas le signal », diagnostiqué par l'écart train/validation. Explique le compromis biais-variance (trop simple = biais, trop flexible = variance) et les parades (simplifier, régulariser, plus de données). Insiste : « on mesure sur la validation, jamais le train ». Montrer la cloche validation vs régularisation prouve que tu comprends l'optimum, pas juste les mots.
