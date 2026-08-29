<!-- keep -->
# Leçon — Réseau : le modèle TCP/IP en couches

## 🌍 Le problème d'abord
« Le site ne marche pas. » Mais qu'est-ce qui ne marche pas, exactement ? Le nom qui
ne se traduit pas en adresse ? La machine injoignable ? Le bon programme qui répond
mal ? Sans méthode, on devine — on redémarre au hasard, on accuse « le réseau ». La
réalité, c'est que faire communiquer deux machines met en jeu **plusieurs étages
empilés**, chacun s'occupant d'une seule chose : le lien physique, l'adresse, la
livraison fiable, puis le sens du message. Si l'on sait à quel étage se situe la
panne, on la trouve en minutes. Cette leçon donne cette **carte mentale** — la base
qui rendra ensuite lisibles le DNS, TLS, HTTP et le réseau cloud. Aucune connaissance
réseau n'est supposée : on construit l'image étage par étage.

## 🎯 Objectif
Acquérir le **modèle mental par couches** qui structure tout le réseau : savoir à
quelle couche appartient un problème (câble/wifi, IP, TCP/UDP, application) pour
diagnostiquer méthodiquement au lieu de deviner. C'est la carte qui rend lisibles DNS,
TLS, HTTP, load balancers et réseau cloud.

## 🧩 Prérequis
Aucune connaissance réseau préalable n'est nécessaire : une machine avec un terminal
suffit. Il est simplement utile d'être à l'aise avec le terminal
(`/doc/lessons/terminal-shell-filesystem`), car on illustre chaque couche avec une
petite commande de diagnostic.

## 🧠 Modèle mental
Le réseau est un **empilement de couches**, chacune rendant un service à celle du
dessus et ignorant les détails de celle du dessous. Quatre couches suffisent
(modèle TCP/IP) : **liaison** (le lien physique/local), **internet** (adressage et
routage, IP), **transport** (livraison fiable ou non, TCP/UDP), **application** (le
sens : HTTP, DNS, SSH). Diagnostiquer un problème réseau = descendre les couches
jusqu'à celle qui échoue.

## 📖 Explication complète
**Les quatre couches.**
- **Liaison** : communication sur le réseau LOCAL (Ethernet, Wi-Fi), via des adresses
  **MAC**. Portée : le segment local. Ne quitte jamais le sous-réseau tel quel.
- **Internet (IP)** : achemine un paquet d'un réseau à l'autre via des **adresses IP**
  et le **routage**. IP est « best effort » : pas de garantie de livraison ni d'ordre.
- **Transport** : au-dessus d'IP, ajoute la notion de **port** (quel service sur la
  machine) et, pour **TCP**, la fiabilité (accusés de réception, ré-émission, ordre).
  **UDP** reste léger et sans garantie.
- **Application** : le protocole qui donne du SENS aux octets (HTTP demande une page,
  DNS résout un nom, SSH ouvre un shell).

**Encapsulation.** Un message applicatif est emballé de couche en couche : HTTP dans un
segment TCP, dans un paquet IP, dans une trame de liaison. À l'arrivée, on déballe dans
l'ordre inverse. Cette structure est POURQUOI on peut raisonner par couches : un
routeur ne lit que l'IP, un load balancer L4 que le TCP, un L7 que le HTTP.

**Adresses et identités par couche.** MAC (liaison, locale), IP (internet, routable),
IP:port (transport, identifie un service précis sur une machine). Un nom de domaine
(couche application, via DNS) est traduit en IP avant tout échange.

**Pourquoi ce découpage est utile.** Il localise les pannes. « Le site ne répond pas »
n'est pas une question : est-ce le nom qui ne se résout pas (DNS, application), la
machine injoignable (IP/routage), le port fermé (transport), ou l'application en erreur
(HTTP 500) ? Le bon réflexe est de tester **couche par couche**.

## 🔧 Diagnostic par couches (ce que chaque test prouve)
```
Nom → IP ?        dig exemple.test        (couche application : DNS résout-il ?)
Machine joignable? ping / traceroute      (couche internet : IP/routage — souvent
                                           filtré, une absence de réponse ne prouve rien)
Port ouvert ?      curl -v / nc -zv host 443   (couche transport : TCP se connecte-t-il ?)
Service OK ?       curl -i https://…       (couche application : quel statut HTTP ?)
```
Chaque étape monte d'une couche. On s'arrête à la première qui échoue : c'est là qu'est
le problème.

## 🧭 Exemple guidé — « le service est inaccessible »

Un collègue signale : « l'API ne répond plus ». C'est tout ce que tu as. La tentation est de
redémarrer quelque chose au hasard ; la méthode est de monter les couches une par une et de
s'arrêter à la première qui échoue.

1. **Le nom résout-il en IP ?** (`dig api.exemple.fr`) — sinon, c'est du DNS, et tester le
   reste ne sert à rien.
2. **L'IP est-elle routée ?** (`traceroute`) — avec une réserve importante, voir plus bas.
3. **Le port TCP répond-il ?** (`nc -zv api.exemple.fr 443`)
4. **L'application répond-elle correctement ?** (`curl -i`) — un 502 ou 503 désigne le
   service derrière, pas le réseau.

**Décision 1 — l'échec le plus utile est celui qu'on sait lire.** À l'étape 3, la même
commande peut échouer de deux façons, et beaucoup de gens les traitent comme équivalentes.
Elles ne le sont pas. Mesuré sur une machine, avec un service en écoute puis sans :

```
port 3777, un service écoute   → connexion établie          en   4 ms
port 3778, personne n'écoute   → "connection refused"       en   2 ms
```

Un **refus** est une réponse. La machine est vivante, joignable, et son système répond
activement « il n'y a personne sur ce port » — c'est pour cela qu'il arrive instantanément.
Diagnostic : le service est arrêté, ou il écoute sur un autre port, ou il n'écoute que sur
`127.0.0.1` au lieu de toutes les interfaces. C'est un problème **de service**.

Un **timeout** est une absence de réponse. Personne ne dit rien, et ton client attend
jusqu'à sa propre limite avant d'abandonner — d'où une durée longue, de l'ordre de plusieurs
secondes. Diagnostic : quelque chose jette les paquets en silence, ce qui est le
comportement normal d'un pare-feu ou d'un *security group* correctement configuré. C'est un
problème **de chemin**.

D'où une règle utilisable immédiatement : **la durée de l'échec est ton premier
diagnostic.** Instantané = quelqu'un a répondu non. Long = personne n'a répondu. Tu peux
trancher entre « le service est tombé » et « le pare-feu bloque » avant même d'ouvrir une
console d'administration.

**Décision 2 — se méfier de l'outil le plus utilisé.** `ping serveur.exemple` ne renvoie
rien : la plupart des gens en concluent que le serveur est mort. C'est un raisonnement
invalide, pour deux raisons cumulées. `ping` utilise ICMP, un protocole différent de celui
de ton application, et ICMP est très souvent bloqué par défaut sur les hébergeurs — un
silence est donc le comportement attendu d'une machine en parfaite santé. Et à l'inverse, un
`ping` qui répond ne prouve pas davantage que ton service fonctionne : il prouve que le
noyau de la machine est vivant, ce qui n'a jamais suffi à servir une requête. La conclusion
est presque la même que pour un test unitaire mal écrit : **un outil qui ne mesure pas la
chose qui t'intéresse ne t'apprend rien**, quel que soit son résultat.

**Décision 3 — depuis où testes-tu ?** C'est la question que les débutants oublient et qui
résout la moitié des cas. « Ça marche chez moi » et « ça ne marche pas depuis le serveur »
ne sont pas contradictoires : ce sont deux points de vue différents sur le réseau. Ton poste
sort peut-être par un VPN, le serveur non ; le nom résout peut-être vers une IP interne
depuis le centre de données et publique depuis l'extérieur. Rejoue donc **la même commande
depuis la machine qui a réellement le problème**, pas depuis la tienne. Le même `curl`, au
même moment, depuis deux endroits, sépare immédiatement un problème de service d'un problème
d'accès.

**Décision 4 — savoir quand on a quitté le réseau.** Si l'étape 4 renvoie un `502 Bad
Gateway`, le diagnostic réseau est terminé et il est positif : le DNS a résolu, la route
existe, le port a répondu, et un serveur HTTP t'a construit une réponse. Ce serveur te dit
simplement qu'il n'a pas réussi à joindre le service derrière lui. Continuer à inspecter des
routes à ce stade, c'est chercher ses clés sous le lampadaire. **Un code HTTP est déjà une
preuve que le réseau a fonctionné.**

**Variante qui déplace le problème.** Le service répond, mais une requête sur deux échoue.
La démarche ci-dessus ne mord pas : chaque test isolé peut réussir. L'intermittence oriente
vers autre chose — un nom qui résout vers plusieurs adresses dont une seule est en panne
(vérifiable en relançant `dig` et en regardant l'ensemble des IP retournées), un
répartiteur de charge devant plusieurs instances dont une est cassée, ou une table de
correspondance d'adresses saturée. La leçon générale : une panne totale se diagnostique
couche par couche, une panne intermittente se diagnostique en cherchant **ce qui varie
d'une tentative à l'autre**.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. `ping serveur.exemple` ne renvoie rien. Qu'as-tu appris ?
2. `curl https://api.exemple` échoue avec « connection refused », et sur une autre
   machine avec « connection timed out ». Ces deux messages disent-ils la même chose ?
3. Un nom résout bien, la machine répond au ping, et le service est injoignable. Quelle
   couche testes-tu ensuite, et avec quoi ?
4. Pourquoi un routeur n'a-t-il pas besoin de comprendre HTTP pour acheminer une
   requête HTTP ?

## ✅ Correction attendue

**La démarche.** Tester **couche par couche**, de bas en haut, et ne monter qu'après
avoir validé le niveau précédent. Chaque outil interroge une couche précise : `dig`
l'application, `traceroute` l'internet, `nc` le transport, `curl -i` l'application à
nouveau, mais côté sens.

**L'erreur probable, et c'est le premier outil que tout le monde apprend.** À la
première question, la réponse spontanée est « la machine est morte » ou « le réseau est
coupé ». La bonne réponse est : **tu n'as appris presque rien.**

`ping` n'utilise ni TCP ni UDP : il utilise **ICMP**, un protocole distinct. Or ICMP est
bloqué par défaut dans la plupart des configurations de pare-feu, et notamment dans les
groupes de sécurité par défaut des fournisseurs cloud. Une machine parfaitement saine,
qui sert du HTTPS à des milliers de clients, ne répondra pas au ping. **L'absence de
réponse ICMP ne dit rien sur l'état du port 443.**

Le piège séduit pour trois raisons qui se cumulent. `ping` est le premier outil réseau
qu'on apprend, donc le plus familier. Il donne une réponse **binaire**, ce qui est
reposant quand on cherche à trancher. Et surtout, **il a longtemps eu raison** : sur un
réseau local sans filtrage, un ping muet signifiait vraiment une machine éteinte.
L'intuition a été correcte pendant des années, puis le monde a mis des pare-feu partout
et l'outil a cessé de mesurer ce qu'on croit qu'il mesure.

Le remplaçant est le test de la couche qui t'intéresse vraiment : `nc -zv hôte 443` ou
`curl -v`. Tester le port, pas la machine.

**Sur les autres questions.** « Connection refused » et « connection timed out » sont
deux diagnostics **opposés**, et les confondre coûte des heures. *Refused* signifie que
le paquet est arrivé et que la machine a activement répondu « aucun service n'écoute
sur ce port » : le réseau fonctionne, c'est le service qui est arrêté. *Timed out*
signifie que rien n'est revenu : le paquet est tombé dans le vide — pare-feu qui rejette
silencieusement, route absente, machine injoignable. Le premier t'envoie regarder le
processus, le second le réseau.

Quand le nom résout et que la machine répond, la couche suivante est le **transport** :
`nc -zv hôte port`. C'est le test qui distingue « le service n'écoute pas » de « le
service écoute mais répond mal », et il coûte une seconde.

Enfin, le routeur ignore HTTP à cause de l'**encapsulation** : les octets HTTP sont
enfermés dans un segment TCP, lui-même dans un paquet IP. Le routeur ne lit que
l'enveloppe IP — l'adresse de destination — et fait suivre sans jamais ouvrir le
contenu. C'est exactement ce qui rend Internet possible : chaque couche ne connaît que
la sienne, et l'on peut inventer un nouveau protocole applicatif sans changer un seul
routeur au monde.

**Alternative défendable.** Certaines équipes autorisent ICMP à l'intérieur de leur
réseau privé, précisément pour que le ping redevienne un diagnostic fiable entre leurs
propres machines. C'est raisonnable et courant. Ce qui ne l'est pas est d'en déduire
que l'outil vaut aussi vers l'extérieur.

**Vérifie seul, sans corrigé** :
1. Pingue un grand service public. Beaucoup ne répondent pas, et fonctionnent
   parfaitement — tu viens de vérifier la leçon en dix secondes.
2. Sur ta machine, lance `nc -zv` vers un port ouvert puis vers un port fermé. Note la
   différence exacte des messages : c'est celle de la question 2.
3. Sur ton dernier incident réseau : quelle couche as-tu testée en premier ? Étais-tu
   parti du bas, ou de ton hypothèse ?

## ⚠️ Erreurs fréquentes
- **Conclure « c'est le réseau » sans preuve par couche** : c'est souvent
  l'application (500) ou le DNS.
- Se fier au `ping` : ICMP filtré → « ne répond pas » ne veut pas dire « éteint ».
- Confondre couche transport (port fermé) et couche application (port ouvert mais 500).
- Oublier que le nom doit d'abord se résoudre en IP.
- Mélanger MAC (local) et IP (routable).

## ☁️ Vers le cloud et Kubernetes
Ce modèle explique les composants cloud : un **security group** filtre au niveau
transport (IP:port), un **load balancer L4** route au transport, un **L7** au niveau
application. En Kubernetes, un **Service** expose au niveau transport, un **Ingress** au
niveau application (HTTP). Les mêmes couches, d'autres noms.

## 🏢 Cas métier
Une API « tombe » pour certains utilisateurs. Diagnostic par couches : le DNS résout
bien (application OK), l'IP est joignable, mais le port 443 est fermé depuis certaines
régions → une règle de security group trop restrictive au niveau transport. On corrige
la règle, pas l'application.

## 🎤 Questions d'entretien
- « Cite les couches TCP/IP et leur rôle. » → liaison (local/MAC), internet (IP/routage),
  transport (ports, TCP/UDP), application (HTTP/DNS/SSH).
- « TCP vs UDP en une phrase ? » → fiable et ordonné vs léger et sans garantie.
- « Un `ping` sans réponse prouve-t-il que la machine est morte ? » → non (ICMP filtré).

## ✍️ Mini-exercice
Le nom résout, l'IP est joignable, mais `curl` renvoie « connection refused » sur 443.
À quelle couche est le problème ? → transport (port fermé : service arrêté ou pare-feu),
pas l'application.

## 🧾 À retenir
- Quatre couches : liaison → internet (IP) → transport (TCP/UDP, ports) → application.
- Encapsulation : chaque couche emballe la précédente ; chaque équipement lit « sa » couche.
- Diagnostiquer = tester couche par couche, s'arrêter à la première qui échoue.
- `ping` filtré ne prouve rien ; distinguer port fermé (transport) et 500 (application).

## 📚 Vocabulaire
**couche** · **liaison / MAC** · **IP / routage** · **transport / port** ·
**TCP / UDP** · **application (HTTP/DNS/SSH)** · **encapsulation** · **best effort**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je nomme les 4 couches et j'y range un problème donné.
- [ ] Je diagnostique une panne en montant les couches une à une.
- [ ] Je ne conclus pas « réseau » sans preuve.

## 🔗 Liens avec le programme
Jour `/day/71` (réseau : DNS, TCP, TLS, HTTP). Leçons liées :
`/doc/lessons/networking-dns`, `/doc/lessons/networking-http-tls`,
`/doc/lessons/networking-proxy-loadbalancing`. Ce modèle sous-tend le réseau cloud
(VPC/subnets/security groups) et Kubernetes (Service/Ingress).
