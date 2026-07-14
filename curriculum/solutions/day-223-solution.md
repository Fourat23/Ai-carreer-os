# Correction — Jour 223 : RAG : robustesse et ré-ingestion

[← Retour au jour 223](../days/day-223.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La robustesse tient à trois mécanismes prouvables : identité de chunk par hash (idempotence), remplacement par source (fraîcheur sans état hybride), journal d'échecs (résilience sans silence). Le test de fraîcheur de bout en bout est la preuve — pas l'inspection du code.

## ⚠️ Erreurs probables et points à vérifier
- Ré-ingérer en ajoutant (append) : les doublons squattent le top-k et l'obsolète cohabite avec le neuf — le pire des deux mondes.
- Un diff fin chunk-à-chunk « pour économiser » : compliqué à prouver correct, sources d'états hybrides — à ton échelle, remplace par source.
- try/except qui avale les erreurs SANS journal : le document illisible disparaît silencieusement du corpus et personne ne le saura.
- Tester seulement l'ajout de documents, jamais la MODIFICATION : c'est la modification qui casse les index naïfs.

## 🔍 Comment vérifier ta solution
- Double ingestion du même corpus → n_chunks identique (idempotence).
- Test de fraîcheur complet passé (réponse mise à jour, pas de doublon, obsolète absent des top-k).
- Fichier corrompu → pipeline complet OK + 1 entrée de journal.
- `rag status` (ou équivalent) montre l'état de santé de l'index.

## 🎤 À savoir expliquer à l'oral
Raconte le scénario de l'incident « deux versions dans l'index » et ta parade en trois mécanismes. Termine par le test de fraîcheur : « je modifie un document, je ré-ingère, la réponse change — c'est prouvé, pas supposé ». Le mot idempotent, bien placé, fait mouche.
