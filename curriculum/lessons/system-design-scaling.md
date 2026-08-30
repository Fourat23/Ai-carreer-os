<!-- keep -->
# Leçon — System Design : passer d'une machine à l'échelle

## 🌍 Le problème d'abord
Ton application tourne sur UNE machine et marche très bien : 10 utilisateurs, tout est fluide. Puis le
succès arrive : 1 000 utilisateurs, ça rame ; 100 000, la machine sature ; 1 000 000, elle tombe. Que
fais-tu ? Acheter une machine plus grosse ? En ajouter plusieurs ? Et si LA machine tombe, tout
s'arrête — c'est un point unique de défaillance. Concevoir un système, ce n'est pas empiler des
technologies à la mode : c'est répondre, étape par étape, à « comment tenir la charge et rester
disponible quand ça grandit ». Cette leçon installe ce raisonnement, du plus simple au plus subtil.

## 🎯 Objectif
Savoir raisonner la mise à l'échelle d'un système : comprendre les ressources d'une machine
(CPU/RAM/disque/réseau), distinguer scaling **vertical** et **horizontal**, comprendre pourquoi le
**sans état (stateless)** rend l'horizontal possible, le rôle du **load balancer**, du **cache**, de
la **réplication** et du **partitionnement**, identifier un **point unique de défaillance (SPOF)**, et
raisonner les **arbitrages** — sans jargon prématuré.

## 🧩 Prérequis
Tu dois connaître les bases d'architecture logicielle — couches, dépendances
(`/doc/lessons/architecture-basics`) — et le rôle d'un reverse proxy / répartiteur de charge
(`/doc/lessons/networking-proxy-loadbalancing`). Des notions de cache (`/doc/lessons/caching-performance`)
et de base de données (`/doc/lessons/database-modeling`) aident. Aucune expérience de conception de
systèmes n'est supposée : on part d'une seule machine.

## 🧠 Modèle mental
Pense à un guichet unique. Tant qu'il y a peu de clients, un guichet suffit. Quand la file s'allonge,
deux réponses : un guichetier plus rapide (**scaling vertical** : une machine plus puissante) ou
PLUSIEURS guichets (**scaling horizontal** : plusieurs machines). Le vertical a une limite physique et
un plafond de prix ; l'horizontal est quasi illimité MAIS impose que n'importe quel guichet puisse
servir n'importe quel client — donc que le travail ne dépende pas d'un guichet particulier
(**stateless**). Concevoir à l'échelle, c'est enchaîner ces décisions : d'abord simple, on complexifie
seulement quand une contrainte réelle l'exige. « On ne conçoit pas pour un million d'utilisateurs le
premier jour ; on conçoit pour pouvoir y arriver. »

## 📚 Explication progressive

### 1. Une machine et ses ressources
Une application consomme du **CPU** (calcul), de la **RAM** (mémoire vive), du **disque** (stockage,
lent) et du **réseau** (bande passante). Le premier réflexe de diagnostic : QUELLE ressource sature ?
Un CPU à 100 % et un disque saturé n'appellent pas la même solution. On ne met pas à l'échelle « en
général » ; on met à l'échelle le goulot.

### 2. Scaling vertical
Ajouter de la puissance à LA machine (plus de CPU/RAM). Simple, sans changement de code. Limites :
plafond matériel, prix qui explose, et surtout ça reste **une seule machine** → si elle tombe, tout
tombe (SPOF). Le vertical repousse le problème, il ne l'élimine pas.

### 3. Scaling horizontal & stateless
Ajouter des MACHINES (instances) identiques. Quasi illimité, et tolérant aux pannes (si une tombe, les
autres continuent). Condition : chaque requête doit pouvoir être servie par N'IMPORTE quelle instance
→ l'application doit être **sans état (stateless)** : elle ne garde pas en mémoire locale des données
propres à un utilisateur (la session en mémoire casse dès qu'on a deux instances). L'état va dans un
stockage PARTAGÉ (base, cache, stockage d'objets). « Stateless = n'importe quelle instance, n'importe
quelle requête. »

### 4. Le load balancer
Avec plusieurs instances, il faut un aiguilleur : le **load balancer** (répartiteur de charge) reçoit
les requêtes et les distribue entre instances (round-robin, moins chargée…). Il surveille aussi la
SANTÉ des instances (health check) et cesse d'envoyer du trafic à une instance en panne. C'est la
porte d'entrée du scaling horizontal.

### 5. Le cache : servir sans recalculer
Beaucoup de requêtes redemandent la même chose. Un **cache** (voir caching-performance) sert ces
réponses sans retaper la base : moins de charge, moins de latence. C'est souvent le levier le plus
rentable AVANT d'ajouter des machines.

### 6. La base de données : réplication et partitionnement
La base devient vite le goulot (une seule, difficile à multiplier). Deux leviers :
- **Réplication** : des COPIES (réplicas) de la base servent les LECTURES ; l'écriture va sur le
  primaire. On encaisse plus de lectures. (Attention : un réplica peut être légèrement en retard — on
  y reviendra dans les systèmes distribués.)
- **Partitionnement / sharding** : on DÉCOUPE les données entre plusieurs bases (ex. par plage d'id ou
  par région) pour répartir la charge d'écriture et le volume. Plus puissant, plus complexe (requêtes
  inter-partitions, rééquilibrage).

### 7. Points uniques de défaillance (SPOF)
Un **SPOF** est un composant dont la panne fait tomber tout le système : une seule base, un seul load
balancer, une seule instance. La disponibilité se gagne en ÉLIMINANT les SPOF (redondance : plusieurs
instances, base répliquée, load balancer redondé). Concevoir pour la disponibilité, c'est chercher
« qu'est-ce qui, en tombant seul, tout casse ? ».

### 8. Capacity planning (ordre de grandeur)
Avant de dimensionner, on ESTIME : combien de requêtes/seconde ? combien une instance en tient-elle ?
→ nombre d'instances nécessaires (+ marge). Pas besoin de précision : un ordre de grandeur suffit à
décider. Estimer évite le sur-dimensionnement (coût) comme le sous-dimensionnement (panne).

## 🔬 Exemple guidé
Une API passe de 100 à 50 000 requêtes par minute et sature.

La question qu'on pose alors — « comment on scale ? » — n'a pas de réponse. Elle en a
seulement une fois qu'on sait **ce qui sature**, et c'est presque toujours l'étape qu'on saute
pour aller directement à une solution qu'on connaît déjà.

### Étape 0 — la mesure qui oriente tout

Trois chiffres suffisent à séparer quatre familles de problèmes complètement différentes :

| Ce qui est saturé | Cause probable | Ce qui aiderait | Ce qui n'aiderait PAS |
|---|---|---|---|
| **processeur** à 100 % | calcul, sérialisation, chiffrement | cache, plus d'instances | plus de mémoire |
| **mémoire** pleine, échanges disque | fuite, objets trop gros, cache local démesuré | corriger la fuite | plus d'instances (elles fuiront aussi) |
| **disque** saturé, files d'attente d'E/S | base non indexée, journaux excessifs | index, moins d'écritures | plus de processeur |
| **rien n'est saturé**, et c'est lent | attente d'un tiers, verrous, N+1 | délais d'attente, corriger le N+1 | **plus de machines** |

La dernière ligne est celle qui coûte le plus cher dans la vraie vie. Un service dont les fils
d'exécution attendent une dépendance lente ne va pas plus vite avec quatre instances : il
attend simplement à quatre endroits, pour quatre fois le prix. Et c'est pourtant la première
chose qu'on fait, parce que c'est la plus facile.

Dans notre cas, la mesure dit : **processeur à 100 %, disque calme, mémoire stable.** On est
sur la première ligne.

### Étape 1 — le levier le moins cher : ne pas faire le travail

Seconde mesure, et elle est aussi importante que la première : **quelle est la répartition des
requêtes ?**

```
70 %  GET /produits/:id      — lectures, contenu identique pour tous
20 %  GET /recherche?q=...   — lectures, contenu variable
10 %  POST /commandes        — écritures
```

Soixante-dix pour cent des requêtes demandent **la même chose**. Avant d'ajouter la moindre
machine, on arrête de recalculer ces réponses : un cache les absorbe.

Ce que ça donne, en ordre de grandeur : si 70 % du trafic est servi depuis le cache, la charge
qui atteint réellement l'application tombe à 30 %. **On vient de diviser le besoin en machines
par trois pour le prix d'un cache** — et sans rien changer à l'architecture.

C'est le principe de la mise à l'échelle, et il est contre-intuitif : *la première question
n'est pas « comment faire plus », c'est « que puis-je ne pas refaire ».* Cache, index, requête
groupée à la place d'un N+1 (mesuré à **51 requêtes contre 1** dans
`/doc/lessons/caching-performance`) : tout cela réduit le travail au lieu d'ajouter des
ressources.

Rappel de la même leçon, pour ne pas croire le cache magique : un cache ne sert que si les
mêmes clés reviennent. Ici c'est vérifié — 70 % des requêtes portent sur les mêmes fiches
produit. Sur la recherche, où chaque requête est différente, il ne servirait à rien.

### Étape 2 — l'horizontal, et son prérequis

Les 30 % restants saturent encore. On ajoute des instances.

Mais on ne peut pas le faire tant qu'une condition n'est pas remplie : **l'application doit
être sans état**. Si la session d'un utilisateur est en mémoire dans une instance, il faut que
toutes ses requêtes retombent sur celle-là — ce qu'on appelle des sessions collantes — et l'on
perd l'essentiel du bénéfice : plus d'équilibrage réel, et une instance qui redémarre
déconnecte ses utilisateurs.

La transformation est simple à énoncer et structurante : **tout ce qui doit survivre à une
requête sort du processus.** Sessions dans un magasin partagé, fichiers téléversés dans un
stockage objet, tâches en attente dans une file. L'instance devient interchangeable et
jetable.

C'est le vrai contenu de l'étape « horizontale », et c'est la raison pour laquelle elle est
douloureuse dans les applications anciennes : le travail n'est pas d'ajouter des machines,
c'est de **retirer l'état** des machines existantes.

Le répartiteur de charge a alors deux fonctions, et la seconde compte autant que la première :
distribuer, et **sortir de la rotation une instance qui ne répond plus** grâce à un contrôle de
santé. Sans ce contrôle, une instance en panne continue de recevoir un quart du trafic.

### Étape 3 — la base, dernier goulot

Les instances tiennent, la base sature. C'est l'ordre habituel : on peut multiplier les
serveurs applicatifs presque à volonté, jamais la base d'écriture.

| Levier | Ce qu'il résout | Ce qu'il coûte |
|---|---|---|
| **index** | des lectures qui parcourent toute la table | 1,85× en écriture (mesuré dans `sql-performance-indexing`) |
| **réplicas de lecture** | le volume de lectures | le **retard de réplication**, et ses effets « parfois » |
| **partitionnement** | le volume d'**écritures** | requêtes entre partitions difficiles, choix de clé irréversible |

L'ordre est celui du tableau, et il est strict : les index sont gratuits en comparaison et
souvent suffisants ; les réplicas introduisent la cohérence à terme décrite dans
`/doc/lessons/distributed-systems-failures` ; le partitionnement est une décision structurelle
qu'on ne défait pas.

### Étape 4 — ce que l'ajout de machines a créé

Une instance unique n'avait aucun point de défaillance unique : elle **était** le service.
Quatre instances derrière un répartiteur en créent un — **le répartiteur**. Le cache partagé en
est un autre : s'il tombe, les 70 % de trafic qu'il absorbait arrivent d'un coup sur une
application dimensionnée pour 30 %, et tout s'effondre.

C'est l'enseignement le moins intuitif de toute la leçon : **la mise à l'échelle crée des modes
de panne qui n'existaient pas.** Chaque composant ajouté est un composant qui peut tomber, et
le système devient plus disponible **seulement si** on redonde ce qu'on a ajouté et si l'on
prévoit ce qui se passe quand chaque pièce disparaît.

D'où la question à poser après chaque étape, et pas à la fin : *qu'est-ce qui tombe si ceci
tombe ?*

### La méthode, en une phrase par étape

1. **Mesurer** ce qui sature — processeur, mémoire, disque, ou rien du tout.
2. **Réduire le travail** avant d'ajouter des ressources : cache, index, N+1.
3. **Retirer l'état** des instances, puis les multiplier.
4. **Traiter la base** en dernier, du moins cher au plus irréversible.
5. **Redonder ce qu'on vient d'ajouter**, et savoir ce qui tombe avec.

Ce qu'il ne faut surtout pas faire : commencer par l'étape 3. C'est le réflexe le plus répandu,
et il produit des architectures distribuées coûteuses pour des problèmes qu'un index ou un
cache aurait réglés en une journée.

## ⚖️ Trade-offs
- Vertical : simple, zéro refactor ↔ plafond, prix, reste un SPOF.
- Horizontal : quasi illimité, tolérant aux pannes ↔ impose le stateless, ajoute LB + état partagé.
- Cache : énorme gain ↔ risque de données périmées (invalidation).
- Réplication : plus de lectures ↔ retard de réplication (lecture potentiellement périmée).
- Partitionnement : plus d'écritures/volume ↔ complexité (requêtes inter-partitions, hotspots).

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Ton API sature. Tu passes de 2 à 20 instances. Les temps de réponse s'aggravent.
   Comment est-ce possible ?
2. Ton application est parfaitement sans état. Est-elle pour autant extensible
   horizontalement sans limite ?
3. Tu ajoutes un cache devant la base. Quel nouveau problème viens-tu de créer ?
4. Quelle est la première question à poser avant toute décision de mise à l'échelle ?

## ✅ Correction attendue

**La démarche.** On ne met pas à l'échelle « une application » : on met à l'échelle **la
ressource qui sature**. Sans avoir identifié laquelle, toute décision est un pari.

**L'erreur probable, et elle aggrave la panne qu'elle prétend résoudre.** Multiplier les
instances est la réponse enseignée, et elle est juste — quand le goulot est dans les
instances. Si le goulot est la **base de données partagée**, on vient de faire passer le
nombre de clients qui la martèlent de 2 à 20.

Chaque instance ouvre son propre pool de connexions. Vingt instances à dix connexions font
deux cents connexions demandées à une base qui en accepte peut-être cent. Les premières
saturent le serveur, les suivantes attendent, les délais d'attente expirent, et **les temps
de réponse augmentent**. Le système a moins de capacité utile qu'avec deux instances.

C'est le principe qu'il faut retenir : **le scaling horizontal ne supprime pas le goulot,
il le déplace.** On l'enlève de l'application et on le pose sur la première ressource
partagée en aval — base, cache, file, service tiers. Une architecture n'est extensible que
jusqu'à sa ressource partagée la moins extensible.

Le piège séduit parce que le lien de causalité paraît direct : « plus de charge, donc plus
de machines ». C'est le raisonnement le plus enseigné du domaine, il fonctionne dans la
majorité des cas, et surtout **c'est le seul levier qu'on actionne en une commande**.
Diagnostiquer la saturation demande de lire des métriques ; ajouter des instances demande
de changer un nombre. La disponibilité de l'action oriente le diagnostic, au lieu de
l'inverse.

**Sur les autres questions.** Une application parfaitement sans état n'est **pas**
extensible sans limite : elle l'est jusqu'à ce que la première ressource partagée cède.
« Sans état » est une condition **nécessaire** du scaling horizontal, jamais suffisante. La
question suivante est toujours : *qu'est-ce que toutes mes instances partagent ?*

Le cache devant la base résout un problème et en crée trois : la **cohérence** (une donnée
modifiée en base et encore présente au cache est servie périmée — combien de temps est-ce
acceptable ?), l'**invalidation** (qui efface l'entrée, et sait-on le faire de façon
fiable ?), et le **redémarrage à froid** — un cache vide au démarrage envoie soudain
100 % du trafic à la base, ce qui peut la faire tomber au pire moment, juste après un
incident. Un cache est une base de données de plus, avec ses propres modes de panne.

Enfin, la première question avant toute décision est : **quelle ressource sature, et
comment le sais-je ?** CPU, mémoire, entrées-sorties, connexions à la base, bande passante,
quota d'un service tiers. La réponse dicte le levier, et chacune en appelle un différent.
Sans elle, on ajoute des machines à un problème de disque.

**Alternative défendable.** Le scaling **vertical** — une machine plus grosse — est
souvent le meilleur choix jusqu'à un point bien plus tardif qu'on ne le croit : aucun
changement de code, aucun état à externaliser, aucune complexité opérationnelle, et le
matériel moderne va très loin. Sa vraie limite n'est pas la puissance, c'est qu'il reste
**un point unique de défaillance**. C'est la disponibilité, pas la capacité, qui impose
généralement de passer à l'horizontal.

**Vérifie seul, sans corrigé** :
1. Sous charge, quelle ressource atteint 100 % en premier ? Si tu ne peux pas répondre,
   c'est le premier travail — avant toute décision.
2. Multiplie ton nombre d'instances par la taille de leur pool de connexions. Compare à ce
   que ta base accepte.
3. Vide ton cache en pleine journée. Ce qui se passe alors est ce qui se passera après un
   redémarrage — dans les pires conditions possibles.

## ⚠️ Erreurs fréquentes / anti-patterns
- « Distribuer » tout dès le départ (micro-services, sharding) sans contrainte réelle → complexité inutile.
- Scaler horizontalement une app à état (session en mémoire) → l'utilisateur « perd » sa session.
- Ajouter des machines alors que le vrai goulot est la base ou un cache absent.
- Oublier les SPOF (une seule base, un seul LB) → indisponibilité au premier incident.
- Dimensionner sans estimer → sur-coût ou panne.

## 🛠️ Pratique
Exercices déterministes reliés à cette leçon :
`cloud-scaling-choice` / `cloud-scaling-kind` (vertical vs horizontal), `cloud-replica-count` (combien
de réplicas), `cloud-detect-spof` / `cloud-spof-detect` (repérer les SPOF), `cloud-stateful-autoscale`
(stateless mal mis à l'échelle). SIMULATIONS déterministes — aucun cloud réel exécuté.
**Auto-évaluation** : teste ta compréhension par niveau (jusqu'au transfert) sur `/diagnostics`
(diagnostic « System Design : monter en charge »).

## 🧪 Vérification de compréhension
- Pourquoi ne peut-on pas scaler horizontalement une application qui garde la session en mémoire locale ?
- Une API sature : comment décides-tu entre « plus grosse machine », « cache » et « plus d'instances » ?
- Cite deux SPOF possibles dans « 1 load balancer → 3 instances → 1 base » et comment les éliminer.

## 💼 Cas professionnel
Toute application qui grandit suit ce chemin : vertical d'abord (simple), puis cache, puis horizontal +
load balancer, puis réplication/partitionnement de la base. Savoir OÙ on en est et QUEL est le prochain
goulot est exactement ce qu'on attend d'un ingénieur qui « pense système ».

## 🎤 Entretien
« Comment mettrais-tu à l'échelle ce service ? » → estimer la charge, trouver le goulot, appliquer le
levier adapté (cache → horizontal+LB → réplication → partition), éliminer les SPOF — pas réciter des
technologies.

## 📌 À retenir
On conçoit du simple au complexe : une machine → trouver le goulot (CPU/RAM/disque/réseau) → vertical
(simple mais plafonné, reste un SPOF) → cache (gros gain) → horizontal + load balancer (impose le
stateless, état partagé) → réplication (plus de lectures) → partitionnement (plus d'écritures/volume) →
éliminer les SPOF pour la disponibilité. Estime la charge avant de dimensionner. On ne distribue que
lorsqu'une contrainte réelle l'exige.

## 📖 Vocabulaire
**scaling vertical / horizontal** · **stateless / état partagé** · **load balancer / health check** ·
**cache** · **réplication (réplica de lecture)** · **partitionnement / sharding** · **SPOF (point
unique de défaillance)** · **capacity planning / goulot**.

## 🔗 Liens avec le programme
Cette leçon réutilise `/doc/lessons/networking-proxy-loadbalancing` (répartiteur), `/doc/lessons/caching-performance`
(cache) et `/doc/lessons/database-modeling` (base), et complète `/doc/lessons/system-design-interview`
(méthode d'entretien) par une progression débutant. Elle prépare l'étude des systèmes distribués (ce
qui casse quand on distribue vraiment) et s'appuie sur `/doc/lessons/async-messaging-queues` (la file
comme amortisseur de charge).
