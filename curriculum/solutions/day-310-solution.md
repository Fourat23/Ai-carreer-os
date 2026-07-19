# Correction — Jour 310 : DocSense : RAG core (architecture cible)

[← Retour au jour 310](../days/day-310.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : reconstruire le pipeline RAG. Solution améliorée : le construire en architecture hexagonale d'emblée (cœur derrière des ports, adapters pour les détails, testable en isolation) et y appliquer directement la config MESURÉE au mois 9 (chunking, embedding, retrieval — décisions chiffrées, pas défaut). Construire propre quand on sait déjà la bonne architecture est plus rapide que bricoler puis refactorer — le privilège de l'expérience.

## ⚠️ Erreurs probables et points à vérifier
- Repartir de valeurs par défaut au lieu de la config mesurée du mois 9 : gaspiller le mois d'évaluation — construire sur des décisions chiffrées.
- Bricoler d'abord en pensant refactorer après : le refactoring d'un système qui marche est coûteux et risqué — construire hexagonal dès le départ.
- Un cœur qui importe Chroma/le SDK LLM directement : la contamination (jour 288) empêche la testabilité et l'évolutivité — passer par des ports.
- Traiter DocSense comme un énième exercice d'apprentissage : c'est la DÉMONSTRATION de maîtrise — le construire proprement le prouve.

## 🔍 Comment vérifier ta solution
- Le RAG core est en architecture hexagonale (cœur/ports/adapters).
- La config du mois 9 (chunking, embedding, retrieval) est appliquée, pas des valeurs par défaut.
- Le cœur est testable en isolation avec des stubs (sans Chroma ni appel réel).
- Le RAG core répond sur le corpus DocSense ingéré (jour 309).
- Un test du cœur avec stubs tourne sans infra (variante).

## 🎤 À savoir expliquer à l'oral
Explique le privilège de l'expérience : « au mois 9 j'explorais et je mesurais ; maintenant j'applique — je construis le RAG core hexagonal d'emblée avec la config que j'ai chiffrée, sans refactoring ultérieur ». Puis la distinction : « DocSense ne démontre pas que j'apprends le RAG, mais que je sais en construire un de qualité directement ». Réutiliser des décisions éprouvées plutôt que re-bricoler est une marque de maturité.
