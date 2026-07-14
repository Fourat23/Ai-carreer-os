# Correction — Jour 200 : Tokens et coûts

[← Retour au jour 200](../days/day-200.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le calcul est une chaîne : hypothèses explicites → coût unitaire (in et out séparés, tarifs réels du modèle) → multiplication à l'échelle → leviers hiérarchisés par impact. Un lecteur doit pouvoir contester une HYPOTHÈSE, pas ta multiplication.

## ⚠️ Erreurs probables et points à vérifier
- Oublier que l'historique se re-paie à chaque tour : c'est souvent LE premier poste, et le plus sous-estimé.
- Compter les mots au lieu des tokens (~×1,3-1,5 en français).
- Donner un chiffre unique au lieu d'une fourchette avec hypothèses — c'est la fourchette qui est crédible.

## 🔍 Comment vérifier ta solution
- Ton estimation distingue input/output avec leurs tarifs respectifs.
- Le poste « historique » apparaît explicitement.
- Trois leviers chiffrés (au moins en ordre de grandeur) sont proposés.
- Tu as vérifié ton intuition avec un vrai compteur de tokens sur 2-3 textes.

## 🎤 À savoir expliquer à l'oral
Prépare la réponse à « ça coûte combien ? » en 90 secondes : hypothèses, calcul, fourchette, leviers. Fais-le UNE fois à voix haute — c'est une question quasi certaine en entretien produit-IA.
