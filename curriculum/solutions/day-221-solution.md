# Correction — Jour 221 : RAG : pipeline modulaire

[← Retour au jour 221](../days/day-221.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le refactoring est réussi si le harnais passe à l'identique ET si chaque module est remplaçable seul (le test mental : « changer le chunking touche combien de fichiers ? » — réponse attendue : un). Le README documente les contrats parce que ce sont eux, pas le code, qui constituent l'architecture.

## ⚠️ Erreurs probables et points à vérifier
- Refactorer sans harnais : tu ne sauras pas si les réponses ont changé — et avec un LLM à temp 0, elles DOIVENT être stables.
- Des modules qui s'importent en cascade (answer importe chunk) : les frontières sont décoratives si tout dépend de tout.
- Cacher les formats intermédiaires « pour encapsuler » : le mois 9 a BESOIN de brancher des mesures entre les étapes.
- README qui décrit les fichiers au lieu des contrats : « chunk.py découpe les textes » n'aide personne ; le format d'entrée/sortie, si.

## 🔍 Comment vérifier ta solution
- Harnais : 10/10 questions donnent les mêmes réponses qu'avant le refactoring.
- `rag search` fonctionne sans appel de génération (et affiche les scores).
- Changer la taille de chunk ne touche qu'un fichier + une ré-ingestion.
- Le README contient le schéma du pipeline et le format entre chaque étape.

## 🎤 À savoir expliquer à l'oral
Déroule l'architecture au tableau depuis ton README : 5 boîtes, les formats entre elles, et UNE décision de découpage justifiée (search/answer séparés pour déboguer le retrieval seul). C'est l'exercice « explique ton projet » de l'entretien, préparé à l'avance.
