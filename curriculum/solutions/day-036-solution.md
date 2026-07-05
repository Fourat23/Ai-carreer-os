# Correction — Jour 36 : TypeScript : le typage qui attrape les bugs avant l'exécution

[← Retour au jour 36](../days/day-036.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Typer = documenter les contrats. Annote les signatures, laisse l'inférence faire le reste. strict interdit les null/undefined implicites → révèle des bugs latents.

## ⚠️ Erreurs probables et points à vérifier
- `any` pour faire taire le compilateur = désactiver l'outil. Utilise `unknown` + validation.
- Croire que tsc exécute : il VÉRIFIE, node exécute après compilation (ou tsx).

## 🧩 Questions de réflexion
- Combien de bugs le typage a-t-il trouvés dans du code que tu croyais correct ?
