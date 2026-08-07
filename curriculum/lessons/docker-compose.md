<!-- keep -->
# Leçon — Docker Compose : orchestrer une application multi-services

## 🎯 Objectif
Décrire une application entière (app + base + cache + …) dans un seul fichier
**déclaratif**, avec réseaux, volumes, variables et **dépendances de santé**, et
la lancer d'une commande. Compose est le pont entre « un conteneur » et « un
système » — et une répétition douce avant l'orchestration Kubernetes.

## 🧩 Prérequis
Réseau et volumes Docker (`/doc/lessons/docker-networking-volumes`).

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
1. Symptôme : l'API échoue à la première connexion, puis marche après un
   redémarrage manuel → course au démarrage.
2. La base a-t-elle un **healthcheck** ? `depends_on` utilise-t-il
   `condition: service_healthy` ?
3. Ajouter le healthcheck + la condition. L'API attend désormais que la base soit
   prête.
4. Vérifier `docker compose down && up` : les données survivent (volume nommé).

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
