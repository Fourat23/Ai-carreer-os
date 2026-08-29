<!-- keep -->
# Leçon — Kubernetes : réseau, Services et Ingress

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Les Pods sont **jetables** : Kubernetes en crée et en détruit sans cesse, et à
chaque fois leur adresse change. Alors comment un composant peut-il en joindre un
autre de façon fiable, si l'adresse bouge tout le temps ? On ne peut pas s'appuyer
sur l'adresse d'un Pod précis. La réponse est le **Service** : une adresse STABLE
posée devant un groupe de Pods, qui répartit le trafic vers ceux qui sont en bonne
santé — exactement le rôle d'un load balancer interne. Cette leçon résout ce
problème (« joindre une cible mouvante ») puis montre comment exposer proprement une
application au monde extérieur avec l'Ingress.

## 🎯 Objectif
Comprendre comment on JOINT des Pods qui vont et viennent : le **Service** comme
adresse stable, ses types (**ClusterIP**, **NodePort**, **LoadBalancer**), la
**découverte par DNS** interne, et l'**Ingress** pour le routage HTTP L7. Relier
ces objets au modèle réseau appris précédemment.

## 🧩 Prérequis
Vous devez savoir ce qu'est un **Pod** et un **workload**
(`/doc/lessons/k8s-workloads`), et avoir la carte du **réseau** et du **load
balancing L4/L7** (`/doc/lessons/networking-tcp-ip-model`,
`/doc/lessons/networking-proxy-loadbalancing`), car un Service EST un répartiteur et
l'Ingress un reverse proxy L7. Les notions ClusterIP/NodePort/LoadBalancer et
endpoints sont définies ici.

## 🧠 Modèle mental
Les Pods sont jetables : leurs IP changent. On ne peut donc pas s'y connecter
directement de façon durable. Le **Service** est une **adresse stable** posée
DEVANT un ensemble de Pods (sélectionnés par labels) : il répartit le trafic vers
les Pods sains, quels que soient ceux du moment. C'est exactement le rôle d'un
load balancer interne — au niveau transport — appliqué au monde mouvant des Pods.

## 📖 Explication complète
**Le Service et les endpoints.** Un Service cible des Pods par **sélecteur de
labels**. Kubernetes maintient la liste des **endpoints** (les IP des Pods sains
correspondants) et répartit le trafic entre eux. Quand un Pod meurt/naît, la liste
se met à jour automatiquement — l'appelant garde la même adresse de Service.

**Types de Service.**
- **ClusterIP** (défaut) : IP interne au cluster ; joignable seulement DEPUIS le
  cluster. C'est le cas courant pour la communication service-à-service.
- **NodePort** : ouvre un port sur chaque nœud ; joignable de l'extérieur via
  `IP_du_nœud:port`. Rudimentaire, surtout pour du test/dépannage.
- **LoadBalancer** : demande au cloud un load balancer externe qui pointe vers le
  Service. C'est le point d'entrée public managé (dépend du fournisseur cloud).

**Découverte par DNS.** Le cluster fournit un DNS interne : un Service `api` dans
le namespace `prod` est joignable par nom (`api` dans le même namespace, ou
`api.prod.svc.cluster.local` complet). Les applications se parlent par NOM de
Service, jamais par IP de Pod — même logique que le DNS de service vu avec Docker.

**Ingress.** Un Service `LoadBalancer` par application deviendrait coûteux et
limité au niveau transport. L'**Ingress** est un **reverse proxy L7** partagé : un
point d'entrée unique qui route le HTTP selon l'**hôte** et le **chemin**
(`api.exemple.test` → Service api, `/` → Service front), gère la **terminaison
TLS** et les redirections. Il nécessite un **Ingress controller** (nginx, Traefik…)
qui réalise concrètement le routage. C'est le pendant K8s du reverse proxy/L7 vu
en réseau.

**Correspondance avec le modèle réseau.** Service = répartition niveau transport
(comme un load balancer L4) ; Ingress = routage niveau application (L7). Les
**probes** (leçon config/probes) déterminent quels Pods sont « sains » et donc
inclus comme endpoints — un Pod non prêt est retiré de la rotation.

## 🔧 Exemple — Service ClusterIP + Ingress
```yaml
apiVersion: v1
kind: Service
metadata: { name: api }
spec:
  selector: { app: monapi }     # cible les Pods portant ce label
  ports:
    - port: 80
      targetPort: 3000          # port du conteneur
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: web }
spec:
  rules:
    - host: api.exemple.test
      http:
        paths:
          - path: /
            pathType: Prefix
            backend: { service: { name: api, port: { number: 80 } } }
```
L'app cliente joint `http://api` (DNS interne) ; l'extérieur passe par l'Ingress.

## 🧭 Exemple guidé — remonter une chaîne de six maillons en trois commandes

« Le service ne répond pas » est le rapport de bug le plus fréquent d'un cluster, et le
moins informatif. Entre l'appelant et le conteneur qui doit répondre, il y a **six
maillons**, et chacun a son symptôme propre :

```
nom DNS  →  Service  →  sélecteur  →  Pod prêt  →  targetPort  →  processus qui écoute
```

L'erreur de méthode consiste à les tester dans le désordre, ou à commencer par le plus
spectaculaire. La bonne méthode élimine la moitié de la chaîne en **une** commande.

### Commande 1 — celle qui coupe le problème en deux

```bash
kubectl get endpoints api
```

Le résultat ne peut prendre que deux formes, et chacune ferme définitivement une moitié
de la chaîne.

```
NAME   ENDPOINTS
api    <none>                                  ← moitié GAUCHE
api    10.244.1.7:8080,10.244.2.4:8080         ← moitié DROITE
```

Un objet `Endpoints` est la liste, tenue à jour automatiquement, des Pods qu'un Service
considère comme utilisables. **Vide**, le problème est en amont : le Service ne trouve
aucun Pod. **Rempli**, le Service sait à qui parler, et l'erreur est en aval.

Faire cette vérification en premier évite l'erreur la plus coûteuse du sujet : passer
une heure sur le DNS et les règles réseau alors qu'une faute de frappe dans un libellé
empêchait toute mise en relation.

### Cas A — la liste est vide

Deux causes, dans cet ordre de fréquence.

**Le sélecteur ne correspond pas.** Le Service cherche `app=api`, les Pods portent
`app: api-service`. Vérification directe :

```bash
kubectl get pods --selector app=api
```

Zéro résultat confirme le diagnostic en trois secondes. C'est de loin la cause la plus
fréquente, et elle ne produit **aucun message d'erreur** : un Service dont le sélecteur
ne correspond à rien est parfaitement valide du point de vue du système.

**Les Pods ne sont pas prêts.** Ils existent, le sélecteur est bon, mais leur sonde de
disponibilité échoue — et **un Pod non prêt n'entre pas dans la liste**. C'est voulu :
c'est exactement le mécanisme qui évite d'envoyer du trafic à un Pod incapable de le
traiter. Le diagnostic bascule alors sur la sonde, pas sur le réseau.

### Cas B — la liste est remplie

Le Service connaît ses Pods, et pourtant l'appel échoue. Deux maillons restent.

**Le mauvais port de destination.** C'est la confusion la plus classique du sujet, parce
que le vocabulaire ne se retient pas :

```yaml
ports:
  - port: 80          # le port du SERVICE : ce que l'appelant utilise
    targetPort: 8080  # le port du CONTENEUR : là où le processus écoute
```

Si le conteneur écoute en réalité sur 3000, le Service transmet consciencieusement vers
8080, où personne n'écoute. Symptôme : refus de connexion **immédiat**, et non délai
d'attente — la machine répond activement qu'il n'y a personne. C'est la même lecture
que dans la leçon réseau : *un refus instantané est une réponse, un long silence est un
blocage.*

**Le nom DNS.** À l'intérieur du cluster, un Service est joignable par son nom court
depuis le même espace de noms, et par son nom complet `api.production.svc.cluster.local`
depuis ailleurs. Appeler `api` depuis un autre espace de noms échoue à la résolution —
symptôme différent, et facile à distinguer : le nom ne se résout pas, il n'y a même pas
de tentative de connexion.

### La méthode, en une phrase

**Trouve d'abord le maillon qui coupe la chaîne en deux, puis dichotomie.** Cette
démarche vaut bien au-delà de Kubernetes : devant une chaîne d'appels, on ne teste pas
les maillons dans l'ordre, on cherche celui qui divise l'espace de recherche.

### La question de conception qu'on oublie de poser

Un Service en mode `ClusterIP` n'est joignable **que depuis l'intérieur** du cluster.
C'est le mode par défaut, et c'est souvent une surprise : « le service répond
parfaitement depuis un autre Pod, mais je ne l'atteins pas depuis mon poste ».

Il n'y a rien de cassé. Exposer vers l'extérieur est une **décision distincte** —
`NodePort`, `LoadBalancer`, ou un Ingress au-dessus — et le fait qu'elle soit distincte
est une bonne chose : la majorité des services d'une application n'ont aucune raison
d'être joignables depuis Internet. **Le défaut fermé est ici la bonne valeur par
défaut.**

## ⚠️ Erreurs fréquentes
- **Sélecteur/labels qui ne correspondent pas** → Service sans endpoints (silence).
- Se connecter à une **IP de Pod** au lieu du nom de Service (l'IP change).
- Confondre `port` (du Service) et `targetPort` (du conteneur).
- Créer un `LoadBalancer` par service au lieu d'un **Ingress** partagé.
- Oublier qu'un Pod non **Ready** est retiré des endpoints.

## 🔐 Sécurité
Par défaut, tout Pod peut joindre tout Service dans le cluster : on restreint avec
des **NetworkPolicies** (leçon sécurité K8s). N'exposer à l'extérieur que le
nécessaire (Ingress/LoadBalancer) ; garder les Services internes en ClusterIP. La
terminaison TLS se fait à l'Ingress (certificat géré là).

## 🏢 Cas métier
Un Service « ne marchait pas » : `kubectl get endpoints` le montrait VIDE. Cause :
le sélecteur `app: api` ne correspondait pas au label réel des Pods (`app:
monapi`). Correction du label : les endpoints se peuplent, le trafic passe. Le
réflexe « endpoints vides = problème de labels/readiness » a fait gagner des
heures.

## 🎤 Questions d'entretien
- « Pourquoi un Service et pas l'IP d'un Pod ? » → les Pods sont jetables ; le
  Service offre une adresse stable + répartition.
- « ClusterIP vs LoadBalancer ? » → interne au cluster vs point d'entrée externe
  managé par le cloud.
- « Rôle de l'Ingress ? » → reverse proxy L7 partagé (routage HTTP par hôte/chemin,
  TLS).

## ✍️ Mini-exercice — cinq pannes, une méthode

**Contexte.** Cinq incidents distincts, sur le même cluster. Pour chacun, on te donne
le symptôme exact tel que l'appelant le voit.

| # | symptôme observé par l'appelant |
|---|---|
| 1 | `could not resolve host: api` |
| 2 | `connection refused` **immédiatement** |
| 3 | délai d'attente dépassé après 30 s, aucune réponse |
| 4 | ça marche depuis un Pod du même espace de noms, pas depuis un autre |
| 5 | ça marche **deux fois sur trois**, la troisième échoue |

**Ce que tu produis.** Pour chacun : (a) la **première commande** que tu lances et **ce
que tu espères y lire** ; (b) les hypothèses que le résultat élimine ; (c) la cause la
plus probable ; (d) la correction précise.

**Livrable.** Un tableau de cinq lignes × quatre colonnes.

**Critère de réussite.** Vérification à faire seul : pour au moins trois des cinq, ta
première commande doit **éliminer plus d'une hypothèse à la fois**. Si chacune de tes
commandes ne teste qu'une chose, tu descends la chaîne au lieu de la couper en deux —
et ce sera trois fois plus long le jour de l'incident.

**Piège.** Deux des cinq symptômes ne sont **pas** des problèmes de Service. Repère-les
et dis à quelle leçon du parcours ils appartiennent.

## ✅ Correction attendue

**La démarche, commune aux cinq.** Le symptôme dit déjà à quelle **couche** on s'est
arrêté, avant même de lancer une commande. Un nom qui ne se résout pas n'a jamais
atteint le réseau. Un refus immédiat prouve qu'on a atteint une machine. Un long
silence prouve que quelque chose absorbe les paquets. **Lire le symptôme avant de taper
une commande est la moitié du diagnostic.**

**1. `could not resolve host`.** Couche DNS, on n'a même pas essayé de se connecter.
Commande : `kubectl get svc api` — j'espère y lire que le Service existe. S'il n'existe
pas, c'est réglé. S'il existe, c'est le nom utilisé qui est incomplet : il faut le nom
complet depuis un autre espace de noms. Élimine d'un coup : sélecteurs, ports, sondes,
règles réseau — rien de tout cela n'a été atteint.

**2. `connection refused` immédiat.** On a joint une machine, qui a activement répondu
qu'il n'y a personne sur ce port. Commande : `kubectl get endpoints api` — j'espère
voir une liste **remplie**, ce qui confirmerait que le Service trouve ses Pods et
déplacerait le problème sur le port. Cause probable : `targetPort` différent du port
d'écoute réel du conteneur. Correction : aligner `targetPort` sur le port du processus.

**3. Délai dépassé, aucune réponse.** Personne ne répond du tout. Même première
commande, mais l'attente pointe vers autre chose que le port : une **règle réseau** qui
absorbe les paquets, ou un Service sans aucun point d'accès. Le contraste avec le cas 2
est le cœur de l'exercice : **refus = quelqu'un a dit non ; silence = quelqu'un bloque
ou personne n'écoute.**

**4. Marche dans l'espace de noms, pas ailleurs.** Il n'y a pas de panne. Le nom court
n'est résoluble que localement ; depuis un autre espace de noms, il faut
`api.production.svc.cluster.local`. **Premier des deux pièges** : ce n'est pas un
problème de Service, c'est une méconnaissance du nommage DNS interne.

**5. Marche deux fois sur trois.** **Second piège**, et le plus intéressant. Le Service
fonctionne — sinon rien ne marcherait. Un exemplaire sur trois est en faute. Deux
causes : soit l'un des trois Pods est réellement défaillant tout en étant considéré
comme prêt — donc sa sonde de disponibilité ne teste pas la bonne chose —, soit
l'application garde de l'état en mémoire et l'utilisateur ne retrouve pas le bon
exemplaire.

Ce cas appartient aux leçons sur les sondes et sur les workloads, pas à celle-ci. Et le
« deux fois sur trois » donne le nombre d'exemplaires gratuitement : c'est la même
signature que dans la leçon sur les workloads.

**L'erreur probable.** Traiter les cinq comme des problèmes de réseau et commencer par
inspecter les règles réseau ou le proxy. C'est le maillon le plus complexe et le moins
souvent en cause. **Trois des cinq cas se résolvent sans jamais regarder le réseau.**

**Les indices qui font reconnaître ce type de problème.** Trois formulations, trois
familles : *« ne résout pas »* → DNS et nommage · *« refusé immédiatement »* → port ou
absence d'écoute · *« ça met du temps puis rien »* → filtrage ou aucun point d'accès.
Apprendre ces trois associations vaut plus que mémoriser des commandes.

**Quand la réponse changerait.** Avec un maillage de services au-dessus du cluster,
un mandataire s'insère entre l'appelant et le Pod, et les symptômes changent :
un refus peut venir d'une règle du maillage plutôt que d'un port. La méthode — couper
la chaîne en deux — reste valable, mais la chaîne compte un maillon de plus, et il faut
savoir qu'il est là.

## 🧾 À retenir
- Service = adresse stable + répartition vers les Pods sains (par labels).
- ClusterIP (interne), NodePort (test), LoadBalancer (entrée cloud).
- DNS interne : on joint par NOM de Service, pas par IP de Pod.
- Ingress = reverse proxy L7 partagé (hôte/chemin, TLS) via un controller.
- Endpoints vides ⇒ labels/sélecteur ou readiness à vérifier.

## 📚 Vocabulaire
**Service** · **endpoints** · **ClusterIP / NodePort / LoadBalancer** · **DNS
interne** · **port / targetPort** · **Ingress / Ingress controller** · **L4 / L7** ·
**NetworkPolicy**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'expose des Pods via un Service et je choisis le bon type.
- [ ] Je joins les services par DNS interne, pas par IP de Pod.
- [ ] Je diagnostique un Service sans endpoints (labels/readiness).

## 🔗 Liens avec le programme
Mois 11 (orchestration). Leçons liées : `/doc/lessons/k8s-workloads`,
`/doc/lessons/networking-proxy-loadbalancing`, `/doc/lessons/k8s-config-probes`.
Le Service/Ingress applique au cluster le modèle load balancing / L4-L7 du réseau.
