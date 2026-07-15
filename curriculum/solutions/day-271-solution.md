# Correction — Jour 271 : Projet 6 — Rapport d'évaluation

[← Retour au jour 271](../days/day-271.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : compiler les mesures des jours 267-269 en un tableau avant/après par amélioration. Solution améliorée : ajouter la méthode reproductible (golden version, juge validé), la trajectoire multidimensionnelle (qualité par type + sécurité + latence + coût), les régressions visibles et les limites assumées avec hypothèse sur la suite. Chaque affirmation renvoie à un chiffre refaisable.

## ⚠️ Erreurs probables et points à vérifier
- Un rapport-brochure sans limites ni régressions : suspect, non défendable — les limites assumées CRÉDIBILISENT le reste.
- Des chiffres non reproductibles (golden non versionné, juge non validé) : le lecteur ne peut pas refaire la mesure, le rapport ne prouve rien.
- Ne montrer que la métrique visée par chaque amélioration : les régressions cachées passent, et le rapport ment par omission.
- Confondre trajectoire globale et somme des gains : les améliorations interagissent (jour 269) — la trajectoire se mesure de bout en bout.

## 🔍 Comment vérifier ta solution
- La méthode est décrite (golden version, métriques, juge validé) : un tiers peut refaire.
- Chaque amélioration a un tableau avant/après avec la métrique visée ET les autres.
- La trajectoire globale couvre qualité/sécurité/latence/coût.
- Les limites (ce qui ne s'est pas amélioré) sont écrites avec une hypothèse.
- Chaque affirmation pointe vers un chiffre reproductible.

## 🎤 À savoir expliquer à l'oral
Raconte le rapport comme une histoire de preuve : « baseline 0,81, deux améliorations pilotées, trajectoire à 0,87 — avec les régressions visibles et une limite assumée : les synthèses plafonnent, le prochain gain viendra du corpus ». Savoir présenter des chiffres AVEC leurs limites est ce qui rend crédible devant un manager comme en entretien.
