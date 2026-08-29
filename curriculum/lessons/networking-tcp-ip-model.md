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
1. Le nom résout-il en IP ? (`dig`) — sinon problème DNS, inutile d'aller plus loin.
2. L'IP est-elle joignable/routée ? (`traceroute`) — attention, ICMP est souvent
   bloqué : un ping sans réponse ne prouve pas que la machine est morte.
3. Le port TCP répond-il ? (`nc -zv host 443` ou `curl -v`) — sinon service arrêté ou
   pare-feu/security group.
4. L'application répond-elle correctement ? (`curl -i`) — un 502/503 pointe vers le
   backend, pas le réseau.

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
