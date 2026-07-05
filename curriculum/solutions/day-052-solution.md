# Correction — Jour 52 : Node natif puis Express : du bas niveau au framework

[← Retour au jour 52](../days/day-052.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le module http donne req/res bruts ; router à la main = switch sur method+url ; parser le corps = accumuler les chunks. Express automatise exactement ça.

## ⚠️ Erreurs probables et points à vérifier
- Oublier res.end (réponse jamais terminée).
- Ne pas gérer les chunks du corps.

## 🧩 Questions de réflexion
- Qu'était pénible en natif ? C'est ce qu'un framework doit résoudre.
