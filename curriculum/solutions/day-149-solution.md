# Correction — Jour 149 : Statistiques : distributions et visualisation

[← Retour au jour 149](../days/day-149.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : produire quatre graphiques. Solution améliorée : choisir chaque graphique selon ce qu'on veut voir (histogramme→forme/bimodalité, boxplot→outliers/comparaison de groupes, scatter→relation/points aberrants, barres→catégories), et surtout INTERPRÉTER ce que chaque forme révèle (deux populations, outliers à investiguer, corrélation gonflée par des aberrants). La preuve : les interprétations pointent des insights que les statistiques agrégées ne montraient pas.

## ⚠️ Erreurs probables et points à vérifier
- Résumer par des statistiques sans regarder la distribution : on rate bimodalité, outliers, asymétrie (quartet d'Anscombe).
- Produire des graphiques sans les interpréter : la visualisation devient décorative, pas un outil de compréhension.
- Mauvais choix de graphique (barres pour une relation, scatter pour des catégories) : la forme ne répond pas à la question.
- Histogramme mal binné (trop peu de classes masque, trop lisse le bruit) : lecture faussée.

## 🔍 Comment vérifier ta solution
- Chaque graphique est choisi selon ce qu'il doit révéler.
- Chaque graphique est accompagné d'une interprétation (pas décoratif).
- L'histogramme révèle la forme (asymétrie, bimodalité).
- Le boxplot montre outliers et comparaison de groupes.
- Le scatter révèle la relation et les points aberrants.

## 🎤 À savoir expliquer à l'oral
Cite le quartet d'Anscombe comme preuve qu'il faut REGARDER, pas seulement calculer (mêmes stats, formes opposées). Associe chaque graphique à ce qu'il révèle (histogramme→forme/bimodalité, boxplot→outliers, scatter→relation). Insiste : chaque graphique s'INTERPRÈTE. Montrer deux colonnes de stats proches mais d'histogrammes opposés est la démonstration qui prouve que tu comprends pourquoi visualiser.
