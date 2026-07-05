# Correction — Jour 58 : Modélisation, normalisation, index, transactions

[← Retour au jour 58](../days/day-058.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Normaliser élimine la redondance (chaque fait à un seul endroit). Un index accélère les lectures, ralentit les écritures, coûte de l'espace : sur les colonnes filtrées/jointes souvent. Une transaction garantit l'atomicité.

## ⚠️ Erreurs probables et points à vérifier
- Index partout ou nulle part.
- Opérations liées non transactionnelles (état incohérent).

## 🧩 Questions de réflexion
- Quand dénormaliser volontairement, et qu'accepte-t-on en échange ?
