<!-- keep -->
# Leçon — Docker : images, couches et registre

## 🌍 Le problème d'abord
Vous fabriquez une « image » de votre application pour la déployer partout à
l'identique. Mais deux surprises reviennent sans cesse : le fabrication (build) est
parfois instantanée, parfois interminable ; et l'image pèse tantôt 80 Mo, tantôt 1
Go pour la même appli. Pourquoi ? Parce qu'une image n'est pas un bloc unique :
c'est un **empilement de calques** (layers), et Docker est très malin pour
RÉUTILISER les calques déjà fabriqués — à condition qu'on range les étapes dans le
bon ordre. Comprendre ce système de calques explique la vitesse, le poids, et
pourquoi l'étiquette `latest` est un piège en production. On part de l'image de base :
qu'est-ce qu'une image, concrètement ?

## 🎯 Objectif
Comprendre ce qu'est VRAIMENT une image Docker : le modèle en **couches**
(layers) empilées, le **cache de build**, les **tags** et **digests**, et le rôle
du **registre**. C'est ce qui explique pourquoi un build est lent ou rapide,
pourquoi une image pèse 1 Go ou 80 Mo, et pourquoi `latest` est un piège.

## 🧩 Prérequis
Vous devez savoir ce qu'est un **conteneur** vs une **image** au niveau intuitif
(`/doc/lessons/docker-containers`) et comprendre qu'un **système de fichiers** est un
arbre de fichiers (`/doc/lessons/linux-filesystem-permissions`), car une couche
d'image EST une différence de système de fichiers. Les termes « couche », « cache de
build », « tag » et « digest » sont construits ici.

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

## 🧭 Exemple guidé — « le build est lent, et l'image est énorme »

Deux plaintes qui arrivent toujours ensemble, et qui ont la même cause : on n'a pas compris
ce qu'est une couche. Voici le Dockerfile en question.

```dockerfile
FROM node:20
WORKDIR /app
COPY . .                                    # (1)
RUN npm ci                                  # (2)
RUN apt-get update && apt-get install -y curl
RUN apt-get clean                           # (3) « pour alléger »
CMD ["npm", "start"]
```

**Décision 1 — la lenteur : quelle couche invalide quoi ?** Le cache de construction suit
une règle unique, et tout en découle : Docker réutilise chaque couche tant que son entrée
n'a pas changé, et recalcule **tout ce qui suit la première couche modifiée**. Ici, tu
changes une ligne de code : la couche (1) change, donc (2) est recalculée, donc `npm ci`
réinstalle l'intégralité des dépendances. Chaque virgule corrigée te coûte une installation
complète.

La correction n'ajoute rien, elle réordonne :

```dockerfile
COPY package*.json ./
RUN npm ci                                  # ne dépend QUE des dépendances
COPY . .                                    # le code arrive après
```

Le principe est plus général que Docker : **ce qui change rarement en haut, ce qui change
souvent en bas.** Ton fichier de dépendances change une fois par mois, ton code trente fois
par jour ; les mettre dans cet ordre fait que la partie coûteuse survit à la partie qui
bouge. Vérifie avec un second build après une simple modification de code : plus aucune
réinstallation.

**Décision 2 — le poids : pourquoi `apt-get clean` ne sert à rien ici.** C'est le passage
contre-intuitif, et c'est le même mécanisme que pour un secret copié puis effacé. La ligne
(3) est une **instruction séparée**, donc une couche séparée. Elle ne supprime rien : elle
ajoute une couche qui déclare que certains fichiers n'existent plus. Les fichiers du cache
`apt` restent dans la couche précédente, qui reste dans l'image. Résultat : l'image ne
maigrit pas d'un octet — elle grossit légèrement, puisqu'on lui a ajouté une couche.

Pour que le nettoyage compte, il doit avoir lieu **dans la même instruction** que la
salissure, avant que la couche ne soit figée :

```dockerfile
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*
```

Ici, la couche produite ne contient jamais le cache : il a été créé et supprimé pendant le
calcul de cette même couche. La formulation à retenir est celle-ci : **on ne peut pas
retirer quelque chose d'une couche déjà écrite ; on peut seulement éviter de l'y mettre.**

**Décision 3 — la vraie question, c'est l'image de base.** Avant d'optimiser des dizaines
de mégaoctets, regarde d'où tu pars : `node:20` embarque une distribution complète avec sa
chaîne de compilation, quand `node:20-slim` fournit le même exécutable Node sur une base
réduite. L'écart se compte en centaines de mégaoctets — sans discussion possible avec les
quelques mégaoctets grattés sur un cache `apt`. Il faut cependant le dire honnêtement :
une base réduite peut manquer d'une bibliothèque système dont dépend un module natif, et
le diagnostic est alors désagréable. La décision se prend donc en connaissance de cause,
pas par réflexe — et se vérifie en construisant.

**Décision 4 — pourquoi tout ça compte au-delà du confort.** Une image légère se télécharge
plus vite à chaque déploiement et sur chaque machine, ce qui se voit directement dans la
durée d'une mise en production. Et elle contient moins de choses : un compilateur, `curl` ou
un gestionnaire de paquets présents dans l'image finale sont autant d'outils offerts à qui
obtiendrait un accès au conteneur. **Réduire une image, c'est réduire une surface d'attaque
autant qu'un temps de transfert** — c'est d'ailleurs le raisonnement qui mène aux
constructions multi-étapes, où l'on compile dans une image outillée puis on ne copie que le
résultat dans une image nue.

**Le geste de vérification.** `docker history --no-trunc` liste les couches avec leur taille
et l'instruction qui les a produites. Deux minutes de lecture répondent aux deux questions
d'un coup : quelle couche pèse, et quelle couche est recalculée trop souvent. Personne ne
devrait optimiser un Dockerfile sans avoir lu cette sortie — sinon on optimise ce qu'on
imagine, pas ce qui coûte.

**Variante qui déplace le problème.** Ton Dockerfile est parfaitement ordonné, et pourtant
le cache ne sert à rien : chaque construction repart de zéro. La cause n'est pas dans le
fichier — c'est que la construction tourne sur un agent d'intégration continue **neuf à
chaque fois**, qui ne possède aucune couche antérieure. Toute la règle « ce qui change
rarement en haut » suppose un cache local qui, là, n'existe pas. Il faut alors le fournir
explicitement : un cache de construction partagé, ou une image de base intermédiaire
construite à part et publiée. Le raisonnement à emporter dépasse Docker : **une optimisation
repose toujours sur une hypothèse d'environnement, et elle disparaît en silence quand
l'hypothèse cesse d'être vraie.** Avant d'accuser un réglage, demande-toi si la machine qui
exécute ressemble encore à celle pour laquelle tu as optimisé.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Ton Dockerfile fait `RUN curl -o cle.pem https://...` puis, dans une instruction
   `RUN` suivante, `rm cle.pem`. `docker run … ls` ne montre rien. La clé est-elle
   partie de l'image ?
2. Ton image pèse 1,2 Go. Tu ajoutes `RUN apt-get clean` en dernière ligne. De combien
   descend-elle ?
3. Deux collègues font `docker pull monapi:1.4.2` à une semaine d'intervalle. Ont-ils la
   même image ?
4. Pourquoi copier `package.json` avant le reste du code accélère-t-il les builds ?

## ✅ Correction attendue

**La démarche.** Une image n'est pas un dossier, c'est **une pile de diffs immuables**.
Tout raisonnement sur la taille ou le contenu doit porter sur les couches, jamais sur ce
que `ls` affiche à l'intérieur du conteneur.

**L'erreur probable, et c'est une fuite de secret qui passe toutes les revues.** À la
première question, la réponse spontanée est « oui, je l'ai supprimée, `ls` le
confirme ». La clé est **toujours dans l'image**, et n'importe qui disposant de l'image
peut l'extraire.

Le mécanisme : chaque instruction crée une couche **immuable**. La couche 4 contient la
clé. La couche 5 enregistre « ce fichier est supprimé » — un marqueur d'effacement
(*whiteout*). L'union filesystem empile les deux et présente une arborescence où le
fichier n'apparaît plus. Mais la couche 4 est intacte, elle voyage avec l'image, et
`docker save image.tar` suivi d'un `tar -x` la rend directement lisible. Aucun outil
n'a besoin d'être sophistiqué.

Le piège séduit parce que **la vérification est faite, et elle est concluante** :
`docker run … ls` ne montre rien, ce qui est vrai. On teste la vue présentée par le
conteneur, alors que ce qui est distribué est la pile complète. C'est exactement
l'équivalent d'un secret retiré du dernier commit d'un dépôt Git : disparu de la
version courante, présent dans l'historique.

Les deux seules parades : **ne jamais faire entrer le secret dans une couche** — le
fournir au moment de l'exécution, ou utiliser un montage de secret de build qui n'est
pas persisté — et, si c'est déjà arrivé, **révoquer le secret**, exactement comme pour un
commit Git. Reconstruire l'image sans lui ne suffit pas : l'ancienne existe déjà.

**Sur les autres questions.** `RUN apt-get clean` en dernière ligne fait gagner
**zéro octet**, pour la même raison : les fichiers qu'il supprime ont été ajoutés par une
couche antérieure, qui reste. Le nettoyage doit avoir lieu **dans la même instruction
`RUN`** que l'installation, pour que la couche produite ne les ait jamais contenus :
`RUN apt-get install … && rm -rf /var/lib/apt/lists/*`.

Deux `docker pull monapi:1.4.2` à une semaine d'écart ne garantissent **pas** la même
image : un tag est une étiquette **mutable**, que quiconque a le droit d'écriture sur le
registre peut redéployer sur un autre contenu. Seul le **digest**
(`monapi@sha256:…`) identifie un contenu exact — d'où l'épinglage par digest en
production, et la raison pour laquelle « ça marche en préproduction et pas en
production » est parfois littéralement une image différente.

Enfin, copier `package.json` en premier exploite le cache : la couche du `npm ci` reste
valide tant que **ses entrées** n'ont pas changé. Si le code est copié avant, la moindre
modification d'une ligne invalide cette couche et toutes les suivantes, donc réinstalle
tout. L'ordre des instructions est un choix de performance, pas de style.

**Alternative défendable.** Pour une image de développement rebâtie vingt fois par jour,
il est raisonnable de tout copier d'un coup et d'ignorer l'optimisation du cache : la
lisibilité du Dockerfile compte plus que trente secondes. Ce compromis ne tient pas en
intégration continue, où le même build est rejoué à chaque commit.

**Vérifie seul, sans corrigé** :
1. `docker history --no-trunc ton-image`. Quelle instruction pèse le plus ? Est-ce celle
   à laquelle tu pensais ?
2. Cherche un secret dans tes couches : `docker save img -o i.tar && tar -xf i.tar` puis
   fouille. Le faire une fois change durablement la façon d'écrire un Dockerfile.
3. Tes déploiements référencent-ils un tag ou un digest ? Si c'est un tag, tu ne sais pas
   exactement ce qui tourne.

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

## 🚑 Que faire dans ce cas ? — « le build Docker est devenu très lent »
- **Symptômes** : chaque build refait tout (réinstalle les dépendances) alors que
  vous n'avez changé qu'une ligne de code.
- **Premières vérifications** : `docker history` (quelles couches sont refaites ?) ;
  l'ordre du Dockerfile (le `COPY . .` est-il AVANT l'installation des dépendances ?).
- **Cause probable** : copier tout le code avant d'installer invalide le cache
  d'installation à chaque changement de code.
- **Correction** : copier d'abord `package*.json`, installer, PUIS copier le reste.
- **Prévention** : ranger du plus stable (dépendances) au plus changeant (code) ;
  vérifier avec un second build qu'il ne réinstalle plus.

## 🔥 Pratique — exercer le mécanisme des couches sans Docker

Le format d'image est une pile de systèmes de fichiers superposés. Ce mécanisme
est disponible directement dans le noyau Linux : tu peux l'exercer, et rien n'y
est caché.

**A. Monter une pile.** Crée trois répertoires de couches, un répertoire de
travail et un point de fusion, puis monte la superposition. Mets un fichier dans
la couche du bas et une version différente dans celle du dessus. Livrable : ce
que montre le point de fusion, et ta prédiction écrite **avant** de regarder.

**B. Supprimer, puis chercher.** Supprime un fichier depuis le point de fusion,
puis réponds par une commande à chacune de ces questions : est-il encore visible
depuis la fusion ? qu'a-t-on écrit dans la couche supérieure ? que contient
encore la couche du bas ? Livrable : les trois réponses.

**C. Mesurer le poids.** Place un fichier de 5 Mio dans la couche du bas, mesure
les trois couches, supprime-le depuis la fusion, remesure. Livrable : les deux
mesures et le total.

**D. Traduire en instructions.** À partir de A, B et C, explique en quatre lignes
pourquoi supprimer un fichier dans une instruction ultérieure ne réduit pas la
taille d'une image, et écris la forme qui, elle, fonctionne.

**E. L'ordre par fréquence.** Réécris un fichier de construction pour qu'une
modification de code ne relance pas l'installation des dépendances. Livrable : le
fichier et la justification de chaque position.

## ✅ Correction attendue

> **Limite déclarée.** Le démon Docker n'est pas disponible dans
> l'environnement de rédaction : **aucune commande `docker` n'a été exécutée**.
> Les sorties présentées comme attendues le sont explicitement. Le mécanisme
> sous-jacent — la superposition de systèmes de fichiers du noyau Linux — a en
> revanche été exercé réellement
> (`scripts/v70-verifications/couches-overlay.sh`), et ces chiffres-là sont
> mesurés.

**A — quelle couche gagne.** La fusion montre la version de la couche
**supérieure**. Attention à l'ordre de déclaration des couches inférieures : il
se lit de la plus haute à la plus basse, ce qui surprend et inverse la
démonstration si l'on se trompe.

La règle transposée : quand deux instructions touchent le même chemin, c'est la
dernière qui décide du contenu visible.

**B — ce qu'écrit vraiment une suppression.** Vu depuis la fusion, le fichier a
disparu. Dans la couche supérieure :

```
c--------- 2 root root 0, 0 .env
```

Le premier caractère est `c` : un **fichier spécial en mode caractère**, de
numéros majeur 0 et mineur 0. Ce n'est pas une suppression, c'est un **marqueur
de masquage**. Et la couche du dessous est intacte :

```
SECRET=sk_live_abc123
```

Deux conséquences directes. Un secret copié puis supprimé reste **lisible dans
la couche**, et quiconque obtient l'image obtient les couches — même si aucun
conteneur démarré depuis cette image ne le montre. Et la parenté avec
l'historique git est exacte : dans les deux cas, on manipule une suite d'états
immuables où l'opération « retirer » n'existe pas, seulement « ajouter un état
où la chose n'est plus visible ».

**C — le poids.** Mesuré :

```
avant suppression : couche1 5132 Kio · couche2 8 · couche3 4
apres suppression : couche1 5132 Kio · couche2 8 · couche3 4
total des couches : 5144 Kio
```

Rien n'a maigri, et la couche supérieure a **grossi**.

**D — la traduction.** La formulation qui compte : le fichier ne doit pas être
*supprimé*, il doit **ne jamais exister à la fin d'une instruction**.

```dockerfile
# ❌ l archive pèse dans l image, définitivement
RUN curl -o outils.tar.gz https://exemple/outils.tar.gz
RUN tar xf outils.tar.gz
RUN rm outils.tar.gz

# ✅ elle n existe qu à l intérieur d une seule couche
RUN curl -o outils.tar.gz https://exemple/outils.tar.gz \
 && tar xf outils.tar.gz \
 && rm outils.tar.gz
```

Et pour un secret, la même logique va plus loin : même dans une instruction
unique, il est présent pendant son exécution et peut apparaître dans les
journaux de construction. Un secret se fournit **au démarrage du conteneur**.

**E — l'ordre.** Du plus stable au plus changeant :

```dockerfile
FROM node:20-slim               # change tous les mois
WORKDIR /app
COPY package*.json ./           # change quand une dépendance change
RUN npm ci                      # l instruction coûteuse
COPY . .                        # change à chaque commit
CMD ["node", "serveur.js"]
```

Le mécanisme : **le cache d'une instruction est invalidé dès qu'une instruction
précédente l'est.** Placer la copie du code avant l'installation fait donc
réinstaller toutes les dépendances à chaque ligne modifiée. L'image reste
correcte, la construction devient dix fois plus lente, et rien ne signale
l'erreur — seulement de l'attente.

Complément indispensable : un fichier d'exclusion, sans quoi la copie du contexte
embarque les dépendances installées localement et l'historique git, et **toute**
modification dans ces répertoires invalide le cache.

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
