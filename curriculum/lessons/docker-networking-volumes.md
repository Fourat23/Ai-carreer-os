<!-- keep -->
# Leçon — Docker : réseau et persistance des données

## 🎯 Objectif
Comprendre comment les conteneurs **communiquent** (réseaux, mapping de ports,
résolution par nom de service) et comment **persister** des données (volumes vs
bind mounts) — les deux points où « ça marche en local mais pas ensemble »
échoue le plus souvent.

## 🧩 Prérequis
Bases Docker (`/doc/lessons/docker-containers`) et modèle réseau
(`/doc/lessons/networking-tcp-ip-model`, `/doc/lessons/networking-addressing-routing`).

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
1. Les deux conteneurs sont-ils sur le MÊME réseau ? (`docker network inspect`)
2. L'URL utilise-t-elle le **nom de service** (`db`) et le **port interne**, pas
   `localhost` ni le port publié ?
3. La base écoute-t-elle bien sur son port interne ? (diagnostic par couches :
   DNS interne → port → application.)
4. Les données survivent-elles à un redémarrage ? Sinon, il manque un **volume**.

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
Votre API doit joindre une base sur le même réseau Docker. Quelle URL ? →
`db:5432` (nom de service + port interne), pas `localhost` ni le port publié.

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
