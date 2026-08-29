<!-- keep -->
# Leçon — Server Components vs Client Components : le modèle mental

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Dans une application Next.js moderne, certains composants s'exécutent sur le SERVEUR, d'autres dans le
NAVIGATEUR — et un débutant ne voit pas la frontière. Il met un `useState` dans un composant serveur
(erreur), ou récupère une clé secrète dans un composant qui part chez le client (fuite). Les messages
d'erreur (« hooks non autorisés ici », « impossible de sérialiser ») paraissent absurdes tant qu'on
n'a pas LE modèle mental. Le problème n'est pas la syntaxe : c'est de savoir QUI exécute quoi, et où
passe la frontière. Cette leçon installe ce modèle avant toute règle.

## 🎯 Objectif
Comprendre la distinction **Server Component** / **Client Component** au niveau du modèle mental : ce
que chacun peut et ne peut pas faire, pourquoi la frontière existe (sécurité, poids, interactivité),
ce qui traverse cette frontière (des données sérialisables, pas des fonctions/secrets), et comment
raisonner « ceci doit-il vivre côté serveur ou côté client ? ».

## 🧩 Prérequis
Tu dois comprendre les stratégies de rendu (`/doc/lessons/nextjs-rendering`), les composants React,
props et hooks (`/doc/lessons/react-fundamentals`, `/doc/lessons/react-hooks-effects`), et la
frontière de confiance des données (`/doc/lessons/typescript-frontend`). Aucune API précise n'est
requise : on raisonne le modèle.

## 🧠 Modèle mental
Imagine deux zones. La **zone serveur** : proche des données et des secrets, sans interactivité (pas
de clic, pas d'état local), son résultat est envoyé au navigateur sous forme de contenu déjà calculé.
La **zone client** : dans le navigateur, interactive (état, événements, effets), mais SANS accès aux
secrets ni au système de fichiers. Un **Server Component** vit dans la première, un **Client
Component** dans la seconde. La frontière n'est pas décorative : ce qui la traverse doit être
**sérialisable** (des données simples : objets, tableaux, chaînes), jamais une fonction, une connexion
base de données ou un secret. Règle mentale : « données et secrets → serveur ; interactivité →
client ; entre les deux, on passe des données sérialisables ».

## 💡 Pourquoi c'est important
Ce modèle explique la plupart des erreurs déroutantes du débutant Next.js moderne (hooks interdits
côté serveur, valeurs non sérialisables, secrets qui fuient). Le maîtriser, c'est placer chaque
morceau au bon endroit : moins de JavaScript envoyé au navigateur (le code serveur n'y va pas),
données et secrets protégés, interactivité là où il faut. C'est aussi ce qui distingue « j'ai suivi
un tuto » de « je comprends l'architecture d'une application Next.js moderne ».

## Explication complète

### Ce qu'un Server Component fait bien
Il s'exécute côté serveur : il peut lire des données directement (base, API interne), utiliser des
secrets (clé d'API) SANS les exposer, et il n'envoie PAS son propre code au navigateur (bundle plus
léger). En contrepartie, il n'a **pas** d'interactivité : pas d'état local, pas d'événements, pas
d'effets, pas d'accès aux API du navigateur. Il produit du contenu, un point c'est tout.

### Ce qu'un Client Component fait bien
Il s'exécute (aussi) dans le navigateur : il a l'**interactivité** — `useState`, événements, `useEffect`,
accès au DOM et aux API navigateur. En contrepartie, son code EST envoyé au client (poids), et il n'a
**aucun** accès direct aux secrets ou aux données privées du serveur. On le réserve aux parties
réellement interactives (un formulaire, un menu, un compteur).

### La frontière : ce qui la traverse
Un Server Component peut RENDRE un Client Component et lui passer des **props sérialisables** (des
données simples). Ce qui NE traverse PAS : une fonction, un objet de connexion, un secret, une valeur
non sérialisable. D'où les erreurs « impossible de sérialiser » : on tente de faire passer côté client
quelque chose qui doit rester serveur. Le bon découpage : les données sont préparées côté serveur, et
seules les données nécessaires descendent vers l'îlot interactif client.

### Raisonner « serveur ou client ? »
- Besoin de données/secrets, pas d'interactivité → **serveur** (par défaut, préfère le serveur).
- Besoin d'état, d'événements, d'API navigateur → **client** (le plus près possible des feuilles).
Un bon design garde de PETITS îlots clients dans un arbre majoritairement serveur : moins de
JavaScript, données protégées, interactivité ciblée. (La façon exacte de MARQUER un composant comme
client est de la syntaxe versionnée ; le modèle serveur/client, lui, est stable.)

## Concepts clés
Zone serveur (données/secrets, pas d'interactivité) vs zone client (interactivité, pas de secrets) ·
Server Component · Client Component · frontière · **props sérialisables** · « préférer le serveur, îlots
clients aux feuilles » · concept stable vs syntaxe de marquage évolutive.

## 🧭 Exemple guidé — quatre erreurs devant la frontière, et ce que chacune apprend

La règle « les composants serveur pour les données, les composants client pour
l'interactivité » se retient en une phrase et ne suffit à rien décider. Ce qui apprend,
c'est de voir **où passe exactement la frontière** — et on ne le voit qu'en la
franchissant mal.

Page « détail produit », un bouton « Ajouter au panier ». Quatre tentatives.

### Tentative 1 — tout côté client

On met `"use client"` en haut de la page et on récupère le produit depuis le composant.
Ça marche en développement. Deux problèmes, dont un grave.

La clé d'API se retrouve **dans le paquet JavaScript envoyé au navigateur**. Non pas
« potentiellement visible » : littéralement lisible en ouvrant les outils de
développement. Un composant client est du code exécuté chez l'utilisateur, donc tout ce
qu'il contient est public — variables, chaînes de caractères, clés.

Second problème : la page arrive vide, puis se remplit. Le contenu n'est pas dans le
HTML initial.

**Ce que ça apprend :** la frontière n'est pas une préférence d'architecture, c'est une
**limite de confidentialité**. Ce qui est côté client est public.

### Tentative 2 — tout côté serveur

On retire `"use client"` partout. La clé est protégée, le HTML est complet. Et le bouton
ne fait rien.

L'erreur est instructive : un composant serveur s'exécute **une fois, sur le serveur**,
et envoie le résultat. Il n'existe plus quand l'utilisateur clique. Il n'y a ni état, ni
gestionnaire d'événement, ni cycle de vie — rien de ce qui rend une interface vivante.

**Ce que ça apprend :** ce n'est pas « le serveur est plus sûr donc mettons-y tout ». Il
existe une classe de choses que seul le client peut faire, et l'interactivité en fait
partie.

### Tentative 3 — le composant client englobe tout

On garde le composant serveur pour lire les données, mais on enveloppe l'affichage
complet dans un composant client, en lui passant le produit.

Ça fonctionne, la clé est protégée, le bouton marche. Alors pourquoi est-ce mauvais ?

Parce que **tout ce qui se trouve à l'intérieur d'un composant client devient client**.
La description, la galerie de photos, le tableau de caractéristiques — du contenu
purement statique — sont maintenant rendus par du JavaScript expédié au navigateur. On
paie en poids de téléchargement et en temps d'exécution pour du texte qui ne bouge
jamais.

**Ce que ça apprend :** la frontière est **contagieuse vers le bas**. On ne la place pas
au niveau de la page, on la place **le plus bas possible** — sur le plus petit
composant qui a réellement besoin d'être interactif.

### Tentative 4 — la bonne, et la question qui reste

Le composant serveur lit le produit et rend tout le contenu. Il importe un petit
composant client `BoutonAjout`, auquel il passe l'identifiant et le prix.

Reste une question que personne ne se pose avant de tomber dessus : **qu'est-ce qui a
le droit de traverser la frontière ?**

Uniquement ce qui est **sérialisable** — nombres, chaînes, tableaux, objets simples. Pas
une fonction, pas une classe, pas une connexion à la base, pas une date sous forme
d'objet dans certains cas. La raison est mécanique : les données traversent en étant
converties en texte pour voyager sur le réseau. Une fonction ne se convertit pas en
texte.

D'où l'erreur suivante, très fréquente et dont le message est déroutant : passer un
gestionnaire `onAjout={...}` d'un composant serveur à un composant client. Le serveur ne
peut pas envoyer une fonction. Il faut inverser le sens — le composant client définit
son propre comportement, ou reçoit une action serveur, qui est un mécanisme
spécifiquement conçu pour ça.

### La règle utilisable

Ne demande pas « serveur ou client ? » pour une page. Demande, **pour chaque petit
morceau** :

1. **a-t-il besoin d'un état, d'un événement, ou d'une API du navigateur ?** → client ;
2. **touche-t-il un secret ou une source de données privée ?** → serveur, obligatoirement ;
3. **si les deux répondent oui**, c'est qu'il faut le couper en deux — et c'est presque
   toujours possible.

Le troisième point est celui qui débloque les cas difficiles. « Ce composant lit la base
**et** gère un formulaire » n'est pas un dilemme : c'est un composant qui en contient
deux.

## ⚠️ Erreurs fréquentes
- Mettre `useState`/`useEffect`/un gestionnaire d'événement dans un composant serveur → interdit
  (pas d'interactivité côté serveur).
- Faire passer une fonction ou un secret à travers la frontière → erreur de sérialisation / fuite.
- Rendre TOUT client « pour simplifier » → bundle lourd, données/secrets exposés.
- Confondre « composant serveur » et « SSR » : le rendu serveur est une stratégie ; le Server
  Component est un type de composant (complémentaires, pas identiques).
- Mémoriser la directive de marquage sans comprendre POURQUOI la frontière existe.

## 🔗 Liens avec le programme
Cette leçon suit `/doc/lessons/nextjs-rendering` et s'appuie sur la frontière de confiance de
`/doc/lessons/typescript-frontend` (données sérialisables, secrets côté serveur). Elle prépare
`/doc/lessons/nextjs-data-production` (récupérer les données côté serveur, gérer erreurs et secrets).
Le principe « petits îlots interactifs » rejoint la composition de `/doc/lessons/react-composition-architecture`.

## 🛠️ Pratique — placer la frontière sur un écran qui existe déjà

**Contexte.** Une équipe reprend l'écran « Tableau de bord commercial » d'une application
interne. L'écran actuel porte `"use client"` en première ligne du fichier de page : tout
est client. Il est lent à charger sur mobile et l'audit de sécurité a relevé une clé
d'API visible dans le paquet JavaScript.

Voici ce que l'écran contient, dans l'ordre d'affichage :

| # | Morceau | Ce qu'il fait |
|---|---------|---------------|
| 1 | En-tête | Affiche le nom du commercial connecté (lu en base) |
| 2 | Bandeau chiffres | Chiffre d'affaires du mois, lu via une API interne authentifiée par clé |
| 3 | Filtre de période | Trois boutons « 7 j / 30 j / 90 j », change l'affichage sans recharger |
| 4 | Tableau des affaires | 40 lignes, données lues en base, tri à la volée en cliquant sur une colonne |
| 5 | Bouton « Exporter en CSV » | Déclenche un téléchargement dans le navigateur |
| 6 | Notes internes | Texte long, éditorial, identique pour tous les utilisateurs |
| 7 | Widget « Aide » | Bulle qui s'ouvre et se ferme au clic |

**Ta production.** Un tableau à cinq colonnes, une ligne par morceau :

`morceau` · `serveur / client / coupé en deux` · `la question de la règle qui tranche (1, 2 ou 3)` ·
`si client ou coupé : quelles props sérialisables traversent la frontière` · `ce qui ne doit
surtout pas traverser`.

Puis, sous le tableau, trois phrases :

- **A.** Le morceau où tu as hésité le plus longtemps, et pourquoi.
- **B.** Un morceau que la solution naïve (« c'est interactif donc tout le bloc est
  client ») rendrait client alors qu'il peut rester majoritairement serveur — nomme
  précisément ce qui reste serveur.
- **C.** L'ordre de grandeur : combien des sept morceaux envoient encore du JavaScript au
  navigateur après ton découpage, contre sept aujourd'hui.

**Critère de réussite.** Ton tableau est bon si : (a) aucune ligne « client » ne reçoit la
clé d'API ni un objet de connexion ; (b) au moins un morceau est *coupé en deux* plutôt
que classé en bloc ; (c) pour chaque ligne client, tu peux nommer les props sans employer
le mot « le produit » ou « les données » — il faut des champs précis.

**Durée.** 25 à 35 minutes. Papier ou fichier texte, aucune exécution nécessaire.

## ✅ Correction

### La démarche, avant les réponses

On ne classe pas les morceaux dans l'ordre d'affichage. On les trie d'abord par la
question **2** (touche-t-il un secret ou une source privée ?), parce que celle-là n'admet
aucun compromis : si la réponse est oui, la lecture est serveur, point. Ensuite seulement
on regarde la question **1** (état, événement, API navigateur ?). Les morceaux où les deux
répondent oui sont ceux où se trouve tout le travail réel — c'est la question **3**.

Fait dans cet ordre, l'exercice se résout ; fait dans l'ordre d'affichage, on hésite sur
le tableau des affaires pendant dix minutes.

### Le tableau

| # | Morceau | Verdict | Règle | Props qui traversent | Ne traverse jamais |
|---|---------|---------|-------|----------------------|--------------------|
| 1 | En-tête | **serveur** | 2 | — | la session, la connexion base |
| 2 | Bandeau chiffres | **serveur** | 2 | — | la clé d'API |
| 3 | Filtre de période | **client** | 1 | `valeurActive: "7j"\|"30j"\|"90j"` | rien d'autre |
| 4 | Tableau des affaires | **coupé en deux** | 3 | `lignes: {id, client, montant, statut, dateISO}[]` | la requête, la connexion |
| 5 | Export CSV | **coupé en deux** | 3 | `url: string` (ou rien, voir plus bas) | le contenu du fichier, la clé |
| 6 | Notes internes | **serveur** | ni 1 ni 2 | — | — |
| 7 | Widget Aide | **client** | 1 | `texte: string` | — |

### Pourquoi ça marche : les trois lignes qui apprennent quelque chose

**Le tableau des affaires (4)** est le cœur de l'exercice. « Les données viennent de la
base » dit serveur ; « on trie en cliquant » dit client. Ce n'est pas un conflit, c'est
une couture mal placée : la **lecture** est serveur, le **tri** est client. Le composant
serveur lit les 40 lignes et les passe, déjà mises en forme, à un petit composant client
qui ne fait que réordonner un tableau qu'il a déjà en mémoire. Le JavaScript envoyé au
navigateur est celui d'une fonction de tri, pas celui d'un accès aux données.

Remarque le détail `dateISO` dans les props. Une date passée comme objet `Date` est un
cas classique de valeur qui traverse mal ; une chaîne au format ISO traverse sans
ambiguïté et se reformate côté client. C'est exactement le genre de décision qui
n'apparaît qu'au moment où on écrit les props précisément — d'où le critère (c).

**Les notes internes (6)** sont le piège inverse. Elles sont *dans* l'écran, donc la
solution naïve les emporte côté client avec le reste. Or elles ne répondent ni à la
question 1 ni à la question 2 : ni interactivité, ni secret. Elles restent serveur, et le
navigateur reçoit du HTML au lieu de JavaScript. C'est la réponse attendue en **B** — ou,
plus fin, le tableau des affaires : les 40 lignes de contenu sont rendues côté serveur,
seul l'entête cliquable est client.

**L'export CSV (5)** est celui où le verdict dépend d'une information qu'on n'a pas
donnée, et c'est volontaire. Si le fichier est fabriqué à partir de données déjà
présentes à l'écran, un composant client suffit. S'il rappelle l'API authentifiée pour
récupérer l'historique complet, la génération est serveur et le client ne reçoit qu'une
URL à ouvrir. Répondre « client » sans poser cette question est une réponse incomplète,
pas une réponse fausse.

### La mauvaise solution plausible

La plus fréquente : classer 3, 4, 5 et 7 en « client » et s'arrêter là, en trouvant que
c'est déjà mieux qu'avant. C'est vrai — mais quatre morceaux sur sept envoient encore du
JavaScript, dont le plus gros de tous (le tableau et ses 40 lignes). Le découpage correct
laisse **trois îlots clients minuscules** : trois boutons de filtre, un entête de tri,
une bulle d'aide. Réponse attendue en **C** : trois morceaux au lieu de sept, et surtout
un volume de JavaScript sans commune mesure, parce que ce sont les trois plus petits.

La seconde erreur plausible : faire du composant client de filtre (3) le parent des
morceaux 2 et 4, « pour qu'il puisse leur transmettre la période choisie ». La frontière
est contagieuse vers le bas — le bandeau chiffres redeviendrait client, avec sa clé. Le
changement de période se propage par l'URL ou par une action serveur, pas en remontant la
frontière.

### Généralisation

Cette méthode ne dépend pas de Next.js. Chaque fois qu'un système a une zone de confiance
et une zone publique — un serveur et un navigateur, un back-office et une application
mobile, un service et son client — la même question se pose : quelle est la plus petite
chose qui doit vraiment vivre du côté public ? La réponse est presque toujours plus
petite qu'on ne le croit, et la trouver consiste presque toujours à **couper en deux un
morceau qu'on croyait indivisible**.

## Mini-exercice
Prends une page « profil utilisateur » qui affiche des infos (venant d'une base, avec une clé secrète)
et un bouton « Modifier » interactif. Sur papier : (1) quelle partie est un Server Component et
pourquoi ; (2) quelle partie est un Client Component et pourquoi ; (3) quelles données (sérialisables)
traversent la frontière ; (4) qu'est-ce qui NE doit jamais la traverser.

## 📚 Vocabulaire
**Server Component** · **Client Component** · **frontière serveur/client** · **sérialisable** ·
**secret côté serveur** · **îlot interactif** · **interactivité** · **hydratation (rappel)**.

## 🧾 À retenir
Deux zones : le serveur (proche des données et des secrets, sans interactivité) et le client
(interactif, sans secrets). Un Server Component prépare le contenu et protège les secrets sans alourdir
le navigateur ; un Client Component apporte l'interactivité et reçoit des **données sérialisables**.
Ce qui traverse la frontière doit être des données simples — jamais une fonction ni un secret.
Raisonne « données/secrets → serveur, interactivité → client », garde de petits îlots clients : le
modèle est stable même quand la syntaxe de marquage évolue.
