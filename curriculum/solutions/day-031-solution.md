# Correction — Jour 31 : Deux sommes et le réflexe hash map

[← Retour au jour 31](../days/day-031.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le pattern : parcourir une fois, et pour chaque élément demander à la Map 'ai-je déjà vu ce dont j'ai besoin ?' (le complément). La Map transforme une recherche O(n) en O(1), donc la double boucle en une seule.

## ⚠️ Erreurs probables et points à vérifier
- Chercher le complément AVANT d'avoir ajouté l'élément courant (ou l'inverse) selon qu'on autorise i==j.
- Somme cumulée : oublier d'initialiser la Map avec {0: -1}.

## 🧩 Questions de réflexion
- Où as-tu déjà 'mémorisé le vu pour interroger plus tard' ? (l'index inversé du jour 30)
