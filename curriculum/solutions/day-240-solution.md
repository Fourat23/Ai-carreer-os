# Correction — Jour 240 : Chunking avancé : par structure

[← Retour au jour 240](../days/day-240.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le chunker respecte les frontières déclarées (sections), garde le chemin de titres dans le texte ET les métadonnées, gère les extrêmes (re-découpe des longues avec titre répété, fusion des courtes) et dégrade en taille fixe sans structure. L'inspection vérifie d'abord que les 6 échecs diagnostiqués sont réparés — la mesure globale vient demain.

## ⚠️ Erreurs probables et points à vérifier
- Mettre le titre en métadonnée mais PAS dans le texte du chunk : l'embedding ne voit pas les métadonnées — le contexte doit être dans ce qui est embeddé.
- Oublier les documents plats : le chunker qui plante sur un PDF sans titres n'est pas un chunker, c'est une démo.
- Re-découper les sections longues SANS répéter le titre sur chaque morceau : les morceaux 2+ redeviennent des orphelins — le problème qu'on voulait régler.
- Conclure « c'est mieux » sur l'inspection d'aujourd'hui : l'inspection dit « prêt à mesurer », le golden set dira « mieux » (demain, chiffres à l'appui).

## 🔍 Comment vérifier ta solution
- Les 6 passages-réponses coupés (jour 226) sont entiers dans le nouvel index (vérifiés un à un).
- Stats côte à côte produites (n, min/moy/max des deux stratégies).
- Un document sans structure passe par le repli taille fixe sans erreur.
- Les sections longues re-découpées portent le titre sur CHAQUE morceau.
- Les deux collections parallèles existent, prêtes pour la mesure de demain.

## 🎤 À savoir expliquer à l'oral
Déroule la logique en entretien comme une hypothèse scientifique : « diagnostic : 6 échecs sur 10 venaient de chunks coupés ; hypothèse : découper aux frontières de sections ; implémentation avec dégradation propre ; vérification ciblée : les 6 passages sont entiers ; mesure demain sur golden set ». Chaque étape appelle la suivante — c'est ça, la méthode.
