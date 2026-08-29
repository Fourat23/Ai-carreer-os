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
Écris un Dockerfile pour un de tes projets et lance-le. Vérifie qu'il tourne sur une machine « propre » (sans tes dépendances installées globalement).

## 🔥 Exercice plus difficile
Écris un `docker-compose.yml` à 2 services (app + base), avec un volume persistant et des secrets par variables d'environnement. Prouve que `docker compose down && up` conserve les données.

## ✅ Correction attendue

**L'erreur de raisonnement à corriger d'abord**, parce qu'elle produit toutes les autres :
croire qu'un Dockerfile est une liste d'instructions dont l'ORDRE n'a d'importance que pour la
logique. Il décrit en réalité une pile, et chaque ligne dépend de toutes celles au-dessus. Tant
qu'on ne pense pas en couches, on écrit des Dockerfile qui marchent et qu'on déteste utiliser.

Deuxième erreur de raisonnement : croire qu'un fichier supprimé dans une image a disparu. Une
couche ne défait pas la précédente, elle s'ajoute par-dessus. Un `COPY .env` suivi d'un
`RUN rm .env` laisse le secret parfaitement lisible dans la couche intermédiaire.

Vérifie ensuite, sur ton propre Dockerfile :
- modifier une ligne de code ne relance PAS l'installation des dépendances ;
- `docker history` sur ton image ne montre aucune couche contenant un secret ;
- l'application tourne sur une machine où rien n'est installé globalement ;
- les données de la base survivent à `docker compose down` puis `up`.

Si l'un des quatre échoue, la cause est presque toujours dans l'ordre des couches ou dans
l'absence de volume — pas dans l'application.

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
