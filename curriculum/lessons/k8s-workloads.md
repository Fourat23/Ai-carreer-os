<!-- keep -->
# Leçon — Kubernetes : Pods, Deployments et workloads

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Kubernetes ne fait pas « tourner un conteneur » directement. On lui déclare plutôt
un **workload** — un objet qui dit « voilà ce que je veux faire tourner, et
comment ». Mais lequel choisir ? Une application web sans mémoire propre, une base de
données qui a besoin de son disque à elle, un agent présent sur chaque machine, une
tâche ponctuelle de nuit… ce ne sont pas les mêmes besoins, donc pas les mêmes
objets. Le débutant qui met une base dans le mauvais objet corrompt ses données au
premier déploiement. Cette leçon part du **Pod** (le plus petit grain) puis explique
quel workload choisir selon la nature de l'application.

## 🎯 Objectif
Connaître les objets qui font TOURNER les applications : le **Pod** (unité de
base), le **ReplicaSet** et le **Deployment** (réplication + rolling update), et
les workloads spécialisés (**DaemonSet**, **StatefulSet**, **Job/CronJob**).
Choisir le bon objet selon le besoin.

## 🧩 Prérequis
Vous devez comprendre l'idée centrale de Kubernetes — **état désiré** et **boucle de
réconciliation** — et l'architecture cluster/nœuds
(`/doc/lessons/k8s-why-architecture`), car un workload est justement une DÉCLARATION
d'état désiré que des contrôleurs maintiennent. Pod, Deployment, StatefulSet sont
définis ici.

## 🧠 Modèle mental
On n'exécute pas un « conteneur » directement dans Kubernetes : on déclare un
**workload** qui, lui, gère des Pods pour vous. Le Pod est le grain ; les objets
au-dessus (Deployment, DaemonSet…) sont des CONTRÔLEURS qui maintiennent le bon
nombre et la bonne version de Pods. On choisit le workload selon la nature de
l'application : sans état, avec état, une tâche par nœud, un traitement ponctuel.

## 📖 Explication complète
**Le Pod.** Plus petite unité déployable : un ou plusieurs conteneurs qui
PARTAGENT le réseau (même IP, mêmes ports) et éventuellement des volumes. La
plupart des Pods n'ont qu'un conteneur principal ; un conteneur secondaire
(sidecar) peut l'assister (proxy, collecte de logs). Un Pod est **éphémère et
jetable** : il peut être recréé à tout moment, avec une nouvelle IP. On ne
s'attache donc pas à un Pod précis.

**ReplicaSet.** Contrôleur qui maintient un NOMBRE de Pods identiques. On le
manipule rarement directement : il est géré par le Deployment.

**Deployment.** Le workload le plus courant pour une application **sans état**. Il
gère un ReplicaSet et orchestre les **rolling updates** : changer l'image dans le
Deployment déclenche un remplacement progressif des Pods (nouveaux montent,
anciens descendent), avec possibilité de **rollback** à la révision précédente.
C'est le pendant Kubernetes des stratégies de déploiement vues en CI/CD.

**DaemonSet.** Garantit UN Pod par nœud (ou par sous-ensemble de nœuds). Usage
typique : un agent d'infrastructure sur chaque machine (collecte de logs, métriques).

**StatefulSet.** Pour les applications **avec état** (bases, files) : identité
stable des Pods (noms ordonnés `-0`, `-1`), stockage persistant attaché à chaque
Pod, démarrage/arrêt ordonnés. À utiliser quand l'identité et les données par
instance comptent — plus complexe qu'un Deployment.

**Job et CronJob.** Un **Job** exécute une tâche jusqu'à COMPLÉTION (traitement
batch, migration) puis s'arrête — différent d'un service qui tourne en continu.
Un **CronJob** lance des Jobs selon une planification (comme cron).

**Labels et sélecteurs.** Les workloads retrouvent « leurs » Pods par
**labels** (étiquettes clé/valeur) via un **sélecteur**. C'est aussi ainsi que
les Services (leçon suivante) ciblent les Pods. Une erreur de label casse le lien
contrôleur↔Pods ou Service↔Pods.

## 🔧 Exemple — un Deployment sans état
```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: monapi }
spec:
  replicas: 3
  selector:
    matchLabels: { app: monapi }
  template:
    metadata:
      labels: { app: monapi }     # doit correspondre au selector
    spec:
      containers:
        - name: monapi
          image: monapi:1.4.2      # image épinglée (pas latest)
```
Changer `image` puis `kubectl apply` déclenche un rolling update ; `kubectl
rollout undo deploy/monapi` revient en arrière.

## 🧭 Exemple guidé — « sans état », et comment savoir si c'est vrai

Le tableau de correspondance — application sans état → Deployment, base de données →
StatefulSet — se retient en trente secondes et ne sert à rien. Il suppose la question
déjà résolue. **La vraie difficulté est de savoir si ton application est sans état**,
et presque tout le monde se trompe au moins une fois.

Prenons une API de bibliothèque, déployée en trois exemplaires derrière un Deployment.
Elle fonctionne. Puis trois symptômes apparaissent, à des semaines d'intervalle.

**Symptôme 1 — les utilisateurs sont déconnectés au hasard.** Un utilisateur se
connecte, navigue deux minutes, et se retrouve sur la page de connexion. Pas
systématiquement : environ deux fois sur trois.

Ce « deux fois sur trois » est l'indice, et il faut apprendre à le lire. Trois
exemplaires, une chance sur trois de retomber sur le bon : **la session est stockée en
mémoire dans le processus**. L'utilisateur n'est pas déconnecté, il parle à un autre
exemplaire qui ne le connaît pas.

L'application se croyait sans état. Elle ne l'était pas — elle l'était tant qu'elle
tournait en un seul exemplaire, ce qui masquait le problème.

La correction n'est pas de changer de type de workload. C'est de **sortir l'état du
processus** : sessions dans un magasin partagé, ou jeton signé porté par le client. Le
Deployment redevient légitime, parce que l'application est enfin réellement sans état.

**Symptôme 2 — les fichiers téléversés disparaissent.** Un bibliothécaire ajoute la
couverture d'un livre. Elle s'affiche. Le lendemain, l'image est cassée.

Même cause, autre visage : le fichier a été écrit sur le disque local du conteneur qui
a traité la requête. Ce disque disparaît avec le Pod, et les deux autres exemplaires ne
l'ont jamais eu. Là encore, la solution n'est pas le StatefulSet — c'est un stockage
externe, partagé, que tous les exemplaires voient.

**Symptôme 3 — le nettoyage nocturne s'exécute trois fois.** Une tâche planifiée dans
le code de l'application supprime les réservations périmées à 3 h du matin. Avec trois
exemplaires, elle part trois fois en parallèle. Aucun message d'erreur ; simplement, la
suppression se marche sur les pieds.

Ce troisième cas est le plus instructif, parce qu'il ne se corrige **pas** en
déplaçant l'état. Il se corrige en sortant le travail de l'application : un **CronJob**
lance un Pod dédié, une seule fois, à l'heure dite. « Ce qui doit s'exécuter une fois »
et « ce qui doit s'exécuter à chaque exemplaire » sont deux besoins différents ; les
mélanger dans le même processus les rend indistinguables.

### Le critère à emporter

Les trois symptômes ont la même racine, et elle est plus utile que le tableau de
correspondance :

> **Une application est sans état si tu peux détruire n'importe lequel de ses
> exemplaires, à n'importe quel moment, sans que personne ne s'en aperçoive.**

Applique le test mentalement avant de choisir un workload. Si la réponse est non,
cherche d'abord *ce qui est retenu dans le processus* — session, fichier, cache,
compteur, tâche planifiée. Dans la grande majorité des cas, la bonne réponse est de
faire disparaître cet état, pas de passer au StatefulSet.

### Quand le StatefulSet est réellement justifié

Il l'est quand l'état ne **peut pas** être externalisé, parce qu'il est la raison
d'être du programme : une base de données, un système de files, un moteur de recherche
indexant sur son propre disque. Ces logiciels ont besoin de trois choses qu'un
Deployment ne donne pas — une **identité stable** (`app-0` reste `app-0` après
redémarrage), un **volume attaché** à cette identité, et un **ordre** de démarrage et
d'arrêt.

Et une mise en garde honnête : faire tourner une base de données dans un cluster
demande de maîtriser la sauvegarde, la restauration et la réplication de ce moteur
précis. Beaucoup d'équipes qui déploient un StatefulSet de base de données auraient
mieux fait de prendre une base managée. Choisir le StatefulSet, c'est accepter d'être
l'administrateur de cette base.

### La panne bête, pour finir

Ton Deployment déclare `selector: app=biblio` et le modèle de Pod porte le label
`app: biblioteque`. Résultat : le contrôleur ne reconnaît pas ses propres Pods, en
recrée sans arrêt, et tu te retrouves avec des dizaines de Pods orphelins. Les labels
ne sont pas décoratifs — **c'est la seule ficelle qui relie un contrôleur à ce qu'il
pilote**, et une faute de frappe la coupe silencieusement.

## ⚠️ Erreurs fréquentes
- Traiter un Pod comme durable (il est jetable ; l'IP change).
- Utiliser un **Deployment** pour une base qui a besoin d'identité/stockage stables
  (→ StatefulSet).
- Labels du `template` ne correspondant PAS au `selector` → objet cassé.
- Lancer une tâche batch comme un service qui « ne s'arrête jamais » (→ Job).
- Oublier d'épingler l'image (`latest` → réplicas incohérents).

## 🔐 Sécurité
Chaque workload doit appliquer le moindre privilège au niveau Pod
(`securityContext` non-root, système de fichiers en lecture seule) — détaillé dans
la leçon sécurité K8s. Épingler les images (digest) évite qu'un rolling update
tire un contenu inattendu.

## 🏢 Cas métier
Une équipe a déployé une base via un Deployment : à chaque rolling update, les
Pods étaient recréés avec de nouvelles identités et le stockage se mélangeait,
corrompant les données. Migration vers un **StatefulSet** (identité + volume
persistant par Pod, ordre maîtrisé) : la base redevient fiable.

## 🎤 Questions d'entretien
- « Deployment vs StatefulSet ? » → sans état (Pods interchangeables) vs avec état
  (identité + stockage stables, ordre).
- « À quoi sert un Job ? » → exécuter une tâche jusqu'à complétion, puis s'arrêter.
- « Comment un contrôleur retrouve ses Pods ? » → via labels et sélecteur.

## ✍️ Mini-exercice — l'audit « sans état » d'une application réelle

**Contexte.** Prends une application que tu as écrite — ton API de bibliothèque, un
projet du parcours, n'importe quoi qui tourne. Elle tourne aujourd'hui en un seul
exemplaire.

**Ce que tu fais.** Applique le test de destruction et produis un **tableau à quatre
colonnes** :

| ce qui est retenu | où c'est stocké | ce qui casse à 3 exemplaires | où le déplacer |
|---|---|---|---|

Cherche au minimum dans ces six endroits, parce que ce sont ceux qu'on oublie :
sessions et authentification · fichiers téléversés · caches en mémoire · compteurs
et statistiques · tâches planifiées dans le code · connexions ouvertes de longue durée
(WebSocket, flux).

**Livrable.** Le tableau rempli, **plus** une dernière ligne : le workload que tu
choisis pour cette application, et la ligne du tableau qui te fait choisir celui-là.

**Critère de réussite.** Vérifiable seul : pour chaque ligne, tu dois pouvoir écrire
le symptôme que verrait un utilisateur — pas « ça ne marchera pas », mais « il sera
déconnecté environ deux fois sur trois ». Si tu n'arrives pas à décrire le symptôme,
c'est que tu n'as pas identifié où l'état vit.

**Piège.** Si ton tableau est vide, ce n'est pas forcément que l'application est sans
état : vérifie d'abord les tâches planifiées et les fichiers écrits sur disque. Ce sont
les deux que l'on ne voit jamais tant qu'on est en un seul exemplaire.

## ✅ Correction attendue

**La démarche.** Le test se fait toujours dans le même ordre, du plus visible au plus
discret : ce que l'utilisateur perd (session, fichier), puis ce que l'application perd
(cache, compteur), puis ce qui se **duplique** (tâches planifiées) — cette dernière
catégorie étant la seule dont le symptôme n'est pas une perte mais une répétition.

**Les six endroits, et le symptôme attendu pour chacun.**

| ce qui est retenu | symptôme à 3 exemplaires | où le déplacer |
|---|---|---|
| session en mémoire | déconnexion ~2 fois sur 3 | magasin de sessions partagé, ou jeton signé |
| fichier écrit sur le disque local | image cassée après redéploiement | stockage objet externe |
| cache en mémoire | taux de succès du cache divisé par 3, latence en dents de scie | cache partagé, ou cache local assumé |
| compteur / statistique | chiffres faux, dépendants de l'exemplaire interrogé | base de données ou système de métriques |
| tâche planifiée dans le code | exécution en triple, résultats qui se chevauchent | CronJob dédié |
| connexion longue durée | l'utilisateur ne reçoit pas les messages émis par un autre exemplaire | bus de messages ou serveur dédié |

**Pourquoi ce raisonnement fonctionne.** Il ne demande pas de connaître Kubernetes. Il
demande de savoir **où vit chaque information** — et c'est la même question que celle
posée par le passage à plusieurs serveurs derrière un répartiteur de charge, bien
avant les conteneurs. Kubernetes n'a pas créé ce problème, il l'a rendu quotidien en
rendant la multiplication des exemplaires banale.

**L'erreur probable, et elle a l'air raisonnable.** Beaucoup répondent StatefulSet dès
qu'ils trouvent un état. C'est confondre *avoir de l'état* et *avoir un état qui doit
rester attaché à un exemplaire précis*. Une session utilisateur a de l'état, mais elle
n'appartient à aucun exemplaire — n'importe lequel doit pouvoir la lire. Le
StatefulSet ne se justifie que quand l'exemplaire **lui-même** doit être identifiable
et retrouver **son** disque : une base de données, une file, un moteur d'indexation.

Prendre un StatefulSet pour une API web « parce qu'elle a des sessions » produit une
architecture plus complexe, plus difficile à mettre à jour, et qui ne résout pas le
problème — les sessions resteront inaccessibles aux autres exemplaires.

**Les indices qui font reconnaître ce type de problème.** Trois formulations
reviennent toujours dans les rapports de bug, et chacune désigne la même famille de
causes : « ça marche une fois sur deux/trois », « ça remarche si je recharge », « ça
ne le fait qu'en production ». Les trois disent la même chose — **plusieurs
exemplaires, et un état qui n'est pas partagé**. Le nombre au dénominateur (« une fois
sur trois ») te donne même gratuitement le nombre d'exemplaires.

**Quand la réponse changerait.** Si l'application ne tourne qu'en un seul exemplaire et
qu'aucune montée en charge n'est prévue, tout ceci est théorique et un Deployment à
un réplica suffit. Le raisonnement redevient nécessaire dès qu'on veut **deux** choses
banales : survivre au redémarrage d'une machine, ou déployer sans coupure. Les deux
imposent d'avoir, au moins transitoirement, deux exemplaires en vie.

## 🧾 À retenir
- Pod = unité jetable ; on déclare des workloads qui gèrent les Pods.
- Deployment (sans état, rolling update, rollback) ; StatefulSet (avec état) ;
  DaemonSet (par nœud) ; Job/CronJob (tâches).
- Labels + sélecteurs lient contrôleurs et Services aux Pods.
- Épingler les images ; appliquer le moindre privilège au Pod.

## 📚 Vocabulaire
**Pod** · **sidecar** · **ReplicaSet** · **Deployment** · **rolling update /
rollback** · **DaemonSet** · **StatefulSet** · **Job / CronJob** · **label /
sélecteur**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je choisis le workload adapté (état, tâche, par nœud).
- [ ] Je comprends que les Pods sont jetables.
- [ ] Je relie contrôleurs et Services aux Pods par labels.

## 🔗 Liens avec le programme
Mois 11 (orchestration). Leçons liées : `/doc/lessons/k8s-why-architecture`,
`/doc/lessons/k8s-networking-services`, `/doc/lessons/k8s-config-probes`. Les
workloads produisent les Pods que le réseau expose et que les probes surveillent.
