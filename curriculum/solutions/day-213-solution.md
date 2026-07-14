# Correction — Jour 213 : Function calling avancé

[← Retour au jour 213](../days/day-213.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La robustesse vient de l'uniformité : tous les outils retournent le même contrat {ok, resultat|erreur}, la boucle ne meurt jamais sur un outil, l'erreur remonte au modèle qui la restitue honnêtement. La matrice de cas est le livrable qui PROUVE — chaque cellule est un test exécuté, pas une intention.

## ⚠️ Erreurs probables et points à vérifier
- Laisser une exception d'outil tuer la boucle : l'assistant entier tombe pour une météo en panne.
- Cacher l'échec au modèle (renvoyer un résultat vide) : il invente alors une réponse plausible — pire que l'erreur.
- Corriger un mauvais choix d'outil par du code de rattrapage au lieu d'améliorer les descriptions : tu combats le mécanisme au lieu de le piloter.
- Tester la matrice à la main sans l'automatiser : elle ne sera jamais rejouée après la prochaine modification.

## 🔍 Comment vérifier ta solution
- La matrice complète passe (≥ 8 cellules + 3 cas transverses).
- Échec forcé de la météo → l'assistant DIT que la météo est indisponible et continue.
- Le cas multi-outils enchaîne correctement deux appels.
- Le budget d'appels coupe une boucle anormale (testé en forçant le cas).

## 🎤 À savoir expliquer à l'oral
Raconte le cas le plus instructif de ta matrice (souvent : l'outil ambigu ou l'échec masqué qui faisait inventer le modèle). Structure : le cas → ce qui se passait → ce que tu as changé → la preuve. C'est une réponse STAR technique parfaite.
