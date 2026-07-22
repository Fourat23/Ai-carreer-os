# Correction — Jour 68 : Auth par token et gestion des secrets

[← Retour au jour 68](../days/day-068.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Protéger les routes d'écriture par un middleware d'auth qui lit le token dans le header Authorization (jamais l'URL) et répond 401 si absent/invalide, placé AVANT les routes protégées. Ranger les secrets dans l'environnement (.env gitignored, .env.example commité), jamais dans le code. Vérifier l'historique Git. La preuve : les 3 cas (sans token, mauvais token, bon token) sont testés et aucun secret n'a jamais été commité.

## ✅ Une solution simple
Un middleware qui vérifie un token sur les routes d'écriture, secret lu depuis .env. L'accès est protégé.

## 🚀 Une solution améliorée
Vérifier le token dans le header (jamais l'URL), tester les 3 cas (sans token → 401, mauvais token → 401, bon token → succès), mettre le secret en .env gitignored avec un .env.example commité, et AUDITER l'historique Git pour confirmer qu'aucun secret n'a jamais fuité. Discuter la limite d'un token statique (JWT/expiration en vrai).

## ⚠️ Erreurs probables et points à vérifier
- Token dans l'URL : fuite dans les logs, proxies et historiques — un secret publié.
- Secret en dur dans le code : publié dans Git, visible par tous.
- .env non gitignored ou secret déjà présent dans l'historique Git : la fuite persiste même après suppression.
- Middleware d'auth placé après la route, ou protégeant les mauvaises routes : la protection ne s'applique pas.

## 🔍 Comment vérifier ta solution
- Routes d'écriture protégées : sans token → 401, mauvais token → 401, bon token → succès (les 3 testés).
- Secrets en .env, .env dans .gitignore, .env.example commité.
- Audit de l'historique Git : aucun secret jamais commité.
- Le token est lu dans le header Authorization, jamais dans l'URL.

## ❓ Réponses du mini-quiz
1. **Pourquoi le token va-t-il dans le header Authorization et jamais dans l'URL ?**
   → Parce que les URLs sont loggées partout (serveurs, proxies, historique navigateur, referers) : un secret dans l'URL est un secret publié. Un header n'est pas loggé par défaut.
2. **Pourquoi l'authentification se rejoue-t-elle à chaque requête ?**
   → Parce que HTTP est sans état : le serveur ne se souvient de personne d'une requête à l'autre, donc le client doit prouver son identité (joindre le token) à chaque appel.
3. **Où vivent les secrets, et que ne fait-on jamais ?**
   → Dans l'environnement : un fichier `.env` gitignored, lu via `process.env`, avec un `.env.example` commité (sans valeurs) qui documente les variables. On ne met JAMAIS un secret en dur dans le code (il serait publié dans Git).
4. **Quel statut pour une requête sans token ou avec un token invalide ?**
   → 401 (non authentifié) : le serveur ne reconnaît pas l'identité. À distinguer de 403 (authentifié mais pas le droit). Un token présent mais faux reste un 401.

## 🎤 À savoir expliquer à l'oral
Explique la conséquence du sans-état : « l'auth se rejoue à chaque requête, via un token dans le header — jamais l'URL, qui est loggée partout ». Décris le middleware qui vérifie avant les routes protégées (401 sinon), et l'hygiène des secrets (.env gitignored, .env.example, scan de l'historique Git). Relier cette hygiène aux clés d'API LLM (mois 8) et mentionner la limite d'un token statique (JWT en vrai) montre une vision au-delà de l'exercice.
