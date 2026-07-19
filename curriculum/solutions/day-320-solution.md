# Correction — Jour 320 : DocSense : dockerisation

[← Retour au jour 320](../days/day-320.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : un Dockerfile qui build l'app. Solution améliorée : un Dockerfile décrivant l'environnement exact + un docker-compose orchestrant les services (app + vector DB) en une commande, des secrets injectés par variables d'environnement (jamais dans l'image), un .dockerignore excluant secrets et inutile, et le test ultime : git clone + docker compose up sur machine propre. La dockerisation industrialise la reproductibilité — l'environnement est identique partout.

## ⚠️ Erreurs probables et points à vérifier
- Secrets dans l'image Docker : une image avec une clé API est compromise si partagée — injecter par variables d'environnement au lancement.
- Pas de .dockerignore : l'image embarque .git, .env, tests — lourde et potentiellement dangereuse (secrets).
- Tester seulement sur sa machine (déjà configurée) : le test qui compte est sur une machine PROPRE (git clone + compose up).
- Compose incomplet (oublier la vector DB) : `up` doit faire tourner TOUT le système, pas seulement l'app.

## 🔍 Comment vérifier ta solution
- Un Dockerfile décrit l'environnement exact de DocSense.
- `docker compose up` fait tourner l'app + la vector DB ensemble.
- Les secrets sont injectés par variables d'environnement (jamais dans l'image).
- Le .dockerignore exclut secrets, .git, inutile.
- Le test git clone + docker compose up réussit sur une machine propre (variante).

## 🎤 À savoir expliquer à l'oral
Explique la reproductibilité industrialisée : « fini ça-marche-chez-moi — mon Dockerfile fige l'environnement, docker compose up fait tout tourner sur n'importe quelle machine, et les secrets sont injectés au lancement, jamais dans l'image ». Puis le test ultime : « git clone + docker compose up sur une machine propre, c'est ce qu'un recruteur ferait ». Un projet lançable en une commande est une preuve de livrabilité.
