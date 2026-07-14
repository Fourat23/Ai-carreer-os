# Correction — Jour 226 : Diagnostic des échecs de retrieval

[← Retour au jour 226](../days/day-226.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Chaque fiche s'arrête au PREMIER maillon cassé, preuve à l'appui (grep pour l'existence, rang/score pour le classement, top-k pour la génération). La synthèse transforme 10 fiches en distribution de causes, et la distribution en priorités — c'est le passage du symptôme au backlog.

## ⚠️ Erreurs probables et points à vérifier
- Sauter le grep manuel : tu traites en « mauvais retrieval » un chunk qui n'existe pas — remède impossible.
- T'arrêter au premier échec analysé et généraliser : UNE cause n'est pas LA cause ; c'est la distribution sur 10 qui décide.
- Confondre rang 7 et rang 40 dans le même sac « retrieval » : les remèdes sont différents (k/reranking vs chunking/vocabulaire).
- Écrire des pistes sans re-test prévu : une piste sans mesure planifiée est une opinion qui s'installe.

## 🔍 Comment vérifier ta solution
- 10 fiches complètes, chacune avec preuve au maillon cassé.
- La synthèse donne la distribution des causes et DEUX priorités argumentées.
- Le test rapide k=5 est fait et son effet chiffré (x échecs récupérés).
- Chaque piste est reliée à un jour futur où elle sera testée.

## 🎤 À savoir expliquer à l'oral
Raconte UNE autopsie complète (la fiche ci-dessus est un bon modèle) : question → grep → rang 9 → verdict → piste. Deux minutes, une preuve par étape. C'est la démonstration de rigueur la plus convaincante de tout ton portfolio RAG.
