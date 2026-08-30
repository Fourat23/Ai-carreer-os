<!-- keep -->
# Leçon — Docker : réseau et persistance des données

## 🌍 Le problème d'abord
Un conteneur seul, c'est facile. Mais une vraie application, c'est souvent plusieurs
conteneurs (l'appli + sa base de données) qui doivent **se parler**. Et le jour où
vous supprimez le conteneur de la base… vos données disparaissent ! Deux questions
concrètes se posent donc : « comment deux conteneurs communiquent-ils ? » et
« comment garder les données quand le conteneur est jetable ? ». Les débutants
butent presque toujours ici : ils écrivent `localhost` entre conteneurs (et ça ne
marche pas), ou oublient de brancher un espace de stockage durable (et perdent tout).
Cette leçon résout ces deux problèmes avec deux idées simples : le **réseau partagé**
(où l'on s'appelle par son nom) et le **volume** (une boîte de données qui survit).

## 🎯 Objectif
Comprendre comment les conteneurs **communiquent** (réseaux, mapping de ports,
résolution par nom de service) et comment **persister** des données (volumes vs
bind mounts) — les deux points où « ça marche en local mais pas ensemble »
échoue le plus souvent.

## 🧩 Prérequis
Vous devez avoir manipulé un **conteneur** (`/doc/lessons/docker-containers`) et
comprendre la notion de **port** et d'**adresse** au niveau réseau
(`/doc/lessons/networking-tcp-ip-model`,
`/doc/lessons/networking-addressing-routing`), car la communication entre conteneurs
repose dessus. Volumes et bind mounts sont définis ici.

## 🧠 Modèle mental
Un conteneur est **isolé par défaut** : son propre espace réseau, son propre
système de fichiers éphémère. Pour qu'il soit joignable de l'extérieur, on
**publie** un port. Pour que deux conteneurs se parlent, on les met sur le **même
réseau** et ils se trouvent **par nom**. Pour que des données survivent à la
suppression du conteneur, on les range dans un **volume** — hors de la couche
inscriptible éphémère.

## 📖 Explication complète
**Réseaux Docker.** Sur un réseau **bridge** défini par l'utilisateur, chaque
conteneur reçoit une IP interne et un **DNS intégré** : un conteneur peut joindre
un autre par son **nom de service** (`http://api:3000`), sans connaître son IP.
C'est la base d'une application multi-conteneurs. Le réseau `host` (partager la
pile réseau de l'hôte) et `none` (aucun réseau) existent pour des cas
particuliers.

**Publication de ports.** `-p 8080:3000` mappe le port 8080 de l'HÔTE vers le
port 3000 du CONTENEUR. Distinction clé : entre conteneurs d'un même réseau, on
utilise le port INTERNE (3000) et le nom de service ; la publication ne sert qu'à
l'accès depuis l'extérieur de Docker. Erreur classique : essayer de joindre
`localhost:3000` depuis un autre conteneur — `localhost` y désigne CE conteneur,
pas l'hôte ni le voisin.

**Volumes vs bind mounts.**
- Un **volume** est géré par Docker (`docker volume create`, monté dans le
  conteneur) : idéal pour des données de production (base, index) — persistant,
  portable, indépendant du chemin de l'hôte.
- Un **bind mount** monte un répertoire PRÉCIS de l'hôte dans le conteneur : utile
  en développement (voir le code changer en direct), mais couplé au système de
  fichiers de l'hôte.
- La couche inscriptible du conteneur, elle, est **éphémère** : sans volume, les
  données écrites disparaissent à la suppression.

**Cycle de vie des données.** `docker rm` supprime le conteneur mais PAS ses
volumes nommés (qu'on supprime explicitement). C'est voulu : on peut recréer un
conteneur tout en gardant sa base. Inversement, un volume anonyme oublié
s'accumule et gaspille de l'espace disque.

## 🔧 Repères pratiques
```bash
docker network create appnet
docker run -d --network appnet --name db postgres:16      # (exemple, non exécuté ici)
docker run -d --network appnet --name api -p 8080:3000 monapi   # api joint db via « db »
docker volume ls                     # volumes présents
docker volume inspect pgdata         # où et comment un volume est stocké
docker run -v pgdata:/var/lib/postgresql/data postgres:16   # persistance via volume nommé
```
Entre `api` et `db`, l'URL est `db:5432` (nom de service + port interne), jamais
`localhost`.

## 🧭 Exemple guidé — « mon API ne joint pas la base »
Deux pannes reviennent sans cesse avec les conteneurs, et elles ont la même origine : **on
raisonne comme si le conteneur était la machine.** Il ne l'est pas — ni pour le réseau, ni pour
le disque.

### Panne 1 — « connection refused » vers un autre conteneur

```js
const db = connecter('postgres://localhost:5433/app');   // ❌ depuis un conteneur
```

`localhost`, à l'intérieur d'un conteneur, désigne **le conteneur lui-même**. La base n'y est
pas. Et `5433` est le port **publié sur la machine hôte**, qui n'existe pas dans le réseau
interne.

```js
const db = connecter('postgres://db:5432/app');          // ✅ nom de service, port interne
```

Deux notions à séparer clairement :

| | Depuis la machine hôte | Depuis un conteneur voisin |
|---|---|---|
| adresse | `localhost` | **le nom du service** (`db`) |
| port | le port **publié** (`5433`) | le port **interne** (`5432`) |

Le nom du service fonctionne parce que le réseau créé par l'orchestrateur fournit une
résolution de noms interne. D'où le premier contrôle du diagnostic : **les deux conteneurs
sont-ils sur le même réseau ?**

```bash
docker network inspect <reseau>     # la liste des conteneurs attachés
```

Deux conteneurs sur deux réseaux distincts ne se voient pas, quel que soit le nom employé — et
c'est précisément le cas quand on lance deux fichiers Compose séparés, chacun créant son propre
réseau.

### Panne 2 — les données ont disparu

```bash
docker compose down && docker compose up      # et la base est vide
```

Le système de fichiers d'un conteneur est **éphémère** : il vit et meurt avec lui. Tout ce qui
doit survivre doit être écrit ailleurs.

```yaml
services:
  db:
    image: postgres:16
    volumes:
      - donnees_db:/var/lib/postgresql/data     # volume nommé
volumes:
  donnees_db:
```

Trois façons de monter des données, et elles ne se valent pas :

| Type | Écriture | Usage |
|---|---|---|
| **volume nommé** | géré par le moteur | **les données de production** |
| **montage de répertoire hôte** | un chemin de ta machine | le **code source en développement**, pour le rechargement à chaud |
| **rien** | dans la couche du conteneur | tout est perdu à la suppression |

Le montage de répertoire hôte est très pratique en développement et pose deux problèmes en
production : il dépend de l'arborescence de la machine, et il fait apparaître des questions de
droits — l'utilisateur du conteneur n'a pas le même identifiant numérique que celui de l'hôte,
d'où des « permission denied » sur des fichiers pourtant présents.

C'est le même mécanisme que dans `/doc/lessons/linux-filesystem-permissions` : les droits sont
attachés à des **identifiants numériques**, pas à des noms d'utilisateur. Un fichier appartenant
à l'UID 1000 sur l'hôte appartient à l'UID 1000 dans le conteneur — qui peut y désigner
quelqu'un d'autre, ou personne.

### Ce que « éphémère » implique vraiment

La conséquence dépasse la base de données, et c'est la partie qu'on découvre tard :

- **les journaux écrits dans un fichier disparaissent** avec le conteneur. Un conteneur écrit
  ses journaux sur la sortie standard, et c'est l'infrastructure qui les collecte ;
- **les fichiers téléversés par les utilisateurs** disparaissent aussi. Ils vont dans un
  stockage objet, pas sur le disque du conteneur ;
- **les données de session en mémoire** disparaissent à chaque redéploiement — c'est le
  prérequis de la mise à l'échelle horizontale de `/doc/lessons/system-design-scaling`.

Ces trois points ne sont pas des contraintes de Docker : ce sont les conséquences de
l'**instance jetable**, qui est précisément ce qui rend possible le déploiement sans coupure et
la mise à l'échelle.

### Le diagnostic, en quatre commandes

```bash
docker network inspect <reseau>            # ① même réseau ?
docker exec -it api getent hosts db        # ② le nom se résout-il ?
docker exec -it api nc -vz db 5432         # ③ le port répond-il ?
docker volume inspect donnees_db           # ④ le volume existe-t-il, et est-il monté ?
```

Elles se lisent comme la bissection réseau de `/doc/lessons/networking-http-tls`, appliquée à
l'intérieur : chacune teste une couche de plus. La première qui échoue désigne la cause, et
rend inutile de chercher au-dessus.


## ⚠️ Erreurs fréquentes
- Utiliser **`localhost`** entre conteneurs (localhost = le conteneur lui-même).
- Confondre port publié (hôte) et port interne (entre conteneurs).
- Oublier le **volume** → perte de données à chaque recréation.
- Mettre des données de prod dans un **bind mount** couplé à un chemin d'hôte.
- Accumuler des volumes anonymes orphelins (espace disque gaspillé).

## 🔐 Sécurité
Ne publier QUE les ports nécessaires (une base n'a pas à être exposée à
l'extérieur ; elle reste sur le réseau interne). Un bind mount donne au conteneur
un accès direct à des fichiers de l'hôte : à limiter et à passer en lecture seule
quand c'est possible. Rappel : l'isolation réseau/fichiers ici est applicative
(namespaces), pas une frontière de type VM.

## 🏢 Cas métier
Une équipe exposait sa base PostgreSQL avec `-p 5432:5432` « pour déboguer », la
rendant joignable depuis l'extérieur. Correction : retirer la publication, garder
la base sur le réseau interne `appnet`, n'exposer que l'API. Bonus : la base
passe sur un volume nommé, les données survivent aux redéploiements.

## 🎤 Questions d'entretien
- « Comment deux conteneurs se joignent-ils ? » → même réseau, par nom de service
  (DNS intégré), port interne.
- « Volume vs bind mount ? » → géré par Docker (prod) vs répertoire d'hôte précis
  (dev).
- « Pourquoi `localhost` ne marche pas entre conteneurs ? » → il désigne le
  conteneur courant, pas le voisin.

## ✍️ Mini-exercice
Monte une API et une base dans un même `compose.yaml`. Fais volontairement pointer l'API sur
`localhost:5432` et lis le message d'erreur exact. Corrige avec le nom de service, puis
supprime le conteneur de base et recrée-le : tes données doivent survivre. Trois
manipulations, trois mécanismes.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Votre API doit joindre une base sur le même réseau Docker. Quelle URL, et pourquoi
   pas les deux autres candidates évidentes ?
2. Vous publiez `-p 5432:5432` pour votre base. L'API la joint désormais. Est-ce la
   bonne solution ?
3. Vous supprimez et recréez le conteneur de base. Les données sont là. Étaient-elles
   dans un volume ?
4. Volume nommé ou bind mount pour la base de données de production ?

## ✅ Correction attendue

**La démarche.** Deux questions séparées, qu'on mélange souvent : **qui peut joindre
qui** (réseau) et **qu'est-ce qui survit** (volumes). Un symptôme relève toujours de
l'une des deux.

**L'erreur probable : publier un port pour résoudre un problème de réseau interne.**
C'est le raccourci le plus fréquent, et il a le mérite de marcher — ce qui est
exactement le problème.

Quand l'API ne joint pas la base, le réflexe est d'ajouter `-p 5432:5432` et de pointer
sur `localhost:5432`. Le trafic sort alors du conteneur, remonte jusqu'à l'hôte,
redescend par le port publié. **Ça fonctionne**, et l'on croit avoir corrigé la
configuration réseau.

Ce qu'on a réellement fait : **exposer sa base de données sur toutes les interfaces de la
machine.** Sur un poste de développement c'est déjà discutable ; sur un serveur avec une
adresse publique, c'est une base de données ouverte sur Internet — l'une des causes les
plus banales de compromission. Le port publié ne sert jamais à la communication entre
conteneurs ; il sert uniquement à l'accès **depuis l'hôte**, par exemple pour brancher un
client SQL le temps d'un débogage.

La bonne réponse est `db:5432` : **nom de service** (résolu par le DNS interne du réseau
Docker) et **port interne** (celui sur lequel le service écoute réellement, indépendant
de toute publication). Aucune publication n'est nécessaire, et la base reste invisible de
l'extérieur.

Le piège séduit parce que **`localhost` a toujours fonctionné avant**. Hors conteneur,
sur une seule machine, tout était sur `localhost` — l'habitude est ancienne et n'a jamais
été prise en défaut. Or dans un conteneur, `localhost` désigne **ce conteneur** : chacun a
sa propre pile réseau, donc son propre `localhost`. Pointer vers `localhost:5432` depuis
l'API revient à chercher une base à l'intérieur de l'API elle-même. Le message d'erreur
— *connection refused* — est d'ailleurs exact : personne n'écoute là.

**Sur les autres questions.** Des données qui survivent à la suppression du conteneur
étaient nécessairement **hors** de sa couche inscriptible, donc dans un volume ou un bind
mount — c'est la définition même. Si elles avaient été dans le conteneur, elles auraient
disparu avec lui, et c'est la mésaventure fondatrice de tous ceux qui apprennent Docker.

Volume nommé ou bind mount en production : **volume nommé**. Il est géré par Docker, ne
dépend d'aucun chemin de l'hôte, gère correctement les permissions, se sauvegarde comme
une unité, et peut s'appuyer sur un pilote de stockage adapté. Le bind mount est l'outil
du développement : il donne un chemin précis sur la machine, ce qui est exactement ce
qu'on veut pour éditer du code en direct, et exactement ce qu'on ne veut pas pour des
données de production.

**Alternative défendable.** Publier le port de la base **en le liant explicitement à la
boucle locale** — `-p 127.0.0.1:5432:5432` — est un compromis raisonnable en
développement : on garde le confort d'un client SQL local sans exposer quoi que ce soit
au réseau. La différence avec `-p 5432:5432` tient à une adresse écrite, et elle sépare
un poste de travail commode d'une base publiée sur Internet.

**Vérifie seul, sans corrigé** :
1. `docker compose ps` : quels ports sont publiés ? Chacun est une porte ouverte sur
   l'hôte. Sont-ils tous nécessaires ?
2. Depuis un conteneur, `getent hosts db`. Le nom résout-il ? C'est le test qui distingue
   un problème de réseau d'un problème de service.
3. Supprime ton conteneur de base et recrée-le. Si tu hésites à le faire, c'est que tu ne
   sais pas où vivent tes données.

## 🧾 À retenir
- Même réseau + nom de service = communication inter-conteneurs (DNS intégré).
- `-p hôte:conteneur` = accès EXTERNE seulement ; en interne, port interne.
- Volume (persistant, prod) vs bind mount (chemin d'hôte, dev) ; couche
  conteneur = éphémère.
- N'exposer que les ports nécessaires ; la base reste interne.

## 📚 Vocabulaire
**réseau bridge** · **DNS intégré / nom de service** · **publication de port
(`-p`)** · **port interne / externe** · **volume nommé** · **bind mount** ·
**couche inscriptible éphémère** · **volume orphelin**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je fais communiquer deux conteneurs par nom de service.
- [ ] Je distingue port publié et port interne.
- [ ] Je persiste des données avec un volume et je n'expose que le nécessaire.

## 🔗 Liens avec le programme
Mois 11 (livraison). Leçons liées : `/doc/lessons/docker-compose`,
`/doc/lessons/networking-addressing-routing`,
`/doc/lessons/docker-production-hardening`. Ce modèle réseau/volume prépare
directement les Services et volumes de Kubernetes.
