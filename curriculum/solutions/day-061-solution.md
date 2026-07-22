# Correction — Jour 61 : Projet 2 — LivreAPI : schéma et CRUD livres

[← Retour au jour 61](../days/day-061.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Concrétiser le contrat conçu au jour 60 en construisant de bas en haut : schéma reconstructible (init.sql), couche data isolée en requêtes paramétrées, routes qui suivent valider → interroger → statut correct. Choisir les statuts à la conception (201/200/204/400/404) et tester chaque étage avant le suivant. La preuve : init.sql reconstruit la base d'une commande et chaque endpoint répond le bon statut, testé via Postman.

## ✅ Une solution simple
CRUD livres qui fonctionne : POST/GET/PUT/DELETE branchés sur SQLite. L'API répond.

## 🚀 Une solution améliorée
Isoler tout le SQL dans la couche data en paramétré, faire que init.sql reconstruise la base de zéro d'une commande, choisir des statuts corrects partout (201 + objet créé, 204 sur DELETE, 404 sur id inconnu, 400 détaillé), valider avant tout accès base, et tester chaque endpoint via Postman. Recycler la structure de l'API citations.

## ⚠️ Erreurs probables et points à vérifier
- Statuts incorrects (200 pour une création ou une erreur) : casse les clients et détruit le langage des statuts.
- Validation oubliée sur POST/PUT : une entrée invalide atteint la base au lieu d'un 400 net.
- Schéma non reconstructible (base créée à la main) : projet irreproductible.
- SQL non paramétré ou éparpillé hors de la couche data : faille d'injection et migration difficile.

## 🔍 Comment vérifier ta solution
- CRUD livres complet sur SQLite, chaque endpoint testé via Postman.
- Statuts corrects partout (201/200/204/400/404).
- init.sql reconstruit la base de zéro en une commande.
- Toutes les requêtes sont paramétrées et isolées dans la couche data.

## ❓ Réponses du mini-quiz
1. **Pourquoi construire l'API de bas en haut (schéma → data → routes) ?**
   → Pour que chaque étage repose sur un socle déjà vérifié : un bug est alors localisé à l'étage qu'on vient d'ajouter, au lieu de pouvoir venir du SQL, de la logique ou du HTTP à la fois.
2. **Que doit garantir le fichier `init.sql` ?**
   → Que la base se reconstruit à l'identique d'une seule commande : le projet est reproductible par n'importe qui (toi demain, un collègue, la CI), contrairement à une base qui n'existe que sur ton poste.
3. **Quel statut renvoyer sur un POST réussi, et pourquoi le choisir tôt ?**
   → 201 + l'objet créé (avec son id). On choisit les statuts à la conception parce que les corriger après coup casse les clients qui en dépendent ; bien les choisir d'emblée est gratuit.
4. **Quel est le squelette invariable de chaque endpoint ?**
   → Valider l'entrée (sinon 400 avant tout accès base) → interroger la couche data en paramétré → répondre le statut correct (201/200/204/404).

## 🎤 À savoir expliquer à l'oral
Explique l'ordre de construction : « schéma reconstructible d'abord, couche data paramétrée ensuite, routes enfin — chaque étage testé avant le suivant, donc un bug reste localisé ». Insiste sur les statuts choisis à la conception (201 + objet créé, 404, 400) et sur init.sql qui reconstruit la base d'une commande. Relier à l'API citations (recyclage) et au contrat du jour 60 montre que tu construis méthodiquement, pas au hasard.
