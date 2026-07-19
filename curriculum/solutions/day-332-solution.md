# Correction — Jour 332 : DocSense : observabilité finale

[← Retour au jour 332](../days/day-332.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : ajouter plus de logs. Solution améliorée : des logs assez détaillés pour REJOUER une session complète (question → chunks+scores → prompt → réponse → coût, via correlation id), permettant de diagnostiquer un incident a posteriori sans reproduction ; et un dashboard NARRATIF qui raconte la trajectoire de qualité (baseline → final, annotée), transformant les données en récit de valeur. L'un sert le débogage, l'autre la communication.

## ⚠️ Erreurs probables et points à vérifier
- Logs insuffisants pour rejouer : si on ne peut pas reconstituer les chunks/scores/prompt, l'incident reste un mystère — logger assez pour rejouer.
- Dashboard d'état seul (score du jour) : il ne raconte pas la trajectoire — le narratif (d'où on part, où on arrive) communique la valeur.
- Logger des données sensibles en clair : privacy — hash/masquage (jour 296), même pour la session rejouable.
- Observabilité comme accessoire : dans un système non déterministe, elle est l'outil de débogage ESSENTIEL, pas un bonus.

## 🔍 Comment vérifier ta solution
- Une session complète est reconstituable depuis les logs (question → réponse → coût).
- Un incident est diagnosticable a posteriori sans reproduction (variante).
- Le dashboard raconte la trajectoire de qualité (baseline → final, annotée).
- Coûts et latences dans le temps sont visibles.
- Les données sensibles dans les logs sont masquées.

## 🎤 À savoir expliquer à l'oral
Montre le double atout : « côté technique, je rejoue n'importe quelle session depuis les logs pour diagnostiquer un incident sans le reproduire ; côté valeur, mon dashboard raconte comment la qualité a progressé de la baseline au final ». Débogage + communication de la valeur : l'observabilité de production complète, un signal de maturité rare.
