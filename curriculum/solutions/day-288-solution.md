# Correction — Jour 288 : Clean architecture

[← Retour au jour 288](../days/day-288.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : lister les composants et intuitionner cœur vs détail. Solution améliorée : classer chaque composant par le TEST DU CHANGEMENT (« si je change cette techno, ce code change-t-il ? »), identifier les CONTAMINATIONS (du cœur qui importe un détail comme chromadb), et poser les interfaces que le cœur devrait définir. La règle directrice : dépendances vers le cœur, cœur sans import de framework — préalable au refactoring hexagonal.

## ⚠️ Erreurs probables et points à vérifier
- Mettre la logique métier RAG au même niveau que l'appel à Chroma : le cœur (le QUOI) doit être séparé du détail (le COMMENT), sinon changer de store casse la logique.
- Croire que « ça marche » suffit : une app qui marche mais dont le cœur importe le SDK LLM partout devra être réécrite à chaque changement de modèle.
- Confondre couches techniques (UI/DB) et clean architecture : ce qui compte est la DIRECTION des dépendances (vers le cœur), pas juste la séparation en dossiers.
- Ne pas identifier les contaminations : sans la liste des fichiers qui importent un détail, le refactoring du jour 289 n'a pas de cible.

## 🔍 Comment vérifier ta solution
- Chaque composant de DocQA est classé cœur ou détail par le test du changement.
- Le cœur identifié ne contient aucune règle métier dépendante d'une techno spécifique.
- Les contaminations (cœur qui importe un détail) sont listées.
- Les interfaces que le cœur devrait définir sont esquissées.
- Le nombre de fichiers important directement un SDK est compté (variante).

## 🎤 À savoir expliquer à l'oral
Explique l'inversion de dépendance avec le test concret : « si je change de vector store, ma logique de refus doit-elle changer ? Non — donc elle est du cœur, et Chroma est un détail derrière une interface ». Puis le pourquoi IA : « l'écosystème LLM change tous les mois ; isoler les détails rend l'évolution triviale — je remplace un adaptateur, pas mon cœur ». La direction des dépendances est LE concept.
