<!-- keep -->
# Leçon — Docker Compose : orchestrer une application multi-services

## 🌍 Le problème d'abord
Lancer une appli à plusieurs conteneurs « à la main », c'est taper une longue série
de commandes `docker run` avec les bons réseaux, volumes et variables — dans le bon
ordre, à chaque fois, sans se tromper. Fastidieux et non reproductible. Et si un
collègue veut lancer la même chose ? **Docker Compose** répond à ce besoin : on
DÉCRIT l'application entière (quels services, comment ils se relient, quelles
données) dans UN fichier, et une seule commande la démarre. On passe de « je tape des
commandes » à « je décris ce que je veux » — le même glissement d'esprit qu'on
retrouvera, en plus puissant, avec Kubernetes. Cette leçon part de la douleur du
« docker run » manuel pour montrer la solution déclarative.

## 🎯 Objectif
Décrire une application entière (app + base + cache + …) dans un seul fichier
**déclaratif**, avec réseaux, volumes, variables et **dépendances de santé**, et
la lancer d'une commande. Compose est le pont entre « un conteneur » et « un
système » — et une répétition douce avant l'orchestration Kubernetes.

## 🧩 Prérequis
Vous devez comprendre comment les conteneurs **communiquent** et **persistent** leurs
données (`/doc/lessons/docker-networking-volumes`), car Compose ne fait que déclarer
ces réseaux et volumes pour vous. La notion d'« état désiré déclaratif » est
introduite ici.

## 🧠 Modèle mental
Compose transforme une série de `docker run` fragiles et non reproductibles en un
**état désiré déclaré** : « voici les services, leurs images, leurs liens, leurs
volumes ». On ne dit plus COMMENT lancer chaque conteneur dans le bon ordre avec
les bons flags ; on DÉCRIT le système et Compose le réalise. C'est le même
glissement mental (impératif → déclaratif) qu'on retrouvera, en plus puissant, en
Kubernetes.

## 📖 Explication complète
**Structure d'un compose.** Un fichier `compose.yaml` liste des **services**
(chacun = une image ou un build), leurs **ports**, **volumes**, **variables
d'environnement**, et le **réseau** (implicite : tous les services d'un compose
partagent un réseau et se joignent par leur nom). `docker compose up` crée le
tout ; `docker compose down` le retire (les volumes nommés persistent sauf
demande contraire).

**Dépendances et santé.** `depends_on` contrôle l'ORDRE de démarrage, mais
« démarré » ≠ « prêt » : une base peut être lancée sans accepter encore de
connexions. La bonne pratique associe `depends_on` à une **condition de santé**
(`condition: service_healthy`) reposant sur un **healthcheck** défini pour le
service dépendu. Sans cela, l'app démarre avant que la base soit prête et échoue
au premier accès (course au démarrage).

**Variables et secrets.** Les valeurs se paramètrent via un fichier `.env` ou des
variables d'environnement. Les secrets réels ne se committent JAMAIS dans le
`compose.yaml` ni dans un `.env` versionné : on utilise un `.env` local
gitignoré, ou un mécanisme de secrets. Dans les exemples pédagogiques, les
valeurs sont manifestement factices.

**Profils et surcharges.** Les **profils** activent des services optionnels (ex.
un outil d'admin seulement en dev). Un fichier de surcharge
(`compose.override.yaml`) adapte la configuration entre dev et prod (bind mount
du code en dev, image figée en prod) sans dupliquer tout le fichier.

**Limites.** Compose orchestre sur UNE machine (ou un petit hôte). Pour du
multi-nœuds, de l'auto-réparation et du scaling automatique, c'est Kubernetes qui
prend le relais — mais le modèle déclaratif appris ici s'y transpose.

## 🔧 Exemple — app + base avec santé
```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: exemple_factice_dev   # valeur factice de démo
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 5
  api:
    build: .
    ports:
      - "8080:3000"
    environment:
      DATABASE_URL: postgres://postgres:exemple_factice_dev@db:5432/app
    depends_on:
      db:
        condition: service_healthy
volumes:
  pgdata:
```
`api` joint `db` par son nom, et ne démarre qu'une fois la base RÉELLEMENT prête.

## 🧭 Exemple guidé — « l'app crashe au démarrage, la base n'est pas prête »
« L'API plante au démarrage. Je la redémarre à la main, et tout fonctionne. »

Ce symptôme est si caractéristique qu'il permet de nommer la cause avant d'ouvrir un fichier :
**une course au démarrage**. Le service est parti avant que sa dépendance ne soit prête.

### Ce que `depends_on` fait, et ce qu'il ne fait pas

```yaml
services:
  api:
    depends_on: [db]      # ⚠️ attend que le conteneur soit DÉMARRÉ
  db:
    image: postgres:16
```

`depends_on` garantit **l'ordre de démarrage des conteneurs**, rien de plus. Or un conteneur
PostgreSQL est « démarré » en quelques millisecondes et **prêt à accepter des connexions** dix
à trente secondes plus tard — le temps d'initialiser ses fichiers, de rejouer son journal, de
créer la base au premier lancement.

Entre les deux, l'API se connecte et échoue.

Et c'est pourquoi le redémarrage manuel « corrige » : au deuxième essai, la base est prête
depuis longtemps. Le défaut est donc **invisible en développement** — on ne redémarre pas
souvent — et systématique en intégration continue, où tout part de zéro à chaque exécution.

### Les deux réponses, et pourquoi il faut la seconde

**Réponse 1 — la condition de disponibilité :**

```yaml
services:
  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 2s
      timeout: 3s
      retries: 15
  api:
    depends_on:
      db:
        condition: service_healthy     # ← attend la DISPONIBILITÉ, pas le démarrage
```

Cela résout le cas du démarrage. Cela ne résout pas le cas où la base **redevient**
indisponible en cours de route — redémarrage, bascule, coupure réseau.

**Réponse 2 — l'application réessaie :**

```js
async function connecterAvecReprise(essais = 10) {
  for (let i = 0; i < essais; i++) {
    try { return await connecter(); }
    catch (e) { await attendre(2 ** i * 100); }        // recul exponentiel
  }
  throw new Error('base injoignable après 10 tentatives');
}
```

C'est la réponse robuste, et elle est indépendante de l'orchestrateur. Une application qui sait
attendre sa base fonctionne sous Compose, sous Kubernetes, en machine virtuelle, et survit à un
redémarrage de la base en pleine journée.

**Les deux ensemble** : le contrôle de disponibilité rend le démarrage propre et rapide ; la
reprise applicative rend le système robuste. L'un sans l'autre laisse un trou.

### Ce que Compose apporte réellement

Au-delà de « lancer plusieurs conteneurs », trois choses qui règlent des problèmes concrets :

| Ce que Compose fournit | Le problème que ça résout |
|---|---|
| un **réseau** commun, avec résolution par nom de service | `db` est joignable depuis `api` sans connaître d'adresse IP |
| des **volumes** nommés | les données de la base survivent à `docker compose down` |
| des **variables d'environnement** par service | la même image se configure différemment selon l'environnement |

Le premier point est celui qui déroute le plus au début : depuis le conteneur `api`, la base
n'est **pas** sur `localhost` mais sur `db`, au **port interne** — celui que le conteneur écoute,
pas celui publié sur la machine hôte. Écrire `localhost:5433` parce que c'est ce qui fonctionne
depuis son terminal est l'erreur numéro un.

```
depuis la machine hôte   →  localhost:5433   (le port publié)
depuis le conteneur api  →  db:5432          (nom de service, port interne)
```

### Le fichier qui ne doit pas servir en production

Compose est excellent pour le développement et l'intégration continue, et il faut savoir dire
pourquoi il ne suffit pas ensuite : pas de redémarrage automatique sur plusieurs machines, pas
de déploiement progressif, pas de bascule en cas de panne d'un hôte.

Ce n'est pas un défaut — c'est un périmètre. Et le connaître évite les deux fautes symétriques :
déployer une application critique avec Compose sur un seul serveur, ou installer un
orchestrateur complet pour développer sur un portable.


## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Ton API échoue au premier démarrage puis fonctionne après un redémarrage manuel. Tu
   ajoutes `depends_on: db` avec `condition: service_healthy`. Le problème est-il résolu ?
2. Ton API se connecte à `localhost:5432`. Ça marchait hors conteneur. Pourquoi plus
   maintenant ?
3. Tu montes `.:/app` pour le rechargement à chaud, et l'application ne trouve plus ses
   dépendances. Que s'est-il passé ?
4. `docker compose down` puis `up` : tes données sont-elles là ?

## ✅ Correction attendue

**La démarche.** Compose décrit un réseau, des dépendances et des durées de vie. Chaque
symptôme se rattache à l'un de ces trois plans, et il vaut mieux savoir lequel avant de
modifier le fichier.

**L'erreur probable, et elle ressemble à une bonne pratique appliquée.** Ajouter
`condition: service_healthy` résout bien le symptôme observé : l'API attend désormais que
la base accepte les connexions. La question est de savoir si le **problème** est résolu,
et la réponse est non.

Ce qu'on vient de corriger, c'est la course au démarrage — un cas particulier. Ce qui
reste entier : **la base redémarrera un jour pendant que l'application tourne.** Une mise
à jour, un basculement, un redémarrage de conteneur, un incident réseau de trois
secondes. À ce moment-là il n'y a plus aucun `depends_on` — cette directive n'existe qu'à
la création — et l'application se retrouve exactement dans la situation qu'on croyait
avoir traitée, avec cette fois de vrais utilisateurs.

La vraie correction est **dans l'application** : réessayer la connexion avec un délai
croissant, et ne pas considérer une dépendance indisponible comme une raison de mourir.
Une application qui sait faire cela n'a plus besoin de `depends_on` du tout — elle
démarre dans n'importe quel ordre, en local comme en production.

Le piège séduit parce que **le correctif fonctionne, immédiatement et de façon
vérifiable**. On relance, l'erreur a disparu, le ticket se ferme. C'est le mode de
défaillance le plus courant du travail d'ingénierie : traiter le symptôme là où il est
apparu, plutôt que là où il vit. Le fait que Compose offre précisément l'outil qui
soulage renforce la conviction d'avoir fait le bon geste.

`depends_on` avec condition de santé reste utile — il rend le démarrage local propre et
les logs lisibles. Ce n'est simplement pas une stratégie de résilience, et il ne faut pas
lui laisser croire qu'on en a une.

**Sur les autres questions.** `localhost` à l'intérieur d'un conteneur désigne **ce
conteneur**, pas la machine ni le voisin. Chaque service a sa propre pile réseau : la
base est joignable par son **nom de service** (`db:5432`), résolu par le DNS interne du
réseau Compose. Et c'est le **port interne** qu'on vise, pas le port publié — la
publication ne concerne que les accès depuis l'hôte.

Le montage `.:/app` qui casse les dépendances est un classique : le bind mount
**remplace** le contenu de `/app` par celui de l'hôte, y compris le `node_modules`
installé pendant le build. Si l'hôte n'en a pas — ou en a un compilé pour un autre
système — l'application ne trouve plus rien. La parade habituelle est un volume anonyme
qui protège ce sous-dossier : `- /app/node_modules` après le bind mount.

Enfin, `down` puis `up` **conserve** les données si elles sont dans un **volume nommé**,
et les perd si elles vivaient dans la couche inscriptible du conteneur. `docker compose
down -v` supprime aussi les volumes — c'est le drapeau qu'on tape une fois de trop.

**Alternative défendable.** Pour un environnement de démonstration ou un tutoriel,
`depends_on` seul, sans condition ni retry, est acceptable : on relance à la main si
besoin, et la simplicité du fichier a une valeur pédagogique réelle. Ce qui n'est pas
défendable est de transposer ce fichier en production en le croyant complet.

**Vérifie seul, sans corrigé** :
1. Lance `docker compose up`, puis redémarre uniquement la base
   (`docker compose restart db`). Ton API survit-elle ? C'est le vrai test.
2. Cherche `localhost` dans ta configuration de services. Chaque occurrence est
   suspecte.
3. `docker compose down && docker compose up` : tes données sont-elles là ? Si tu ne sais
   pas répondre sans essayer, tu ne sais pas où elles sont stockées.

## ⚠️ Erreurs fréquentes
- Croire que `depends_on` garantit que le service est **prêt** (il garantit
  l'ordre, pas la disponibilité) → ajouter un healthcheck.
- Committer un `.env` avec de vrais secrets.
- Publier des ports internes inutiles (la base n'a pas à sortir).
- Oublier de déclarer le volume → perte de données.
- Empiler des `docker run` manuels au lieu de décrire l'état dans le compose.

## 🔐 Sécurité
Ne pas exposer les services internes ; garder les secrets hors du fichier
versionné ; utiliser des images épinglées (cf. tags/digests). Les valeurs
d'exemple doivent être visiblement factices. Compose n'apporte pas d'isolation
supplémentaire : mêmes propriétés que les conteneurs sous-jacents (partage du
noyau).

## 🏢 Cas métier
Un projet démarrait « une fois sur deux » en CI : l'app se connectait à la base
avant qu'elle accepte les connexions. L'ajout d'un healthcheck sur `db` et d'une
`condition: service_healthy` sur `depends_on` a rendu le démarrage
déterministe — plus de flakiness au lancement.

## 🎤 Questions d'entretien
- « `depends_on` garantit-il que le service est prêt ? » → non, seulement l'ordre
  ; il faut un healthcheck + condition.
- « Comment les services se joignent-ils dans un compose ? » → par nom de service
  sur le réseau commun.
- « Où mettez-vous les secrets ? » → hors du fichier versionné (`.env` gitignoré /
  gestionnaire de secrets).

## ✍️ Mini-exercice
Votre API démarre avant que la base accepte les connexions. Quelle est la
correction propre dans Compose ? → un `healthcheck` sur la base + `depends_on:
{ condition: service_healthy }` sur l'API.

## 🧾 À retenir
- Compose = état désiré déclaratif d'une app multi-services, en une commande.
- Services joignables par nom ; réseau et volumes déclarés au même endroit.
- `depends_on` = ordre, PAS disponibilité → healthcheck + condition.
- Secrets hors du fichier versionné ; images épinglées ; n'exposer que le
  nécessaire.

## 📚 Vocabulaire
**service** · **compose.yaml** · **depends_on** · **healthcheck** ·
**condition: service_healthy** · **profil** · **fichier de surcharge** ·
**`.env`** · **course au démarrage (race)**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je décris une app multi-services (réseau, volumes, variables) en Compose.
- [ ] Je gère les dépendances avec healthcheck + condition.
- [ ] Je garde les secrets hors du dépôt et n'expose que l'utile.

## 🔗 Liens avec le programme
Mois 11 (livraison, projet final). Leçons liées :
`/doc/lessons/docker-networking-volumes`, `/doc/lessons/docker-containers`,
`/doc/lessons/docker-production-hardening`. Le modèle déclaratif de Compose
prépare l'orchestration Kubernetes.
