# Correction — Jour 215 : Introduction au RAG : le pourquoi

[← Retour au jour 215](../days/day-215.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La note répond à UNE question : pourquoi cette architecture et pas une autre, pour CE corpus et CES questions. La conception est complète quand chaque étape du schéma a un format d'entrée/sortie défini et que les limites assumées sont écrites avant le code.

## ⚠️ Erreurs probables et points à vérifier
- Choisir un corpus que tu ne maîtrises pas : tu ne pourras pas juger si les réponses sont bonnes — prends un corpus dont TU es l'expert.
- Écrire les questions types APRÈS avoir construit : elles épouseront ce que le système sait faire au lieu de le tester.
- Vendre le RAG comme la fin des hallucinations : il les réduit sur le corpus, il n'immunise pas (le modèle peut mal lire un chunk, ou répondre hors sources).
- Concevoir pour un corpus d'un million de documents alors que tu en as 50 : dimensionne pour TON problème (JSON + cosinus suffiront des semaines).

## 🔍 Comment vérifier ta solution
- La note contient le chiffrage coût tout-dans-le-prompt vs retrieval pour TON corpus.
- 10 questions types écrites, dont 2 auxquelles le corpus ne répond PAS (tests de refus futurs).
- Le schéma précise le format des données entre chaque étape.
- Les 3 alternatives écartées ont chacune une raison chiffrable.

## 🎤 À savoir expliquer à l'oral
Entraîne-toi au tableau : les 6 étapes du pipeline dessinées en 60 secondes, puis les 3 murs (taille/coût/fraîcheur) en 3 phrases. C'est LE schéma d'entretien AI engineer — il doit sortir sans hésitation.
