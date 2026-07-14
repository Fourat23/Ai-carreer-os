# Correction — Jour 193 : Architecture transformer

[← Retour au jour 193](../days/day-193.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le schéma est le livrable ET le test : si une étape ne se dessine pas, elle n'est pas comprise. L'ordre est intangible (tokens → embeddings+position → blocs → projection → échantillonnage) et chaque flèche a une entrée/sortie nommable.

## ⚠️ Erreurs probables et points à vérifier
- Oublier la POSITION (l'erreur n°1) : sans elle, l'attention ne voit qu'un sac de mots.
- Dessiner « une couche » au lieu de N blocs identiques empilés.
- Placer la température au mauvais endroit (elle agit à l'échantillonnage, pas dans l'attention).

## 🔍 Comment vérifier ta solution
- Ton schéma se redessine de MÉMOIRE en 2 minutes.
- Chaque flèche répond à « entrée → sortie ».
- Tu sais y pointer : fenêtre, température, source des hallucinations.

## 🎤 À savoir expliquer à l'oral
Chronomètre-toi : le trajet complet en 3 minutes, schéma à l'appui, en finissant par « il géométrise le plausible, pas le vrai » — la phrase qui ouvre la discussion suivante (RAG, grounding).
