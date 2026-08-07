<!-- keep -->
# Leçon — Réseau : proxy, reverse proxy et load balancing

## 🎯 Objectif
Distinguer **proxy** et **reverse proxy**, comprendre le **load balancing** (L4 vs L7,
health checks, répartition, sessions), et savoir diagnostiquer une chaîne réseau
« couche par couche » — le maillon entre le client et vos services, omniprésent en cloud
et en Kubernetes.

## 🧩 Prérequis
Modèle en couches et HTTP/TLS (`/doc/lessons/networking-tcp-ip-model`,
`/doc/lessons/networking-http-tls`).

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
