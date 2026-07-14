# Correction — Jour 237 : Bilan RAG et préparation évaluation

[← Retour au jour 237](../days/day-237.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le bilan compile les chiffres existants, le backlog relie chaque amélioration à un échec diagnostiqué (aucune amélioration « parce que c'est mieux »), le golden set opérationnalise le cadrage avec source de vérité par question. La baseline v1 passée sur le set clôt le mois : l'état est mesuré, la suite est priorisée, l'instrument est prêt.

## ⚠️ Erreurs probables et points à vérifier
- Écrire les questions du golden set en regardant ce que le système réussit : biais fatal — elles viennent du besoin et du cadrage, pas des capacités.
- Un golden set sans sources de vérité : les verdicts resteront manuels et coûteux — c'est source_verite qui permet le script du mois 9.
- Un backlog par intuition (« le reranking c'est bien ») : chaque ligne cite sa preuve ou elle sort du backlog.
- Retoucher le golden set après l'avoir figé : chaque retouche invalide toutes les comparaisons passées — version 1.0, point.

## 🔍 Comment vérifier ta solution
- Golden set : 30 questions, 5 types représentés, sources de vérité partout, fichier versionné et daté.
- Baseline v1 passée et chiffrée (par type, pas seulement en global).
- Backlog : chaque ligne a sa preuve (renvoi au jour/diagnostic) et son jour d'exécution prévu.
- Le bilan tient sur 2 pages et cite les coûts API réels du mois.

## 🎤 À savoir expliquer à l'oral
Le récit de fin de mois en 2 minutes : « je suis parti d'un pipeline naïf, j'ai diagnostiqué [chiffres], optimisé [trajectoire 9→13/15], cadré les cas difficiles, et je termine avec un golden set figé et un backlog où chaque ligne a sa preuve ». C'est une histoire d'ingénieur complète — répète-la, c'est ta réponse à « parle-moi d'un projet récent ».
