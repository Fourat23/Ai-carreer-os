<!-- keep -->
# Leçon — Docker : maîtriser le Dockerfile et le multi-stage

## 🎯 Objectif
Aller au-delà du Dockerfile minimal : comprendre le **contexte de build**, les
instructions clés (`COPY` vs `ADD`, `CMD` vs `ENTRYPOINT`, `ARG` vs `ENV`), le
**multi-stage build** pour produire des images légères et sûres, et le
`.dockerignore`. Objectif : des images petites, reproductibles et sans secrets.

## 🧩 Prérequis
Modèle en couches (`/doc/lessons/docker-images-layers`).

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
1. Constater la taille et les couches (`docker history`).
2. Ajouter un `.dockerignore` (`node_modules`, `.git`, `.env`, tests).
3. Introduire un multi-stage : compiler dans `build`, copier `dist` dans l'image
   finale.
4. Installer uniquement les dépendances de production (`--omit=dev`).
5. Re-mesurer : l'atelier a disparu de l'image livrée.

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
