# Correction — Jour 313 : DocSense : spikes exécutés

[← Retour au jour 313](../days/day-313.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : exécuter les spikes et voir ce qui se passe. Solution améliorée : respecter le time-box (code jetable, on répond à la question binaire), documenter pour chaque spike une paire résultat factuel + décision, et AJUSTER le plan/scope/architecture en conséquence (un spike qui confirme un risque doit modifier le plan avant de s'engager). Un résultat de spike ignoré annule le dérisquage ; accepter un résultat négatif et adapter sauve le projet.

## ⚠️ Erreurs probables et points à vérifier
- Transformer un spike en développement (« finir proprement ») : le time-box protège — un spike répond à une question, il ne construit pas la feature.
- Ignorer un résultat de spike (« on verra ») : annule tout l'intérêt du dérisquage — chaque résultat doit informer une décision.
- Forcer l'approche initiale malgré un résultat négatif : l'entêtement fait échouer les projets — adapter est la bonne réponse.
- Ne documenter que le code jetable : le livrable est la paire résultat + décision, pas le code.

## 🔍 Comment vérifier ta solution
- Les 3 spikes sont exécutés dans leur time-box (code jetable).
- Chaque spike produit un résultat FACTUEL (réponse à la question binaire).
- Chaque spike aboutit à une DÉCISION explicite.
- Le plan/scope/SPEC est ajusté selon les résultats.
- Au moins un résultat négatif est accepté et adapté sans forcer (variante).

## 🎤 À savoir expliquer à l'oral
Raconte un spike qui a changé le plan : « mon spike d'extraction a montré que les tableaux devenaient illisibles sur 3 de mes 5 PDF — j'ai décidé de les exclure du scope v1 et de le noter dans la SPEC, plutôt que de forcer ». Puis le principe : « je décide sur des faits, pas des espoirs ; un spike qui révèle un problème m'a fait économiser des semaines ». Accepter un résultat négatif et adapter est une maturité qui rassure un employeur.
