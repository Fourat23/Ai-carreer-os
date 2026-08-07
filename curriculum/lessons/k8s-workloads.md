<!-- keep -->
# Leçon — Kubernetes : Pods, Deployments et workloads

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

## 🧭 Exemple guidé — choisir le bon workload
1. Application web sans état, plusieurs exemplaires → **Deployment**.
2. Base de données avec stockage par instance → **StatefulSet**.
3. Agent présent sur chaque nœud → **DaemonSet**.
4. Migration ponctuelle → **Job** ; nettoyage nocturne → **CronJob**.

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

## ✍️ Mini-exercice
Vous devez faire tourner un agent de collecte de logs sur CHAQUE nœud. Quel
workload ? → un DaemonSet (un Pod par nœud).

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
