<!-- keep -->
# Leçon — Kubernetes : pourquoi et architecture

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Vous savez lancer un conteneur, et même plusieurs avec Docker Compose, sur UNE
machine. Mais en vrai : et si la machine tombe ? et s'il faut 20 exemplaires de
l'appli répartis sur 10 machines ? et si un conteneur crashe à 3 h du matin — qui le
relance ? Le faire à la main sur un parc de serveurs est impossible. **Kubernetes**
est le robot qui s'en charge : vous lui DÉCRIVEZ ce que vous voulez (« je veux 3
exemplaires sains, joignables »), et il travaille en permanence pour que la réalité
corresponde à votre demande — il recrée ce qui tombe, répartit, remplace sans
coupure. Avant de toucher au moindre bouton, cette leçon fait comprendre CETTE idée
centrale (« décrire l'état voulu, le robot s'en occupe ») et qui fait quoi dans le
système. Sans elle, tout le reste paraît magique et incompréhensible.

## 🎯 Objectif
Comprendre le PROBLÈME que Kubernetes résout (faire tourner des conteneurs à
l'échelle, de façon résiliente et automatisée) et son idée centrale : la
**boucle de réconciliation** vers un **état désiré**. Poser l'architecture
(control plane vs nœuds) avant de manipuler des objets.

## 🧩 Prérequis
Vous devez être à l'aise avec les **conteneurs** et avoir vu **Docker Compose**
(décrire une appli multi-conteneurs — `/doc/lessons/docker-compose`) ainsi que le
**durcissement** (`/doc/lessons/docker-production-hardening`), car Kubernetes
orchestre des conteneurs et pousse plus loin l'idée déclarative de Compose. Les
termes cluster, nœud, Pod, état désiré/observé sont introduits ici.

## 🧠 Modèle mental
Avec Docker Compose, vous décrivez un état sur UNE machine et vous le lancez.
Kubernetes généralise cette idée à un **parc de machines** et ajoute
l'**auto-réparation** : vous DÉCLAREZ « je veux 3 exemplaires de cette
application, sains, joignables », et un système corrige EN PERMANENCE l'écart
entre ce désir et la réalité. Kubernetes n'exécute pas des commandes, il POURSUIT
un état. Ce glissement — d'« ordres impératifs » à « état désiré réconcilié » —
est la clé de tout le reste.

## 📖 Explication complète
**Le problème.** À l'échelle, on veut : répartir des conteneurs sur plusieurs
machines, remplacer ceux qui tombent, monter/descendre en capacité, déployer sans
coupure, router le trafic vers les instances saines. Le faire à la main est
intenable ; Kubernetes automatise ces tâches.

**Boucle de réconciliation.** Le cœur conceptuel : des **contrôleurs** comparent
sans cesse l'état DÉSIRÉ (ce que vous avez déclaré) à l'état OBSERVÉ (ce qui
tourne) et agissent pour les rapprocher. Si un conteneur meurt, l'écart apparaît
et le contrôleur en recrée un. C'est pourquoi on ne « redémarre » pas
manuellement : on corrige la déclaration, le système converge.

**Architecture — control plane.** Le **plan de contrôle** est le cerveau :
- **API server** : la porte d'entrée unique ; tout passe par lui (kubectl, les
  contrôleurs). Il valide et stocke les objets.
- **etcd** : la base clé-valeur qui stocke l'état désiré (la source de vérité).
- **scheduler** : décide sur quel nœud placer un nouveau Pod (selon ressources,
  contraintes).
- **controller manager** : héberge les boucles de réconciliation.

**Architecture — nœuds (workers).** Les machines qui exécutent réellement les
conteneurs :
- **kubelet** : l'agent sur chaque nœud ; il lance les conteneurs demandés et
  rapporte leur état à l'API server.
- **runtime de conteneurs** : exécute effectivement les conteneurs.
- **kube-proxy** : gère la connectivité réseau des Services sur le nœud.

**kubectl et l'API déclarative.** On interagit via `kubectl` qui parle à l'API
server. On applique des **manifestes** YAML décrivant les objets voulus
(`kubectl apply -f`). L'impératif (`kubectl run`) existe mais le mode
professionnel est déclaratif et versionné (GitOps).

**Ce que Kubernetes n'est PAS.** Ce n'est pas une VM ni une couche d'isolation
matérielle : les conteneurs partagent toujours le noyau du nœud. Ce n'est pas
magique non plus — mal configuré, il reproduit les mêmes pannes, en plus
distribué.

## 🔧 Repères pratiques
```bash
kubectl get nodes                 # les machines du cluster (exemple, non exécuté ici)
kubectl get pods -A               # tous les Pods, tous les namespaces
kubectl apply -f deployment.yaml  # déclarer l'état désiré
kubectl get deploy monapi -o yaml # état désiré + état observé (status)
```
Tout objet a un `spec` (désiré) et un `status` (observé) : lire les deux, c'est
lire l'écart que la boucle cherche à combler.

## 🧭 Exemple guidé — « pourquoi mon Pod revient après que je l'ai supprimé ? »
1. Vous supprimez un Pod géré par un Deployment.
2. L'état désiré dit « 3 réplicas » ; l'observé tombe à 2 : un écart apparaît.
3. Le contrôleur recrée un Pod pour revenir à 3. C'est voulu, pas un bug.
4. Pour vraiment réduire, on change la DÉCLARATION (`replicas: 2`), pas le Pod.

## ⚠️ Erreurs fréquentes
- Raisonner en **impératif** (« je lance/j'arrête ») au lieu de déclaratif (« je
  déclare l'état »).
- Supprimer un Pod en pensant l'« arrêter » (le contrôleur le recrée).
- Croire que Kubernetes isole comme une VM (noyau partagé).
- Modifier des objets à la main sans versionner les manifestes.
- Attendre de la « magie » : sans ressources/probes correctes, ça casse pareil.

## 🔐 Sécurité
L'**API server** est la porte centrale : son accès doit être strictement contrôlé
(authentification, autorisation — cf. leçon sécurité K8s). `etcd` contient toute
la vérité du cluster, secrets compris : sa protection est critique. Rappel :
l'isolation reste applicative (namespaces/cgroups), pas une frontière VM.

## 🏢 Cas métier
Une équipe migrant de Compose « redémarrait » des Pods à la main en incident, en
vain : ils revenaient. En comprenant la réconciliation, elle bascule sur des
manifestes versionnés : on corrige l'état désiré (image, réplicas, ressources) et
le cluster converge. Les interventions manuelles disparaissent.

## 🎤 Questions d'entretien
- « Quel est le principe central de Kubernetes ? » → réconcilier l'état observé
  vers l'état désiré via des contrôleurs.
- « Control plane vs nœuds ? » → cerveau (API server, etcd, scheduler,
  controllers) vs machines d'exécution (kubelet, runtime, kube-proxy).
- « Pourquoi un Pod supprimé réapparaît ? » → un contrôleur maintient le nombre de
  réplicas désiré.

## ✍️ Mini-exercice
Vous voulez passer de 3 à 2 exemplaires d'une app gérée par un Deployment.
Supprimez-vous un Pod ? → non : on modifie la déclaration (`replicas: 2`), sinon
le contrôleur recrée le Pod supprimé.

## 🧾 À retenir
- Kubernetes poursuit un ÉTAT DÉSIRÉ ; il ne fait pas qu'exécuter des commandes.
- Boucle de réconciliation = auto-réparation et scaling déclaratif.
- Control plane (API server, etcd, scheduler, controllers) vs nœuds (kubelet,
  runtime, kube-proxy).
- Tout objet a `spec` (désiré) et `status` (observé) ; on pilote en déclaratif.

## 📚 Vocabulaire
**état désiré / observé** · **boucle de réconciliation** · **contrôleur** ·
**control plane** · **API server** · **etcd** · **scheduler** · **kubelet** ·
**kube-proxy** · **manifeste / kubectl apply**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'explique la réconciliation vers l'état désiré.
- [ ] Je situe les composants du control plane et des nœuds.
- [ ] Je raisonne en déclaratif (manifestes) plutôt qu'en impératif.

## 🔗 Liens avec le programme
Mois 11 (orchestration). Leçons liées : `/doc/lessons/k8s-workloads`,
`/doc/lessons/k8s-networking-services`, `/doc/lessons/docker-compose`. La
réconciliation sous-tend les workloads, le réseau et le troubleshooting K8s.
