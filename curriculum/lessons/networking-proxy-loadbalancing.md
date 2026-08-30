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
« Le site répond une fois sur trois. » Symptôme classique, et il désigne presque toujours la
même chose : **un répartiteur de charge qui envoie du trafic à une instance morte.**

Voyons pourquoi le contrôle de santé ne l'a pas détectée — c'est là que se trouve la vraie
leçon.

### Le diagnostic, du dehors vers le dedans

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://app.exemple.fr    # ① via le répartiteur
for i in 1 2 3; do curl -s -o /dev/null -w '%{http_code}\n' http://10.0.2.$i:8080/health; done   # ② chaque instance
```

Si ① alterne entre 200 et 502 pendant que ② montre une instance en erreur, la cause est
identifiée : **une instance dégradée reçoit encore sa part du trafic**.

La question qui suit n'est pas « comment la retirer » — le répartiteur sait le faire — mais
**« pourquoi ne l'a-t-il pas retirée tout seul ? »**.

### La réponse : ce que teste le contrôle de santé

C'est le cœur de cette leçon, et le tableau suivant explique la quasi-totalité des cas.

| Ce que teste le contrôle | Ce qu'il détecte | Ce qu'il laisse passer |
|---|---|---|
| le port TCP est ouvert | processus mort | processus vivant mais **incapable de répondre** |
| `GET /` renvoie 200 | serveur web debout | base injoignable, cache vide, disque plein |
| `GET /health` **avec ses dépendances** | l'instance ne peut pas servir | (le bon niveau) |

Un contrôle trop **laxiste** — le port répond — garde en rotation une instance dont la base est
inaccessible. Un contrôle trop **strict** provoque le défaut inverse, et il est pire : si le
contrôle de santé teste la base et que la base tombe, **toutes** les instances sont déclarées
mortes simultanément, le répartiteur n'a plus rien à qui envoyer, et une panne partielle devient
totale.

C'est la même distinction que dans `/doc/lessons/monitoring-production` :

- **vivant** : le processus tourne — ne dépend d'aucune dépendance externe ;
- **prêt** : il peut servir — vérifie ses dépendances, et sort l'instance de la rotation sans
  la tuer.

Le contrôle du répartiteur doit interroger la **disponibilité**, et l'orchestrateur la
**vivacité**. Les brancher à l'envers est une cause fréquente de panne totale.

### Les trois réglages qui décident du comportement réel

| Réglage | Trop bas | Trop haut |
|---|---|---|
| **intervalle** (fréquence des contrôles) | charge inutile | une instance morte reste en rotation longtemps |
| **seuil d'échec** (nombre d'échecs avant retrait) | retrait sur un simple hoquet — **oscillation** | détection lente |
| **délai d'attente** du contrôle | une instance lente est déclarée morte | on attend trop pour constater |

Le calcul qui manque presque toujours : **temps de détection = intervalle × seuil d'échec**.
Un contrôle toutes les 30 secondes avec un seuil de 3 laisse une instance morte servir du
trafic pendant **90 secondes**. Si cela paraît long, ce sont les réglages qu'il faut changer,
pas le répartiteur.

Et l'oscillation mérite d'être nommée : un seuil de 1 avec un service au comportement irrégulier
produit des instances qui sortent et rentrent en boucle. Chaque retour purge les connexions
établies, et la qualité de service est pire qu'avec l'instance dégradée.

### Ce qu'un répartiteur fait d'autre, et qui explique des pannes

Un répartiteur n'est pas qu'un distributeur ; il **termine** souvent la connexion et en ouvre
une nouvelle. Cela a trois conséquences pratiques :

- **l'adresse IP vue par l'application est celle du répartiteur.** Les journaux montrent tous
  la même adresse, la limitation de débit par IP ne fonctionne plus, la géolocalisation est
  fausse. C'est l'en-tête `X-Forwarded-For` qui porte l'adresse d'origine — et il faut la
  **configurer explicitement**, sinon elle n'apparaît nulle part ;
- **TLS est souvent terminé au répartiteur.** L'application parle en clair derrière ; si elle
  génère des URL absolues, elle produit du `http://` alors que le client est en `https://` —
  d'où les boucles de redirection et les avertissements de contenu mixte. `X-Forwarded-Proto`
  est ce qui le corrige ;
- **les connexions de longue durée** — WebSocket, événements serveur, téléversements — se font
  couper par le délai d'inactivité du répartiteur, souvent réglé à 60 secondes par défaut.
  L'application n'y est pour rien et n'en voit rien.

Ces trois points sont responsables d'un très grand nombre d'heures perdues, précisément parce
que le code applicatif est correct et que le problème est dans une couche que le développeur ne
regarde pas.

### Répartir : les algorithmes, et quand ils cessent de convenir

| Algorithme | Comment | Quand il échoue |
|---|---|---|
| tour de rôle | à tour de rôle | requêtes de coûts très inégaux |
| moins de connexions | vers la moins chargée | requêtes courtes et nombreuses |
| par hachage de l'IP | même client → même instance | déséquilibre si un client domine |

Le troisième existe pour les applications à **état** — sessions en mémoire. C'est un pansement,
et il vaut mieux le dire : il empêche l'équilibrage réel, complique les déploiements, et perd
les sessions au moindre redémarrage. La bonne réponse est celle de
`/doc/lessons/system-design-scaling` : **sortir l'état du processus**, et rendre les instances
interchangeables.


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

## 🔥 Pratique — répartir, et découvrir ce que la répartition casse

**A. Un répartiteur minimal.** Écris un programme qui écoute sur un port et
relaie chaque requête vers l'une de trois instances, à tour de rôle. Chaque
instance répond avec son identifiant. Livrable : le code, et la trace de dix
requêtes montrant la rotation.

**B. Le contrôle de santé.** Ajoute une vérification périodique et retire
automatiquement une instance qui ne répond plus. Arrête une instance en cours de
route. Livrable : le nombre de requêtes servies en erreur entre l'arrêt et le
retrait, et ce qui détermine ce nombre.

**C. Ce que la répartition casse.** Ajoute une session en mémoire à chaque
instance et connecte-toi plusieurs fois. Livrable : ce que tu observes, et deux
solutions différentes avec leurs compromis.

**D. Comparer aux adresses multiples.** Ta mesure de `networking-dns` montre
qu'un nom peut porter douze adresses. Compare cette répartition à celle de A sur
trois critères : temps de retrait d'une instance morte, granularité, et
équipement nécessaire. Livrable : le tableau comparatif.

**E. Le drainage.** Fais en sorte qu'une instance qu'on arrête finisse de servir
ses requêtes en cours avant de disparaître. Mesure le nombre de requêtes
interrompues avec et sans. Livrable : les deux nombres.

## ✅ Correction attendue

**A — le tour de rôle.** La rotation stricte est le point de départ, et elle
suppose que **toutes les requêtes coûtent la même chose** — ce qui est faux dès
qu'une route est plus lourde que les autres. La stratégie « vers l'instance qui
a le moins de connexions ouvertes » corrige cela sans rien connaître du métier,
et c'est pourquoi elle est le défaut raisonnable en pratique.

**B — la fenêtre d'erreur.** Le chiffre obtenu dépend de deux paramètres, et la
réponse attendue les nomme :

```
requêtes servies en erreur ≈ débit × (intervalle de vérification × seuil d échecs)
```

Avec une vérification toutes les 10 s et deux échecs requis avant retrait, une
instance morte reçoit du trafic pendant **jusqu'à 20 secondes**. À 200 requêtes
par seconde réparties sur trois instances, cela fait environ 1 300 requêtes en
erreur.

Le compromis à formuler : réduire l'intervalle réduit la fenêtre mais augmente
la charge de vérification et le risque de retirer une instance **saine** lors
d'un pic passager. Un seuil de deux échecs consécutifs existe exactement pour
cela — et c'est le même arbitrage que celui du disjoncteur dans
`resilience-patterns`.

Le contrôle de santé doit par ailleurs vérifier ce dont le service **dépend**
— sa base, ses dépendances critiques — et non se contenter de répondre « je suis
vivant ». Un contrôle qui répond toujours vrai ne retire jamais rien.

**C — ce que ça casse.** Tu observeras une session perdue une fois sur trois :
elle vit en mémoire d'une instance, et la requête suivante part ailleurs.

Deux solutions, avec des compromis opposés :

- **L'affinité de session** : le répartiteur renvoie toujours le même client vers
  la même instance. Simple, et cela **annule une partie du bénéfice** — la charge
  se déséquilibre, et l'arrêt d'une instance déconnecte ses utilisateurs.
- **Sortir l'état des instances** (base, cache partagé, jeton signé). Plus de
  travail, et cela rend les instances **interchangeables**, ce qui est la
  propriété qu'on cherchait en répartissant.

La seconde est presque toujours la bonne, et pour une raison qui dépasse ce
sujet : **une instance interchangeable peut être arrêtée, redémarrée, remplacée
et multipliée sans conséquence.** C'est ce qui rend possibles le déploiement
progressif, le retour arrière et la mise à l'échelle automatique — trois choses
que l'affinité de session complique toutes.

**D — comparaison avec les adresses multiples.** Le tableau attendu, en
s'appuyant sur la mesure de `networking-dns` (12 adresses pour un même nom) :

| critère | plusieurs adresses pour un nom | répartiteur |
|---|---|---|
| retrait d'une instance morte | **lent** — limité par la durée de vie des enregistrements et les caches | **rapide** — quelques secondes |
| granularité | par client, à la résolution | par requête |
| contrôle de santé | **aucun** | oui |
| équipement | aucun | un composant à exploiter |

La conclusion : les deux se combinent plutôt qu'ils ne s'opposent. Les adresses
multiples répartissent entre **régions** ou entre répartiteurs ; le répartiteur
répartit entre **instances**. Utiliser les adresses multiples seules revient à
accepter qu'une instance morte reste distribuée pendant des heures — ce que la
mesure de propagation de `networking-dns` rend concret.

**E — le drainage.** Sans drainage, les requêtes en cours sur l'instance arrêtée
sont interrompues : le client reçoit une connexion coupée, sans code d'erreur
exploitable, ce qui est le pire cas — irréessayable automatiquement en toute
sécurité, puisqu'on ne sait pas si le traitement a eu lieu.

La séquence correcte compte quatre temps, et l'ordre est ce qui compte :

1. l'instance se déclare **hors service** à son contrôle de santé ;
2. le répartiteur cesse de lui envoyer du **nouveau** trafic ;
3. l'instance **termine** ses requêtes en cours ;
4. seulement alors, le processus s'arrête.

Sauter l'étape 1 fait sauter les trois autres — et c'est le défaut le plus
fréquent, parce qu'un arrêt de conteneur ou de service déclenche directement
l'étape 4. C'est exactement le mécanisme de propagation des signaux mesuré dans
`linux-services-systemd` et `docker-production-hardening` : le service doit
recevoir le signal d'arrêt et avoir le droit de prendre son temps.

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
