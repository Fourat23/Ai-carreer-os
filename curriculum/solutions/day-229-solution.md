# Correction — Jour 229 : Métadonnées et filtrage

[← Retour au jour 229](../days/day-229.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le filtrage est correct s'il s'applique AVANT la similarité (sous-matrice, pas post-filtre), s'il est exposé proprement (CLI), et s'il est PROUVÉ par le cas à deux documents concurrents. Le périmètre vide est un cas géré avec un message spécifique — pas un refus mystérieux.

## ⚠️ Erreurs probables et points à vérifier
- Filtrer le top-k après la recherche globale : le piège classique — résultats vides alors que la réponse existe dans le périmètre.
- Des filtres en substring flou (source contient « contrat ») quand l'utilisateur attend un match exact : définis la sémantique de chaque filtre.
- Ne pas distinguer « périmètre vide » de « rien de pertinent » : deux messages différents, deux actions utilisateur différentes.
- Construire le test avec une question qui n'existe que dans UN document : le filtre semblera marcher sans rien prouver.

## 🔍 Comment vérifier ta solution
- Le cas deux-documents est construit et le filtre change la réponse (avant/après documentés).
- Filtre sur source inexistante → message « périmètre vide » explicite.
- La CLI accepte au moins source et type.
- Le gain de latence du filtrage est mesuré (variante).
- Sans filtre, le comportement reste strictement identique à avant (non-régression).

## 🎤 À savoir expliquer à l'oral
Déroule le scénario des deux contrats en 60 secondes : sans filtre le 2023 gagne, avec --source le 2025 répond, et la règle « filtrer AVANT de chercher » avec le pourquoi. Simple, visuel, et ça répond d'avance à « pourquoi une vector DB ? » — par les fonctionnalités, pas par la mode.
