<!-- keep -->
# Leçon — CI/CD : anatomie d'un pipeline

## 🎯 Objectif
Décomposer un pipeline moderne : **déclencheurs**, **jobs** et **étapes**,
**runners**, **parallélisme** et **matrice**, **cache** et **artefacts** qui
circulent entre les jobs. Objectif : lire, concevoir et accélérer un pipeline au
lieu d'en subir un.

## 🧩 Prérequis
Notions de CI/CD (`/doc/lessons/ci-cd`) et de build d'image
(`/doc/lessons/docker-images-layers`).

## 🧠 Modèle mental
Un pipeline est un **graphe de tâches** déclenché par un événement. Chaque tâche
tourne sur une machine JETABLE et repart de zéro : ce qu'un job veut transmettre à
un autre doit être explicitement **publié** (artefact) ou **mis en cache**. Penser
« machines éphémères + flux de données explicite » évite les deux erreurs
classiques : croire qu'un job hérite de l'état d'un autre, et reconstruire
inutilement à chaque fois.

## 📖 Explication complète
**Déclencheurs.** Un pipeline se lance sur un événement : push, pull request,
tag, planification (cron), déclenchement manuel. On adapte le pipeline au
déclencheur : une PR lance lint + tests ; un tag de version lance en plus la
publication d'image et le déploiement.

**Jobs et étapes.** Un **job** est une unité qui tourne sur un **runner** (une
machine, souvent conteneurisée) ; il enchaîne des **étapes**. Les jobs peuvent
s'exécuter en **parallèle** (lint, tests, build en même temps) ou en séquence via
des **dépendances** (`needs`) — par exemple « déployer » dépend de « tests
verts ».

**Runners.** Le runner fournit un environnement PROPRE : c'est ce qui attrape le
« ça marche chez moi ». Il peut être hébergé par le fournisseur ou auto-hébergé
(pour des besoins spécifiques). Comme il est jetable, rien ne persiste entre deux
exécutions sans cache ni artefact.

**Parallélisme et matrice.** Une **matrice** exécute le même job sur plusieurs
combinaisons (versions de langage, systèmes d'exploitation) en parallèle. Le
parallélisme réduit la durée totale mais consomme plus de ressources : on
équilibre vitesse et coût.

**Cache vs artefacts — à ne pas confondre.**
- Le **cache** accélère un job en réutilisant des données coûteuses à recréer
  (dépendances téléchargées). Il est opportuniste : un cache manquant ne casse
  pas, il ralentit.
- Un **artefact** est un LIVRABLE produit par un job et transmis à un autre (ou
  conservé) : un binaire compilé, une image, un rapport de tests. Il fait partie
  du contrat du pipeline.
Utiliser un cache là où il faut un artefact (ou l'inverse) est une erreur
fréquente.

**Durée et feedback.** Un pipeline lent décourage les intégrations fréquentes. On
l'accélère en parallélisant, en mettant en cache les dépendances, et en ordonnant
les vérifications rapides d'abord (lint avant une suite de tests longue) pour
échouer vite (**fail fast**).

## 🔧 Exemple — jobs parallèles puis déploiement conditionnel
```yaml
on:
  push:
    branches: [main]
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }   # cache des dépendances
      - run: npm ci
      - run: npm test
  build:
    needs: test                     # ne construit que si les tests passent
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: actions/upload-artifact@v4          # publie un ARTEFACT
        with: { name: dist, path: dist/ }
```

## 🧭 Exemple guidé — « le pipeline prend 25 minutes »
1. Où va le temps ? (durée par job.) Les dépendances sont-elles re-téléchargées à
   chaque fois → activer le **cache**.
2. Les jobs indépendants (lint, tests, build) tournent-ils en **parallèle** ou en
   série ?
3. Les vérifications rapides échouent-elles AVANT les longues (fail fast) ?
4. Un job reconstruit-il ce qu'un précédent avait déjà produit → passer par un
   **artefact**.

## ⚠️ Erreurs fréquentes
- Croire qu'un job **hérite** de l'état d'un autre (chaque runner repart de zéro).
- Confondre **cache** (accélération opportuniste) et **artefact** (livrable du
  contrat).
- Tout en série alors que des jobs sont indépendants.
- Mettre les vérifications lentes en premier (pas de fail fast).
- Ne pas figer les dépendances → pipeline non déterministe.

## 🔐 Sécurité
Les **secrets** de CI (jetons de publication, clés de déploiement) s'injectent via
le coffre du fournisseur, jamais en clair dans le fichier de pipeline ni dans les
logs. Limiter la portée des secrets aux jobs qui en ont besoin (ex. seul le job de
déploiement voit la clé de déploiement).

## 🏢 Cas métier
Une équipe subissait un pipeline de 25 min qui dissuadait les petits commits.
Diagnostic : dépendances re-téléchargées, jobs en série, tests longs en premier.
Après cache des dépendances, parallélisation lint/tests/build et fail fast, le
pipeline tombe à 7 min et les intégrations redeviennent fréquentes.

## 🎤 Questions d'entretien
- « Différence entre cache et artefact ? » → accélération opportuniste vs livrable
  transmis entre jobs.
- « Pourquoi un runner attrape le "ça marche chez moi" ? » → environnement propre
  et jetable.
- « Comment accélérer un pipeline lent ? » → cache, parallélisme, fail fast.

## ✍️ Mini-exercice
Le job « déployer » a besoin du binaire produit par « build ». Cache ou artefact ?
→ artefact (c'est un livrable transmis entre jobs, pas une simple accélération).

## 🧾 À retenir
- Pipeline = graphe de jobs déclenchés par un événement, sur runners jetables.
- Rien ne persiste entre jobs sans cache (accélération) ou artefact (livrable).
- Parallélisme + matrice + fail fast = feedback rapide.
- Secrets via le coffre du fournisseur, portée minimale.

## 📚 Vocabulaire
**déclencheur (trigger)** · **job / étape** · **runner** · **needs (dépendance)** ·
**matrice** · **parallélisme** · **cache** · **artefact** · **fail fast**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je lis un pipeline (jobs, dépendances, parallélisme).
- [ ] Je distingue cache et artefact et je les utilise à bon escient.
- [ ] Je sais accélérer un pipeline lent.

## 🔗 Liens avec le programme
Mois 11 (livraison). Leçons liées : `/doc/lessons/ci-cd`,
`/doc/lessons/ci-cd-quality-gates-artifacts`,
`/doc/lessons/deployment-strategies`. L'anatomie du pipeline est le socle des
portes qualité et du déploiement.
