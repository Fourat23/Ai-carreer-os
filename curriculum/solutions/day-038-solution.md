# Correction — Jour 38 : POO en TypeScript : encapsulation, héritage, polymorphisme

[← Retour au jour 38](../days/day-038.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le polymorphisme via interface : alerter() ne connaît que le contrat, pas les implémentations — ajouter Slack = une classe, zéro modif ailleurs (open/closed, inversion de dépendance en germe).

## ⚠️ Erreurs probables et points à vérifier
- Héritage profond (fragile) au lieu de composition.
- Tout en classe par réflexe : une fonction pure suffit souvent.

## 🧩 Questions de réflexion
- Quand la classe bat-elle une fonction + closure (jour 22) ? (état encapsulé + méthodes liées)
