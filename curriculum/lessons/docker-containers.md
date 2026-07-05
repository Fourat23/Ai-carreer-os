<!-- keep -->
# Leçon — Docker et conteneurs

## 🎯 Objectif
Comprendre ce qu'est un conteneur, pourquoi il résout le « ça marche chez moi », et savoir écrire un Dockerfile + un docker-compose pour livrer une application (dont un système IA) de façon reproductible. C'est le standard de livraison et ce qui rend ton projet final crédible.

## 🧠 Modèle mental
Un conteneur, c'est **une boîte qui emporte ton application ET tout son environnement** (dépendances, version de langage, config) pour qu'elle tourne à l'identique partout. Pas « ça marche chez moi » : « ça marche dans la boîte, donc partout ».

## 📖 Explication complète
- Une **image** est un modèle figé (l'appli + son environnement), construit depuis un **Dockerfile** (une recette : partir d'une base, copier le code, installer, définir la commande de démarrage).
- Un **conteneur** est une instance qui tourne d'une image (comme un objet est une instance d'une classe).
- Un **volume** persiste des données hors du conteneur (une base, des fichiers) — sinon tout disparaît à l'arrêt.
- **docker-compose** orchestre plusieurs conteneurs (app + base + …) en un fichier, lancés par `docker compose up`.
Les **secrets** (clés d'API) passent par des variables d'environnement, jamais dans l'image (une image se partage). Le `.dockerignore` évite de copier `node_modules`, `.env`, `.git` dans l'image.

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
**Énoncé** : conteneuriser une API qui lit une clé d'API.
**Raisonnement** : la clé ne doit PAS être dans l'image ; on la passe au run.
**Solution** :
```bash
docker build -t monapi .
docker run -e API_KEY=$API_KEY -p 3000:3000 monapi
```
**Explication** : `-e` injecte le secret à l'exécution (l'image reste partageable) ; `-p` mappe le port. **Variante** : mets ça dans un `docker-compose.yml` avec un service base de données et un volume.

## 🤖 Exemple appliqué (IA / data / architecture)
DocSense (projet final) se livre en `docker compose up` : un conteneur app + un conteneur base vectorielle + un volume pour l'index. Le recruteur clone, lance une commande, tout tourne — c'est ce qui transforme un POC en produit démontrable, et un critère de qualité du projet final.

## ⚠️ Erreurs fréquentes
- Mettre des secrets dans l'image ou le Dockerfile.
- Copier `node_modules`/`.git` dans l'image (pas de `.dockerignore`).
- Oublier les volumes → perte de données à l'arrêt.
- Image énorme (partir d'une base lourde, ne pas utiliser `npm ci`).

## 🚫 Anti-patterns
- Tout dans un seul conteneur géant au lieu de services séparés quand ça a du sens.
- Reconstruire l'image entière à chaque petit changement (mal ordonner les couches du Dockerfile).

## ✍️ Mini-exercice
Écris un Dockerfile pour un de tes projets et lance-le. Vérifie qu'il tourne sur une machine « propre » (sans tes dépendances installées globalement).

## 🔥 Exercice plus difficile
Écris un `docker-compose.yml` à 2 services (app + base), avec un volume persistant et des secrets par variables d'environnement. Prouve que `docker compose down && up` conserve les données.

## ✅ Correction attendue
La logique : Dockerfile = recette reproductible ; secrets au run, pas dans l'image ; volumes pour la persistance ; compose pour l'orchestration. Vérifie : l'image ne contient aucun secret, l'appli tourne sur machine propre, les données survivent à un redémarrage (volume).

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
