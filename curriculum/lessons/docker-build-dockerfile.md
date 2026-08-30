<!-- keep -->
# Leçon — Docker : maîtriser le Dockerfile et le multi-stage

## 🌍 Le problème d'abord
Un **Dockerfile** est la recette qui fabrique votre image : « pars de telle base,
copie le code, installe les dépendances, lance telle commande ». Le débutant écrit
vite une recette qui « marche »… mais produit une image énorme, lente à fabriquer,
et parfois contenant par accident un mot de passe ou tout le code source. Le
problème à résoudre : écrire une recette qui donne une image **petite, rapide à
refabriquer et sans secret**. La grande idée sera le **multi-stage** : fabriquer
dans un atelier bien équipé, puis ne livrer que le produit fini, en laissant les
outils derrière. Cette leçon part d'un Dockerfile naïf et le rend propre, étape par
étape.

## 🎯 Objectif
Aller au-delà du Dockerfile minimal : comprendre le **contexte de build**, les
instructions clés (`COPY` vs `ADD`, `CMD` vs `ENTRYPOINT`, `ARG` vs `ENV`), le
**multi-stage build** pour produire des images légères et sûres, et le
`.dockerignore`. Objectif : des images petites, reproductibles et sans secrets.

## 🧩 Prérequis
Vous devez comprendre le **modèle en couches** et le **cache de build**
(`/doc/lessons/docker-images-layers`), car chaque instruction du Dockerfile crée une
couche et l'ordre gouverne le cache. Les instructions et le multi-stage sont
introduits ici sans prérequis supplémentaire.

## 🧠 Modèle mental
Un Dockerfile est une **recette déterministe** : à partir d'une base, on applique
des étapes pour aboutir à une image. Le multi-stage ajoute une idée puissante :
**construire dans un atelier, ne livrer que le produit fini**. On compile /
installe dans une première étape riche, puis on copie UNIQUEMENT le résultat dans
une image finale minimale — l'atelier (compilateurs, sources, caches) reste en
dehors de l'image livrée.

## 📖 Explication complète
**Le contexte de build.** `docker build .` envoie le contenu du répertoire (le
« contexte ») au moteur. Un contexte énorme (avec `node_modules`, `.git`, gros
fichiers) ralentit tout et risque de fuiter dans l'image. Le **`.dockerignore`**
exclut ces éléments — indispensable.

**COPY vs ADD.** `COPY` copie des fichiers locaux (préféré, prévisible). `ADD` en
fait plus (décompression d'archives, URLs) mais ces effets implicites sont
sources de surprise : on utilise `COPY` par défaut.

**CMD vs ENTRYPOINT.** `ENTRYPOINT` définit l'exécutable principal du conteneur ;
`CMD` fournit des arguments par défaut (surchargables à `docker run`). Un motif
courant : `ENTRYPOINT ["node"]` + `CMD ["server.js"]`. Utiliser la forme
**exec** (`["cmd", "arg"]`) et non la forme shell, pour que le process reçoive
correctement les signaux (arrêt gracieux — cf. processus/signaux).

**ARG vs ENV.** `ARG` est une variable disponible UNIQUEMENT pendant le build
(ex. version à installer) ; `ENV` définit une variable présente à l'exécution
dans le conteneur. Point de sécurité majeur : **ne jamais passer un secret via
`ARG` ou `ENV`** codé en dur — il reste inscrit dans les couches de l'image, donc
partagé avec elle. Les secrets se fournissent au run (variables d'exécution,
fichiers montés, gestionnaire de secrets).

**Multi-stage build.** Une seule et même image peut contenir plusieurs étapes
`FROM`. On nomme une étape (`FROM node:20 AS build`), on y compile / installe,
puis une étape finale part d'une base minimale et copie le livrable
(`COPY --from=build /app/dist ./dist`). Résultat : l'image finale ne contient ni
compilateur, ni sources, ni caches — elle est petite et a une surface d'attaque
réduite.

**Utilisateur non-root.** Par défaut un conteneur tourne en root. On crée et
bascule sur un utilisateur non privilégié (`USER app`) : un principe de moindre
privilège développé dans la leçon de durcissement.

## 🔧 Exemple — Dockerfile multi-stage (Node)
```dockerfile
# Étape 1 : atelier (dépendances + build)
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : image finale minimale
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/server.js"]
```
L'image finale ne contient ni les devDependencies, ni les sources TypeScript, ni
le cache de build : seulement le nécessaire pour tourner.

## 🧭 Exemple guidé — réduire une image de moitié
Une image fait **1,2 Go** et sa construction prend quatre minutes à chaque modification d'une
ligne de code. Les deux problèmes ont la même cause, et elle tient en une phrase :

> **Un `Dockerfile` n'est pas un script d'installation. C'est une suite de couches mises en
> cache, et l'ordre des instructions décide de tout.**

### Le mécanisme : une instruction, une couche

Chaque instruction produit une **couche** empilée sur la précédente. Deux conséquences que rien
d'autre n'explique :

**1. Le cache est invalidé en cascade.** Si la couche 4 change, les couches 5 et suivantes sont
reconstruites — même si leur instruction est identique. Une seule ligne modifiée en haut du
fichier annule tout le cache en dessous.

**2. Ce qui entre dans une couche y reste.** Supprimer un fichier dans une couche ultérieure
ne le retire pas de l'image : il devient invisible, et continue d'occuper de la place. Un
secret copié puis effacé est **toujours dans l'image**, et se récupère en inspectant les
couches.

Ces deux propriétés dictent tout ce qui suit.

### Le diagnostic : lire les couches avant de toucher au fichier

```bash
docker history mon-image:latest      # la taille de CHAQUE couche, et l'instruction qui l'a créée
```

C'est le geste de départ, et il évite d'optimiser au hasard. On y lit presque toujours la même
chose : une ou deux couches représentent 90 % du poids, et ce sont elles seules qu'il faut
traiter.

*(Limite déclarée : ces commandes ne sont pas exécutées dans le corps de cette leçon — le
démon Docker n'est pas disponible dans l'environnement où elle a été rédigée. Les tailles
citées ci-dessous sont des ordres de grandeur typiques, pas des mesures. Le geste, lui, est
celui à faire sur tes propres images.)*

### Correction 1 — `.dockerignore`, avant tout le reste

```
node_modules
.git
.env
*.log
tests/
```

Sans ce fichier, le `COPY . .` envoie **tout** au moteur de construction : l'historique Git
complet, les dépendances déjà installées localement, les fichiers d'environnement.

Trois effets, et le troisième est un défaut de sécurité :

- la construction commence par transférer des centaines de mégaoctets ;
- `node_modules` copié depuis la machine locale peut contenir des binaires compilés pour un
  autre système, qui écraseront ceux de l'image ;
- **un `.env` copié dans l'image y reste**, lisible par quiconque récupère l'image.

C'est la modification la plus rentable du domaine : cinq lignes, aucun risque.

### Correction 2 — l'ordre des instructions, dicté par la fréquence de changement

```dockerfile
# ❌ le cache est inutilisable
COPY . .
RUN npm ci                # ← recalculé à CHAQUE modification de code

# ✅ du plus stable au plus changeant
COPY package*.json ./
RUN npm ci                # ← recalculé seulement si les dépendances changent
COPY . .
```

La règle générale : **place les instructions dans l'ordre inverse de leur fréquence de
changement.** Les dépendances évoluent une fois par semaine, le code vingt fois par jour ; les
dépendances doivent donc être installées **avant** que le code n'entre dans l'image.

C'est ce qui fait passer une reconstruction de quatre minutes à quelques secondes, sans changer
une ligne de code applicatif.

### Correction 3 — la construction en plusieurs étapes

```dockerfile
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci                       # dépendances de développement comprises
COPY . .
RUN npm run build                # compilation

FROM node:22-slim                # ← une image NEUVE, on repart de zéro
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev            # dépendances d'exécution seulement
COPY --from=build /app/dist ./dist
CMD ["node", "dist/serveur.js"]
```

Le principe : **ce qui sert à construire n'a rien à faire dans ce qui s'exécute.** Compilateurs,
outils de développement, code source, dépendances de test — tout cela reste dans la première
étape et n'existe pas dans l'image finale.

Le gain habituel est d'un facteur 3 à 10 sur la taille. Et il est autant un gain de
**sécurité** que de place : une image sans compilateur, sans `git`, sans gestionnaire de
paquets offre beaucoup moins à quelqu'un qui obtiendrait un accès.

### Correction 4 — l'image de base, et son compromis

| Base | Taille | Ce que ça change |
|---|---|---|
| `node:22` | ~1 Go | tout est là, rien à débugger |
| `node:22-slim` | ~200 Mo | il manque des bibliothèques système ; certains paquets natifs échouent |
| `node:22-alpine` | ~130 Mo | bibliothèque C différente ; **des paquets natifs cassent** |

Le tableau se lit du haut vers le bas comme un compromis taille/compatibilité, et non comme un
classement. Choisir la plus petite par principe conduit à passer une journée sur une erreur de
compilation obscure pour économiser 70 Mo.

La démarche raisonnable : partir de `slim`, mesurer, et n'aller plus bas que si la taille est
un vrai problème — sur un déploiement fréquent ou une flotte de nombreuses machines, elle peut
l'être.

### Ce que la construction ne doit jamais contenir

```dockerfile
# ❌ le secret est dans une couche, définitivement
ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc && npm ci && rm .npmrc
```

Le `rm` ne sert à rien : le fichier existe dans la couche du `RUN`, et l'inspection des couches
le retrouve. C'est la conséquence directe de la propriété n° 2 énoncée au début.

Les réponses correctes utilisent un mécanisme qui **ne crée pas de couche** — le montage de
secret au moment de la construction — ou déplacent l'authentification hors de l'image. Et la
règle générale à retenir : **rien de secret ne doit jamais apparaître dans une instruction de
construction**, ni en argument, ni en fichier temporaire.


## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. `CMD npm start` et `CMD ["npm", "start"]` : quelle différence à l'arrêt du
   conteneur ?
2. Tu passes un jeton avec `ARG TOKEN` pendant le build et tu ne l'écris nulle part.
   Est-il récupérable dans l'image ?
3. `docker build .` prend deux minutes rien qu'à démarrer, avant la première
   instruction. Pourquoi ?
4. À quoi sert `COPY --from=build` et qu'est-ce que cela retire de l'image finale ?

## ✅ Correction attendue

**La démarche.** Un Dockerfile décrit deux choses distinctes qu'on confond volontiers :
**comment l'image est construite** et **comment le processus est lancé**. La plupart des
surprises en production viennent de la seconde.

**L'erreur probable, et elle ne se manifeste jamais en développement.** La forme
`CMD npm start` — la forme *shell* — paraît identique à `CMD ["npm", "start"]`. Elle ne
l'est pas, et la différence apparaît uniquement lors d'un arrêt orchestré.

Avec la forme shell, Docker exécute en réalité `/bin/sh -c "npm start"`. Le **PID 1** du
conteneur devient donc `sh`, et ton application est son enfant. Or `sh` ne transmet pas
les signaux qu'il reçoit. Quand l'orchestrateur envoie `SIGTERM` pour un arrêt propre,
le signal arrive à `sh`, qui ne fait rien, et l'application ne le voit jamais. Après le
délai de grâce — dix secondes par défaut — le `SIGKILL` tombe et coupe tout net.

La conséquence est discrète et permanente : **chaque déploiement coupe les requêtes en
cours.** Sur une mise à jour progressive de dix instances, ce sont dix coupures, à
chaque livraison, plusieurs fois par semaine. Personne n'ouvre de ticket parce que
chaque incident est minuscule et invisible dans les moyennes.

Le piège séduit parce qu'**en développement, tout se passe bien**. On lance
`docker run`, on fait `Ctrl-C`, et le conteneur s'arrête immédiatement : le terminal
envoie `SIGINT` à tout le groupe de processus, donc l'application le reçoit directement.
Le mécanisme fautif est court-circuité par la façon même dont on teste. Le bug n'existe
que dans le mode d'exécution qu'on ne pratique pas localement.

La règle : **forme exec partout** (`["exécutable", "arg"]`), et si le processus principal
lance lui-même des enfants, ajouter un vrai init (`--init`, ou `tini`) pour récupérer les
orphelins et propager les signaux.

**Sur les autres questions.** Un jeton passé par `ARG` est **récupérable**, même sans
l'avoir écrit dans un fichier : les arguments de build sont conservés dans les
métadonnées de l'image et `docker history` les affiche. `ARG` limite la portée dans le
temps du build, il n'apporte **aucune confidentialité**. Les secrets se fournissent à
l'exécution, ou via un montage de secret de build prévu pour ne pas être persisté.

Le build qui met deux minutes avant sa première instruction envoie le **contexte** au
moteur : tout le contenu du répertoire, `node_modules` et `.git` compris. Un
`.dockerignore` règle cela en une ligne, et évite au passage qu'un `.env` traînant ne
finisse dans l'image via un `COPY . .`.

Enfin, `COPY --from=build` récupère un artefact d'une étape précédente sans emporter
l'étape elle-même : compilateurs, dépendances de développement, code source, caches de
paquets, historique. L'image finale contient le livrable et son environnement d'exécution
— rien de l'atelier. Le gain est double : une image plus petite **et** une surface
d'attaque réduite, puisqu'un attaquant n'y trouve ni shell, ni compilateur, ni sources.

**Alternative défendable.** La forme shell reste légitime quand on a réellement besoin du
shell — une substitution de variable, un enchaînement avec `&&`. Dans ce cas on l'assume
et on met `exec` devant la commande finale (`CMD ["sh", "-c", "exec npm start"]`) : `exec`
remplace le shell par le programme, qui devient PID 1 et reçoit les signaux.

**Vérifie seul, sans corrigé** :
1. `docker inspect --format '{{.Config.Cmd}}' ton-image`. Vois-tu `/bin/sh -c` ? Si oui,
   ton arrêt n'est pas gracieux.
2. Chronomètre `docker stop`. Dix secondes pile signifient que le délai de grâce a expiré.
3. `docker history` sur une image construite avec `ARG`. Cherche ta valeur.

## ⚠️ Erreurs fréquentes
- Pas de `.dockerignore` → contexte énorme, secrets/`node_modules` embarqués.
- **Secret dans un `ARG`/`ENV`** codé en dur → présent dans les couches, fuité
  avec l'image.
- Forme shell de `CMD` → mauvaise propagation des signaux, arrêt non gracieux.
- Un seul stage : compilateurs et sources restent dans l'image de prod.
- `ADD` là où `COPY` suffit (effets implicites).

## 🔐 Sécurité
Multi-stage + base minimale + utilisateur non-root = trois leviers cumulables de
réduction de risque. Les secrets ne doivent JAMAIS être « en dur » dans le
Dockerfile ni dans une couche : ils se passent à l'exécution. Rappel : le
conteneur partage le noyau de l'hôte ; il ne remplace pas une isolation de type
VM.

## 🏢 Cas métier
Une équipe livrait une image de 900 Mo contenant tout le toolchain de build. Un
audit trouve même une ancienne clé de test inscrite via `ENV`. Correction :
`.dockerignore`, multi-stage (image finale 150 Mo), secret retiré des couches et
déplacé vers le gestionnaire de secrets injecté au run.

## 🚑 Que faire dans ce cas ? — « l'image marche en local mais pas en CI »
- **Symptômes** : `docker build` réussit sur votre poste, échoue (ou produit une
  image cassée) dans le pipeline.
- **Premières vérifications** : le **contexte de build** est-il le même ? un fichier
  utilisé en local est-il exclu par `.dockerignore` ou non commité (donc absent en
  CI) ? une dépendance est-elle installée globalement chez vous mais pas dans
  l'image ?
- **Cause probable** : l'image s'appuyait implicitement sur quelque chose présent
  SEULEMENT sur votre machine (fichier non versionné, cache local, variable).
- **Correction** : tout ce dont l'image a besoin doit être copié explicitement et
  versionné ; ne jamais dépendre de l'état de la machine hôte.
- **Prévention** : construire localement dans un dossier propre (comme le fait la CI)
  avant de pousser ; garder un `.dockerignore` juste (ni trop, ni trop peu).

## 🎤 Questions d'entretien
- « À quoi sert un multi-stage build ? » → construire dans une étape riche, ne
  livrer qu'un artefact minimal.
- « ARG vs ENV ? » → build-time vs run-time ; aucun des deux pour un secret.
- « CMD vs ENTRYPOINT ? » → arguments par défaut vs exécutable principal.

## ✍️ Mini-exercice
Vous devez injecter une clé d'API dans le conteneur. La mettez-vous dans un `ENV`
du Dockerfile ? → non : elle serait inscrite dans une couche partagée avec
l'image ; on l'injecte au run (variable d'exécution / fichier monté).

## 🧾 À retenir
- `.dockerignore` = contexte propre, pas de fuite ; `COPY` par défaut.
- `ARG` (build) vs `ENV` (run) ; jamais de secret dans l'un ou l'autre.
- Multi-stage : atelier séparé de l'image livrée → petite et sûre.
- Forme exec de `CMD`/`ENTRYPOINT` pour l'arrêt gracieux.

## 📚 Vocabulaire
**contexte de build** · **`.dockerignore`** · **COPY / ADD** · **CMD /
ENTRYPOINT** · **ARG / ENV** · **multi-stage build** · **`--from`** ·
**utilisateur non-root** · **base minimale**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'écris un Dockerfile multi-stage qui livre une image minimale.
- [ ] Je n'inscris jamais de secret dans une couche.
- [ ] Je maîtrise `.dockerignore` et la différence ARG/ENV.

## 🔗 Liens avec le programme
Mois 11 (livraison). Leçons liées : `/doc/lessons/docker-images-layers`,
`/doc/lessons/docker-production-hardening`, `/doc/lessons/deployment-secrets`. Le
multi-stage est le pont vers des images de production sûres et un CI rapide.
