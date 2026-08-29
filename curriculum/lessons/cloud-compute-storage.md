<!-- keep -->
# Leçon — Cloud : compute et stockage

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Deux questions reviennent pour toute application dans le cloud : « où va tourner mon
code ? » et « où vais-je ranger mes données ? ». Pour le code, faut-il une machine
complète (que je gère), un conteneur managé, ou juste une petite fonction qui se
lance à la demande ? Pour les données, un « disque », un partage entre machines, ou
un grand entrepôt de fichiers ? Se tromper coûte cher : payer une grosse machine
allumée en permanence pour un usage occasionnel, ou utiliser un entrepôt de fichiers
comme s'il s'agissait d'un disque. Cette leçon donne les critères de choix, avec un
principe clé : le code est souvent **jetable**, donc les données à garder vont
ailleurs (jamais sur le disque d'une machine qui peut disparaître).

## 🎯 Objectif
Choisir OÙ faire tourner du code et OÙ ranger des données dans le cloud : les
options de **compute** (machines virtuelles, conteneurs managés, **serverless**),
les types de **stockage** (**objet**, **bloc**, **fichier**) et les **bases
managées**. Décider selon le besoin, indépendamment du fournisseur.

## 🧩 Prérequis
Vous devez connaître les **fondamentaux cloud** (IaaS/PaaS, managé, élasticité —
`/doc/lessons/cloud-fundamentals`) et avoir manipulé un **conteneur**
(`/doc/lessons/docker-containers`). Les notions serverless, stockage objet/bloc/
fichier sont définies ici, indépendamment du fournisseur.

## 🧠 Modèle mental
Deux questions structurent l'architecture cloud : « où tourne mon code ? » et « où
vivent mes données ? ». Pour le code, le curseur va de la **VM** (je gère l'OS) au
**serverless** (je ne fournis qu'une fonction). Pour les données, on choisit le
type de stockage selon la FORME de l'accès : un gros catalogue de fichiers, un
disque pour une machine, ou un partage entre plusieurs machines. Choisir juste
évite de payer cher un mauvais outil.

## 📖 Explication complète
**Options de compute (du plus géré au moins géré).**
- **Machine virtuelle (IaaS)** : contrôle total, vous gérez l'OS et les patchs.
  Adapté au legacy, aux besoins spécifiques.
- **Conteneurs managés** : le cloud fait tourner vos conteneurs (service de
  conteneurs, ou Kubernetes managé). Bon compromis portabilité/contrôle.
- **Serverless (fonctions)** : vous fournissez une fonction, le cloud gère
  l'exécution et l'échelle (jusqu'à zéro). Facturé à l'invocation/à la durée.
  Idéal pour de l'événementiel/intermittent ; attention au **démarrage à froid**
  (cold start) et aux limites de durée.
On choisit selon le contrôle voulu, le profil de charge et le coût.

**Types de stockage — la distinction clé.**
- **Objet** : stocke des fichiers (« objets ») dans des conteneurs logiques,
  accessibles par API/HTTP, très scalable et peu cher. Idéal pour médias,
  sauvegardes, données statiques, artefacts. Pas un système de fichiers classique.
- **Bloc** : un « disque » brut attaché à UNE machine (comme un SSD). Pour l'OS, une
  base auto-hébergée, des I/O intensives. Attaché à une instance à la fois.
- **Fichier** : un partage réseau (système de fichiers) monté par PLUSIEURS
  machines simultanément. Pour du partage entre instances.
Erreur fréquente : vouloir utiliser du stockage objet comme un disque (ou
l'inverse) — ce sont des modèles d'accès différents.

**Bases managées.** Le cloud offre des bases relationnelles et NoSQL managées
(sauvegardes, patchs, réplication, bascule délégués). On y gagne en exploitation ;
on garde la responsabilité du schéma, des accès et des coûts. Préférer le managé à
l'auto-hébergement d'une base, sauf besoin très spécifique.

**Éphémère vs persistant.** Le compute est souvent **éphémère** (une instance/un
conteneur peut disparaître) : les données à conserver vont dans un stockage
persistant (objet/bloc/fichier/base), jamais sur le disque local d'une instance
jetable — même leçon que les volumes Docker et le stockage des Pods.

## 🔧 Repères (multi-fournisseurs)
- Compute : VM (contrôle) → conteneurs managés (portabilité) → serverless
  (événementiel, scale-to-zero).
- Stockage : objet (fichiers/API, pas cher), bloc (disque d'une machine), fichier
  (partage multi-machines).
- Base : managée par défaut.
- Données persistantes hors du compute éphémère.

## 🧭 Exemple guidé — trois façons de se tromper de stockage

Les trois familles de stockage — **objet**, **bloc**, **fichier** — se distinguent mal
sur le papier. Elles se distinguent très bien par les pannes qu'elles produisent quand
on choisit la mauvaise. Voici les trois, dans l'ordre où on les rencontre.

### Erreur 1 — le disque qu'on voudrait partager

Une application tourne en trois exemplaires. Chacun doit lire et écrire dans un dossier
commun de documents. On attache donc un disque — du stockage **bloc** — et on le monte
sur les trois machines.

Ça ne marche pas, et la façon dont ça ne marche pas est instructive : le plus souvent
le fournisseur refuse simplement l'attachement à plusieurs machines, et dans les cas où
c'est techniquement possible, les fichiers se corrompent.

La raison n'est pas une limitation arbitraire. **Un disque bloc est un disque brut** :
il fournit des blocs numérotés, et c'est le système d'exploitation qui, au-dessus,
tient la comptabilité de ce qui est où. Deux systèmes qui tiennent chacun leur propre
comptabilité sur les mêmes blocs, sans se parler, écrivent l'un par-dessus l'autre. Il
n'y a pas d'arbitre.

Deux sorties. Le stockage **fichier**, qui expose un partage réseau conçu pour l'accès
concurrent — c'est justement le service que rend le protocole de partage : arbitrer. Ou
le stockage **objet**, si les documents sont écrits puis relus sans être modifiés en
place, ce qui est le cas le plus fréquent.

### Erreur 2 — le stockage objet pris pour un système de fichiers

L'application enregistre des documents dans un stockage objet, et l'utilisateur doit
pouvoir renommer un dossier. On écrit donc une fonction « renommer le dossier » qui
parcourt les fichiers et les déplace.

Sur trois fichiers, c'est instantané. Sur douze mille, la requête expire.

Ici, le modèle mental est faux et il faut le refaire. **Un stockage objet n'a pas de
dossiers.** Il a des clés — des chaînes de caractères — et un fichier nommé
`2026/factures/f-001.pdf` n'est pas « dans » un dossier `factures` : sa clé contient
simplement des barres obliques. L'arborescence que t'affiche la console est une
commodité d'affichage.

Renommer un dossier revient donc à **copier puis supprimer chaque objet, un par un**.
Ce n'est pas lent parce que le service est mauvais ; c'est lent parce que l'opération
demandée n'existe pas, et qu'on l'a simulée.

Corollaire à connaître avant d'en avoir besoin : le stockage objet facture souvent au
**nombre d'opérations** autant qu'au volume. Une application qui lit un petit fichier
des milliers de fois par minute peut coûter cher tout en stockant très peu.

### Erreur 3 — le disque de la machine éphémère

Une API en conteneurs écrit ses fichiers téléversés sur son disque local. Tout
fonctionne. Après un redéploiement, les fichiers ont disparu.

C'est le pendant exact de ce que dit la leçon sur les workloads : ce disque appartient
à une instance, pas à l'application. Il faut ajouter une distinction que beaucoup
découvrent trop tard — un disque local peut être **éphémère** (attaché à la machine, il
disparaît avec elle) ou **persistant** (indépendant, il survit et se réattache). Les
deux ressemblent à `/data` vu depuis l'intérieur. **Rien, dans le programme, ne permet
de les distinguer** ; seule la configuration le dit.

### La question qui remplace le tableau

Plutôt que de mémoriser « médias → objet, base → bloc », pose trois questions dans cet
ordre :

1. **Qui écrit ?** Un seul processus à la fois, ou plusieurs en même temps ? Plusieurs
   écrivains simultanés éliminent le bloc.
2. **Modifie-t-on en place, ou écrit-on puis relit-on ?** La modification en place, au
   milieu d'un gros fichier, oriente vers le bloc ou le fichier ; l'écriture-relecture
   vers l'objet.
3. **Que se passe-t-il si la machine disparaît maintenant ?** Si la réponse est « on
   perd des données », le stockage choisi est le mauvais, quel que soit son nom.

### Et pour le calcul, la même logique

Le choix machine virtuelle / conteneur / fonction sans serveur se pose de la même
manière — non par préférence, mais par contrainte. Une charge qui doit **démarrer
instantanément et rester chaude** supporte mal les fonctions sans serveur, dont le
premier appel après une période d'inactivité est lent : c'est le démarrage à froid. Une
charge qui tourne en continu 24 h/24 coûte souvent plus cher en fonctions qu'en machine
réservée. Et une application qui doit garder un état en mémoire entre deux requêtes ne
convient à aucun des deux, pour la raison vue plus haut.

**Le critère commun aux deux familles de choix : ce n'est pas ce que la technologie sait
faire, c'est ce que ta charge exige.**

## ⚠️ Erreurs fréquentes
- Utiliser du stockage **objet** comme un disque de système de fichiers (ou
  l'inverse).
- Écrire des données à conserver sur le **disque local** d'une instance éphémère.
- Prendre une **VM** là où un service managé/serverless réduirait la charge.
- Ignorer le **cold start** et les limites de durée du serverless.
- Auto-héberger une base « pour économiser » et hériter de toute l'exploitation.

## 🔐 Sécurité
Le stockage objet est une source RÉCURRENTE de fuites quand il est rendu public
par erreur : garder les conteneurs privés par défaut, chiffrer au repos, restreindre
les accès (responsabilité client). Chiffrer les disques (bloc) et les bases ;
limiter qui peut lire les données.

## 🏢 Cas métier
Une équipe stockait les fichiers uploadés sur le disque local de ses VMs. À chaque
remplacement d'instance (autoscaling), des fichiers disparaissaient. Migration vers
du stockage **objet** : les données survivent aux instances jetables, le coût
baisse, et le service passe à l'échelle sans perte.

## 🎤 Questions d'entretien
- « Stockage objet vs bloc vs fichier ? » → fichiers via API (scalable) vs disque
  d'une machine vs partage multi-machines.
- « Quand choisir le serverless ? » → charge événementielle/intermittente, scale-to-zero
  ; attention au cold start.
- « Où mettez-vous des données à conserver ? » → stockage persistant, jamais le
  disque d'une instance éphémère.

## ✍️ Mini-exercice — placer six charges, et défendre chaque choix

**Contexte.** Une plateforme de cours en ligne. Tu dois placer six éléments sur les
familles de calcul et de stockage.

1. L'API principale, trafic régulier en journée, quasi nul la nuit.
2. Les vidéos de cours, 4 To, consultées par les apprenants.
3. Le générateur de miniatures, déclenché à chaque téléversement de vidéo, dure 20 s.
4. La base des inscriptions et des paiements.
5. Les journaux applicatifs, conservés 90 jours, relus uniquement en cas d'incident.
6. Un logiciel de montage vidéo hérité, qui doit voir un dossier partagé et écrire
   dedans depuis deux machines simultanément.

**Ce que tu produis.** Pour chaque élément : la famille de **calcul** (machine
virtuelle, conteneur, fonction sans serveur, service managé), la famille de
**stockage** (objet, bloc, fichier, base managée), et — c'est la partie notée — **la
contrainte de l'énoncé** qui rend ton choix nécessaire.

**Livrable.** Un tableau de six lignes, plus **une ligne d'anti-choix par élément** :
une option plausible que tu écartes, et le symptôme concret qu'elle produirait.

**Critère de réussite.** Relis tes six justifications. Si l'une d'elles pourrait être
recopiée telle quelle pour un autre élément du tableau, elle est trop générale :
réécris-la en citant le mot exact de l'énoncé qui tranche.

**Piège.** Deux des six éléments ont une contrainte qui **élimine** une famille
entière, et non qui la rend simplement moins bonne. Repère-les : ce sont ceux où il
n'y a pas de compromis, seulement une impossibilité.

## ✅ Correction attendue

**La démarche.** Pour le stockage, les trois questions de l'exemple guidé — qui écrit,
modifie-t-on en place, que perd-on si la machine disparaît. Pour le calcul, une seule :
**la charge est-elle continue, intermittente, ou événementielle ?**

**1. API principale.** Trafic régulier en journée, nul la nuit → **conteneurs managés**
avec ajustement automatique du nombre d'exemplaires. Anti-choix : les fonctions sans
serveur. Elles conviendraient au profil de charge, mais le premier appel après une
période creuse subit un **démarrage à froid** — l'utilisateur qui ouvre la plateforme à
8 h attend plusieurs secondes. Symptôme : une latence anormale au premier appel de la
journée, invisible dans les moyennes.

**2. Vidéos de cours.** Stockage **objet**, servi via un réseau de diffusion. Écrites
une fois, lues souvent, jamais modifiées en place. Anti-choix : un disque bloc attaché
à une machine — il faudrait faire transiter chaque octet par cette machine, qui
deviendrait le goulot d'étranglement, et le coût de transfert exploserait.

**3. Générateur de miniatures.** **Fonction sans serveur**, déclenchée par l'événement
de téléversement. C'est le cas d'usage idéal : événementiel, court, sans état, et
inactif la plupart du temps. Anti-choix : une machine allumée en permanence pour
attendre des téléversements — on paie 24 h/24 pour quelques minutes de travail
quotidien.

**4. Base des inscriptions et paiements.** **Base relationnelle managée**, multi-zone.
La contrainte est dans le mot *paiements* : on veut des transactions et on ne veut pas
gérer soi-même la restauration. Anti-choix : une base installée sur une machine
virtuelle — moins chère à l'heure, jusqu'au jour où il faut restaurer.

**5. Journaux, 90 jours, relus rarement.** Stockage **objet**, avec passage automatique
en classe d'archivage après quelques jours. La contrainte est *relus uniquement en cas
d'incident* : on accepte un délai de restauration en échange d'un coût très inférieur.
Anti-choix : les garder en stockage courant — on paie un accès instantané dont on ne
se sert presque jamais.

**Les deux impossibilités, et c'est le cœur de l'exercice.**

**6. Logiciel de montage, dossier partagé, deux machines simultanément.** Ce n'est pas
un compromis, c'est une élimination : le stockage **bloc est impossible**, pour la
raison exposée dans l'exemple guidé — deux systèmes de fichiers tenant chacun leur
propre comptabilité sur les mêmes blocs se corrompent mutuellement. Réponse : stockage
**fichier**, sur machines virtuelles, parce qu'un logiciel hérité attend un chemin
monté et non une interface programmatique.

La seconde impossibilité est le **3 combiné au 2** : la fonction sans serveur qui
génère les miniatures ne peut pas écrire sur un disque local persistant — elle n'en a
pas. Elle lit et écrit dans le stockage objet. Ce n'est pas une préférence, c'est ce
que le modèle d'exécution permet.

**L'erreur probable.** Choisir « conteneur + disque bloc » partout, parce que c'est ce
qu'on connaît. Ça fonctionne pour 1 et 4, et ça produit trois pannes distinctes sur 2,
3 et 6. **Le réflexe de reproduire l'architecture qu'on maîtrise est le premier
adversaire d'un bon choix d'infrastructure** — et il ne se manifeste pas comme une
erreur, mais comme une préférence.

**Comment reconnaître ce type de problème.** Trois formulations de l'énoncé sont des
signaux forts : « simultanément » élimine le bloc ; « déclenché à chaque » appelle
l'événementiel ; « relu rarement » appelle l'archivage. Apprendre à repérer ces mots
dans une demande métier vaut mieux que mémoriser un tableau de services.

**Quand la réponse changerait.** Si la plateforme n'a que 40 utilisateurs internes,
tout ceci est surdimensionné : une machine virtuelle, un disque, une base, et c'est
fini. **L'architecture répond à une échelle** — la même liste de besoins à deux ordres
de grandeur de moins n'appelle pas les mêmes réponses.

## 🧾 À retenir
- Compute : VM (contrôle) → conteneurs managés → serverless (événementiel).
- Stockage : objet (fichiers/API), bloc (disque d'une machine), fichier (partage).
- Bases managées par défaut ; données persistantes hors du compute éphémère.
- Le stockage objet public par erreur = fuite classique.

## 📚 Vocabulaire
**machine virtuelle** · **conteneurs managés** · **serverless / fonction** · **cold
start** · **stockage objet / bloc / fichier** · **base managée** · **chiffrement au
repos** · **éphémère / persistant**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je choisis une option de compute selon le contrôle et la charge.
- [ ] Je choisis le type de stockage selon le modèle d'accès.
- [ ] Je place les données persistantes hors du compute jetable.

## 🔗 Liens avec le programme
Mois 11 (cloud). Leçons liées : `/doc/lessons/cloud-fundamentals`,
`/doc/lessons/cloud-aws-core`, `/doc/lessons/cloud-azure-core`,
`/doc/lessons/cloud-finops`. Ces choix compute/stockage pilotent l'architecture et
le coût.
