<!-- keep -->
# Leçon — Cloud : le réseau (VPC/VNet, subnets, pare-feu)

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Dans le cloud, vos machines ont besoin d'un réseau : lesquelles peuvent se parler ?
lesquelles sont joignables depuis Internet ? laquelle doit rester cachée (la base de
données) ? Bonne nouvelle : ce n'est PAS un nouveau sujet. Un réseau cloud, c'est
exactement l'adressage, les subnets, les passerelles et le routage que vous avez
déjà appris — mais rendus **logiciels** : on les crée par configuration, en quelques
clics, au lieu de tirer des câbles. Le vocabulaire change selon le fournisseur (AWS
dit « VPC », Azure dit « VNet »), le raisonnement non. Cette leçon fait le pont
entre le réseau « général » déjà vu et sa version cloud, et montre l'erreur qui
expose une base de données à tout Internet.

## 🎯 Objectif
Appliquer le modèle réseau au cloud : le réseau virtuel isolé (**VPC** côté AWS,
**VNet** côté Azure), le découpage en **subnets** publics/privés, les **pare-feu**
(security groups / NSG), les passerelles (**Internet Gateway**, **NAT**), et
l'équilibrage managé. Concevoir un réseau cloud sûr et diagnostiquer « ça ne passe
pas ».

## 🧩 Prérequis
Vous devez maîtriser l'**adressage IP/CIDR, subnets, gateway, NAT**
(`/doc/lessons/networking-addressing-routing`) et le **modèle en couches**
(`/doc/lessons/networking-tcp-ip-model`), ainsi que les **fondamentaux cloud**
(régions/zones — `/doc/lessons/cloud-fundamentals`) : cette leçon ne fait que les
transposer au cloud. VPC/VNet, security group/NSG sont reliés à ces bases.

## 🧠 Modèle mental
Un réseau cloud EST le modèle appris en réseau (CIDR, subnets, gateway, routage,
NAT), rendu **logiciel et déclaratif**. On dessine un espace d'adresses privé, on
le découpe en quartiers (subnets), on décide qui a une porte vers Internet, et on
place des pare-feu à l'entrée des ressources. Les noms changent d'un fournisseur à
l'autre, le raisonnement non.

## 📖 Explication complète
**Le réseau virtuel isolé.** Un **VPC** (AWS) ou **VNet** (Azure) est un espace
réseau privé, défini par une plage **CIDR** (ex. `10.0.0.0/16`), isolé des autres
clients. C'est le périmètre dans lequel vivent vos ressources.

**Subnets publics et privés.** On découpe le VPC/VNet en **subnets** disjoints. Un
subnet est **public** s'il a une route vers l'**Internet Gateway** (ses ressources
peuvent être joignables/joindre Internet) ; **privé** sinon. Le motif standard :
équilibreur/point d'entrée en public, applications et bases en PRIVÉ.

**Sortie sans entrée : la NAT.** Une ressource privée qui doit SORTIR (mise à jour,
appel d'API externe) sans être joignable depuis Internet passe par une **NAT
gateway** : sortie possible, entrée impossible — exactement le modèle « privé +
NAT » vu en réseau.

**Pare-feu : deux niveaux.**
- Les **security groups** (AWS) / **NSG** (Azure) filtrent au niveau de la
  ressource (ou de la carte réseau) : règles par IP/port/protocole. Un security
  group AWS est **stateful** (le retour d'une connexion autorisée passe
  automatiquement).
- AWS ajoute les **NACL** au niveau du subnet (stateless). Azure applique les NSG
  au niveau subnet et/ou interface.
Distinction importante : ne pas confondre le filtrage au niveau ressource
(SG/NSG) et au niveau subnet (NACL/NSG de subnet).

**Équilibrage et entrée.** Les load balancers managés (L4/L7) sont le point
d'entrée public standard ; ils appliquent le modèle proxy/L4-L7 vu en réseau. Les
ressources restent en privé derrière eux.

**Connexions privées et DNS.** On relie des réseaux par **peering** (attention aux
CIDR qui ne doivent pas se chevaucher — piège vu en réseau), et on accède à des
services managés via des **endpoints privés** pour éviter de passer par Internet.
Le **DNS privé** nomme les ressources internes sans les exposer.

## 🔧 Repères (multi-fournisseurs)
- VPC (AWS) / VNet (Azure) = réseau privé défini par CIDR.
- Subnet public = route vers Internet Gateway ; privé = pas de route entrante.
- Sortie privée → NAT gateway.
- Filtrage : security group (AWS, stateful) / NSG (Azure) au niveau ressource ;
  NACL (AWS) / NSG de subnet au niveau subnet.
- Peering sans chevauchement de CIDR ; endpoints privés + DNS privé.

## 🧭 Exemple guidé — concevoir un réseau à 3 niveaux
1. VPC/VNet `10.0.0.0/16`.
2. Subnet **public** `10.0.1.0/24` : l'équilibreur.
3. Subnets **privés** `10.0.2.0/24` (app) et `10.0.3.0/24` (base), sortie via NAT.
4. Pare-feu : l'app n'accepte que le trafic de l'équilibreur ; la base n'accepte
   que celui de l'app. Rien n'est directement exposé sauf l'équilibreur.

## ⚠️ Erreurs fréquentes
- Mettre une **base dans un subnet public** « pour y accéder » (surface d'attaque).
- **Security group trop ouvert** (`0.0.0.0/0` sur un port sensible).
- Oublier la **NAT** et se demander pourquoi une ressource privée ne peut pas sortir.
- **Chevauchement de CIDR** empêchant un peering.
- Confondre filtrage niveau ressource (SG/NSG) et niveau subnet (NACL).

## 🔐 Sécurité
Le réseau est la première ligne de défense cloud : n'exposer QUE l'entrée
nécessaire (équilibreur), garder app et base en privé, appliquer le moindre
privilège aux règles de pare-feu (pas de `0.0.0.0/0` sur des ports d'admin). La
plupart des fuites de données cloud viennent de ressources exposées par
configuration réseau/accès trop permissive (responsabilité client).

## 🏢 Cas métier
Un audit trouve une base accessible depuis Internet : elle était dans un subnet
public avec un security group ouvert à `0.0.0.0/0`. Remédiation : déplacer la base
en subnet privé, restreindre le SG au seul subnet applicatif, ajouter une NAT pour
ses mises à jour sortantes. L'exposition disparaît sans changer l'application.

## 🎤 Questions d'entretien
- « Subnet public vs privé ? » → route vers l'Internet Gateway ou non.
- « À quoi sert une NAT gateway ? » → laisser sortir des ressources privées sans
  les rendre joignables.
- « Security group vs NACL (AWS) ? » → filtrage stateful au niveau ressource vs
  stateless au niveau subnet.

## ✍️ Mini-exercice
Une ressource privée doit télécharger des mises à jour mais ne doit PAS être
joignable depuis Internet. Quel composant ? → une NAT gateway (sortie sans entrée).

## 🧾 À retenir
- VPC (AWS) / VNet (Azure) = réseau privé par CIDR ; c'est le modèle réseau, en
  logiciel.
- Public = route vers Internet Gateway ; privé + NAT = sortie sans entrée.
- SG/NSG (ressource) vs NACL/NSG de subnet ; SG AWS stateful.
- N'exposer que l'entrée nécessaire ; base et app en privé.

## 📚 Vocabulaire
**VPC / VNet** · **subnet public/privé** · **Internet Gateway** · **NAT gateway** ·
**security group / NSG** · **NACL** · **peering** · **endpoint privé** · **DNS
privé**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je conçois un VPC/VNet à subnets public/privé avec NAT.
- [ ] Je restreins les pare-feu au moindre privilège.
- [ ] Je distingue filtrage niveau ressource et niveau subnet.

## 🔗 Liens avec le programme
Mois 11 (cloud). Leçons liées : `/doc/lessons/networking-addressing-routing`,
`/doc/lessons/cloud-fundamentals`, `/doc/lessons/cloud-aws-core`,
`/doc/lessons/cloud-azure-core`. Le réseau cloud sous-tend AWS et Azure et l'entrée
des clusters Kubernetes.
