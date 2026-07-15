# Correction — Jour 275 : Modes d'échec des agents

[← Retour au jour 275](../days/day-275.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : provoquer chaque mode et l'identifier dans les traces. Solution améliorée : pour chaque mode, remonter à la CAUSE (accomplissement non reconnu / objectif dilué / description ambiguë), implémenter la parade correspondante (détection de répétition / réinjection d'objectif / descriptions durcies + validation), et la PROUVER par re-provocation. La leçon : l'autonomie implique le risque ; on détecte et limite, on n'élimine pas.

## ⚠️ Erreurs probables et points à vérifier
- Croire que le budget d'itérations « corrige » les boucles : il borne le coût, pas la cause — la détection de répétition traite la cause.
- Attribuer une dérive d'objectif au « modèle qui est bête » au lieu de la cause structurelle (objectif dilué dans un long historique) : la parade est la réinjection, pas un meilleur modèle.
- Documenter les modes sans PARADE testée : nommer un échec sans le limiter ne rend pas l'agent plus fiable.
- Chercher à éliminer tous les échecs : avec de l'autonomie c'est impossible — viser détection + limitation, pas immunité.

## 🔍 Comment vérifier ta solution
- Les 3 modes sont provoqués et identifiés dans des traces annotées.
- Chaque mode a sa cause explicitée (pas « le modèle est mauvais »).
- Chaque parade est implémentée et re-prouvée par re-provocation.
- La distinction « borner le dégât (budget) » vs « traiter la cause (parade) » est claire.
- La posture détecter+limiter (vs éliminer) est assumée.

## 🎤 À savoir expliquer à l'oral
Raconte un mode d'échec vécu avec sa trace : « objectif flou → l'agent bouclait, les traces montraient les mêmes 2 appels ; j'ai ajouté une détection de répétition, re-testé, la boucle est coupée ». Puis la posture : « l'autonomie implique le risque — je détecte et je limite, je ne prétends pas éliminer ». Provoquer et border ses propres échecs = maturité d'ingénieur d'agents.
