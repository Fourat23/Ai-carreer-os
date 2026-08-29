<!-- keep -->
# Leçon — Réseau : proxy, reverse proxy et load balancing

## 🌍 Le problème d'abord
Un seul serveur ne suffit bientôt plus : trop de visiteurs, et s'il tombe, tout
tombe. La solution est d'en faire tourner **plusieurs** identiques… mais alors, à qui
le visiteur parle-t-il ? On place devant eux un **répartiteur** qui distribue le
trafic vers les serveurs en bonne santé et écarte ceux qui sont malades. C'est le
**load balancer**. On le confond souvent avec un simple « proxy », et l'on ne sait
plus, en cas de panne, si le problème vient du répartiteur ou des serveurs derrière.
Cette leçon clarifie proxy vs reverse proxy vs load balancer, et donne une méthode
pour diagnostiquer la chaîne « client → répartiteur → serveur » maillon par maillon.
C'est exactement ce que font les load balancers cloud et l'Ingress de Kubernetes.

## 🎯 Objectif
Distinguer **proxy** et **reverse proxy**, comprendre le **load balancing** (L4 vs L7,
health checks, répartition, sessions), et savoir diagnostiquer une chaîne réseau
« couche par couche » — le maillon entre le client et vos services, omniprésent en cloud
et en Kubernetes.

## 🧩 Prérequis
Vous devez avoir la **carte des couches réseau**
(`/doc/lessons/networking-tcp-ip-model`) et comprendre **HTTP/TLS**
(`/doc/lessons/networking-http-tls`), car un load balancer travaille soit au niveau
transport (L4), soit au niveau HTTP (L7) : la distinction s'appuie sur ces couches.
Les termes proxy, reverse proxy et health check sont définis ici.

## 🧠 Modèle mental
Entre le client et le serveur, on intercale souvent un **intermédiaire**. Un **proxy**
sort pour le client (il représente le client vers l'extérieur). Un **reverse proxy**
entre pour le serveur (il représente un ensemble de serveurs vers les clients). Un
**load balancer** est un reverse proxy spécialisé qui RÉPARTIT le trafic sur plusieurs
instances et retire celles qui sont malades. Ces briques rendent un service scalable et
hautement disponible.

## 📖 Explication complète
**Proxy (forward).** Placé côté client, il relaie les requêtes sortantes : filtrage,
cache, anonymisation, contrôle d'accès sortant en entreprise. Le serveur distant voit
le proxy, pas le client.

**Reverse proxy.** Placé côté serveur, il reçoit les requêtes entrantes et les
transmet aux services internes. Rôles : point d'entrée unique, terminaison **TLS**,
routage par chemin/hôte (`/api` → backend, `/` → frontend), cache, compression,
protection (rate limiting, WAF). nginx, Traefik, Envoy en sont des exemples ; en cloud,
le load balancer managé et l'Ingress Kubernetes jouent ce rôle.

**Load balancing L4 vs L7.**
- **L4 (transport)** : répartit selon IP:port, sans lire le contenu. Très rapide,
  polyvalent (tout protocole TCP/UDP), mais aveugle au HTTP (pas de routage par URL).
- **L7 (application)** : comprend HTTP. Route selon le chemin, l'hôte, les en-têtes ;
  gère la terminaison TLS, les redirections. Plus riche, un peu plus coûteux. On choisit
  L7 pour du routage applicatif (microservices, plusieurs domaines), L4 pour la
  performance brute.

**Health checks.** Un load balancer interroge périodiquement chaque instance (« es-tu
saine ? ») et **retire** automatiquement celles qui échouent, ne routant que vers les
saines. C'est ce qui permet un déploiement sans coupure et la tolérance aux pannes —
mais un health check mal conçu (trop laxiste ou testant le mauvais chemin) route vers
des instances mortes ou en retire de bonnes.

**Répartition et sessions.** Algorithmes courants : round-robin, least-connections,
par hachage. Problème classique : un service qui garde un **état local** (session en
mémoire) casse quand le client tombe sur une autre instance. La rustine est la **sticky
session** (affinité) ; la vraie solution est de rendre le service **stateless** (état
externalisé dans un cache/base partagé) — condition d'un scaling horizontal sain.

**Diagnostic d'une chaîne.** Client → DNS → load balancer → reverse proxy → service →
base. Un problème se localise couche par couche : le nom résout-il ? le LB répond-il ?
route-t-il vers une instance saine ? l'instance renvoie-t-elle 200 ? Un `502/503` au LB
pointe vers les backends (aucun sain / tous en erreur), pas vers le réseau.

## 🔧 Repères pratiques
```bash
curl -i https://service.exemple.test        # statut vu du client (à travers le LB)
curl -i http://10.0.2.10:8080/health        # tester une instance backend directement
# 502/503 au LB → aucun backend sain ; 200 en direct sur l'instance → problème LB/health check
```

## 🧭 Exemple guidé — « le site renvoie 503 par intermittence »
1. Le DNS résout et le LB répond → couche transport OK.
2. `curl` en direct sur les instances : lesquelles renvoient 200 ? Certaines sont-elles
   mortes mais toujours routées (health check trop laxiste) ?
3. Regarder le health check : teste-t-il un vrai endpoint de santé ? seuils cohérents ?
4. Cause fréquente : instances saturées (voir ressources/I-O) retirées par vagues → le
   LB manque de capacité. Corriger la capacité/l'autoscaling, pas le LB seul.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Ton endpoint `/health` vérifie que la base de données répond. La base a un
   ralentissement de dix secondes. Que fait le load balancer ?
2. Un `/health` qui renvoie toujours `200` tant que le processus vit : quel est son
   défaut opposé ?
3. Ton application garde la session en mémoire. Tu passes de une à trois instances.
   Que voient les utilisateurs, et quelles sont les deux réponses possibles ?
4. Un L4 peut-il router `/api` vers un backend et `/` vers un autre ?

## ✅ Correction attendue

**La démarche.** Un load balancer prend une décision toutes les quelques secondes à
partir d'une seule information : la réponse au health check. La qualité de cette
information détermine tout le reste — et c'est presque toujours là que se joue la
disponibilité réelle.

**L'erreur probable, et elle transforme une panne partielle en panne totale.** À la
première question, la réponse spontanée est « il retire les instances qui ne répondent
plus, c'est son rôle, tout va bien ». En réalité : **la base ralentit pour tout le monde
en même temps, donc toutes les instances échouent leur health check en même temps, donc
le load balancer les retire toutes — et il ne reste aucune capacité.**

Un ralentissement de la base aurait dégradé le service. Le health check l'a transformé
en **indisponibilité complète**, et il l'a fait en appliquant exactement la règle qu'on
lui avait donnée. Pire : les instances retirées cessent de recevoir du trafic, la base
se repose, les checks repassent au vert, tout le trafic revient d'un coup, la base
retombe. Le système se met à osciller, et le graphe montre une panne qui va et vient
sans cause apparente.

Le piège séduit parce que **la logique est impeccable** : un service qui ne peut pas
joindre sa base ne peut effectivement pas répondre correctement. Vérifier les
dépendances dans le health check paraît plus rigoureux, plus complet, plus
professionnel. L'erreur n'est pas dans le raisonnement mais dans le fait qu'il est
appliqué **simultanément par toutes les instances sur une dépendance partagée** : ce
qui est vrai individuellement devient catastrophique collectivement.

La distinction qui règle le problème, et qu'il vaut la peine de retenir sous ces deux
noms :

- **liveness** — « ce processus est-il irrécupérable ? » Si oui, on le redémarre. Ne
  teste que soi-même, jamais une dépendance.
- **readiness** — « puis-je servir du trafic maintenant ? » Peut consulter une
  dépendance **critique**, mais jamais une dépendance partagée par toutes les instances
  sans garde-fou.

Un service dont la base ralentit devrait rester **présent** et répondre en mode dégradé
ou avec une erreur claire — pas disparaître.

**Sur les autres questions.** Le health check qui renvoie toujours `200` a le défaut
exactement inverse et tout aussi coûteux : le processus vit, le load balancer route, et
chaque requête échoue. **L'instance est morte fonctionnellement et considérée saine.**
Entre les deux excès, un bon check teste ce que l'instance peut faire *par elle-même* —
sa configuration est chargée, ses caches sont initialisés, son pool de connexions
existe.

La session en mémoire avec trois instances : les utilisateurs sont **déconnectés au
hasard**, environ deux fois sur trois, sans logique apparente — le symptôme le plus
déroutant qui soit pour le support. Deux réponses : la **sticky session**, qui épingle
chaque client à une instance (rapide à mettre en place, mais la panne d'une instance
déconnecte ses utilisateurs, et la répartition devient inégale) ; ou l'**externalisation
de l'état** dans un cache partagé, qui est la vraie solution et la condition du scaling
horizontal. La première est une rustine assumée, la seconde un changement d'architecture.

Enfin, un L4 **ne peut pas** router par chemin : il ne lit que l'enveloppe TCP —
adresses et ports — et le chemin `/api` vit dans le contenu HTTP, une couche au-dessus.
Router par URL exige de lire le HTTP, donc un L7. C'est aussi pourquoi un L7 doit
terminer le TLS pour faire son travail : on ne lit pas un contenu chiffré.

**Alternative défendable.** Certaines équipes n'ont volontairement **aucun health check
applicatif** et se contentent d'un test de port TCP. C'est défendable pour un service
sans état et sans initialisation : moins de code, aucun risque d'amplification, et les
vraies pannes sont détectées par les métriques d'erreur plutôt que par le load balancer.
Le prix est une détection plus lente d'une instance abîmée mais vivante.

**Vérifie seul, sans corrigé** :
1. Lis ton endpoint de santé. Interroge-t-il une dépendance partagée par toutes tes
   instances ? Si oui, tu as l'amplification décrite ci-dessus, en attente d'un
   ralentissement.
2. Coupe ta base en local et appelle `/health`. La réponse te paraît-elle proportionnée
   à la panne ?
3. Combien d'instances peuvent être retirées avant que la capacité restante ne suffise
   plus ? Si tu ne connais pas ce nombre, ton autoscaling est décoratif.

## ⚠️ Erreurs fréquentes
- **Confondre proxy et reverse proxy** (client vs serveur).
- Choisir L4 quand on a besoin de router par URL (ou payer un L7 pour du TCP brut).
- **Health check trivial** (« le port répond ») qui route vers des instances malades.
- Compter sur la sticky session au lieu de rendre le service stateless.
- Diagnostiquer « le réseau » alors que tous les backends renvoient 500.
- Terminer TLS au LB mais laisser un trafic interne sensible en clair sans le vouloir.

## ☁️ Vers le cloud et Kubernetes
En cloud : ALB/NLB (AWS), Application Gateway/Load Balancer (Azure) = ces mêmes L7/L4
managés. En Kubernetes : un **Service** répartit (niveau transport) vers les Pods sains
(via les probes = health checks), un **Ingress** fait le reverse proxy L7 (routage
HTTP, TLS). Le modèle mental est identique.

## 🏢 Cas métier
Après une montée de trafic, 30% des requêtes renvoient 503. Le health check ne testait
que l'ouverture du port : des instances saturées « répondaient » mais échouaient sur les
vraies requêtes. On corrige le health check (endpoint `/health` réel) ET on active
l'autoscaling pour ajouter de la capacité.

## 🎤 Questions d'entretien
- « Proxy vs reverse proxy ? » → sort pour le client vs entre pour le serveur.
- « L4 vs L7 ? » → transport (IP:port, rapide, aveugle) vs application (HTTP, routage par URL).
- « À quoi sert un health check ? » → retirer les instances malades du pool.

## ✍️ Mini-exercice
Vous devez router `/api` vers un backend et `/` vers un frontend, sur le même domaine.
L4 ou L7 ? → L7 (routage par chemin, il faut comprendre le HTTP).

## 🧾 À retenir
- Proxy = côté client ; reverse proxy = côté serveur (point d'entrée, TLS, routage).
- Load balancer = reverse proxy qui répartit + retire les instances malsaines.
- L4 (transport, rapide, aveugle) vs L7 (application, routage HTTP).
- Health checks = tolérance aux pannes ; stateless > sticky session pour scaler.
- Diagnostiquer couche par couche ; 502/503 au LB = problème backend.

## 📚 Vocabulaire
**proxy** · **reverse proxy** · **load balancer** · **L4 / L7** · **health check** ·
**round-robin / least-connections** · **sticky session** · **stateless** ·
**terminaison TLS** · **Ingress**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je distingue proxy, reverse proxy et load balancer.
- [ ] Je choisis L4/L7 selon le besoin de routage.
- [ ] Je diagnostique une chaîne client → LB → backend couche par couche.

## 🔗 Liens avec le programme
Jour `/day/71` (réseau) et `/day/79` (observabilité). Leçons liées :
`/doc/lessons/networking-http-tls`, `/doc/lessons/networking-tcp-ip-model`. Ces briques
sont les load balancers cloud et l'Ingress Kubernetes, approfondis dans les leçons réseau
cloud et Kubernetes du parcours.
