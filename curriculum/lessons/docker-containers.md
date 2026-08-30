<!-- keep -->
# Leçon — Docker et conteneurs

## 🌍 Le problème d'abord
Ton application marche parfaitement sur ta machine. Tu l'envoies à un collègue (ou en production) : elle plante — mauvaise version de langage, dépendance manquante, variable d'environnement absente. « Ça marche chez moi » devient le cauchemar de toute équipe. Le problème : ton application dépend d'un ENVIRONNEMENT que tu n'as pas emporté avec elle. Les conteneurs résolvent ça en empaquetant l'application ET tout son environnement dans une boîte qui tourne à l'identique partout. Cette leçon t'apprend à construire cette boîte (Dockerfile) pour livrer n'importe quelle application — y compris un système IA — de façon reproductible.

## 🎯 Objectif
Comprendre ce qu'est un conteneur, pourquoi il résout le « ça marche chez moi », et savoir écrire un Dockerfile + un docker-compose pour livrer une application (dont un système IA) de façon reproductible. C'est le standard de livraison et ce qui rend ton projet final crédible.

## 🧩 Prérequis
Tu dois savoir utiliser un terminal et comprendre qu'une application a des DÉPENDANCES et une configuration (`/doc/lessons/terminal-shell-filesystem`), et avoir une idée de ce qu'est un processus. Les notions de port et de variable d'environnement (vues en HTTP et déploiement) aident. Aucune expérience préalable de conteneurs n'est supposée : on part de « ça marche chez moi ».

## 🧠 Modèle mental
Un conteneur, c'est **une boîte qui emporte ton application ET tout son environnement** (dépendances, version de langage, config) pour qu'elle tourne à l'identique partout. Pas « ça marche chez moi » : « ça marche dans la boîte, donc partout ».

## 📖 Explication complète

**L'image est une pile de couches, et c'est toute l'astuce.** Une **image** est le modèle figé
de ton application avec son environnement. Elle se construit depuis un **Dockerfile**, une
recette lue de haut en bas. Chaque instruction de cette recette produit une **couche** : une
photo des différences apportées par cette seule ligne. `FROM node:20-slim` pose la première
couche (un système minimal avec Node) ; `COPY package*.json ./` en pose une deuxième (deux
fichiers) ; `RUN npm ci` une troisième (le dossier des dépendances installées) ; et ainsi de
suite. L'image finale est cet empilement.

**Pourquoi cet empilement change tout : le cache.** Quand tu reconstruis, Docker réutilise
telle quelle chaque couche dont l'entrée n'a pas changé, et ne recalcule qu'à partir de la
PREMIÈRE couche modifiée — puis tout ce qui suit, obligatoirement, puisque chaque couche est
posée sur la précédente. D'où la règle qui gouverne tout Dockerfile : **ce qui change rarement
en haut, ce qui change souvent en bas.** Le fichier des dépendances change une fois par mois,
ton code trente fois par jour. Les copier dans cet ordre — `package*.json`, puis `npm ci`,
puis le reste du code — fait que modifier une ligne de code ne réinstalle rien. L'ordre inverse
réinstalle tout, à chaque fois.

**`npm ci` plutôt que `npm install`.** Les deux installent les dépendances ; `npm ci` les
installe à la version EXACTE inscrite dans `package-lock.json`, et refuse de modifier ce
fichier. C'est ce qui rend la construction reproductible : la même recette rend la même image
la semaine prochaine. `npm install` peut, lui, accepter une version plus récente et faire
diverger silencieusement l'image de ce que tu as testé.

**Le conteneur est l'exécution de l'image.** Une image ne tourne pas, elle se copie ; un
**conteneur** est une instance en cours d'exécution, avec une couche supplémentaire, celle-là
inscriptible. Tout ce que le programme écrit va dans cette couche — et disparaît avec le
conteneur. C'est exactement pourquoi un **volume** existe : un dossier de la machine hôte
monté dans le conteneur, hors de la pile de couches, qui survit à l'arrêt. Une base de données
sans volume perd ses données à chaque redémarrage, sans erreur ni avertissement.

**Ce qui n'entre jamais dans une image.** Une image se partage, se publie, se télécharge : tout
ce qu'elle contient est lisible par qui l'obtient, y compris les couches intermédiaires — une
clé supprimée par une instruction ultérieure reste présente dans la couche qui l'a introduite.
Les **secrets** passent donc par des variables d'environnement au démarrage, jamais par le
Dockerfile. Le `.dockerignore` empêche de son côté `node_modules`, `.env` et `.git` d'être
copiés : inutile, lourd, et dangereux pour les deux derniers.

**docker-compose** décrit enfin plusieurs conteneurs (l'application, sa base, son index) et
leurs liens dans un seul fichier, lancés ensemble par `docker compose up`.

## 🔎 Décomposition
- « Pourquoi ça marche partout ? » → l'environnement voyage avec l'application, en couches.
- « Pourquoi mon build est lent ? » → une couche haute change trop souvent ; réordonne.
- « Où vont mes données ? » → dans la couche du conteneur, donc perdues — sauf volume.
- « Où va ma clé d'API ? » → dans l'environnement au run, jamais dans une couche.
- « Pourquoi `npm ci` ? » → pour que la même recette rende la même image demain.

## 🔧 Exemple simple
Dockerfile minimal Node :
```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "start"]
```

## 🧭 Exemple guidé

Ton API appelle un service payant et a besoin d'une clé. Tu dois la conteneuriser. La
question « où mettre la clé ? » a quatre réponses courantes ; **trois sont des fuites**, et
deux d'entre elles ont l'air parfaitement sûres. C'est cet écart qui rend l'exercice
intéressant.

**Candidat 1 — l'écrire dans le Dockerfile.**

```dockerfile
ENV API_KEY=sk-live-8f3a...
```

Personne ne le défend une fois dit à voix haute, mais tout le monde l'écrit « juste pour
tester ». La clé est dans l'image, donc dans le dépôt d'images, donc chez quiconque la
télécharge — et `docker history` l'affiche sans effort particulier. Écarté.

**Candidat 2 — la copier puis l'effacer.** Là, l'intuition se retourne contre toi :

```dockerfile
COPY .env /app/.env
RUN node build.js && rm /app/.env      # on nettoie derrière soi
```

Le fichier n'est plus là. `docker run ... ls /app` ne le montre pas. Et pourtant la clé est
toujours récupérable. Une image n'est pas un dossier : c'est une **pile de différences
empilées**, chacune conservée telle quelle. La ligne `COPY` a créé une couche contenant le
fichier ; la ligne `RUN ... rm` a créé une couche suivante qui dit « ce fichier n'existe
plus ». La seconde masque la première, elle ne l'efface pas — les deux voyagent ensemble
dans l'image publiée. Qui obtient l'image peut extraire la couche intermédiaire et lire le
fichier.

C'est le mécanisme qu'il faut retenir, parce qu'il ne s'apprend pas en lisant la sortie de
`docker run` : **supprimer dans une couche ultérieure ne retire rien de l'image.** La règle
qui en découle est plus large qu'il n'y paraît : un secret qui a été présent une seule fois
pendant la construction y reste. C'est aussi vrai d'un `git clone` avec un jeton dans l'URL,
ou d'un fichier de configuration copié par erreur.

Vérifie-le toi-même plutôt que de me croire : construis cette image, puis lance
`docker history --no-trunc` dessus et lis les instructions couche par couche. C'est un
exercice de trois minutes et il vaccine durablement.

**Candidat 3 — un argument de construction.**

```dockerfile
ARG API_KEY
RUN echo "clé reçue" && ./configurer.sh
```

`ARG` semble être la bonne réponse : c'est prévu pour passer des valeurs au moment du build,
et la variable n'existe plus à l'exécution. Le piège est que la valeur passée avec
`--build-arg` est **enregistrée dans les métadonnées de l'image** et reste consultable par
qui l'inspecte. `ARG` est fait pour des paramètres — un numéro de version, une architecture
cible — pas pour des secrets.

**Candidat 4 — ne jamais la faire entrer dans l'image.**

```bash
docker build -t monapi .
docker run -e API_KEY="$API_KEY" -p 3000:3000 monapi
```

L'image ne contient que du code ; la clé n'existe que pendant l'exécution du conteneur.
La même image part en recette, en production et chez un collègue, avec une clé différente
à chaque fois — ce qui est d'ailleurs un bénéfice indépendant de la sécurité : **une image
qui contient sa configuration n'est plus la même image d'un environnement à l'autre**, et on
perd la garantie que ce qui a été testé est ce qui est déployé.

**La limite, qu'il faut connaître pour ne pas s'endormir dessus.** `-e` n'est pas un
coffre-fort. La valeur apparaît dans `docker inspect`, et sur l'hôte dans
`/proc/<pid>/environ` — donc pour tout utilisateur suffisamment privilégié de la machine.
Elle traîne aussi dans l'historique de ton shell si tu l'as tapée en clair. C'est
acceptable en développement ; en production on monte un fichier de secret ou l'on passe par
un gestionnaire dédié, dont le conteneur lit la valeur au démarrage. La progression est
toujours la même : d'abord ne pas mettre le secret dans l'artefact partagé, ensuite réduire
qui peut le lire sur la machine qui l'exécute.

**Le piège de fin de parcours.** Ton Dockerfile contient `COPY . .`. Si un fichier `.env`
traîne dans ton dossier de travail, il vient d'entrer dans l'image — et tu retombes sur le
candidat 2 sans l'avoir choisi. Un `.dockerignore` listant `.env`, `.git` et `node_modules`
n'est donc pas une optimisation de taille : c'est ce qui empêche une décision correcte
d'être annulée par un fichier oublié.

**Variante qui déplace le problème.** Ajoute une base de données avec `docker compose`. La
question du secret revient, mais accompagnée d'une autre : le mot de passe de la base doit
être connu de **deux** conteneurs, qui démarrent en même temps. Et une nouvelle catégorie de
perte apparaît, silencieuse celle-là — sans volume déclaré, la base écrit dans la couche
inscriptible du conteneur, qui disparaît à chaque `docker compose down`. Aucune erreur,
aucun avertissement : juste une base vide au redémarrage. Les deux problèmes ont la même
racine, et c'est le modèle mental à emporter : **ce qui doit survivre au conteneur doit
vivre en dehors de lui**, qu'il s'agisse d'un secret ou de données.

## 🤖 Exemple appliqué (IA / data / architecture)
DocSense (projet final) se livre en `docker compose up` : un conteneur app + un conteneur base vectorielle + un volume pour l'index. Le recruteur clone, lance une commande, tout tourne — c'est ce qui transforme un POC en produit démontrable, et un critère de qualité du projet final.

## ⚠️ Erreurs fréquentes

**L'erreur de couches, montrée.** Voici le Dockerfile que presque tout le monde écrit d'abord.
Il est correct — l'image produite fonctionne — et il rend le développement pénible :

```dockerfile
# ❌ LENT : le code est copié AVANT l'installation.
FROM node:20-slim
WORKDIR /app
COPY . .          # ← cette couche change à CHAQUE modification de code
RUN npm ci        # ← donc celle-ci est recalculée à chaque fois
CMD ["npm", "start"]
```

Change une virgule dans un commentaire : la couche `COPY . .` change, donc `RUN npm ci` est
invalidée, donc les dépendances sont réinstallées entièrement. Trente à quatre-vingt-dix
secondes, à chaque itération.

```dockerfile
# ✅ RAPIDE : seul ce qui décrit les dépendances est copié avant de les installer.
FROM node:20-slim
WORKDIR /app
COPY package*.json ./   # ← ne change que si les dépendances changent
RUN npm ci              # ← réutilisée telle quelle le reste du temps
COPY . .                # ← la couche qui change souvent, tout en bas
CMD ["npm", "start"]
```

Même image finale, mêmes fichiers, même comportement. Une seule différence : l'ordre. La
seconde reconstruit en une à deux secondes.

Les autres, plus classiques :
- Mettre un secret dans le Dockerfile : il reste dans la couche, même supprimé plus loin.
- Copier `node_modules`/`.git` faute de `.dockerignore` : image lourde, et historique exposé.
- Oublier le volume : les données de la base disparaissent à l'arrêt, en silence.
- Partir d'une image de base complète (`node:20`, ~1 Go) au lieu de `node:20-slim` (~200 Mo)
  quand rien ne l'exige.

## 🚫 Anti-patterns
- Tout dans un seul conteneur géant au lieu de services séparés quand ça a du sens.
- Reconstruire l'image entière à chaque petit changement, faute d'avoir ordonné les couches
  (voir le Dockerfile fautif ci-dessus).

## ✍️ Mini-exercice
Sans relire : un `RUN rm secret.txt` placé après le `COPY` qui l'a introduit
retire-t-il le secret de l'image ? Que fait-il réellement ?

## 🔥 Pratique — voir le mécanisme des couches de tes propres yeux

Ce que Docker appelle une image est une pile de systèmes de fichiers superposés,
un mécanisme du noyau Linux nommé *overlay*. Tu vas l'exercer directement, sans
Docker, ce qui a un avantage : rien n'est caché.

**A. Fabriquer une pile de couches.** Crée trois répertoires `couche1`,
`couche2`, `couche3` plus un répertoire de travail et un point de fusion.
Mets dans `couche1` un fichier `.env` contenant un faux secret et un `app.js`.
Mets dans `couche2` un `app.js` différent. Monte la superposition :

```bash
mount -t overlay overlay \
  -o lowerdir=couche2:couche1,upperdir=couche3,workdir=travail fusion
```

Livrable : le contenu de `fusion/app.js`, et ta prédiction écrite avant de
regarder.

**B. Supprimer, puis chercher.** Depuis le point de fusion, supprime le `.env`.
Puis réponds à quatre questions par une commande chacune : le fichier est-il
visible depuis la fusion ? qu'est-ce qui a été écrit dans `couche3` ?
(`ls -la`, et regarde le premier caractère du mode) ; que contient encore
`couche1` ? l'ensemble des couches a-t-il maigri ?

**C. Mesurer le poids.** Mets un fichier de 5 Mio dans `couche1`, mesure les
trois couches, supprime-le depuis la fusion, remesure. Livrable : les deux
mesures et le total.

**D. Traduire en Dockerfile.** À partir de A, B et C, écris deux Dockerfile pour
un de tes projets : un qui télécharge une archive, l'utilise et la supprime dans
**trois** instructions, et un qui fait les trois dans **une seule**. Explique en
quatre lignes, en te servant de tes mesures, pourquoi les images n'ont pas la
même taille.

**E. Vérifier l'ordre des couches.** Réécris ton Dockerfile pour que modifier
une ligne de code ne relance pas l'installation des dépendances. Livrable : le
fichier, et l'ordre des instructions justifié par leur fréquence de changement.

## ✅ Correction attendue

> **Limite déclarée.** Le démon Docker n'est pas disponible dans l'environnement
> où ce cours a été écrit ; aucune commande `docker` n'a été exécutée pour
> produire cette correction. En revanche le mécanisme sous-jacent — la
> superposition de systèmes de fichiers — a été exercé réellement, et les
> sorties ci-dessous sont mesurées :
> `scripts/v70-verifications/couches-overlay.sh`. Ce n'est pas une analogie de
> ce que fait Docker : c'est la couche du noyau que Docker utilise.

**A — quelle couche gagne.** La fusion montre `app.js` contenant la version de
`couche2`. Dans l'option de montage, `lowerdir=couche2:couche1` se lit **de la
plus haute à la plus basse** — c'est un ordre qui surprend, et se tromper
inverse la démonstration. La règle transposée : quand deux instructions touchent
le même chemin, c'est la dernière qui compte pour le contenu visible.

**B — ce qu'écrit vraiment une suppression.** Depuis la fusion :

```
fichiers .env visibles : 0
lecture : cat: .../fusion/.env: No such file or directory
```

Le conteneur ne voit plus rien. Mais dans la couche supérieure :

```
c--------- 2 root root 0, 0 Aug 30 10:46 .env
```

Le premier caractère est `c` : c'est un **fichier spécial en mode caractère**,
de numéros majeur 0 et mineur 0, appelé *whiteout*. Ce n'est pas une
suppression, c'est un **marqueur de masquage**. Et la couche du dessous est
intacte :

```
SECRET=sk_live_abc123
```

Voilà pourquoi un `COPY .env` suivi d'un `RUN rm .env` ne protège rien. Le
secret n'apparaît dans aucun conteneur démarré depuis l'image — ce qui est
précisément le piège, puisqu'on vérifie en démarrant un conteneur. Il est dans
la couche, et **quiconque obtient l'image obtient les couches**. Une image
poussée sur un registre partagé a distribué le secret.

Note la parenté avec l'historique git : dans les deux cas, on manipule une
structure faite d'états successifs et immuables, et l'opération « retirer »
n'existe pas — seulement « ajouter un état où la chose n'est plus visible ».

**C — le poids.** Mesuré, en kibioctets :

```
avant suppression : couche1 5132 · couche2 8 · couche3 4
apres suppression : couche1 5132 · couche2 8 · couche3 4
total des couches : 5144
```

Rien n'a maigri. La couche 1 pèse toujours 5 Mio, et la couche supérieure a
même **grossi** d'un fichier de masquage. Une image ne rétrécit jamais par
suppression, elle ne fait que s'allonger.

**D — la conséquence sur le Dockerfile.** La version en trois instructions
produit une image qui contient l'archive pour toujours ; la version en une seule
instruction ne la fait jamais entrer dans une couche persistée. La formulation
exacte compte : le fichier ne doit pas être *supprimé*, il doit **ne jamais
exister à la fin d'une instruction**.

```dockerfile
# ❌ l archive pèse dans l image, définitivement
RUN curl -o outils.tar.gz https://exemple/outils.tar.gz
RUN tar xf outils.tar.gz
RUN rm outils.tar.gz

# ✅ l archive n existe qu à l intérieur d une seule couche
RUN curl -o outils.tar.gz https://exemple/outils.tar.gz \
 && tar xf outils.tar.gz \
 && rm outils.tar.gz
```

Et pour un secret, la même logique conduit plus loin : il ne doit pas non plus
entrer dans une instruction unique, parce qu'il resterait présent pendant
l'exécution de celle-ci et peut apparaître dans les journaux de construction. Un
secret se fournit au **démarrage du conteneur**, jamais à la construction de
l'image — ce qui rejoint la règle de la leçon `deployment-secrets` : la
configuration est injectée, pas gravée.

**E — l'ordre par fréquence de changement.** L'ordre attendu, du plus stable au
plus changeant :

```dockerfile
FROM node:20-slim               # change tous les mois
WORKDIR /app
COPY package*.json ./           # change quand une dépendance change
RUN npm ci                      # l instruction coûteuse
COPY . .                        # change à chaque commit
CMD ["node", "serveur.js"]
```

Le mécanisme à savoir énoncer : le cache d'une instruction est invalidé dès
qu'une instruction **précédente** l'est. Placer `COPY . .` avant `RUN npm ci`
fait donc réinstaller toutes les dépendances à chaque modification d'une ligne
de code — l'image est correcte, la construction est dix fois plus lente, et
personne ne comprend pourquoi. C'est le défaut le plus fréquent des Dockerfile
écrits sans penser en couches, et il ne produit aucune erreur : seulement de
l'attente.

Deux compléments qu'une bonne réponse ajoute d'elle-même. Un `.dockerignore`
est nécessaire, sans quoi `COPY . .` embarque `node_modules`, `.git` et les
fichiers locaux — donc invalide le cache à chaque changement de n'importe quoi.
Et la persistance des données ne passe pas par les couches : un conteneur
supprimé emporte sa couche d'écriture, donc la base doit vivre dans un
**volume**, seul mécanisme qui survit à la recréation du conteneur.

## 🎤 Questions d'entretien
- « Différence entre une image et un conteneur ? » → L'image est le modèle figé, le conteneur une instance qui tourne (comme classe vs objet).
- « Où mets-tu les secrets ? » → En variables d'environnement au run, jamais dans l'image.
- « À quoi sert un volume ? » → Persister des données hors du cycle de vie du conteneur.

## 🧾 À retenir
- Un conteneur emporte l'appli ET son environnement → reproductible partout.
- Secrets au run, jamais dans l'image ; volumes pour la persistance.
- `docker compose up` = livraison démontrable en une commande.

## 📚 Vocabulaire
**image / conteneur** · **Dockerfile** · **couche (layer)** · **volume** · **docker-compose** · **variable d'environnement** · **.dockerignore** · **port mapping**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sais écrire un Dockerfile et lancer un conteneur.
- [ ] Mes secrets ne sont jamais dans l'image.
- [ ] Je sais orchestrer 2 services avec compose et persister des données.

## 🔗 Liens avec le programme
Mois 11 (jours ~300-320), projet final. Leçons liées : `deployment-secrets`, `ci-cd`, `architecture-basics`.
