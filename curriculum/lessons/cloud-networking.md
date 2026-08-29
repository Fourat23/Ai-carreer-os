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

## 🧭 Exemple guidé — le même réseau, vu par un attaquant

Un réseau cloud à trois niveaux se dessine en quatre lignes. On peut les apprendre par
cœur sans rien comprendre. La façon utile de les comprendre est de se demander, à
chaque couche : **si quelqu'un arrive jusqu'ici, jusqu'où va-t-il ensuite ?**

Voici le schéma, puis la même question posée trois fois.

```
Réseau privé virtuel        10.0.0.0/16
├── sous-réseau public      10.0.1.0/24   → le répartiteur de charge
├── sous-réseau privé       10.0.2.0/24   → les serveurs applicatifs
└── sous-réseau privé       10.0.3.0/24   → la base de données
```

### Ce que « public » et « privé » veulent réellement dire

Ce n'est pas une étiquette de sécurité, et c'est la première confusion à lever. Un
sous-réseau est **public** s'il a une route vers la passerelle Internet ; **privé**
s'il n'en a pas. C'est une question de **table de routage**, pas de réglage de sécurité.

Conséquence pratique importante : une machine dans un sous-réseau privé n'est pas
protégée par magie. Elle est simplement **inatteignable depuis Internet parce qu'aucun
chemin n'y mène**. La différence compte, parce qu'une erreur de routage peut la rendre
joignable sans que personne n'ait touché à une règle de pare-feu.

### Question 1 — l'attaquant atteint le répartiteur de charge

C'est le seul composant exposé, donc c'est par lui que tout commence. Que peut-il
faire ? Envoyer des requêtes HTTP. C'est tout : le répartiteur n'écoute que sur les
ports 80 et 443, et ne sait rien faire d'autre que transmettre.

**Ce qui est déjà gagné à ce stade** : il n'a pas d'accès SSH, pas d'accès à la base,
pas de vue sur les machines. Il est dans la position d'un visiteur normal — et c'est
exactement l'objectif de cette couche.

### Question 2 — l'attaquant obtient l'exécution de code sur un serveur applicatif

Cette fois c'est sérieux : une faille dans le code applicatif, et il exécute des
commandes sur une machine du sous-réseau `10.0.2.0/24`.

**Que peut-il joindre ?** Le groupe de sécurité de la base n'accepte que le port 5432
et **uniquement en provenance du groupe de sécurité des serveurs applicatifs**. C'est
le point technique qu'il faut avoir compris : les règles de sécurité cloud se réfèrent
à des **groupes**, pas à des plages d'adresses. Autoriser « le groupe des serveurs
applicatifs » plutôt que « 10.0.2.0/24 » reste juste quand les machines changent
d'adresse, ce qu'elles font sans arrêt.

Il atteint donc la base — c'est inévitable, l'application doit lui parler. Ce qu'il
n'atteint pas : les autres machines du même sous-réseau, **si** leurs règles n'ouvrent
rien entre elles. C'est le principe du cloisonnement latéral, et il est souvent oublié
parce qu'on raisonne en « intérieur/extérieur » alors que la vraie question est
« qui parle à qui, précisément ».

**Peut-il exfiltrer les données ?** Oui, et c'est la limite honnête de cette
architecture : le sous-réseau privé a une **passerelle de traduction d'adresses** pour
sortir — mises à jour de sécurité, appels d'API externes. Cette passerelle ne laisse
entrer personne, mais elle laisse sortir tout le monde. Une donnée volée part par là.

C'est pourquoi les architectures sensibles restreignent aussi le trafic **sortant** :
liste d'autorisation des destinations, ou suppression pure et simple de la passerelle
au profit de points de terminaison privés vers les seuls services nécessaires. Peu
d'équipes le font, parce que ça casse des choses tous les jours au début.

### Question 3 — l'attaquant atteint la base

Il a les données. Le réseau ne peut plus rien pour toi ; c'est le chiffrement, la
gestion des accès et la journalisation qui prennent le relais.

### Ce que ce découpage achète réellement

Il n'empêche pas l'intrusion — **aucune architecture réseau ne le fait**. Il fait deux
choses, et il faut savoir les nommer :

1. il **réduit la surface** : un seul composant est exposé, au lieu de dix ;
2. il **limite la propagation** : chaque couche franchie n'en donne qu'une, pas
   l'ensemble.

C'est le principe du rayon d'explosion. La bonne question à se poser en concevant n'est
pas « est-ce sécurisé ? » — question à laquelle on répond toujours oui — mais :
**« quand cette couche tombe, qu'est-ce que l'attaquant obtient exactement ? »** Si la
réponse est « tout », le découpage est décoratif.

### L'erreur qui annule tout le travail

Ouvrir une règle de pare-feu vers `0.0.0.0/0` sur le port 22 pour « déboguer
rapidement », et l'oublier. Le sous-réseau reste privé, la table de routage est
correcte — mais la machine est désormais accessible depuis n'importe où, et les
tentatives de connexion automatisées la trouveront en quelques heures. **Une
architecture réseau se conçoit en une journée et se détruit en une règle.**

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

## ✍️ Mini-exercice — auditer un réseau par le rayon d'explosion

**Contexte.** Voici le réseau d'une application de facturation, tel qu'il a été livré
par un prestataire. Il fonctionne.

```
Réseau privé virtuel 10.0.0.0/16
├── sous-réseau public  10.0.1.0/24
│     ├── répartiteur de charge   : entrant 80, 443 depuis 0.0.0.0/0
│     └── machine d'administration : entrant 22 depuis 0.0.0.0/0
├── sous-réseau public  10.0.2.0/24
│     └── 3 serveurs applicatifs   : entrant 80 depuis 0.0.0.0/0, sortie directe
└── sous-réseau privé   10.0.3.0/24
      └── base de données          : entrant 5432 depuis 10.0.0.0/16
```

**Ce que tu produis.** Un audit en trois parties.

1. **Cinq défauts**, classés par gravité. Pour chacun : ce qui est ouvert, **ce qu'un
   attaquant obtient en le franchissant**, et la correction précise (pas « sécuriser »,
   mais la règle exacte).
2. Le **rayon d'explosion** de chacune des trois compromissions : répartiteur, serveur
   applicatif, machine d'administration. Pour chacune, la liste de ce qui devient
   atteignable.
3. Le **schéma corrigé**, en quatre à six lignes.

**Livrable.** L'audit écrit, avec pour chaque défaut une ligne de la forme :
*« ouvert : … → obtient : … → correction : … »*.

**Critère de réussite.** Vérifiable seul : après ta correction, la compromission d'un
serveur applicatif ne doit donner accès **ni** aux autres serveurs applicatifs, **ni**
à la machine d'administration. Si c'est encore le cas, tu as corrigé l'entrée sans
corriger la circulation interne.

**Piège.** Un des cinq défauts n'est pas une règle trop ouverte mais un **choix de
sous-réseau**. Et un autre est plus grave qu'il n'en a l'air parce qu'il annule une
protection située ailleurs.

## ✅ Correction attendue

**La démarche.** On lit un réseau dans cet ordre : d'abord **ce qui est joignable
depuis Internet**, ensuite **ce que chaque composant peut joindre**, enfin **ce qui
sort**. La plupart des audits s'arrêtent au premier point et manquent l'essentiel.

**Défaut 1 — le plus grave. SSH ouvert au monde entier sur la machine
d'administration.** Ouvert : port 22 depuis `0.0.0.0/0`. Obtient : une machine
d'administration a par construction des droits étendus ; sa compromission donne
probablement accès à tout le reste. Correction : restreindre à la plage d'adresses de
l'entreprise, ou mieux, supprimer la machine et passer par un service d'accès managé
qui journalise les sessions. **Une machine d'administration exposée annule le bénéfice
de tout le découpage réseau**, parce qu'elle est précisément le composant qui peut
parler à tous les autres.

**Défaut 2 — les serveurs applicatifs sont dans un sous-réseau public et exposés
directement.** Ouvert : port 80 depuis `0.0.0.0/0`. Obtient : le répartiteur de charge
peut être **contourné**. Tout ce qu'il apportait — terminaison TLS, filtrage, limitation
de débit, journalisation — devient facultatif pour l'attaquant, qui frappe directement
les serveurs. C'est le défaut « plus grave qu'il n'en a l'air » : il n'ouvre pas une
nouvelle porte, il **rend inutile** une protection existante. Correction : entrant 80
autorisé uniquement depuis le groupe de sécurité du répartiteur.

**Défaut 3 — le choix de sous-réseau.** Les serveurs applicatifs n'ont aucune raison
d'être dans un sous-réseau public. Correction : les déplacer en privé, avec une
passerelle de traduction d'adresses pour leurs mises à jour. C'est le défaut qui n'est
pas une règle mais une **implantation** : même avec des règles parfaites, une machine
dans un sous-réseau public a une route vers Internet, et une erreur future la rendra
joignable.

**Défaut 4 — la base accepte tout le réseau privé virtuel.** Ouvert : `10.0.0.0/16`,
c'est-à-dire l'ensemble du réseau, machine d'administration comprise. Correction :
entrant 5432 depuis le seul groupe de sécurité des serveurs applicatifs. La règle par
groupe reste juste quand les adresses changent, contrairement à une plage.

**Défaut 5 — rien n'encadre la sortie.** Les serveurs applicatifs ont une sortie
directe et illimitée. Obtient : un canal d'exfiltration. Correction, par ordre de
faisabilité : passerelle de traduction plutôt que sortie directe, puis restriction des
destinations autorisées, puis points de terminaison privés vers les seuls services
nécessaires.

**Les trois rayons d'explosion, avant correction.**

| compromission | ce qui devient atteignable |
|---|---|
| répartiteur de charge | les serveurs applicatifs — mais ils étaient déjà exposés, donc **rien de plus** |
| un serveur applicatif | les **deux autres** serveurs (même sous-réseau, aucune règle entre eux), **la base** (règle sur tout le réseau), et Internet en sortie |
| machine d'administration | tout, sans exception |

Après correction, la compromission d'un serveur applicatif donne : la base, et rien
d'autre. C'est le résultat qu'on cherche — pas l'invulnérabilité, mais un dégât **borné
et prévisible**.

**L'erreur probable.** Corriger uniquement le port 22, parce que c'est le défaut qui
ressemble le plus à une faille. C'est nécessaire et très insuffisant : la circulation
latérale entre serveurs applicatifs et la sortie non contrôlée restent ouvertes, et ce
sont elles qui transforment une intrusion en fuite de données.

**Les indices qui font reconnaître ce type de problème.** Trois motifs, à chercher
systématiquement dans n'importe quelle configuration réseau : `0.0.0.0/0` en entrée sur
autre chose qu'un répartiteur · une règle qui autorise **une plage entière** au lieu
d'un groupe · des machines de même rôle dans un sous-réseau sans règle entre elles.

**Quand la réponse changerait.** Sur un environnement de démonstration jetable, sans
données réelles, cet audit est disproportionné et la configuration livrée est
acceptable. **Le rayon d'explosion se mesure en valeur de ce qu'on protège** — c'est la
première question à poser avant de concevoir, et elle n'est pas technique.

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
