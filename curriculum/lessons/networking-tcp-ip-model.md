<!-- keep -->
# Leçon — Réseau : le modèle TCP/IP en couches

## 🎯 Objectif
Acquérir le **modèle mental par couches** qui structure tout le réseau : savoir à
quelle couche appartient un problème (câble/wifi, IP, TCP/UDP, application) pour
diagnostiquer méthodiquement au lieu de deviner. C'est la carte qui rend lisibles DNS,
TLS, HTTP, load balancers et réseau cloud.

## 🧩 Prérequis
Aucun ; une machine avec un terminal suffit.

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
