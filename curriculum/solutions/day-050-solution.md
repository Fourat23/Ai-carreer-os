# Correction — Jour 50 : HTTP en profondeur : le protocole du web

[← Retour au jour 50](../days/day-050.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Comprendre HTTP comme un protocole sans état requête/réponse où méthodes et statuts portent une SÉMANTIQUE. Explorer concrètement avec curl (GET, POST JSON, headers, redirection, statuts), documenter 8 statuts avec leur cas d'usage précis, et distinguer les concepts clés : sans-état, idempotence, 401 vs 403. Rejouer dans Postman une collection organisée et versionnée. La preuve : savoir choisir méthode et statut, et dessiner le cycle complet.

## ✅ Une solution simple
Faire des GET/POST avec curl et noter les statuts observés. On voit HTTP fonctionner.

## 🚀 Une solution améliorée
Explorer méthodiquement (GET, POST JSON avec Content-Type, headers via -i, redirection), documenter 8 statuts avec un cas d'usage PRÉCIS chacun (dont 401 vs 403, 201, 204, 409), expliquer le sans-état et l'idempotence, organiser une collection Postman versionnée dans Git, et savoir dessiner DNS→TCP→TLS→HTTP.

## ⚠️ Erreurs probables et points à vérifier
- Répondre 200 pour tout : les statuts sont de l'information exploitable par les clients et les outils.
- Confondre 401 (non authentifié) et 403 (interdit) : distinction sémantique essentielle.
- Croire qu'un GET peut modifier des données : il doit être sans effet de bord (contrat des caches/proxies).
- Ignorer l'idempotence : rejouer un POST après une réponse perdue crée un doublon.

## 🔍 Comment vérifier ta solution
- Exploration curl complète (GET, POST JSON, headers, redirection) réalisée sans notes.
- 8 statuts documentés avec leur cas d'usage précis, dont la distinction 401/403.
- Le caractère sans-état et l'idempotence sont expliqués avec un exemple.
- La collection Postman est organisée et versionnée dans Git.

## ❓ Réponses du mini-quiz
1. **Que signifie « HTTP est sans état » et quelle en est la conséquence ?**
   → Chaque requête est autonome et contient tout ; le serveur répond puis oublie. Conséquence : l'état (identité, panier) doit être transporté à chaque requête (token/cookie), et l'auth se rejoue à chaque appel — mais on peut ajouter des serveurs à volonté.
2. **Quelle est la différence entre 401 et 403 ?**
   → 401 = non AUTHENTIFIÉ (« je ne sais pas qui tu es »). 403 = INTERDIT (« je sais qui tu es, mais tu n'as pas le droit »). Les confondre trahit une compréhension superficielle de HTTP.
3. **Qu'est-ce que l'idempotence et pourquoi est-ce crucial pour les retries ?**
   → Une méthode idempotente donne le même effet qu'on l'appelle une ou plusieurs fois (GET/PUT/DELETE). On peut donc rejouer sans risque après une réponse perdue — contrairement à POST (deux POST = deux créations).
4. **Pourquoi un GET ne doit-il jamais modifier de données ?**
   → Parce que la sémantique de GET (lire, sans effet de bord) est un contrat sur lequel se fient clients, caches et proxies. Un GET qui modifie casserait les caches et les attentes de tout l'écosystème.

## 🎤 À savoir expliquer à l'oral
Structure autour de « sans état » : chaque requête autonome, le serveur oublie, d'où la scalabilité et le transport de l'état par token. Enchaîne sur les statuts comme langage et martèle la distinction 401 (non authentifié) / 403 (interdit). Mentionner l'idempotence pour les retries et savoir dessiner DNS→TCP→TLS→HTTP montre que tu comprends l'infrastructure sous l'API — un niveau au-dessus de « je sais appeler une API ».
