# Correction — Jour 139 : ETL : robustesse et rejouabilité

[← Retour au jour 139](../days/day-139.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : ajouter des try/except et des prints. Solution améliorée : rendre le load IDEMPOTENT (upsert par clé ou remplacement de partition, pas d'INSERT aveugle), journaliser chaque étape (lignes extraites/transformées/chargées + erreurs), charger transactionnellement (tout ou rien), tracer les lignes invalides dans un dead-letter avec leur raison, permettre la reprise après échec, et PROUVER en interrompant. La preuve : relancer après une coupure ne produit ni doublon ni chargement partiel.

## ⚠️ Erreurs probables et points à vérifier
- INSERT aveugle non idempotent : relancer duplique les données — utiliser un upsert ou un remplacement par clé.
- Aucun log : un échec nocturne est indiagnosticable au matin.
- Load non transactionnel : une interruption laisse la base à moitié chargée.
- Ignorer ou planter sur une ligne invalide : perte silencieuse ou pipeline fragile — la router vers un dead-letter avec sa raison.

## 🔍 Comment vérifier ta solution
- Le load est idempotent (relancer ne duplique pas).
- Chaque étape est journalisée (compteurs + erreurs).
- Le chargement est transactionnel (pas d'état partiel).
- Les lignes invalides sont tracées dans un dead-letter avec leur raison.
- Une interruption suivie d'un relancement ne produit ni doublon ni chargement partiel (prouvé).

## 🎤 À savoir expliquer à l'oral
Structure autour de deux propriétés : idempotence (upsert → relancer sans dupliquer) et survie aux échecs (logs, load transactionnel, reprise, dead-letter). Martèle « je conçois pour l'interruption, pas pour le chemin heureux ». La preuve par coupure simulée (ni doublon, ni chargement partiel) est la démonstration qui prouve la maturité data engineer.
