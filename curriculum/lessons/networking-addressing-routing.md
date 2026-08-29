<!-- keep -->
# Leçon — Réseau : adressage IP, CIDR et routage

## 🌍 Le problème d'abord
Chaque machine sur un réseau a une **adresse**, comme une maison a une adresse
postale. Mais quand vous devez organiser des centaines de machines dans le cloud —
lesquelles peuvent se parler ? lesquelles sont joignables depuis Internet ?
lesquelles doivent rester cachées ? — il faut découper l'espace d'adresses en
**quartiers** et décider des règles de circulation. Mal fait, deux quartiers se
chevauchent et plus rien ne « route » ; ou une base de données se retrouve exposée à
tout Internet. Cette leçon part de l'analogie « adresses et quartiers d'une ville »
(en précisant vite ses limites) pour construire les vraies notions : IP, CIDR,
subnet, gateway, routage et NAT. C'est exactement le modèle des réseaux cloud
(VPC/VNet).

## 🎯 Objectif
Savoir lire une adresse IP et un **CIDR**, comprendre ce qu'est un **subnet**, une
**gateway**, une **table de routage** et le **NAT**, et distinguer réseau **public** et
**privé** — les fondations pour concevoir un VPC/VNet et diagnostiquer « ça ne route
pas ».

## 🧩 Prérequis
Vous devez avoir la **carte mentale des couches réseau**
(`/doc/lessons/networking-tcp-ip-model`), en particulier savoir que l'adresse IP vit
à la couche « internet » : cette leçon zoome sur cette couche. Aucune notion de CIDR,
subnet ou NAT n'est supposée — elles sont construites ici pas à pas.

## 🧠 Modèle mental
Une **IP** est l'adresse d'une machine sur un réseau. Un **subnet** est un quartier
d'adresses contiguës. Une machine parle DIRECTEMENT à son quartier ; pour joindre
l'extérieur, elle passe par une **gateway** (la sortie du quartier). La **table de
routage** est le plan qui dit « pour telle destination, prends telle sortie ». Concevoir
un réseau, c'est découper des quartiers (subnets) et décider qui a une sortie vers
Internet.

**Les limites de l'analogie, et il faut les connaître avant qu'elles ne coûtent cher.**
Elle est utile sur trois points — les adresses sont hiérarchiques, les quartiers sont
contigus, on sort par une porte — et elle trompe sur trois autres :

1. **Un quartier n'a pas de murs.** Dans une ville, changer de quartier demande de se
   déplacer ; dans un réseau, deux subnets d'un même VPC se joignent **par défaut**, sans
   rien faire. Le découpage en subnets organise l'adressage, il n'isole rien. C'est le
   pare-feu (security group, NACL) qui isole, pas le subnet.
2. **« Privé » ne veut pas dire « protégé ».** Un subnet privé n'a pas de route vers
   Internet — c'est tout. Il reste joignable par n'importe quelle machine du même réseau.
3. **Les frontières sont invisibles et exactes.** Une rue peut appartenir à deux
   quartiers dans le langage courant ; un chevauchement de plages CIDR, lui, casse
   immédiatement le routage. Il n'y a pas d'approximation possible.

Retiens la première : c'est celle qui produit les vrais incidents de sécurité.

## 📖 Explication complète
**IPv4 et notation.** Une IPv4 tient sur 32 bits, notée en quatre octets
(`10.0.5.23`). Chaque octet va de 0 à 255. Certaines plages sont **privées** (non
routables sur Internet) : `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`. Le reste est
public.

**CIDR : le nombre après le slash.** `10.0.0.0/16` signifie « les 16 premiers bits sont
FIXES (le préfixe réseau), les 16 suivants sont libres (les hôtes) ». Plus le nombre est
GRAND, plus le réseau est PETIT : `/24` = 256 adresses, `/16` = 65 536. Règle utile :
un `/24` fixe les trois premiers octets (`10.0.5.x`, ~254 hôtes utilisables) ; passer de
`/24` à `/25` coupe le quartier en deux (128 adresses chacun). Deux subnets d'un même
réseau doivent avoir des plages **disjointes** (un chevauchement rend le routage
ambigu).

**Subnet, gateway, broadcast.** Dans un subnet, quelques adresses sont réservées
(réseau, gateway, broadcast). La **gateway** (souvent la première IP utilisable) est la
porte de sortie : tout paquet dont la destination n'est PAS dans le subnet local y est
envoyé.

**La table de routage.** Chaque machine (et chaque routeur) a une table : « destination
→ interface/next-hop ». La **route par défaut** (`0.0.0.0/0`) attrape tout ce qui n'a
pas de route plus spécifique et l'envoie à la gateway. `ip route` (Linux) l'affiche.
La règle : la route la plus **spécifique** (préfixe le plus long) gagne.

**Public vs privé, et NAT.** Une machine dans un subnet **privé** n'a pas d'IP publique :
elle ne peut pas être jointe depuis Internet (bien pour une base, un backend). Pour
qu'elle SORTE quand même (télécharger une mise à jour), on utilise le **NAT** (Network
Address Translation) : une passerelle traduit son IP privée en une IP publique partagée
le temps de la connexion sortante. Entrée impossible, sortie possible : c'est le modèle
« subnet privé + NAT gateway » du cloud.

## 🔧 Repères pratiques
```bash
ip addr                 # adresses IP des interfaces
ip route                # table de routage (voir la route par défaut)
ip route get 1.1.1.1    # par quelle route sortirait ce paquet ?
```
Calcul mental utile : `/24` → 256 adresses (254 hôtes), `/16` → 65 536, `/25` → 128,
`/26` → 64. Chevauchement : `10.0.1.0/24` et `10.0.1.128/25` se recouvrent (le second
est inclus dans le premier).

## 🧭 Exemple guidé — concevoir un petit réseau cloud
1. Choisir un espace privé : `10.0.0.0/16` (65 536 adresses).
2. Découper en subnets disjoints : `10.0.1.0/24` **public** (load balancer),
   `10.0.2.0/24` **privé** (backends), `10.0.3.0/24` **privé** (base).
3. Route : le subnet public a une route `0.0.0.0/0` vers l'Internet Gateway ; les subnets
   privés ont une route sortante via une NAT gateway (sortie seule).
4. Vérifier : aucune plage ne se chevauche ; la base n'est joignable que depuis les
   backends (règles de pare-feu), pas d'Internet.

## ⚠️ Erreurs fréquentes
- **Confondre la taille du préfixe** : croire que `/16` est plus petit que `/24`.
- **Subnets qui se chevauchent** : routage ambigu, segmentation cassée.
- Mettre une base dans un subnet **public** « pour y accéder » (surface d'attaque).
- Oublier le NAT et se demander pourquoi un backend privé ne peut pas sortir.
- Utiliser des plages publiques par erreur pour un réseau interne.

## ☁️ Vers le cloud
Un **VPC** (AWS) ou **VNet** (Azure) est exactement ce découpage : un espace CIDR
divisé en subnets publics/privés, avec tables de routage, Internet Gateway et NAT. La
leçon de fond ici EST le modèle mental du réseau cloud ; seuls les noms changent.

## 🏢 Cas métier
Deux équipes ont créé chacune un réseau `10.0.0.0/16`. Au moment de les relier
(peering), le trafic ne route plus : les plages se **chevauchent**, impossible de
distinguer les destinations. Leçon : planifier l'adressage globalement AVANT de créer
les réseaux (une plage par environnement/équipe).

## 🎤 Questions d'entretien
- « Combien d'adresses dans un `/24` ? » → 256 (254 hôtes utilisables).
- « Différence subnet public / privé ? » → route vers l'Internet Gateway ou non.
- « À quoi sert le NAT ? » → laisser sortir des ressources privées sans les rendre
  joignables depuis l'extérieur.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. `10.0.1.0/24` et `10.0.2.0/24` se chevauchent-ils ? Et `10.0.0.0/16` avec
   `10.0.5.0/24` ?
2. Ta base est dans un subnet privé. Un serveur web du subnet public est compromis.
   Que peut atteindre l'attaquant ?
3. Pourquoi `/25` désigne-t-il un réseau DEUX FOIS plus petit que `/24`, alors que 25
   est plus grand que 24 ?
4. Tu prévois trois environnements et deux régions. Quel espace d'adressage choisis-tu,
   et qu'est-ce qui rend cette décision difficile à corriger plus tard ?

## ✅ Correction attendue

**La démarche.** Un CIDR se lit en bits : le nombre après le slash compte les bits
**fixés**. Tout le reste — taille, chevauchement, découpage — en découle mécaniquement.

**L'erreur probable, et c'est une faille de sécurité, pas une erreur de calcul.** À la
deuxième question, la réponse spontanée est « rien, la base est dans un subnet privé,
elle est protégée ». Elle est fausse, et dangereusement.

**« Privé » qualifie une route, pas une protection.** Un subnet privé se définit par une
seule propriété : il n'a pas de route vers l'Internet Gateway. Cela empêche exactement
une chose — qu'on l'atteigne depuis Internet. Cela n'empêche en rien une machine **du
même réseau** de la joindre, puisque tous les subnets d'un VPC se routent mutuellement
par défaut. L'attaquant qui contrôle le serveur web atteint donc la base directement, et
le mot « privé » n'aura rien fait pour l'en empêcher.

Ce qui protège réellement est une couche différente : un **security group** sur la base
qui n'autorise le port 5432 qu'en provenance du security group des backends. C'est cela,
et seulement cela, qui refuse la connexion.

Le piège séduit parce que **le mot est juste à moitié**, et que la moitié vraie est
spectaculaire : la base n'est effectivement pas exposée à Internet, ce qui est un progrès
réel et mesurable. On généralise donc une protection vérifiée en protection générale.
S'ajoute la géométrie de tous les schémas d'architecture, où le subnet privé est dessiné
**à l'intérieur** d'un rectangle — l'image suggère un enclos, et il n'y en a pas.

**Sur les autres questions.** `10.0.1.0/24` et `10.0.2.0/24` ne se chevauchent pas : le
troisième octet diffère, ce sont deux plages disjointes. `10.0.0.0/16` et `10.0.5.0/24`
se chevauchent en revanche complètement, le second étant **entièrement contenu** dans le
premier — un `/16` fixe `10.0.`, donc il couvre tout ce qui commence ainsi.

Le paradoxe du `/25` disparaît dès qu'on se souvient de ce que compte le nombre : il
compte les bits **imposés**, pas les adresses disponibles. Plus on impose de bits, moins
il en reste de libres, et chaque bit fixé supplémentaire **divise par deux** l'espace
restant. `/24` laisse 8 bits libres, donc 2⁸ = 256 adresses ; `/25` en laisse 7, donc
128. Grand préfixe = petit réseau, toujours.

Le plan d'adressage pour trois environnements et deux régions demande des plages
**disjointes dès le départ** — par exemple un `/16` distinct par couple
environnement-région, taillé dans un `/8` privé réservé. Ce qui rend la décision
difficile à corriger est simple et brutal : **on ne renumérote pas un réseau en
production.** Chaque machine, chaque règle de pare-feu, chaque configuration porte ces
adresses. Deux réseaux qui se chevauchent ne pourront jamais être appairés, et la seule
issue sera de reconstruire l'un des deux.

**Alternative défendable.** Certaines équipes ne segmentent pas du tout par subnets et
s'appuient uniquement sur l'identité et les politiques réseau applicatives — c'est la
logique du *zero trust* et des maillages de services. C'est cohérent et parfois
supérieur : le réseau n'est plus un périmètre de confiance, chaque appel s'authentifie.
Le coût est un outillage bien plus lourd, et cela reste rare hors des grandes
organisations.

**Vérifie seul, sans corrigé** :
1. Prends ta base de données la plus sensible. Quelle règle **précise** empêche une
   machine compromise du même réseau de s'y connecter ? Si tu ne peux pas la citer, elle
   n'existe pas.
2. Calcule le nombre d'adresses d'un `/22` et d'un `/28` sans regarder de table. Si tu
   passes par les bits libres, c'est acquis.
3. Écris ton plan d'adressage pour les trois prochaines années sur une feuille. Le
   moment de le faire est avant de créer le premier réseau.

## 🧾 À retenir
- IP = adresse ; CIDR `/n` = n bits de préfixe fixe (grand n = petit réseau).
- Subnet = quartier ; gateway = sortie ; route par défaut `0.0.0.0/0` ; la plus
  spécifique gagne.
- Plages privées non routables ; subnets d'un réseau **disjoints**.
- Public = route vers Internet Gateway ; privé + NAT = sortie sans entrée.

## 📚 Vocabulaire
**IP** · **CIDR / préfixe** · **subnet** · **gateway** · **table de routage** ·
**route par défaut** · **NAT** · **plage privée** · **public / privé** · **peering**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je lis un CIDR et j'estime la taille d'un subnet.
- [ ] Je détecte un chevauchement de plages.
- [ ] Je conçois un découpage public/privé avec NAT cohérent.

## 🔗 Liens avec le programme
Jour `/day/71` (réseau). Leçons liées : `/doc/lessons/networking-tcp-ip-model`,
`/doc/lessons/networking-proxy-loadbalancing`. Exercice associé : détection de
chevauchement CIDR (Laboratoire). Ce modèle EST celui des VPC/VNet du cloud, décliné
dans la leçon réseau cloud du parcours.
