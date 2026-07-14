# Correction — Jour 230 : Consolidation RAG v1 + revue mensuelle 8

[← Retour au jour 230](../days/day-230.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
L'ADR est réussie si la décision découle de MESURES (jour 228), si les conséquences négatives sont écrites, et si les conditions de révision sont observables. La revue est réussie si le triage acquis/fragile/ouvert est honnête et si les chantiers du mois 9 sortent des DONNÉES (autopsies) plutôt que de l'envie.

## ⚠️ Erreurs probables et points à vérifier
- Une ADR-plaidoyer (que des avantages pour l'option choisie) : sans conséquences négatives assumées, c'est du marketing interne.
- Décider « vector DB » parce que le programme le prévoit : la bonne formulation est « je migre au jour 239 POUR ces raisons, avec ces conditions » — l'ADR peut cadrer une décision planifiée.
- Une revue-célébration sans FRAGILE ni chiffres : l'inventaire honnête est ce qui la rend utile (et crédible en entretien).
- Oublier les conditions de révision : une décision sans critère de réouverture redevient un dogme.

## 🔍 Comment vérifier ta solution
- ADR-006 complète : contexte chiffré, 4 options, décision, ≥ 2 conséquences négatives, ≥ 2 conditions de révision.
- La revue contient les 3 listes (acquis/fragile/ouvert) et 3 chiffres du mois.
- Les chantiers « ouverts » citent les données qui les justifient (autopsies, grille).
- Un tiers comprendrait la décision sans te parler (test de relecture).

## 🎤 À savoir expliquer à l'oral
Présente l'ADR en 90 secondes : la question, les chiffres, la décision différée avec conditions, et UNE conséquence négative assumée à voix haute (« je re-validerai Chroma contre ma brute force, parce que je perds la transparence »). Assumer un inconvénient en entretien est un signal de séniorité que presque personne n'envoie.
