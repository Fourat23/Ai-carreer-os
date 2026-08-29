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

## 🧭 Exemple guidé
Une page « détail produit » avec un bouton « Ajouter au panier ». Découpage : un **Server Component**
lit le produit en base (avec la clé secrète, non exposée) et rend le contenu ; il passe les données du
produit (sérialisables) à un petit **Client Component** « bouton d'ajout » qui, lui, gère l'état et le
clic. Raisonnement : les données et le secret restent au serveur ; seule la partie interactive (le
bouton) part côté client, avec juste les données dont elle a besoin. Résultat : léger, sûr, interactif
au bon endroit. Tenter de tout mettre côté client exposerait le secret ; tout mettre côté serveur
supprimerait l'interactivité du bouton.

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

## Mini-exercice
Prends une page « profil utilisateur » qui affiche des infos (venant d'une base, avec une clé secrète)
et un bouton « Modifier » interactif. Sur papier : (1) quelle partie est un Server Component et
pourquoi ; (2) quelle partie est un Client Component et pourquoi ; (3) quelles données (sérialisables)
traversent la frontière ; (4) qu'est-ce qui NE doit jamais la traverser. Exercice de modèle mental,
sans exécution.

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
