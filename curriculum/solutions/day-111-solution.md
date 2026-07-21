# Correction — Jour 111 : Gestion d'erreur front robuste

[← Retour au jour 111](../days/day-111.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : un try/catch autour des appels et un état d'erreur. Solution améliorée : distinguer les deux familles — erreurs async (état 'error' + retry) et exceptions de rendu (error boundaries) qu'un try/catch ne peut pas attraper ; placer une boundary par section (granularité) pour contenir les crashs, journaliser via componentDidCatch, offrir une sortie sur chaque erreur, et PROUVER la résilience en cassant volontairement l'app. La preuve : une section qui plante affiche un repli local, le reste reste utilisable.

## ⚠️ Erreurs probables et points à vérifier
- Croire qu'un try/catch attrape les exceptions de rendu : il ne le fait pas — c'est le rôle des error boundaries.
- Une seule error boundary pour toute l'app : un widget cassé fait tomber tout l'écran — une par section.
- Laisser des culs-de-sac (erreur sans bouton réessayer/retour) : l'utilisateur est bloqué.
- Ne pas provoquer les erreurs : sans les tester volontairement, on ne sait pas si la dégradation est réellement propre.

## 🔍 Comment vérifier ta solution
- Les erreurs async ont un état 'error' avec message et retry.
- Les exceptions de rendu sont attrapées par des error boundaries.
- La granularité des boundaries contient les crashs (une par section).
- Chaque état d'erreur offre une sortie (réessayer/retour).
- La résilience est prouvée en cassant volontairement l'app (réseau coupé, exception forcée).

## 🎤 À savoir expliquer à l'oral
Structure ta réponse en deux familles : « attendues (async → état error + retry) et inattendues (exceptions de rendu → error boundary, car try/catch ne les attrape pas) ». Insiste sur la granularité (une boundary par section) et la preuve par sabotage (couper le réseau, forcer une exception). « Jamais d'écran blanc » est la formule qui résume une pensée de robustesse mûre.
