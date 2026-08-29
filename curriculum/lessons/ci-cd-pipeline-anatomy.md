<!-- keep -->
# Leçon — CI/CD : anatomie d'un pipeline

## 🌍 Le problème d'abord
À chaque fois que vous modifiez du code, il faut le tester, le construire, peut-être
le déployer. Le faire à la main, c'est long, oubliable et différent d'une personne à
l'autre. Un **pipeline** est un robot qui exécute ces étapes AUTOMATIQUEMENT, dans un
environnement propre, à chaque changement. Mais un pipeline mal compris devient une
boîte noire de 25 minutes qui décourage : on ne sait plus pourquoi c'est lent, ni
pourquoi un job échoue. Cette leçon ouvre la boîte : de quoi un pipeline est-il fait
(étapes, jobs, machines jetables), et pourquoi certaines choses doivent être
explicitement transmises d'une étape à l'autre. On part de zéro : c'est quoi, « le
robot » ?

## 🎯 Objectif
Décomposer un pipeline moderne : **déclencheurs**, **jobs** et **étapes**,
**runners**, **parallélisme** et **matrice**, **cache** et **artefacts** qui
circulent entre les jobs. Objectif : lire, concevoir et accélérer un pipeline au
lieu d'en subir un.

## 🧩 Prérequis
Vous devez avoir l'intuition de la **CI/CD** (`/doc/lessons/ci-cd`) et savoir ce
qu'est une **image** que l'on construit (`/doc/lessons/docker-images-layers`), car un
pipeline construit et publie souvent des images. Les notions de job, runner, cache et
artefact sont définies ici.

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

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Ton job « build » produit un binaire, ton job « deploy » en a besoin. Tu passes par le
   cache. Que peut-il arriver ?
2. Ton pipeline passe en CI et échoue en production. Cite deux causes qui n'ont rien à
   voir avec ton code.
3. Une suite de tests met 40 minutes. Tu la parallélises sur 8 runners. Que gagnes-tu
   réellement, et que payes-tu ?
4. Pourquoi un runner jetable attrape-t-il le « ça marche chez moi » ?

## ✅ Correction attendue

**La démarche.** Un pipeline est une suite d'environnements **jetables**. Tout ce qui doit
survivre d'un job à l'autre doit être transmis explicitement, et la façon de le transmettre
change tout.

**L'erreur probable, et elle produit des déploiements non reproductibles.** Passer un
livrable par le cache fonctionne — c'est ce qui la rend difficile à débusquer — parce que
le cache et l'artefact stockent tous deux des fichiers entre deux jobs. Leurs **contrats**
n'ont pourtant rien à voir :

| | cache | artefact |
|---|---|---|
| garantie | **aucune** — peut être vide, périmé, évincé | le fichier est là, tel qu'il a été produit |
| but | accélérer (reconstructible) | transmettre (résultat) |
| en cas d'absence | le job doit encore fonctionner, plus lentement | le job doit échouer |
| portée | partagée, souvent entre branches | cette exécution |

Le cache est **une optimisation dont l'absence doit être sans conséquence**. En y mettant
un binaire, on déploie ce qui s'y trouve : une version évincée le matin, ou pire, celle
déposée par une **autre branche** qui partageait la clé. Le déploiement réussit, les tests
sont verts, et la production tourne un artefact qui ne correspond à aucun commit. Le jour
où il faudra comprendre un bug, personne ne saura ce qui est déployé.

La règle : **cache pour ce qu'on peut reconstruire** — dépendances téléchargées, compilation
incrémentale. **Artefact pour ce qu'on ne veut pas reconstruire** — le livrable, parce qu'on
veut déployer exactement ce qui a été testé.

Le piège séduit parce que **les deux mécanismes se ressemblent à l'usage** : on déclare un
chemin, on lui donne une clé, on le récupère au job suivant. La différence n'est pas dans
l'interface, elle est dans la **garantie**, et une garantie ne se voit pas quand elle est
tenue. Le cache tient parole des centaines de fois avant de faillir une fois.

**Sur les autres questions.** Un pipeline vert et une production cassée : la cause la plus
fréquente n'est pas le code mais l'**environnement** — une variable présente en CI et
absente en production, une version de runtime différente, un service accessible depuis le
runner et pas depuis la production, une migration jamais jouée. Vient ensuite la
**différence de données** : la CI teste sur un jeu propre et minuscule, la production a
huit ans d'historique, des valeurs nulles, des doublons et des cas que personne n'a
imaginés.

Paralléliser 40 minutes sur 8 runners donne rarement 5 minutes : il faut compter le
démarrage de chaque runner, l'installation des dépendances, la répartition inégale des
tests. On atteint 8 à 12 minutes, ce qui reste excellent. On paye huit fois plus de
minutes de calcul — le coût ne baisse pas, il est simplement échangé contre du temps
humain, ce qui est presque toujours un bon échange.

Enfin, le runner jetable attrape le « ça marche chez moi » parce qu'il **part de rien** :
aucun outil installé de longue date, aucune variable d'environnement héritée, aucune
dépendance globale, aucun fichier oublié et non commité. Tout ce qui manque au dépôt
manque au runner, immédiatement et bruyamment. C'est un environnement neutre parce qu'il
n'a pas d'histoire.

**Alternative défendable.** Sur un petit projet, un pipeline en **un seul job séquentiel**
est parfaitement raisonnable : pas de transmission entre jobs, donc ni cache ni artefact à
gérer, et une durée totale acceptable. Le découpage en jobs se justifie par le parallélisme
et la lisibilité des échecs — pas par principe.

**Vérifie seul, sans corrigé** :
1. Cherche dans ton pipeline ce qui transite entre jobs. Est-ce du cache ou de l'artefact ?
   Chaque livrable en cache est un déploiement non traçable.
2. Vide ton cache et relance. Le pipeline passe-t-il encore ? Sinon, ce n'était pas un
   cache.
3. Liste les différences entre ton runner et ta production. Chacune est une panne
   possible que la CI ne verra jamais.

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

## 🚑 Que faire dans ce cas ? — « le pipeline échoue seulement en production »
- **Symptômes** : les jobs passent pour les branches de test, mais le job de
  déploiement en production échoue.
- **Premières vérifications** : les **secrets/variables** de l'environnement prod
  sont-ils bien définis (et pas seulement ceux de test) ? le job prod a-t-il les
  droits/approbations nécessaires ? cible-t-il le bon environnement ?
- **Cause probable** : une différence de CONFIGURATION entre environnements (secret
  manquant, variable, approbation), pas le code lui-même.
- **Correction** : aligner/renseigner la configuration de l'environnement prod ;
  vérifier la portée des secrets par job.
- **Prévention** : documenter les variables requises par environnement ; échouer tôt
  avec un message clair si une variable obligatoire manque.

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
