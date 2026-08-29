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

## 🧭 Exemple guidé — trois choses qui « ne marchent pas », et une seule explication

Kubernetes déroute au début parce qu'il ne fait pas ce qu'on lui demande — il fait ce
qu'on lui **déclare**. La différence est immense, et trois situations banales suffisent
à la rendre évidente.

### Situation 1 — le Pod qui ressuscite

Tu supprimes un Pod. Deux secondes plus tard, il est de retour, avec un nom différent.
Tu recommences. Il revient encore.

Le réflexe est de chercher qui le relance. Le geste utile est de **regarder l'écart** :

```
kubectl get deploy monapi
NAME     READY   UP-TO-DATE   AVAILABLE
monapi   3/3     3            3
```

Ce `3/3` se lit *« trois observés sur trois désirés »*. Tu viens d'en supprimer un,
donc pendant un instant l'observé est tombé à 2 pendant que le désiré restait à 3. Un
contrôleur a vu l'écart, et il a fait la seule chose qu'il sait faire : le combler.

**Personne n'a « relancé » ton Pod.** Un programme a comparé deux nombres et agi.
C'est la boucle de réconciliation, et c'est tout Kubernetes en une phrase : *quelqu'un
compare en permanence ce que tu as déclaré à ce qui tourne, et rapproche les deux.*

Pour réduire réellement, on ne touche pas au Pod — on change la **déclaration** :
`replicas: 2`. Le contrôleur constatera alors un écart dans l'autre sens et supprimera
un Pod de lui-même.

### Situation 2 — la modification qui disparaît

Tu corriges une variable d'environnement directement sur un Pod, avec
`kubectl edit pod`. Ça marche. Le lendemain, la valeur est revenue à l'ancienne.

Même mécanisme, conséquence plus grave. Ton Pod a été recréé — mise à jour, panne de
nœud, peu importe — et il a été recréé **à partir du modèle déclaré dans le
Deployment**, qui ne contenait pas ta correction. Ta modification n'a jamais existé
pour le système : elle vivait sur un objet éphémère.

La règle qui en découle est la plus importante du sujet : **ce qui n'est pas dans la
déclaration n'existe pas durablement.** C'est aussi ce qui rend le mode déclaratif
intéressant — la déclaration est un fichier, donc versionnable dans Git, donc
relisible, donc opposable. Une correction faite à la main sur un objet vivant est
invisible pour l'équipe et disparaîtra sans prévenir.

### Situation 3 — `kubectl apply` réussit, et rien ne se passe

Tu appliques ton manifeste. La commande affiche `configured`. Mais l'application ne
change pas.

Ici, il faut comprendre **qui fait quoi** dans l'architecture, sinon on cherche au
mauvais endroit. Quand tu lances `kubectl apply` :

1. `kubectl` envoie ton objet à l'**API server**, la seule porte d'entrée ;
2. l'API server le valide et l'écrit dans **etcd**, la mémoire du cluster ;
3. à ce stade, `configured` s'affiche — **et rien n'a encore tourné**. Tu as seulement
   changé une intention ;
4. un **contrôleur** remarque ensuite l'écart et décide d'agir ;
5. le **scheduler** choisit sur quelle machine placer les nouveaux Pods ;
6. le **kubelet** de cette machine lance réellement les conteneurs.

`configured` signifie donc « ton intention est enregistrée », pas « c'est fait ». Si
rien ne se passe, l'échec est à l'une des étapes 4 à 6, et chacune se diagnostique
différemment : aucun Pod créé oriente vers le contrôleur, des Pods en `Pending` vers
le scheduler (souvent : pas assez de ressources sur les nœuds), des Pods créés mais
qui ne démarrent pas vers le kubelet et l'image.

**C'est la raison pratique d'apprendre l'architecture.** Pas pour réciter les noms des
composants en entretien, mais pour savoir, quand quelque chose ne se produit pas,
**lequel des six maillons interroger**.

### La lecture qui résume tout

Chaque objet Kubernetes a deux parties : `spec` — ce que tu veux — et `status` — ce
qui est. Le système passe son temps à réduire la distance entre les deux.

```bash
kubectl get deploy monapi -o yaml   # lire les DEUX, pas seulement spec
```

Quand quelque chose te surprend, la première question n'est jamais « quelle commande
taper ? » mais : **quel est l'écart, et qui est censé le combler ?**

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

## ✍️ Mini-exercice — écrire la chaîne de responsabilité de six pannes

**Contexte.** Tu n'as pas besoin d'un cluster pour cet exercice. Il porte sur le
raisonnement, qui est ce qui manque le jour où le cluster est en panne.

**Ce que tu produis.** Pour chacune des six situations ci-dessous, écris trois choses :
(a) **quel écart** existe entre le désiré et l'observé — ou s'il n'y en a pas ;
(b) **quel composant** est censé le combler — API server, etcd, scheduler, contrôleur,
kubelet, kube-proxy ; (c) **la première commande** que tu taperais, et surtout **ce que
tu espères y lire**.

1. `kubectl apply` répond `configured`, aucun nouveau Pod n'apparaît.
2. Trois Pods sont en état `Pending` depuis dix minutes.
3. Un Pod redémarre en boucle, compteur de redémarrages à 47.
4. Tu supprimes un Deployment ; ses Pods survivent quelques secondes.
5. Un Pod tourne, mais aucune requête ne l'atteint.
6. `kubectl get nodes` montre un nœud en `NotReady`, et les Pods qui y tournaient
   n'ont **pas** été recréés ailleurs.

**Livrable.** Un tableau de six lignes × trois colonnes.

**Critère de réussite.** Pour chaque ligne, la colonne (c) doit préciser *ce que tu
espères lire*, pas seulement la commande. « `kubectl describe pod` » ne vaut rien ;
« `kubectl describe pod` pour lire la section Events, où le scheduler écrit pourquoi
il n'a pas pu placer le Pod » vaut tout.

**Piège.** Une des six situations n'est pas un écart mais un **délai normal**, et une
autre a une cause qui ne se trouve pas du tout dans le composant qu'on soupçonne
d'abord. Ne force pas six diagnostics différents s'il n'y en a pas six.

## ✅ Correction attendue

**La démarche, valable pour les six.** Toujours dans cet ordre : *y a-t-il un écart ?*
→ *qui est chargé de le combler ?* → *ce composant a-t-il essayé ?* Cette troisième
question est celle qu'on saute, et c'est presque toujours là que se trouve la réponse :
un composant qui a essayé et échoué **écrit pourquoi**, dans les `Events` de l'objet.

**1. `configured` sans nouveau Pod.** Écart : aucun, probablement. `configured`
signifie que l'API server a accepté et stocké ton objet, pas que quelque chose a
tourné. Si ta modification ne touche pas le modèle de Pod — une annotation, un
libellé sur le Deployment lui-même — **aucun Pod n'a de raison d'être recréé**, et le
système a raison. Composant : aucun en défaut. Commande : `kubectl get deploy -o yaml`
pour comparer `spec` et `status`, et vérifier si `observedGeneration` a suivi.

**2. Pods en `Pending`.** Écart : oui, désiré 3, observé 0 en exécution. Composant :
le **scheduler**, qui n'a trouvé aucun nœud acceptable. Commande :
`kubectl describe pod` et lire les `Events` — le scheduler y écrit sa raison en clair,
le plus souvent « Insufficient cpu » ou « Insufficient memory ». C'est le cas le plus
fréquent et le plus mal diagnostiqué : on soupçonne l'image ou le réseau alors que le
Pod n'a même pas été placé.

**3. Redémarrages en boucle.** Écart : oui. Composant : le **kubelet**, qui lance bien
le conteneur — donc le placement a réussi, ce qui élimine déjà le scheduler. Le
conteneur s'arrête tout seul. Commande : `kubectl logs <pod> --previous`, avec
`--previous` qui est le point clé : sans lui, tu lis les journaux du conteneur actuel,
qui vient de démarrer et n'a rien à dire. **La cause est dans l'exécution précédente.**

**4. Pods qui survivent quelques secondes.** Écart : transitoire. Aucun composant en
défaut — c'est l'arrêt gracieux : Kubernetes envoie un signal de terminaison et
attend un délai avant de forcer. Le même mécanisme que le `SIGTERM` puis `SIGKILL` d'un
processus ordinaire. C'est la situation où il **n'y a rien à réparer**, et savoir
l'identifier évite d'aller chercher un problème inexistant.

**5. Pod sain, aucune requête.** Écart : aucun côté workload — le Pod tourne, le
contrôleur est satisfait. Le problème est ailleurs : le Service ne trouve pas ce Pod.
Composant : **kube-proxy** et la définition du Service, mais la cause est presque
toujours un **sélecteur de labels** qui ne correspond pas. Commande :
`kubectl get endpoints <service>` — une liste vide prouve que le Service ne pointe sur
rien, et déplace le diagnostic du réseau vers les libellés en trois secondes.

**6. Nœud `NotReady`, Pods non recréés.** C'est la question la plus subtile, et la
réponse surprend : le comportement est **normal**, au moins pendant plusieurs minutes.
Le plan de contrôle ne peut pas distinguer un nœud mort d'un nœud temporairement
injoignable. Recréer immédiatement les Pods risquerait de les faire tourner en double
si le nœud revient. Il attend donc un délai avant de considérer les Pods comme perdus.
Composant : le **controller manager**, et il fait exactement son travail. Ce cas
enseigne quelque chose de général sur les systèmes distribués : **on ne peut pas
distinguer « mort » de « lent »**, et tout système qui prétend le contraire fait un
pari.

**L'erreur probable, et elle vient d'une bonne habitude.** Le réflexe hérité des
serveurs classiques est de redémarrer, supprimer, relancer à la main. Ici, chacun de ces
gestes est soit annulé par la boucle de réconciliation, soit invisible pour l'équipe
parce qu'il n'est écrit nulle part. **On ne répare pas un objet, on corrige une
déclaration.**

**Comment reconnaître ce type de problème.** Chaque fois que quelque chose « revient
tout seul » ou « ne se produit pas alors que la commande a réussi », tu es devant un
écart entre déclaration et réalité. La question n'est jamais « quel outil ? » mais
« quel écart, et qui le comble ? ».

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
