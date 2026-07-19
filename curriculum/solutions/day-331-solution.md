# Correction — Jour 331 : DocSense : gestion d'erreur bout-en-bout

[← Retour au jour 331](../days/day-331.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : ajouter des try/except. Solution améliorée : gérer les trois catégories (dépendances externes → retry+backoff puis dégradation gracieuse ; entrées pathologiques → validation propre ; cas limites métier → comportement défini), garantir qu'aucune erreur n'atteint l'utilisateur sous forme brute (message + log), et TESTER chaque scénario exprès. La robustesse se juge sur les chemins d'erreur — un système qui dégrade gracieusement est un produit, un qui plante est un prototype.

## ⚠️ Erreurs probables et points à vérifier
- Ne tester que le chemin nominal : la robustesse se joue sur les erreurs — les provoquer exprès.
- Laisser une erreur brute atteindre l'utilisateur (stacktrace, crash) : chaque erreur doit devenir un message compréhensible.
- Pas de dégradation gracieuse sur dépendance externe : si le LLM tombe, l'app entière tombe — retry puis message propre, app debout.
- Erreur attrapée mais non loggée : le message propre côté utilisateur ne doit pas empêcher le débogage — logger (jour 297).

## 🔍 Comment vérifier ta solution
- 10 scénarios d'erreur (dépendances, entrées, cas limites) sont gérés.
- Aucun scénario ne produit un crash ou une stacktrace côté utilisateur.
- Les dépendances externes qui échouent → retry+backoff puis dégradation gracieuse.
- Chaque erreur est loggée pour le débogage.
- Chaque scénario est testé EXPRÈS (variante).

## 🎤 À savoir expliquer à l'oral
Explique où se juge la robustesse : « le chemin nominal marche toujours ; la vraie qualité se voit sur les erreurs — LLM down, question vide, document corrompu ; DocSense les transforme en messages propres, jamais en crash, et je les teste exprès ». Puis la distinction : « un système qui dégrade gracieusement est un produit, un qui plante est un prototype ». La robustesse testée est une preuve de production.
