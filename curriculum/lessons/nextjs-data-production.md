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

## 🧭 Exemple guidé — la journée de mise en ligne, heure par heure

Une boutique en ligne met en production sa page « Mes commandes ». La page a été testée
pendant trois semaines en développement et fonctionne parfaitement. Suivons la journée.

### 9 h 10 — mise en ligne. Tout va bien.

La page s'affiche, les commandes sont là. L'équipe passe à autre chose.

Ce qui a été testé pendant trois semaines : une API locale qui répond en 4 ms, jamais en
erreur, avec un jeu de données stable et un seul utilisateur. Autrement dit : le cas
heureux, mille fois. Retiens cette phrase, elle explique tout ce qui suit.

### 11 h 25 — « la page reste blanche »

Un client appelle. Sa page ne s'affiche pas — elle est blanche, pendant plusieurs secondes,
puis apparaît. Chez lui, l'API met 2 à 3 secondes : il a 340 commandes, pas 5 comme dans le
jeu de test.

Le code ne prévoit qu'une issue : quand les données sont là, on affiche. Tant qu'elles ne
sont pas là, il n'y a rien à afficher, donc rien ne s'affiche.

La correction ne consiste pas à accélérer l'API — ce serait traiter le symptôme, et 2
secondes resteront 2 secondes pour quelqu'un en 4G dans un train. Elle consiste à **prévoir
un écran pour l'état d'attente** : une structure de page avec des blocs gris à la place des
lignes. L'utilisateur voit immédiatement qu'il est au bon endroit et que ça arrive.

Le framework a une convention pour ça : un fichier d'attente à côté de la page, qui
s'affiche automatiquement tant que les données du composant serveur ne sont pas prêtes. On
n'écrit pas de `if (chargement)` : on écrit l'écran d'attente, et il apparaît quand il faut.

> **Premier enseignement.** Le chargement n'est pas un délai, c'est un **état**, avec son
> propre écran. Un état sans écran donne un écran blanc.

### 13 h 02 — « erreur 500 » sur toute l'application

Le fournisseur de paiement, appelé pour afficher le statut de règlement, tombe. La page
« Mes commandes » plante — et le plantage remonte : c'est toute l'application qui affiche
une page d'erreur brute, y compris pour les clients qui voulaient juste consulter le
catalogue.

Deux problèmes distincts, à ne pas confondre.

Le premier est que rien n'attrape l'erreur. Une exception non gérée pendant le rendu remonte
jusqu'à la racine, et ce qui n'est pas rattrapé en chemin emporte tout. La réponse est une
**frontière d'erreur** : un écran de secours placé à un niveau donné de l'arbre, qui
intercepte ce qui casse en dessous et propose de réessayer. Le mot « frontière » est à
prendre littéralement : elle délimite la zone que la panne peut détruire.

Le second problème est le **placement** de cette frontière. Mise à la racine, elle transforme
une panne de paiement en panne de site. Mise autour du seul bloc « statut de règlement »,
elle transforme la même panne en une ligne « statut indisponible » dans une page qui, par
ailleurs, fonctionne. Même mécanisme, deux qualités de service très différentes.

> **Deuxième enseignement.** Une frontière d'erreur ne se contente pas d'éviter le plantage :
> **son emplacement décide de ce qui survit à la panne.** Place-la au plus près de ce qui
> peut tomber.

### 14 h 30 — « un client voit les commandes d'un autre »

Alerte grave. Un client rapporte avoir vu, pendant quelques secondes, une commande qui
n'était pas la sienne.

En cherchant, l'équipe trouve que la page a été marquée comme mise en cache pour une
durée d'une heure, « pour aller plus vite ». Ce cache est partagé : la première réponse
calculée est réservée aux visiteurs suivants. Or cette page dépend de **qui** la demande.

C'est la confusion la plus coûteuse de cette leçon : on met en cache une page en pensant à
sa **fraîcheur** (« les commandes ne changent pas si vite ») alors que la vraie question
était sa **portée** (« cette page est-elle la même pour tout le monde ? »).

Deux questions distinctes, à poser dans cet ordre :

1. **Pour qui ?** Si la réponse dépend de l'utilisateur, elle ne peut pas être servie depuis
   un cache partagé. Ce n'est pas un réglage de performance, c'est une règle de correction.
2. **Pour combien de temps ?** Seulement si la première question a répondu « c'est le même
   contenu pour tous », alors on arbitre entre vitesse et fraîcheur.

Note que la panne de 14 h 30 n'aurait produit aucun symptôme en développement : sur un poste
avec un seul utilisateur connecté, un cache partagé et un cache par utilisateur sont
indiscernables.

> **Troisième enseignement.** Avant « combien de temps garder cette réponse ? », demande
> **« à qui ai-je le droit de la resservir ? »**.

### 16 h 15 — le prix affiché n'est pas le prix facturé

Une promotion se termine à 16 h. À 16 h 15, la page produit affiche encore l'ancien prix ;
le panier, lui, facture le nouveau. Le client crie à l'arnaque.

Ici le cache est légitime — une fiche produit est identique pour tous, question 1 réglée.
C'est la question 2 qui a été mal répondue : la durée choisie était 24 heures, parce que
« une fiche produit ne change presque jamais ».

« Presque jamais » n'est pas la bonne unité. La bonne question est : **quel retard maximal
est acceptable, et pour qui ?** Un délai de 24 heures sur une description est sans
conséquence. Le même délai sur un prix crée un litige commercial. Dans une même page, tous
les champs n'ont pas la même exigence de fraîcheur — et le champ le plus exigeant impose sa
règle à l'ensemble, à moins de séparer les deux.

D'où deux corrections possibles, toutes deux valables : raccourcir la durée pour la page
entière (simple, on paie en charge serveur), ou **rafraîchir sur événement** — quand une
promotion se termine, l'application signale au cache que cette page est périmée. La seconde
est plus juste et plus complexe ; elle se justifie quand le retard coûte de l'argent.

> **Quatrième enseignement.** La durée de cache ne se déduit pas de « ça change souvent ou
> pas », mais du **coût du retard**.

### 17 h 50 — la clé d'API est publique

Un développeur, en cherchant autre chose, trouve la clé du fournisseur de paiement dans le
fichier JavaScript téléchargé par le navigateur. Elle avait été mise dans une variable
d'environnement — mais dans la catégorie **publique**.

Les frameworks distinguent deux familles de variables : celles qui restent sur le serveur, et
celles qui sont volontairement injectées dans le code envoyé au navigateur (typiquement une
adresse d'API publique, un identifiant de mesure d'audience). Le préfixe qui marque la
seconde famille varie selon les versions ; le principe ne varie pas.

L'erreur est presque toujours la même : le code ne fonctionnait pas, quelqu'un a vu que la
variable était `undefined` côté client, l'a déplacée dans la catégorie publique, et ça a
marché. Ça a marché parce que la variable est devenue publique — ce qui était précisément le
problème à ne pas créer.

Une variable `undefined` côté client n'est pas un bug de configuration : c'est le système
qui signale que **le code qui a besoin de ce secret est du mauvais côté de la frontière**.
La correction est de déplacer l'appel, pas la variable.

Et la rotation qui suit n'est pas optionnelle : une clé qui a été servie à des navigateurs
est compromise, même si personne ne l'a manifestement utilisée. On ne « remet pas » un
secret sur le serveur, on en génère un nouveau.

> **Cinquième enseignement.** Quand un secret manque côté client, **déplace le code, jamais
> le secret**.

### Ce que la journée a coûté, et ce qu'elle enseigne

Cinq incidents, aucun bug de logique métier. Aucun n'était détectable en développement, et
c'est le point commun qui compte : chacun venait d'une **issue non-heureuse jamais
rencontrée** — lenteur, panne d'un tiers, pluralité des utilisateurs, écoulement du temps,
frontière de confiance.

La liste de contrôle qui reste, à passer sur chaque page avant mise en ligne :

| Question | Ce qu'elle protège |
|----------|--------------------|
| Que voit l'utilisateur pendant l'attente ? | l'écran blanc |
| Si un appel échoue, que reste-t-il d'affiché ? | la panne totale |
| Cette réponse est-elle la même pour tout le monde ? | la fuite entre utilisateurs |
| Quel retard est acceptable sur le champ le plus sensible ? | l'affichage périmé |
| Quel code a besoin du secret, et de quel côté est-il ? | la fuite de clé |

Cinq questions. Elles ne dépendent d'aucune version d'aucun framework.

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

## 🛠️ Pratique — la revue avant mise en ligne

**Contexte.** Tu es la personne qui relit les pages avant mise en production. Un site de
petites annonces immobilières te soumet quatre pages, décrites ci-dessous telles que
l'équipe les a écrites. Aucune n'a jamais tourné ailleurs qu'en développement.

| Page | Ce qu'elle affiche | Comment elle est écrite aujourd'hui |
|------|--------------------|-------------------------------------|
| **P1 — `/annonces`** | Les 30 dernières annonces publiées, filtrables par ville | Lecture serveur, pas de cache déclaré, pas d'écran d'attente, pas d'écran d'erreur |
| **P2 — `/annonces/[id]`** | Une annonce : photos, description, prix, nom et téléphone de l'agence, plus un encart « biens similaires » venant d'un service externe | Lecture serveur, cache déclaré à 24 h, pas d'écran d'erreur |
| **P3 — `/mes-favoris`** | Les annonces mises de côté par l'utilisateur connecté | Lecture serveur, cache déclaré à 1 h pour « soulager la base » |
| **P4 — `/estimation`** | Formulaire d'estimation : l'utilisateur saisit une adresse, un service externe payant renvoie une fourchette de prix | Appel au service **depuis le navigateur**, avec la clé lue dans une variable d'environnement publique |

**Ta production.** Une fiche de revue par page — quatre fiches — construite ainsi :

1. Les **cinq questions** de la liste de contrôle de l'exemple guidé, avec pour chacune :
   `conforme` / `à corriger`, et une phrase qui dit *ce que voit un utilisateur réel* si
   on ne corrige pas. Pas « ce n'est pas une bonne pratique » : ce qui apparaît à l'écran.
2. La **correction concrète** pour chaque `à corriger` : quoi déplacer, quoi ajouter, quelle
   valeur choisir. Si tu proposes une durée de cache, écris le nombre et justifie-le par le
   coût du retard, pas par « ça ne change pas souvent ».
3. Un **verdict** : `peut partir` / `peut partir après corrections mineures` /
   `ne doit pas partir`. Une seule des quatre pages mérite le troisième verdict — désigne-la
   et dis en une phrase pourquoi elle est dans une autre catégorie que les autres.
4. Une **question à poser à l'équipe** : un point que la description ne permet pas de
   trancher et dont dépend ta recommandation. Une seule, la plus utile.

**Critère de réussite.** Ta revue est bonne si (a) au moins une page a une durée de cache
différente de celles proposées par l'équipe, avec un nombre et une raison ; (b) tu as
repéré la page où le problème n'est pas la fraîcheur mais la **portée** ; (c) au moins une
de tes corrections consiste à déplacer du code plutôt qu'à changer un réglage ; (d) chaque
« à corriger » est formulé du point de vue de l'utilisateur.

**Durée.** 40 à 50 minutes. Papier ou fichier texte.

## ✅ Correction

### La démarche

Passe les quatre pages dans l'ordre de gravité, pas dans l'ordre de la liste. Une fuite de
secret et une fuite entre utilisateurs sont des défauts de **correction** : la page fait
quelque chose de faux. Une absence d'écran d'attente ou une mauvaise durée de cache sont des
défauts de **qualité** : la page fait ce qu'elle doit, mal. Les deux se corrigent, mais
seuls les premiers empêchent une mise en ligne.

Ce tri d'abord évite le piège classique de la revue : passer vingt minutes sur l'écran de
chargement de P1, et signaler la clé de P4 en dernière ligne comme une remarque parmi
d'autres.

### P4 — `/estimation` : **ne doit pas partir**

C'est la seule des quatre dans cette catégorie, et la question qui la distingue est la
cinquième : *quel code a besoin du secret, et de quel côté est-il ?*

La clé d'un service **payant** est dans le paquet JavaScript. Ce que voit un utilisateur
réel : rien du tout — et c'est ce qui rend le défaut dangereux. Ce que voit quelqu'un qui
ouvre les outils de développement : une clé utilisable, facturée au propriétaire du compte,
sans plafond ni traçabilité. Le préjudice n'est pas visuel, il est sur la facture.

Correction — et c'est la correction qui consiste à **déplacer du code** :

- l'appel au service part du navigateur et devient un appel côté serveur ; le navigateur
  envoie l'adresse saisie à notre propre serveur, qui appelle le service et renvoie la
  fourchette ;
- la variable quitte la catégorie publique et redevient une variable serveur ;
- la clé actuelle est **révoquée et régénérée** : elle a été distribuée à des navigateurs.

Le formulaire reste un composant client — c'est de la saisie, de l'état, un événement. Ce
qui change de côté, c'est l'appel au service, pas le formulaire.

Question 3 au passage : ce serveur appelle un service payant sur des adresses arbitraires. Il
faut une limite de débit par utilisateur, sinon on a remplacé une clé publique par un
service public. Le déplacement du code est nécessaire, pas suffisant.

### P3 — `/mes-favoris` : **ne doit pas partir non plus** (défaut de portée)

C'est la page attendue au critère (b). Le cache d'une heure a été choisi en pensant
fraîcheur : « les favoris ne changent pas toutes les minutes ». La question posée aurait dû
être : *cette réponse est-elle la même pour tout le monde ?*

Elle ne l'est pas. Un cache partagé sur une page dépendant de l'utilisateur connecté sert à
la deuxième personne la page de la première. Ce que voit un utilisateur réel : les favoris
de quelqu'un d'autre — c'est-à-dire, sur un site immobilier, ce qu'un inconnu envisage
d'acheter et son budget.

Correction : **pas de cache partagé**, quelle que soit la durée. Zéro minute n'est pas une
version prudente d'une heure ; c'est une catégorie différente. Une page dépendant de la
session se rend à la requête. Si la charge sur la base pose vraiment problème, la réponse
est un cache **par utilisateur** ou une lecture plus efficace, pas un cache partagé plus
court.

Le raccourci mental à corriger : *la durée ne répare jamais une erreur de portée.*

### P2 — `/annonces/[id]` : **corrections mineures**

Deux points.

**La durée.** 24 heures a été justifiée par « une annonce ne bouge pas ». Reprends la
question par le coût du retard, champ par champ : la description et les photos tolèrent une
journée sans conséquence ; le **prix** et surtout le **statut** (« vendu ») ne le tolèrent
pas. Ce que voit un utilisateur réel : il appelle l'agence pour un bien vendu la veille, ou
il découvre au téléphone que le prix a changé.

C'est le champ le plus exigeant qui impose sa règle. Une durée de l'ordre de **5 à 15
minutes** est défendable ici, et il faut écrire le nombre : disons 10 minutes, parce qu'un
délai de dix minutes entre la mise à jour d'un prix par l'agence et son affichage ne produit
pas d'appel mécontent, alors qu'une heure en produit. Mieux, si l'outil le permet :
rafraîchir **sur événement** — quand une agence modifie une annonce, la page correspondante
est marquée périmée. La durée n'est alors qu'un filet de sécurité.

**L'encart « biens similaires ».** Il vient d'un service externe, donc il tombera un jour.
Sans frontière d'erreur, ce qui tombe est la fiche entière — la page qui fait vivre le site.
Correction : une frontière d'erreur **autour du seul encart**, avec un contenu de secours
discret. Ce que voit un utilisateur réel après correction : une annonce complète, sans
suggestions. Avant correction : une page d'erreur, alors que le téléphone de l'agence était
disponible et suffisait.

Note qu'ici, la donnée la plus précieuse de la page — le numéro de l'agence — est lue depuis
notre propre base. Il serait absurde de la perdre à cause d'un service de recommandation.

### P1 — `/annonces` : **corrections mineures**

La portée est bonne (même liste pour tous, les filtres sont dans l'URL), le secret n'est pas
en cause. Manquent les deux écrans non-heureux.

**Attente** : 30 annonces avec photos ne se chargent pas instantanément sur un téléphone en
mobilité. Ce que voit un utilisateur réel aujourd'hui : une page blanche pendant une à trois
secondes, ce qui est le seuil où l'on referme l'onglet. Correction : un écran d'attente
montrant la structure — 30 cartes grises aux bonnes dimensions. La perception de vitesse
tient autant à ce qui s'affiche pendant l'attente qu'à la durée réelle.

**Erreur** : si la base ne répond pas, il faut un écran de secours avec un bouton de
réessai, à l'échelle de la liste.

**Cache** : absent aujourd'hui, ce qui n'est pas faux — la fraîcheur est bonne, on paie en
charge. Une durée courte, de l'ordre de **une minute**, est un compromis raisonnable pour la
page la plus visitée du site : une annonce publiée il y a cinquante secondes peut attendre.
Attention toutefois : la liste est filtrable par ville, donc chaque combinaison de filtres
est une réponse différente. C'est acceptable — le filtre est dans l'URL, il fait partie de
l'identité de la réponse, contrairement à l'identité de l'utilisateur en P3.

### La question à poser à l'équipe

La plus utile porte sur P2 : **qui met à jour le statut d'une annonce, et par quel chemin ?**

Si les agences passent par notre back-office, on peut invalider la page au moment de la
modification, et la durée de cache devient un simple filet. Si les annonces sont importées
d'un système tiers toutes les nuits, le rafraîchissement sur événement n'est pas disponible
et il faut choisir une durée. La recommandation change du tout au tout selon la réponse, et
rien dans la description ne permet de trancher.

Une question de la même famille sur P4 — *le service d'estimation facture-t-il à l'appel ?* —
est bonne aussi, mais moins décisive : le déplacement du code s'impose de toute façon.

### La mauvaise solution plausible

Sur P3, proposer « on garde le cache mais on ramène la durée à 5 minutes ». C'est une
réponse qui semble prudente et qui ne corrige rien : pendant ces cinq minutes, les favoris
d'un utilisateur restent servis aux autres. Une fuite intermittente est plus difficile à
diagnostiquer qu'une fuite permanente, donc cette « demi-correction » est plus coûteuse que
l'absence de correction.

Sur P4, proposer « on renomme la variable pour qu'elle ne soit plus publique ». La variable
cesserait d'être injectée dans le code client, l'appel deviendrait `undefined`, la page
cesserait de fonctionner — et quelqu'un remettrait le préfixe public la semaine suivante pour
« réparer ». Tant que l'appel part du navigateur, la clé doit être publique : c'est le code
qui est du mauvais côté.

### Généralisation

Les cinq questions ne parlent en réalité ni de Next.js ni du web. *Que voit-on pendant
l'attente · que reste-t-il quand une dépendance tombe · à qui ai-je le droit de resservir
cette réponse · quel retard est acceptable · où vit le secret* — ce sont les questions d'un
service en production, quel qu'il soit. Un traitement par lots, une application mobile, une
API interne les posent à l'identique. Ce que le framework apporte, ce sont des conventions
pour y répondre sans écrire la plomberie ; il ne dispense pas de se les poser, et c'est
précisément l'écart entre « ça marche sur ma machine » et « c'est en production ».

## Mini-exercice
Reprends une page « tableau de bord » affichant des données issues d'une API protégée par une clé.
Sur papier : (1) où récupères-tu les données et pourquoi ; (2) mets-tu en cache, et quelle durée
(justifie par le coût du retard) ; (3) décris les quatre états d'écran ; (4) où placer la clé.

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
