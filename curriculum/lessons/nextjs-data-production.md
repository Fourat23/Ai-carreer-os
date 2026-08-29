<!-- keep -->
# Leçon — Next.js : données, états d'erreur et mise en production

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Ton application affiche des données. En développement, tout va bien. En production : l'API est parfois
lente (que voit l'utilisateur pendant ce temps ?), parfois en erreur (500 ? page blanche ?), une URL
n'existe pas (que renvoyer ?), et une clé secrète traîne dans le code envoyé au navigateur (fuite). Une
application qui ne gère que le cas heureux n'est pas prête pour la production. Cette leçon relie ce que
tu sais déjà — les quatre états d'écran, la frontière de confiance — aux réponses de production d'un
framework : récupérer les données au bon endroit, gérer erreurs/chargement/absence, protéger les
secrets, et déployer.

## 🎯 Objectif
Savoir raisonner la récupération de données et la mise en production d'une application Next.js, au
niveau fondamental : où récupérer les données (serveur), notion de cache et de revalidation, gestion
des états erreur/chargement/not-found, frontière des secrets (variables d'environnement), et étapes
conceptuelles d'un déploiement. Sans mémoriser d'API : les principes.

## 🧩 Prérequis
Tu dois comprendre les stratégies de rendu (`/doc/lessons/nextjs-rendering`), la frontière serveur/
client (`/doc/lessons/nextjs-server-client-components`), les quatre états d'écran
(`/doc/lessons/react-application-states`), HTTP (`/doc/lessons/http-rest-json`) et les secrets côté
serveur (`/doc/lessons/typescript-frontend`, `/doc/lessons/authentication`).

## 🧠 Modèle mental
La production ajoute une exigence à tout ce que tu sais : gérer ce qui PEUT MAL SE PASSER. Trois idées
portent la leçon. (1) **Récupérer les données là où c'est sûr** : côté serveur, on lit les données et
on utilise les secrets sans les exposer ; le navigateur ne reçoit que le résultat. (2) **Fraîcheur =
compromis** : mettre en cache accélère mais peut servir du périmé ; la *revalidation* décide quand
rafraîchir. (3) **Tout écran a plusieurs issues** : chargement, erreur, absence (not-found), succès —
comme les quatre états d'écran, mais désormais avec des conventions du framework pour chaque cas.
« En production, le cas heureux est le plus rare des cas à gérer. »

## 💡 Pourquoi c'est important
La différence entre une démo et un produit tient dans ces détails : un secret protégé, un état de
chargement au lieu d'un écran blanc, une page d'erreur au lieu d'un plantage, une page 404 propre, un
cache qui n'affiche pas des prix périmés. Savoir raisonner ces points — indépendamment de la version
du framework — est exactement ce qu'un employeur attend d'un frontend capable de livrer.

## Explication complète

### Récupérer les données au bon endroit
Dans une application Next.js moderne, on récupère de préférence les données **côté serveur** (dans un
Server Component) : on peut lire une base ou une API interne avec un secret, et n'envoyer au navigateur
que les données nécessaires. Bénéfices : secret protégé, moins de JavaScript, HTML rempli d'emblée
(vitesse, référencement). La récupération côté client reste utile pour l'interactif (recherche en
direct après saisie), avec sa gestion d'erreur/anti-course déjà vue.

### Cache et revalidation (le compromis fraîcheur)
Servir une donnée mise en cache est rapide et économe, mais peut être PÉRIMÉ. La **revalidation** est
la réponse : rafraîchir le cache selon une règle (au bout d'un délai, ou lors d'un événement). Concept
stable : on arbitre entre VITESSE (cache) et FRAÎCHEUR (revalidation) selon le contenu — un article de
blog tolère des minutes de retard, un stock non. (Les API exactes de cache/revalidation dépendent de
la version : c'est la partie évolutive.)

### Les états d'une page en production
Un framework fournit des conventions pour les issues non-heureuses :
- **chargement** : une UI d'attente pendant que les données arrivent (souvent en streaming) ;
- **erreur** : une frontière d'erreur affiche une page de secours au lieu d'un plantage, avec reprise ;
- **not-found** : une page 404 propre quand la ressource n'existe pas ;
- **succès** : le contenu.
Ce sont les quatre états d'écran de `react-application-states`, désormais outillés par le framework.

### La frontière des secrets (variables d'environnement)
Une clé d'API, un mot de passe de base : ce sont des **secrets**. Ils vivent dans des **variables
d'environnement** lues **côté serveur uniquement**. Règle de sécurité : un secret ne doit JAMAIS se
retrouver dans le code envoyé au navigateur (les frameworks distinguent les variables « publiques »,
exposées au client, des variables serveur — ne mets un secret que dans les secondes). « Pratique côté
client, vérité et secrets côté serveur » (rappel de la leçon formulaires).

### Déployer (au niveau conceptuel)
Déployer une application Next.js, c'est : construire (build) l'application, fournir les variables
d'environnement de production (secrets), servir les pages selon leur stratégie (statiques pré-générées,
pages rendues à la requête), et surveiller (erreurs, performance). Le détail dépend de l'hébergeur ;
le principe — build reproductible + secrets injectés à l'exécution + observabilité — est stable et
rejoint `deployment-secrets`.

## Concepts clés
Récupération côté serveur (données/secrets protégés) · cache vs **revalidation** (vitesse ↔ fraîcheur) ·
états de page (chargement / erreur / not-found / succès) · frontière d'erreur · **variables
d'environnement** (publiques vs secrètes) · déploiement (build + secrets + observabilité) · concept
stable vs API versionnée.

## 🧭 Exemple guidé
Une page « liste de commandes ». (1) **Données** : récupérées côté serveur (la clé de l'API interne
reste au serveur) ; seules les commandes nécessaires descendent au client. (2) **Cache** : revalidées
toutes les quelques minutes (une commande passée il y a 10 s peut attendre un peu). (3) **États** :
chargement (squelette en streaming), erreur (page de secours + réessayer), not-found (si l'utilisateur
n'a aucune commande → message clair, pas un écran vide), succès (la liste). (4) **Secret** : la clé
est une variable d'environnement SERVEUR, jamais exposée. Raisonnement : chaque décision protège la
production contre un cas non-heureux. C'est l'application, en contexte framework, des quatre états et
de la frontière de confiance déjà connus.

## ⚠️ Erreurs fréquentes
- Récupérer des données avec un secret côté CLIENT → fuite de la clé dans le navigateur.
- Ne gérer que le succès → écran blanc au chargement, plantage en erreur, vide sans message.
- Mettre en cache un contenu qui doit être frais sans revalidation → données périmées affichées.
- Exposer un secret via une variable « publique » → confusion publique/serveur.
- Mémoriser des API de data fetching sans comprendre le compromis vitesse/fraîcheur (qui, lui, dure).

## 🔗 Liens avec le programme
Cette leçon relie `/doc/lessons/react-application-states` (les quatre états), `/doc/lessons/nextjs-server-client-components`
(récupérer côté serveur), `/doc/lessons/typescript-frontend` et `/doc/lessons/authentication` (secrets,
frontière de confiance), et `/doc/lessons/deployment-secrets` (build + secrets + observabilité). Elle
clôt la chaîne Next.js fondations.

## Mini-exercice
Prends une page « tableau de bord » affichant des données issues d'une API protégée par une clé. Sur
papier : (1) où récupères-tu les données et pourquoi ; (2) mets-tu en cache, et prévois-tu une
revalidation (justifie par la fraîcheur nécessaire) ; (3) décris les quatre états d'écran de la page ;
(4) où placer la clé secrète pour qu'elle ne fuie jamais. Exercice de raisonnement, sans exécution
réelle de Next.js.

## 📚 Vocabulaire
**récupération côté serveur** · **cache** · **revalidation** · **frontière d'erreur** · **not-found
(404)** · **variable d'environnement (publique / secrète)** · **build** · **observabilité** ·
**fraîcheur ↔ vitesse**.

## 🧾 À retenir
La production, c'est gérer ce qui peut mal se passer. Récupère les données là où c'est sûr (serveur,
secrets protégés) ; arbitre vitesse (cache) et fraîcheur (revalidation) selon le contenu ; traite les
quatre états de page (chargement, erreur, not-found, succès) avec les conventions du framework ; garde
les secrets dans des variables d'environnement SERVEUR, jamais dans le code client ; et déploie avec un
build reproductible, des secrets injectés et de l'observabilité. Les API évoluent — ces principes
restent.
