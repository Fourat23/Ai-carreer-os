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

## 🧭 Exemple guidé — « le pipeline prend 25 minutes, on va paralléliser »

C'est la réaction naturelle, et elle est à moitié juste. Pour voir quelle
moitié, on ne va pas raisonner en général : on va mesurer une vraie suite de
tests. Le script `scripts/v70-verifications/pipeline-duree.mjs` chronomètre les
**155 fichiers de tests de ce dépôt**, un par un, puis calcule ce que donnerait
leur répartition sur N agents.

### 1. Où va le temps ?

```
temps CPU cumulé (exécution séquentielle) : 129,2 s
les cinq fichiers les plus lents :
   19,16 s   14,8 %  tests/v47-exercises.test.mjs
   15,80 s   12,2 %  tests/react-compile.test.mjs
   13,05 s   10,1 %  tests/v48-exercises.test.mjs
    7,69 s    5,9 %  tests/typescript-runtime.test.mjs
    6,17 s    4,8 %  tests/python-runtime.test.mjs
  -> ces 5 fichiers sur 155 représentent 47,9 % du temps total.
```

Cinq fichiers sur 155 — 3 % des fichiers — pèsent **la moitié du temps**. Cette
forme est la règle, pas l'exception : le temps d'une suite de tests est presque
toujours concentré sur une poignée de fichiers, en général ceux qui compilent,
lancent un processus externe, ou touchent le disque. La première action utile
n'est donc pas de paralléliser : c'est de **mesurer par fichier**, ce qui prend
dix minutes et dit où chercher.

### 2. Ce que la parallélisation rend réellement

On répartit les fichiers sur N agents avec la meilleure heuristique simple — le
plus long d'abord, chaque fichier va sur l'agent le moins chargé. Le pipeline
se termine quand le **dernier** agent a fini :

```
  agents | durée du pipeline | accélération | accélération idéale
       1 |          129,2 s |  ×1,00       | ×1,00
       2 |           64,7 s |  ×2,00       | ×2,00
       4 |           32,4 s |  ×3,99       | ×4,00
       8 |           19,2 s |  ×6,75       | ×8,00
      16 |           19,2 s |  ×6,75       | ×16,00
      32 |           19,2 s |  ×6,75       | ×32,00
```

Lis la colonne de droite. Jusqu'à quatre agents, l'accélération est
quasi parfaite. À huit, elle décroche déjà. À seize et à trente-deux, elle
**n'augmente plus du tout** :

```
plancher incompressible : 19,16 s
(tests/v47-exercises.test.mjs — un fichier ne se coupe pas en deux)
```

Le pipeline ne peut pas être plus rapide que son plus gros fichier, parce que
l'unité de répartition est le fichier. Au-delà de sept agents environ, chaque
agent supplémentaire est du temps machine payé pour rien. Trente-deux agents
donnent exactement le même résultat que huit.

C'est une instance de la loi d'Amdahl : la partie non parallélisable d'un
travail fixe la limite de toute accélération. Ici la partie non parallélisable
n'est pas mystérieuse, elle a un nom de fichier. **Et c'est une bonne nouvelle
opérationnelle** : découper ce seul fichier en trois déplacerait le plancher à
environ 6,4 s et rendrait utile d'aller au-delà de huit agents. Le levier n'est
pas le nombre d'agents, c'est la granularité.

### 3. Ce que la parallélisation coûte, et qui n'apparaît jamais dans le calcul

Chaque agent paie un coût fixe avant d'exécuter le premier test. Sur cette
machine, le seul démarrage d'un processus Node coûte déjà 39,4 ms — mesuré. Sur
un agent de CI réel s'y ajoutent le provisionnement de la machine, le clone du
dépôt, la restauration du cache et l'installation des dépendances, soit un ordre
de grandeur usuel de 30 à 90 secondes qui n'est pas mesurable depuis ce dépôt et
qu'on ne va donc pas inventer plus précisément.

Prenons 60 secondes de coût fixe. Passer de 1 à 8 agents ajoute **8 minutes de
temps machine facturé** pour faire passer l'attente de 129 s à 19 s, soit 110
secondes gagnées. C'est peut-être un excellent marché — si vingt personnes
attendent ce pipeline vingt fois par jour — et c'est peut-être absurde sur un
projet à deux. **L'accélération se paie, et pas dans la même monnaie que
celle qu'on gagne** : on échange du temps machine contre du temps humain. Le
calcul se fait, il ne se suppose pas.

### 4. La démarche, dans l'ordre

Ce que la mesure impose comme séquence — chaque étape avant la suivante, parce
que chacune rend la suivante mieux informée :

1. **Mesurer par job et par fichier.** Sans cela, on optimise au hasard. Dix
   minutes de travail.
2. **Supprimer le travail refait.** Les dépendances sont-elles retéléchargées à
   chaque exécution ? Un cache les rend disponibles sans réseau. Un job
   reconstruit-il ce qu'un job précédent a déjà produit ? Il faut alors un
   **artefact**, et pas un cache — la distinction est développée dans la
   correction ci-dessous, et se tromper de mécanisme produit un défaut rare et
   très difficile à diagnostiquer.
3. **Faire échouer vite.** Les vérifications rapides (lint, typage, format)
   passent avant les longues. Un pipeline qui met 25 minutes à annoncer une
   virgule mal placée gaspille 25 minutes à chaque fois.
4. **Alors seulement, paralléliser** — et s'arrêter au point où l'accélération
   décroche, que la mesure a rendu visible.
5. **Découper le fichier le plus long**, qui est désormais le seul levier
   restant.

Beaucoup d'équipes commencent à l'étape 4 et paient les agents sans jamais
atteindre le plancher qu'elles auraient pu abaisser à l'étape 5.

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
Sans relire : le job « déployer » a besoin du binaire produit par « build ».
Cache ou artefact, et qu'est-ce qui arrive si tu te trompes ?

## 🔥 Pratique — instrumenter ton pipeline avant de l'optimiser

Cette pratique produit des chiffres sur **ton** pipeline, pas sur celui d'un
article de blog.

**A. Mesurer par fichier.** Écris un script qui exécute chaque fichier de ta
suite de tests séparément et enregistre sa durée. Trie, et calcule la part du
temps total prise par les cinq plus lents. Livrable : le tableau trié et le
pourcentage cumulé.

**B. Calculer ton plafond d'accélération.** À partir des durées de A, simule la
répartition sur 1, 2, 4, 8, 16 et 32 agents avec la règle « le plus long
d'abord, sur l'agent le moins chargé ». Livrable : le tableau
agents / durée / accélération, le nombre d'agents au-delà duquel plus rien ne
s'améliore, et le nom du fichier qui fixe le plancher.

**C. Décider avec le coût.** Estime le coût fixe par agent sur ta plateforme
(mesure-le : lance un pipeline qui ne fait rien et chronomètre-le). Calcule, pour
le nombre d'agents choisi en B, le temps machine ajouté par exécution et le
temps d'attente économisé. Multiplie par le nombre d'exécutions par jour et par
le nombre de personnes qui attendent. Livrable : la comparaison chiffrée, et ta
décision.

**D. Abaisser le plancher.** Découpe le fichier identifié en B en au moins trois
fichiers indépendants — indépendants au sens de la leçon `ci-cd` : chacun doit
passer seul. Refais le calcul de B. Livrable : le nouveau plancher et la
nouvelle accélération maximale.

**E. Corriger un mécanisme de transmission.** Trouve dans ton pipeline un
endroit où un job utilise ce qu'un autre a produit. Vérifie si c'est un cache ou
un artefact. Si c'est un cache, remplace-le et explique en trois lignes ce qui
pouvait arriver.

## ✅ Correction attendue

**A — la forme du résultat.** Attends-toi à une distribution très déséquilibrée.
Sur la suite de ce dépôt, mesurée : 5 fichiers sur 155 — 3 % des fichiers —
représentent 47,9 % du temps. Si ta mesure donne une répartition uniforme, c'est
une information rare et précieuse : cela signifie qu'il n'y a pas de gain facile,
et que la parallélisation est effectivement le bon levier. Dans tous les autres
cas, il y a du travail moins cher à faire avant.

Le piège de mesure : chronométrer le job entier au lieu de chaque fichier. La
durée du job inclut le provisionnement, le clone et l'installation des
dépendances, qui ne se parallélisent pas de la même façon et qu'il faut compter
à part.

**B — le plafond.** La forme attendue :

```
  agents | durée du pipeline | accélération | accélération idéale
       1 |          129,2 s |  ×1,00       | ×1,00
       4 |           32,4 s |  ×3,99       | ×4,00
       8 |           19,2 s |  ×6,75       | ×8,00
      16 |           19,2 s |  ×6,75       | ×16,00
      32 |           19,2 s |  ×6,75       | ×32,00
```

Ce qu'une bonne réponse relève : l'accélération **plafonne**, et le plafond a un
nom de fichier. C'est la loi d'Amdahl, mais formulée de façon actionnable — la
partie non parallélisable, ici, c'est « le plus gros fichier ne se coupe pas en
deux ». La quantité à calculer est donc `temps total / temps du plus long
fichier`, qui donne le nombre d'agents utile (environ 7 dans la mesure
ci-dessus). Tout agent au-delà est payé et inutile.

Une erreur fréquente dans la simulation : répartir les fichiers par ordre
alphabétique ou en tourniquet. Cela donne un résultat nettement pire que le
glouton « plus long d'abord », et conduit à conclure à tort que la
parallélisation ne marche pas. L'ordre de répartition compte.

**C — la décision.** Il n'y a pas de bonne réponse universelle, et c'est le
point. Avec 60 s de coût fixe par agent, passer à 8 agents ajoute 8 minutes de
temps machine par exécution pour économiser environ 110 secondes d'attente. Sur
un projet à deux personnes qui poussent trois fois par jour, c'est un mauvais
marché. Sur une équipe de vingt qui pousse cent fois par jour, l'attente
économisée dépasse largement le coût. **La réponse attendue est un calcul, pas
une préférence** — et elle doit nommer les deux monnaies, parce qu'elles ne sont
pas interchangeables : on paie en temps machine, on gagne en temps humain.

**D — abaisser le plancher.** Découper le fichier de 19,16 s en trois fichiers
équilibrés déplace le plancher à environ 6,4 s et fait remonter l'accélération
maximale d'environ ×6,75 à environ ×20. C'est le levier le plus rentable de tout
l'exercice, et il ne coûte aucun agent supplémentaire.

Le mot important est **indépendants**. Découper un fichier en trois qui
partagent un état ne donne pas trois fichiers : cela donne un fichier qui ne
fonctionne que si les trois morceaux tournent dans l'ordre, sur le même agent —
soit exactement ce qui empêche de les répartir. Si les trois morceaux ne
passent pas isolément, le découpage n'a rien découpé.

**E — cache ou artefact.** La distinction, en une phrase : un **cache** est une
optimisation dont l'absence doit être sans conséquence ; un **artefact** est un
livrable dont l'absence rend le job suivant impossible.

Ce qui arrive si l'on transmet un binaire par le cache : le cache peut être
absent (première exécution, expiration, éviction), et le job de déploiement
prend alors ce qu'il trouve — rien, ou pire, une version précédente encore
présente sous la même clé. Ce dernier cas est le vrai danger : **le pipeline est
vert et déploie l'ancien binaire.** Le défaut est rare, non reproductible, et
n'apparaît dans aucun journal comme une erreur.

La règle de conception qui en découle : un cache doit être **invalidable par une
clé qui change quand le contenu change** (l'empreinte du fichier de
verrouillage, pour des dépendances), et il ne doit jamais contenir quelque chose
qu'on ne saurait pas reconstruire. Un artefact, lui, est nommé par l'empreinte du
commit, publié une fois, et immuable.

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
