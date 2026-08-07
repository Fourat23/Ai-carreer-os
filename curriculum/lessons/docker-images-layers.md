<!-- keep -->
# Leçon — Docker : images, couches et registre

## 🎯 Objectif
Comprendre ce qu'est VRAIMENT une image Docker : le modèle en **couches**
(layers) empilées, le **cache de build**, les **tags** et **digests**, et le rôle
du **registre**. C'est ce qui explique pourquoi un build est lent ou rapide,
pourquoi une image pèse 1 Go ou 80 Mo, et pourquoi `latest` est un piège.

## 🧩 Prérequis
Notions de base sur les conteneurs (`/doc/lessons/docker-containers`) et le
système de fichiers (`/doc/lessons/linux-filesystem-permissions`).

## 🧠 Modèle mental
Une image n'est pas un gros bloc opaque : c'est un **empilement de couches en
lecture seule**, chacune correspondant à une instruction du Dockerfile. Au
lancement, Docker pose par-dessus une fine couche **inscriptible** propre au
conteneur. Deux images qui partent de la même base PARTAGENT les couches
communes sur le disque. Penser « pile de calques » explique le cache, la taille
et le partage.

## 📖 Explication complète
**Les couches.** Chaque instruction `FROM`, `RUN`, `COPY`, `ADD` crée une
couche : un diff du système de fichiers (« ces fichiers ont été ajoutés /
modifiés »). Les couches sont **immuables** et identifiées par un hash de leur
contenu. Un **union filesystem** (overlay) les empile pour présenter une seule
arborescence au conteneur. La couche inscriptible du conteneur est **éphémère** :
elle disparaît à la suppression du conteneur (d'où les volumes pour persister).

**Le cache de build.** Docker réutilise une couche déjà construite tant que son
instruction ET les couches précédentes n'ont pas changé. Conséquence capitale :
l'**ordre** des instructions gouverne la vitesse. Copier `package.json` puis
`npm ci` AVANT de copier tout le code permet de garder l'installation en cache
tant que les dépendances ne bougent pas. Copier tout le code d'abord invalide le
cache à chaque modification d'un seul fichier source.

**Taille d'image.** Chaque couche AJOUTE du poids ; supprimer un fichier dans une
couche ULTÉRIEURE ne réduit pas l'image (le fichier reste dans la couche
précédente, juste masqué). D'où deux règles : partir d'une base **minimale**
(`-slim`, `alpine`, `distroless` selon les cas) et nettoyer DANS la même
instruction `RUN` (`apt-get install … && rm -rf /var/lib/apt/lists/*`).

**Tags vs digests.** Un **tag** (`monapi:1.4.2`, `node:20-slim`) est une étiquette
MUTABLE : elle peut être redéployée sur un autre contenu. Un **digest**
(`sha256:…`) identifie un contenu EXACT et immuable. `latest` est un simple tag
par défaut, pas « la dernière version » garantie : deux `docker pull latest` à
des dates différentes peuvent donner des images différentes. Pour la
reproductibilité (et la sécurité), on épingle une version précise, voire un
digest.

**Le registre.** Un **registre** (Docker Hub, GHCR, ECR côté AWS, ACR côté Azure)
stocke et distribue les images. `docker push` envoie les couches manquantes,
`docker pull` récupère celles qu'on n'a pas déjà en cache local. Comme les
couches sont partagées, tirer une image dont on possède déjà la base est rapide.

## 🔧 Repères pratiques
```bash
docker history monapi:1.4.2      # les couches et leur taille (repérer les grosses)
docker image inspect monapi:1.4.2 --format '{{.RootFS.Layers}}'  # digests des couches
docker images                    # tailles des images locales
docker pull node@sha256:<digest> # tirer un contenu EXACT (immuable)
```
`docker history` est l'outil clé pour comprendre « pourquoi mon image est
grosse » : il montre la contribution de chaque instruction.

## 🧭 Exemple guidé — « le build est lent à chaque petit changement »
1. `docker history` : les couches lourdes sont-elles l'installation des
   dépendances ?
2. Vérifier l'ordre du Dockerfile : le code est-il copié AVANT `npm ci` ? Si oui,
   toute modif de code invalide l'installation.
3. Réordonner : copier `package*.json`, installer, PUIS copier le reste. Le cache
   d'installation survit tant que les dépendances ne changent pas.
4. Mesurer : un second build après une modif de code ne réinstalle plus.

## ⚠️ Erreurs fréquentes
- **Copier tout le code avant d'installer** les dépendances → cache inutile.
- Croire qu'un `rm` d'un fichier réduit l'image (il reste dans une couche
  antérieure).
- Utiliser **`latest`** en production et croire à la reproductibilité.
- Partir d'une base généraliste énorme quand un `-slim` suffit.
- Multiplier les `RUN` qui installent puis nettoient dans des couches séparées
  (le nettoyage n'allège pas la couche précédente).

## 🔐 Sécurité
Épingler une version/digest évite qu'un tag mutable soit remplacé par une image
malveillante ou instable. Une image minimale réduit la **surface d'attaque**
(moins de binaires = moins de vulnérabilités). Attention : une image n'isole pas
comme une VM — les conteneurs **partagent le noyau** de l'hôte (isolation par
namespaces/cgroups au niveau applicatif, pas une frontière OS complète).

## 🏢 Cas métier
Une image d'API pesait 1,2 Go et ralentissait chaque déploiement. `docker
history` révèle une base généraliste + des caches d'installation laissés en
place. En passant à une base `-slim` et en nettoyant dans le même `RUN`, l'image
tombe à 180 Mo : pulls plus rapides, déploiements plus courts, moins de
vulnérabilités.

## 🎤 Questions d'entretien
- « Différence entre un tag et un digest ? » → étiquette mutable vs identifiant de
  contenu immuable.
- « Pourquoi l'ordre des instructions du Dockerfile compte ? » → le cache de
  build : une couche invalidée invalide toutes les suivantes.
- « Pourquoi `latest` est risqué en prod ? » → tag mutable, pas de garantie de
  reproductibilité.

## ✍️ Mini-exercice
Vous supprimez un gros fichier avec un `RUN rm` placé APRÈS le `COPY` qui l'a
ajouté. L'image est-elle plus légère ? → non : le fichier reste dans la couche du
`COPY`, seulement masqué ; il faut éviter de l'ajouter (ou nettoyer dans la même
couche).

## 🧾 À retenir
- Une image = pile de couches immuables ; le conteneur ajoute une couche
  inscriptible éphémère.
- Le cache de build dépend de l'ordre : dépendances avant le code.
- Supprimer dans une couche ultérieure n'allège pas l'image.
- Tag = mutable, digest = immuable ; épingler pour la reproductibilité.
- Le registre distribue les couches ; les couches communes sont partagées.

## 📚 Vocabulaire
**image / couche (layer)** · **union filesystem / overlay** · **couche
inscriptible** · **cache de build** · **tag** · **digest (sha256)** ·
**registre** · **base minimale (slim/alpine/distroless)** · **surface d'attaque**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'explique le modèle en couches et le partage sur disque.
- [ ] Je sais lire `docker history` pour alléger une image.
- [ ] Je distingue tag et digest et je sais épingler une version.

## 🔗 Liens avec le programme
Mois 11 (livraison, projet final). Leçons liées :
`/doc/lessons/docker-containers`, `/doc/lessons/docker-build-dockerfile`,
`/doc/lessons/docker-production-hardening`. Le modèle en couches sous-tend
l'optimisation des builds en CI et la sécurité des images.
