# Correction — Jour 311 : DocSense : retrieval hybride

[← Retour au jour 311](../days/day-311.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : brancher l'hybride + reranking dans DocSense. Solution améliorée : l'intégrer derrière le port de retrieval (hexagonal, sans casser le cœur), puis RE-VALIDER le gain sur le corpus DocSense (rappel@k avec/sans, sur questions représentatives — un gain ne se transpose pas automatiquement), et arbitrer coût/latence par une politique à deux régimes. Les choix de retrieval sont justifiés par des mesures sur le bon corpus, pas importés.

## ⚠️ Erreurs probables et points à vérifier
- Supposer que l'hybride validé au mois 9 marche identiquement sur DocSense : le gain dépend du corpus — re-mesurer.
- Ignorer le coût/latence du reranking : il n'est pas gratuit — arbitrer par la politique à deux régimes (jour 251).
- Casser le cœur en intégrant l'hybride : grâce au port, il s'intègre comme composant sans toucher au cœur.
- Garder le lexical même s'il n'apporte rien sur ce corpus : si le corpus a peu d'identifiants exacts, le mesurer et décider en conséquence.

## 🔍 Comment vérifier ta solution
- L'hybride + reranking est intégré derrière le port de retrieval (cœur intact).
- Le gain est RE-MESURÉ sur le corpus DocSense (rappel@k avec/sans).
- L'arbitrage coût/latence est fait (politique nominal/dégradé).
- Une question où le lexical rattrape le vectoriel sur ce corpus est identifiée (variante).
- Les choix de retrieval sont justifiés par des mesures sur le corpus DocSense.

## 🎤 À savoir expliquer à l'oral
Explique pourquoi tu re-mesures : « un gain de retrieval ne se transpose pas automatiquement d'un corpus à l'autre — le lexical brille sur les identifiants exacts, si mon corpus DocSense en a peu, il aidera moins ; je re-valide sur MON corpus ». Savoir qu'une technique n'est pas universellement meilleure et le prouver par la mesure sur le bon corpus est un réflexe d'ingénieur RAG mûr.
