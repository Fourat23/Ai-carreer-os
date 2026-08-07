<!-- keep -->
# Leçon — Cloud : compute et stockage

## 🎯 Objectif
Choisir OÙ faire tourner du code et OÙ ranger des données dans le cloud : les
options de **compute** (machines virtuelles, conteneurs managés, **serverless**),
les types de **stockage** (**objet**, **bloc**, **fichier**) et les **bases
managées**. Décider selon le besoin, indépendamment du fournisseur.

## 🧩 Prérequis
Fondamentaux cloud (`/doc/lessons/cloud-fundamentals`) et conteneurs
(`/doc/lessons/docker-containers`).

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

## 🧭 Exemple guidé — placer les briques d'une app
1. API à trafic variable et événementiel → serverless ou conteneurs managés
   (autoscaling).
2. Médias uploadés par les utilisateurs → stockage **objet** (scalable, pas cher).
3. Base relationnelle → service **managé** (multi-AZ pour la disponibilité).
4. Disque d'une VM legacy → stockage **bloc**.

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

## ✍️ Mini-exercice
Vous devez stocker des images uploadées par des utilisateurs, à grande échelle et
à bas coût. Quel type de stockage ? → objet (accès par API, très scalable, peu
cher), pas un disque bloc.

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
